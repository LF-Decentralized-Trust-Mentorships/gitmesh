"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationMergeSuggestionType = exports.OrganizationSource = exports.OrganizationAttributeName = void 0;
var OrganizationAttributeName;
(function (OrganizationAttributeName) {
    OrganizationAttributeName["SOURCE_ID"] = "sourceId";
    OrganizationAttributeName["URL"] = "url";
    OrganizationAttributeName["SYNC_REMOTE"] = "syncRemote";
    OrganizationAttributeName["DOMAIN"] = "domain";
})(OrganizationAttributeName || (exports.OrganizationAttributeName = OrganizationAttributeName = {}));
var OrganizationSource;
(function (OrganizationSource) {
    OrganizationSource["EMAIL_DOMAIN"] = "email-domain";
    OrganizationSource["ENRICHMENT"] = "enrichment";
    OrganizationSource["HUBSPOT"] = "hubspot";
    OrganizationSource["GITHUB"] = "github";
    OrganizationSource["UI"] = "ui";
})(OrganizationSource || (exports.OrganizationSource = OrganizationSource = {}));
var OrganizationMergeSuggestionType;
(function (OrganizationMergeSuggestionType) {
    OrganizationMergeSuggestionType["BY_IDENTITY"] = "by_identity";
})(OrganizationMergeSuggestionType || (exports.OrganizationMergeSuggestionType = OrganizationMergeSuggestionType = {}));
//# sourceMappingURL=organizations.js.map