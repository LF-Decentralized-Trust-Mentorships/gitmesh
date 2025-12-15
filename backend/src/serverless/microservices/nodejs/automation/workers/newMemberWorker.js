"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareMemberPayload = exports.shouldProcessMember = void 0;
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const automationExecutionRepository_1 = __importDefault(require("../../../../../database/repositories/automationExecutionRepository"));
const automationRepository_1 = __importDefault(require("../../../../../database/repositories/automationRepository"));
const memberRepository_1 = __importDefault(require("../../../../../database/repositories/memberRepository"));
const sequelizeRepository_1 = __importDefault(require("../../../../../database/repositories/sequelizeRepository"));
const getUserContext_1 = __importDefault(require("../../../../../database/utils/getUserContext"));
const util_1 = require("./util");
const log = (0, logging_1.getServiceChildLogger)('newMemberWorker');
/**
 * Helper function to check whether a single member should be processed by automation
 * @param member Member data
 * @param automation {AutomationData} Automation data
 */
const shouldProcessMember = async (member, automation) => {
    const settings = automation.settings;
    let process = true;
    // check whether member platforms matches
    if (settings.platforms && settings.platforms.length > 0) {
        const platforms = Object.keys(member.username);
        if (!platforms.some((platform) => settings.platforms.includes(platform))) {
            log.warn(`Ignoring automation ${automation.id} - Member ${member.id} platforms do not include any of automation setting platforms: [${settings.platforms.join(', ')}]`);
            process = false;
        }
    }
    if (process) {
        const userContext = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const repo = new automationExecutionRepository_1.default(userContext);
        const hasAlreadyBeenTriggered = await repo.hasAlreadyBeenTriggered(automation.id, member.id);
        if (hasAlreadyBeenTriggered) {
            log.warn(`Ignoring automation ${automation.id} - Member ${member.id} was already processed!`);
            process = false;
        }
    }
    return process;
};
exports.shouldProcessMember = shouldProcessMember;
/**
 * Return a cleaned up copy of the member that contains only data that is relevant for automation.
 *
 * @param member Member data as it came from the repository layer
 * @returns a cleaned up payload to use with automation
 */
const prepareMemberPayload = (member) => {
    const copy = Object.assign({}, member);
    delete copy.importHash;
    delete copy.signals;
    delete copy.type;
    delete copy.score;
    delete copy.updatedAt;
    delete copy.updatedById;
    delete copy.deletedAt;
    return copy;
};
exports.prepareMemberPayload = prepareMemberPayload;
/**
 * Check whether this member matches any automations for tenant.
 * If so emit automation process messages to NodeJS microservices SQS queue.
 *
 * @param tenantId tenant unique ID
 * @param memberId tenant member ID
 * @param memberData community member data
 */
exports.default = async (tenantId, memberId, segmentId) => {
    const userContext = await (0, getUserContext_1.default)(tenantId, null, [segmentId]);
    try {
        // check if relevant automation exists in this tenant
        const automations = await new automationRepository_1.default(userContext).findAll({
            trigger: types_1.AutomationTrigger.NEW_MEMBER,
            state: types_1.AutomationState.ACTIVE,
        });
        if (automations.length > 0) {
            log.info(`Found ${automations.length} automations to process!`);
            const member = await memberRepository_1.default.findById(memberId, userContext);
            for (const automation of automations) {
                if (await (0, exports.shouldProcessMember)(member, automation)) {
                    log.info(`Member ${member.id} is being processed by automation ${automation.id}!`);
                    switch (automation.type) {
                        case types_1.AutomationType.WEBHOOK:
                            await (0, util_1.sendWebhookProcessRequest)(tenantId, automation, member.id, (0, exports.prepareMemberPayload)(member), types_1.AutomationType.WEBHOOK);
                            break;
                        case types_1.AutomationType.SLACK:
                            await (0, util_1.sendWebhookProcessRequest)(tenantId, automation, member.id, (0, exports.prepareMemberPayload)(member), types_1.AutomationType.SLACK);
                            break;
                        default:
                            log.error(`ERROR: Automation type '${automation.type}' is not supported!`);
                    }
                }
            }
        }
    }
    catch (error) {
        log.error(error, 'Error while processing new member automation trigger!');
        throw error;
    }
};
//# sourceMappingURL=newMemberWorker.js.map