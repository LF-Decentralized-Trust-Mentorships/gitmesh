"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_LIMITS = void 0;
const feature_flags_1 = require("@gitmesh/feature-flags");
const types_1 = require("@gitmesh/types");
const plans_1 = __importDefault(require("../security/plans"));
const getFeatureFlagTenantContext_1 = __importDefault(require("./getFeatureFlagTenantContext"));
exports.PLAN_LIMITS = {
    [plans_1.default.values.essential]: {
        [types_1.FeatureFlag.AUTOMATIONS]: 2,
        [types_1.FeatureFlag.CSV_EXPORT]: 2,
    },
    [plans_1.default.values.growth]: {
        [types_1.FeatureFlag.AUTOMATIONS]: 10,
        [types_1.FeatureFlag.CSV_EXPORT]: 10,
        [types_1.FeatureFlag.MEMBER_ENRICHMENT]: 1000,
        [types_1.FeatureFlag.ORGANIZATION_ENRICHMENT]: 200,
    },
    [plans_1.default.values.scale]: {
        [types_1.FeatureFlag.AUTOMATIONS]: 20,
        [types_1.FeatureFlag.CSV_EXPORT]: 20,
        [types_1.FeatureFlag.MEMBER_ENRICHMENT]: Infinity,
        [types_1.FeatureFlag.ORGANIZATION_ENRICHMENT]: Infinity,
    },
    [plans_1.default.values.enterprise]: {
        [types_1.FeatureFlag.AUTOMATIONS]: Infinity,
        [types_1.FeatureFlag.CSV_EXPORT]: Infinity,
        [types_1.FeatureFlag.MEMBER_ENRICHMENT]: Infinity,
        [types_1.FeatureFlag.ORGANIZATION_ENRICHMENT]: Infinity,
    },
};
exports.default = async (featureFlag, req) => (0, feature_flags_1.isFeatureEnabled)(featureFlag, async () => (0, getFeatureFlagTenantContext_1.default)(req.currentTenant, req.database, req.redis, req.log), req.unleash);
//# sourceMappingURL=isFeatureEnabled.js.map