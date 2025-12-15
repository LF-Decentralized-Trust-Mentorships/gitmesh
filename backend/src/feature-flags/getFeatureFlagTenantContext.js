"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("@gitmesh/redis");
const types_1 = require("@gitmesh/types");
const timing_1 = require("../utils/timing");
const automationRepository_1 = __importDefault(require("../database/repositories/automationRepository"));
async function getFeatureFlagTenantContext(tenant, database, redis, log) {
    const automationCount = await automationRepository_1.default.countAllActive(database, tenant.id);
    const csvExportCountCache = new redis_1.RedisCache(types_1.FeatureFlagRedisKey.CSV_EXPORT_COUNT, redis, log);
    const memberEnrichmentCountCache = new redis_1.RedisCache(types_1.FeatureFlagRedisKey.MEMBER_ENRICHMENT_COUNT, redis, log);
    let csvExportCount = await csvExportCountCache.get(tenant.id);
    let memberEnrichmentCount = await memberEnrichmentCountCache.get(tenant.id);
    const secondsRemainingUntilEndOfMonth = (0, timing_1.getSecondsTillEndOfMonth)();
    if (!csvExportCount) {
        await csvExportCountCache.set(tenant.id, '0', secondsRemainingUntilEndOfMonth);
        csvExportCount = '0';
    }
    if (!memberEnrichmentCount) {
        await memberEnrichmentCountCache.set(tenant.id, '0', secondsRemainingUntilEndOfMonth);
        memberEnrichmentCount = '0';
    }
    return {
        tenantId: tenant.id,
        plan: tenant.plan,
        automationCount: automationCount.toString(),
        csvExportCount,
        memberEnrichmentCount,
    };
}
exports.default = getFeatureFlagTenantContext;
//# sourceMappingURL=getFeatureFlagTenantContext.js.map