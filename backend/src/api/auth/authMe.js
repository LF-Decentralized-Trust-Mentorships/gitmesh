"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("@gitmesh/redis");
const common_1 = require("@gitmesh/common");
const types_1 = require("@gitmesh/types");
const automationRepository_1 = __importDefault(require("../../database/repositories/automationRepository"));
const segmentService_1 = __importDefault(require("../../services/segmentService"));
exports.default = async (req, res) => {
    if (!req.currentUser || !req.currentUser.id) {
        await req.responseHandler.error(req, res, new common_1.Error403(req.language));
        return;
    }
    const payload = req.currentUser;
    const csvExportCountCache = new redis_1.RedisCache(types_1.FeatureFlagRedisKey.CSV_EXPORT_COUNT, req.redis, req.log);
    const memberEnrichmentCountCache = new redis_1.RedisCache(types_1.FeatureFlagRedisKey.MEMBER_ENRICHMENT_COUNT, req.redis, req.log);
    payload.tenants = await Promise.all(payload.tenants.map(async (tenantUser) => {
        tenantUser.tenant.dataValues = Object.assign(Object.assign({}, tenantUser.tenant.dataValues), { csvExportCount: Number(await csvExportCountCache.get(tenantUser.tenant.id)) || 0, automationCount: Number(await automationRepository_1.default.countAllActive(req.database, tenantUser.tenant.id)) ||
                0, memberEnrichmentCount: Number(await memberEnrichmentCountCache.get(tenantUser.tenant.id)) || 0 });
        const segmentService = new segmentService_1.default(req);
        const tenantSubprojects = await segmentService.getTenantSubprojects(tenantUser.tenant);
        const activityTypes = await segmentService_1.default.getTenantActivityTypes(tenantSubprojects);
        const activityChannels = await segmentService_1.default.getTenantActivityChannels(tenantUser.tenant, req);
        // TODO: return actual activityTypes using segment information
        tenantUser.tenant.dataValues.settings[0].dataValues = Object.assign(Object.assign({}, tenantUser.tenant.dataValues.settings[0].dataValues), { activityTypes,
            activityChannels, slackWebHook: !!tenantUser.tenant.settings[0].dataValues.slackWebHook });
        return tenantUser;
    }));
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=authMe.js.map