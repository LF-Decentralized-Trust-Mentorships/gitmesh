"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This script is responsible for generating organizationIds
 * for the existing activities
 */
const sequelize_1 = require("sequelize");
const logging_1 = require("@gitmesh/logging");
const tenantService_1 = __importDefault(require("../../services/tenantService"));
const getUserContext_1 = __importDefault(require("../utils/getUserContext"));
const memberService_1 = __importDefault(require("../../services/memberService"));
const memberEnrichmentService_1 = __importDefault(require("../../services/premium/enrichment/memberEnrichmentService"));
const log = (0, logging_1.getServiceChildLogger)('fixer');
async function memberEnrichmentAddOrganization() {
    const tenants = await tenantService_1.default._findAndCountAllForEveryUser({});
    tenants.rows = tenants.rows.filter((i) => i.id === '1a634aad-ca86-4bad-9876-ab2e6ab880cc');
    // for each tenant
    for (const t of tenants.rows) {
        const tenantId = t.id;
        // get user context
        const userContext = await (0, getUserContext_1.default)(tenantId);
        const memberService = new memberService_1.default(userContext);
        const memberEnrichmentService = new memberEnrichmentService_1.default(userContext);
        // get enriched members
        const members = await userContext.database.sequelize.query(`select mc.data as "enrichmentData", m.id as id from members m
    join "memberEnrichmentCache" mc on mc."memberId" = m.id
    where m."tenantId" = :tenantId and m."lastEnriched" is not null;`, {
            replacements: {
                tenantId,
            },
            type: sequelize_1.QueryTypes.SELECT,
        });
        for (const member of members) {
            log.info(`Enriching member ${member.id} again!`);
            const memberById = await memberService.findById(member.id, true, false);
            log.info({ ed: member.enrichmentData }, `Enrichment data:`);
            await memberEnrichmentService.getAttributes();
            const normalizedData = await memberEnrichmentService.normalize(memberById, member.enrichmentData);
            await memberService.upsert(Object.assign(Object.assign({}, normalizedData), { platform: Object.keys(memberById.username)[0] }));
        }
    }
}
memberEnrichmentAddOrganization();
//# sourceMappingURL=memberEnrichmentAddOrganization.js.map