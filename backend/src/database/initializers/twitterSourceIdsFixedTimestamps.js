"use strict";
/**
 * This script is responsible for regenerating
 * sourceIds for twitter follow activities that have timestamp > 1970-01-01
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const dotenv_expand_1 = __importDefault(require("dotenv-expand"));
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const activityService_1 = __importDefault(require("../../services/activityService"));
const integrationService_1 = __importDefault(require("../../services/integrationService"));
const tenantService_1 = __importDefault(require("../../services/tenantService"));
const getUserContext_1 = __importDefault(require("../utils/getUserContext"));
const integrationServiceBase_1 = require("../../serverless/integrations/services/integrationServiceBase");
const path = require('path');
const env = dotenv_1.default.config({
    path: path.resolve(__dirname, `../../../.env.staging`),
});
dotenv_expand_1.default.expand(env);
const log = (0, logging_1.getServiceLogger)();
async function twitterFollowsFixSourceIdsWithTimestamp() {
    const tenants = await tenantService_1.default._findAndCountAllForEveryUser({});
    // for each tenant
    for (const t of tenants.rows) {
        const tenantId = t.id;
        // get user context
        const userContext = await (0, getUserContext_1.default)(tenantId);
        const integrationService = new integrationService_1.default(userContext);
        const twitterIntegration = (await integrationService.findAndCountAll({ filter: { platform: types_1.PlatformType.TWITTER } })).rows[0];
        if (twitterIntegration) {
            const actService = new activityService_1.default(userContext);
            // get activities where timestamp != 1970-01-01, we can query by > 2000-01-01
            const activities = await actService.findAndCountAll({
                filter: { type: 'follow', timestampRange: ['2000-01-01'] },
            });
            for (const activity of activities.rows) {
                log.info({ activity }, 'Activity');
                // calculate sourceId with fixed timestamps
                const sourceIdRegenerated = integrationServiceBase_1.IntegrationServiceBase.generateSourceIdHash(activity.communityMember.username.twitter, 'follow', '1970-01-01T00:00:00+00:00', 'twitter');
                await actService.update(activity.id, { sourceId: sourceIdRegenerated });
            }
        }
    }
}
twitterFollowsFixSourceIdsWithTimestamp();
//# sourceMappingURL=twitterSourceIdsFixedTimestamps.js.map