"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const logging_1 = require("@gitmesh/logging");
const common_1 = require("@gitmesh/common");
const memberRepository_1 = __importDefault(require("../../database/repositories/memberRepository"));
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
const memberService_1 = __importDefault(require("../../services/memberService"));
/* eslint-disable no-continue */
/* eslint-disable @typescript-eslint/no-loop-func */
const log = (0, logging_1.getServiceLogger)();
function checkUsernames(allUsernames) {
    for (let i = 0; i < allUsernames.length; i++) {
        const usernames = allUsernames[i];
        for (const [platform, username] of Object.entries(usernames)) {
            for (let j = i; j < allUsernames.length; j++) {
                if (allUsernames[j][platform] && allUsernames[j][platform] !== username) {
                    return false;
                }
            }
        }
    }
    return true;
}
function checkEmails(allEmails) {
    for (let i = 0; i < allEmails.length; i++) {
        const emails = allEmails[i];
        for (let j = i; j < allEmails.length; j++) {
            const emails2 = allEmails[j];
            for (let k = 0; k < emails.length; k++) {
                if (emails[k] !== emails2[k]) {
                    return false;
                }
            }
        }
    }
    return true;
}
async function doMerge(data, logger) {
    // merge all instances to the first one
    const firstId = data.all_ids[0];
    const tenantOptions = await sequelizeRepository_1.default.getDefaultIRepositoryOptions(undefined, {
        id: data.tenantId,
    });
    tenantOptions.log = logger;
    const service = new memberService_1.default(tenantOptions);
    for (let i = 1; i < data.all_ids.length; i++) {
        logger.info(`Merging ${data.all_ids[i]} into ${firstId}...`);
        const id = data.all_ids[i];
        await service.merge(firstId, id);
    }
}
async function check() {
    let count = 0;
    const dbOptions = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
    const seq = sequelizeRepository_1.default.getSequelize(dbOptions);
    log.info('Querying database for duplicated members...');
    const results = await seq.query(`  with activity_counts as (select count(id) as count, "memberId"
                             from activities
                            group by "memberId")
      select keys.platform,
            m.username ->> keys.platform as username,
            m."tenantId",
            count(*)                     as duplicate_count,
            coalesce(sum(ac.count), 0)   as total_activitites,
            json_agg(m.id)               as all_ids,
            jsonb_agg(m.emails)          as all_emails,
            jsonb_agg(m.username)        as all_usernames
        from members m
                left join activity_counts ac on ac."memberId" = m.id,
            lateral jsonb_object_keys(m.username) as keys(platform)
      group by keys.platform,
                m.username ->> keys.platform,
                m."tenantId"
      having count(*) > 1
      order by duplicate_count desc,
                keys.platform,
                m."tenantId";`, {
        type: sequelize_1.QueryTypes.SELECT,
    });
    log.info(`Found ${results.length} duplicated members.`);
    let jobs = 0;
    const promises = [];
    for (const [i, data] of results.entries()) {
        log.info(`Processing ${i + 1}/${results.length}...`);
        if (data.username.toLowerCase().includes('deleted')) {
            log.warn('Skipping deleted member...');
            continue;
        }
        if (checkUsernames(data.all_usernames) && checkEmails(data.all_emails)) {
            const logger = (0, logging_1.getChildLogger)('merger', log, {
                requestId: (0, common_1.generateUUIDv1)(),
                platform: data.platform,
                tenantId: data.tenantId,
                username: data.username,
            });
            logger.info(`Found ${data.all_ids.length} duplicated members with same usernames and emails.`);
            while (jobs >= 5) {
                log.info('Waiting for job opening...');
                await (0, common_1.timeout)(500);
            }
            jobs++;
            log.info({ jobs }, 'Job started!');
            promises.push(doMerge(data, logger)
                .then(() => {
                jobs--;
                log.info({ jobs }, 'Job done!');
            })
                .catch((err) => {
                logger.error(err, { ids: data.all_ids }, 'Error while merging members!');
                jobs--;
                log.info({ jobs }, 'Job done with error!');
            }));
            count++;
        }
        else {
            const logger = (0, logging_1.getChildLogger)('fixer', log, {
                requestId: (0, common_1.generateUUIDv1)(),
                platform: data.platform,
                tenantId: data.tenantId,
                username: data.username,
            });
            logger.info('Can not automatically merge - first member in the group by joinedAt will get the identity and the rest will get them as weakIdentities.');
            const options = Object.assign(Object.assign({}, dbOptions), { log: logger, currentTenant: { id: data.tenantId } });
            let transaction;
            try {
                transaction = await sequelizeRepository_1.default.createTransaction(options);
                const txOptions = Object.assign(Object.assign({}, options), { transaction });
                const allMembers = [];
                for (const id of data.all_ids) {
                    const member = await memberRepository_1.default.findById(id, txOptions);
                    allMembers.push(member);
                }
                // sort so the oldest members by joinedAt are first
                allMembers.sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
                // first member stays the same - it will keep the identity
                // these ones will get the duplicated identity as weakIdentities
                const otherMembers = allMembers.slice(1);
                for (const member of otherMembers) {
                    logger.info({ memberId: member.id }, 'Removing identity from member.username column!');
                    // let's remove this identity from the member.username column
                    delete member.username[data.platform];
                    await memberRepository_1.default.update(member.id, {
                        username: member.username,
                    }, txOptions);
                }
                logger.info('Adding duplicated identity to other members as weakIdentity...');
                // finally let's add the duplicated identity as weakIdentity
                await memberRepository_1.default.addToWeakIdentities(otherMembers.map((m) => m.id), data.username, data.platform, txOptions);
                await sequelizeRepository_1.default.commitTransaction(transaction);
                count++;
            }
            catch (err) {
                logger.error(err, 'Error while merging members that can not be automatically merged!');
                if (transaction) {
                    await sequelizeRepository_1.default.rollbackTransaction(transaction);
                }
            }
        }
    }
    await Promise.all(promises);
    return count;
}
setImmediate(async () => {
    log.info('Starting merge duplicated members script...');
    let count = await check();
    while (count > 0) {
        count = await check();
    }
});
//# sourceMappingURL=merge-duplicated-members.js.map