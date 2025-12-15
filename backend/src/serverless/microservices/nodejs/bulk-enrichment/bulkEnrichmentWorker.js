"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkEnrichmentWorker = void 0;
const redis_1 = require("@gitmesh/redis");
const types_1 = require("@gitmesh/types");
const timing_1 = require("../../../../utils/timing");
const conf_1 = require("../../../../conf");
const getUserContext_1 = __importDefault(require("../../../../database/utils/getUserContext"));
const memberEnrichmentService_1 = __importDefault(require("../../../../services/premium/enrichment/memberEnrichmentService"));
/**
 * Sends weekly analytics emails of a given tenant
 * to all users of the tenant.
 * Data sent is for the last week.
 * @param tenantId
 */
async function bulkEnrichmentWorker(tenantId, memberIds, segmentIds, notifyFrontend, skipCredits) {
    const userContext = await (0, getUserContext_1.default)(tenantId, null, segmentIds);
    const memberEnrichmentService = new memberEnrichmentService_1.default(userContext);
    const { enrichedMemberCount } = await memberEnrichmentService.bulkEnrich(memberIds, notifyFrontend);
    const failedEnrichmentRequests = memberIds.length - enrichedMemberCount;
    // if skipCredits is true, no need to check or deduct credits
    if (!skipCredits) {
        if (failedEnrichmentRequests > 0) {
            const redis = await (0, redis_1.getRedisClient)(conf_1.REDIS_CONFIG, true);
            // get redis cache that stores memberEnrichmentCount
            const memberEnrichmentCountCache = new redis_1.RedisCache(types_1.FeatureFlagRedisKey.MEMBER_ENRICHMENT_COUNT, redis, userContext.log);
            // get current enrichment count of tenant from redis
            const memberEnrichmentCount = await memberEnrichmentCountCache.get(userContext.currentTenant.id);
            // calculate remaining seconds for the end of the month, to set TTL for redis keys
            const secondsRemainingUntilEndOfMonth = (0, timing_1.getSecondsTillEndOfMonth)();
            if (!memberEnrichmentCount) {
                await memberEnrichmentCountCache.set(userContext.currentTenant.id, '0', secondsRemainingUntilEndOfMonth);
            }
            else {
                // Before sending the queue message, we increase the memberEnrichmentCount with all member Ids that are sent,
                // assuming that we'll be able to enrich all.
                // If any of enrichments failed, we should add these credits back, reducing memberEnrichmentCount
                await memberEnrichmentCountCache.set(userContext.currentTenant.id, (parseInt(memberEnrichmentCount, 10) - failedEnrichmentRequests).toString(), secondsRemainingUntilEndOfMonth);
            }
        }
    }
}
exports.bulkEnrichmentWorker = bulkEnrichmentWorker;
//# sourceMappingURL=bulkEnrichmentWorker.js.map