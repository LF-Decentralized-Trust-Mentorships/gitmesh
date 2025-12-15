"use strict";
/**
 * This script is responsible for generating non
 * existing parentIds for historical discord activities
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
const dotenv_expand_1 = __importDefault(require("dotenv-expand"));
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const tenantService_1 = __importDefault(require("../../services/tenantService"));
const activityService_1 = __importDefault(require("../../services/activityService"));
const integrationService_1 = __importDefault(require("../../services/integrationService"));
const conf_1 = require("../../conf");
const getUserContext_1 = __importDefault(require("../utils/getUserContext"));
const path = require('path');
const env = dotenv_1.default.config({
    path: path.resolve(__dirname, `../../../.env.staging`),
});
dotenv_expand_1.default.expand(env);
const log = (0, logging_1.getServiceLogger)();
async function discordSetParentForThreads() {
    const tenants = await tenantService_1.default._findAndCountAllForEveryUser({});
    tenants.rows = tenants.rows.filter((i) => i.id === 'b044af41-657a-4925-9541-cf8dfbdc687b');
    // for each tenant
    for (const t of tenants.rows) {
        const tenantId = t.id;
        // get user context
        const userContext = await (0, getUserContext_1.default)(tenantId);
        // get discord message activities
        const integrationService = new integrationService_1.default(userContext);
        const discordIntegration = (await integrationService.findAndCountAll({ filter: { platform: types_1.PlatformType.DISCORD } })).rows[0];
        if (discordIntegration &&
            discordIntegration.settings.channels &&
            discordIntegration.settings.channels.length > 0) {
            const actService = new activityService_1.default(userContext);
            const discordChannelMapping = [];
            log.info({ discordIntegration }, 'Discord integration!');
            for (const channel of discordIntegration.settings.channels) {
                discordChannelMapping[channel.name] = { id: channel.id, type: 'channel' };
            }
            // Logging channel mapping:
            log.info({ discordChannelMapping }, 'Discord channel mapping!');
            // Get thread starter activities
            const acts = (await actService.findAndCountAll({
                filter: { platform: types_1.PlatformType.DISCORD, type: 'message' },
                orderBy: 'timestamp_ASC',
            })).rows;
            for (const act of acts) {
                if (act.gitmeshInfo.sample !== 'true' &&
                    act.gitmeshInfo.sample !== true &&
                    !(act.gitmeshInfo.discord && act.gitmeshInfo.discord.sample === 'true') &&
                    act.sourceId) {
                    if (act.gitmeshInfo.threadStarter === true) {
                        // get thread activities
                        let threadActivitiesFromApi = await getThreadMessages(act.sourceId);
                        // check thread has more activities
                        let moreActsFromApi = await getThreadMessages(act.sourceId, threadActivitiesFromApi[threadActivitiesFromApi.length - 1].id);
                        while (moreActsFromApi.length > 0) {
                            log.info({ anhor: moreActsFromApi[moreActsFromApi.length - 1].id }, 'Getting next 50 thread messagess...');
                            await new Promise((resolve) => {
                                setTimeout(resolve, 500);
                            });
                            threadActivitiesFromApi = threadActivitiesFromApi.concat(moreActsFromApi);
                            moreActsFromApi = await getThreadMessages(act.sourceId, moreActsFromApi[moreActsFromApi.length - 1].id);
                        }
                        for (const threadActivityFromApi of threadActivitiesFromApi) {
                            const childSourceId = threadActivityFromApi.id;
                            const childGitmeshActivityRowsAndCount = await actService.findAndCountAll({
                                filter: { sourceId: childSourceId },
                            });
                            if (childGitmeshActivityRowsAndCount.count === 1) {
                                // update both child.gitmeshInfo and child.parent
                                const childGitmeshInfo = childGitmeshActivityRowsAndCount.rows[0].gitmeshInfo;
                                childGitmeshInfo.url = `https://discordapp.com/channels/${discordIntegration.integrationIdentifier}/${act.gitmeshInfo.sourceId}/${childGitmeshActivityRowsAndCount.rows[0].sourceId}`;
                                await actService.update(childGitmeshActivityRowsAndCount.rows[0].id, {
                                    childGitmeshInfo,
                                    sourceParentId: act.sourceId,
                                    parent: act.id,
                                });
                                log.info({ activityId: childGitmeshActivityRowsAndCount.rows[0].id }, 'Child activity gitmeshInfo and parent updated!');
                            }
                            else {
                                log.info(`thread child cannot be found in the db sourceId: ${childSourceId}`);
                                log.info(`found count is: ${childGitmeshActivityRowsAndCount.count}`);
                            }
                        }
                        // update parent.gitmeshInfo if mapping exists
                        if (discordChannelMapping[act.gitmeshInfo.channel] &&
                            discordChannelMapping[act.gitmeshInfo.channel].id) {
                            const parentGitmeshInfo = act.gitmeshInfo;
                            parentGitmeshInfo.url = `https://discordapp.com/channels/${discordIntegration.integrationIdentifier}/${discordChannelMapping[act.gitmeshInfo.channel].id}/${act.sourceId}`;
                            await actService.update(act.id, { gitmeshInfo: parentGitmeshInfo });
                            log.info(`parent activity [${act.id}] gitmeshInfo updated!`);
                        }
                    }
                    else if (act.gitmeshInfo.thread === false || act.gitmeshInfo.thread === 'false') {
                        // not a thread starter and not a thread message
                        if (discordChannelMapping[act.gitmeshInfo.channel] &&
                            discordChannelMapping[act.gitmeshInfo.channel].id) {
                            const parentGitmeshInfo = act.gitmeshInfo;
                            parentGitmeshInfo.url = `https://discordapp.com/channels/${discordIntegration.integrationIdentifier}/${discordChannelMapping[act.gitmeshInfo.channel].id}/${act.sourceId}`;
                            await actService.update(act.id, { gitmeshInfo: parentGitmeshInfo });
                            log.info(`activity [${act.id}] gitmeshInfo updated!`);
                        }
                    }
                }
            }
        }
    }
}
async function getThreadMessages(threadId, before = null) {
    log.info(`getting messages of threadID: ${threadId}`);
    let url = `https://discord.com/api/v9/channels/${threadId}/messages`;
    if (before) {
        url += `?before=${before}`;
        log.info(`paginated url is: ${url}`);
    }
    return (0, node_fetch_1.default)(url, {
        headers: { Authorization: `Bot ${conf_1.DISCORD_CONFIG.token}` },
    })
        .then((res) => res.json())
        .then((res) => {
        log.info({ res }, 'Found thread activities in api!');
        return res;
    });
}
discordSetParentForThreads();
//# sourceMappingURL=discordThreadsRepliesHistorical.js.map