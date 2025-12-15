"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureFlagRedisKey = exports.FeatureFlag = void 0;
var FeatureFlag;
(function (FeatureFlag) {
    FeatureFlag["AUTOMATIONS"] = "automations";
    FeatureFlag["SIGNALS"] = "signals";
    FeatureFlag["CSV_EXPORT"] = "csv-export";
    FeatureFlag["LINKEDIN"] = "linkedin";
    FeatureFlag["HUBSPOT"] = "hubspot";
    FeatureFlag["MEMBER_ENRICHMENT"] = "member-enrichment";
    FeatureFlag["ORGANIZATION_ENRICHMENT"] = "organization-enrichment";
    FeatureFlag["SEGMENTS"] = "segments";
    FeatureFlag["QUICKSTART_V2"] = "quickstart-v2";
    // opensearch
    FeatureFlag["SYNCHRONOUS_OPENSEARCH_UPDATES"] = "synchronous-opensearch-updates";
    // temporal
    FeatureFlag["TEMPORAL_AUTOMATIONS"] = "temporal-automations";
    FeatureFlag["TEMPORAL_EMAILS"] = "temporal-emails";
})(FeatureFlag || (exports.FeatureFlag = FeatureFlag = {}));
var FeatureFlagRedisKey;
(function (FeatureFlagRedisKey) {
    FeatureFlagRedisKey["CSV_EXPORT_COUNT"] = "csvExportCount";
    FeatureFlagRedisKey["MEMBER_ENRICHMENT_COUNT"] = "memberEnrichmentCount";
    FeatureFlagRedisKey["ORGANIZATION_ENRICHMENT_COUNT"] = "organizationEnrichmentCount";
})(FeatureFlagRedisKey || (exports.FeatureFlagRedisKey = FeatureFlagRedisKey = {}));
//# sourceMappingURL=featureFlags.js.map