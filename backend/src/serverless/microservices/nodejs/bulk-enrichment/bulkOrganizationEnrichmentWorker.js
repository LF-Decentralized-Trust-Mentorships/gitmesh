"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkorganizationEnrichmentWorker = void 0;
const redis_1 = require("@gitmesh/redis");
const types_1 = require("@gitmesh/types");
const timing_1 = require("../../../../utils/timing");
const conf_1 = require("../../../../conf");
const getUserContext_1 = __importDefault(require("../../../../database/utils/getUserContext"));
const isFeatureEnabled_1 = require("../../../../feature-flags/isFeatureEnabled");
const organizationEnrichmentService_1 = __importDefault(require("../../../../services/premium/enrichment/organizationEnrichmentService"));
async function BulkorganizationEnrichmentWorker(tenantId, maxEnrichLimit = 0, verbose = false, includeOrgsActiveLastYear = false) {
    var _a;
    const userContext = await (0, getUserContext_1.default)(tenantId);
    const redis = await (0, redis_1.getRedisClient)(conf_1.REDIS_CONFIG, true);
    const organizationEnrichmentCountCache = new redis_1.RedisCache(types_1.FeatureFlagRedisKey.ORGANIZATION_ENRICHMENT_COUNT, redis, userContext.log);
    const usedEnrichmentCount = parseInt((_a = (await organizationEnrichmentCountCache.get(userContext.currentTenant.id))) !== null && _a !== void 0 ? _a : '0', 10);
    // Discard limits and credits if maxEnrichLimit is provided
    const skipCredits = maxEnrichLimit > 0;
    const remainderEnrichmentLimit = skipCredits
        ? maxEnrichLimit // Use maxEnrichLimit as the limit if provided
        : isFeatureEnabled_1.PLAN_LIMITS[userContext.currentTenant.plan][types_1.FeatureFlag.ORGANIZATION_ENRICHMENT] -
            usedEnrichmentCount;
    let enrichedOrgs = [];
    if (remainderEnrichmentLimit > 0) {
        const enrichmentService = new organizationEnrichmentService_1.default({
            options: userContext,
            apiKey: conf_1.ORGANIZATION_ENRICHMENT_CONFIG.apiKey,
            tenantId,
            limit: remainderEnrichmentLimit,
        });
        enrichedOrgs = await enrichmentService.enrichOrganizationsAndSignalDone(includeOrgsActiveLastYear, verbose);
    }
    if (!skipCredits) {
        await organizationEnrichmentCountCache.set(userContext.currentTenant.id, (usedEnrichmentCount + enrichedOrgs.length).toString(), (0, timing_1.getSecondsTillEndOfMonth)());
    }
}
exports.BulkorganizationEnrichmentWorker = BulkorganizationEnrichmentWorker;
//# sourceMappingURL=bulkOrganizationEnrichmentWorker.js.map