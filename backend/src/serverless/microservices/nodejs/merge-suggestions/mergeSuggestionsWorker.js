"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeSuggestionsWorker = void 0;
const opensearch_1 = require("@gitmesh/opensearch");
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const getUserContext_1 = __importDefault(require("../../../../database/utils/getUserContext"));
const memberService_1 = __importDefault(require("../../../../services/memberService"));
const memberTypes_1 = require("../../../../database/repositories/types/memberTypes");
const segmentService_1 = __importDefault(require("../../../../services/segmentService"));
const organizationService_1 = __importDefault(require("@/services/organizationService"));
const conf_1 = require("@/conf");
const log = (0, logging_1.getServiceChildLogger)('mergeSuggestionsWorker');
async function mergeSuggestionsWorker(tenantId) {
    const userContext = await (0, getUserContext_1.default)(tenantId);
    const segmentService = new segmentService_1.default(userContext);
    const { rows: segments } = await segmentService.querySubprojects({});
    userContext.currentSegments = segments;
    userContext.opensearch = (0, opensearch_1.getOpensearchClient)(conf_1.OPENSEARCH_CONFIG);
    log.info(`Generating organization merge suggestions for tenant ${tenantId}!`);
    const organizationService = new organizationService_1.default(userContext);
    await organizationService.generateMergeSuggestions(types_1.OrganizationMergeSuggestionType.BY_IDENTITY);
    log.info(`Done generating organization merge suggestions for tenant ${tenantId}!`);
    log.info(`Generating member merge suggestions for tenant ${tenantId}!`);
    const memberService = new memberService_1.default(userContext);
    // Splitting these because in the near future we will be treating them differently
    const byUsername = await memberService.getMergeSuggestions(memberTypes_1.IMemberMergeSuggestionsType.USERNAME);
    await memberService.addToMerge(byUsername);
    const byEmail = await memberService.getMergeSuggestions(memberTypes_1.IMemberMergeSuggestionsType.EMAIL);
    await memberService.addToMerge(byEmail);
    const bySimilarity = await memberService.getMergeSuggestions(memberTypes_1.IMemberMergeSuggestionsType.SIMILARITY);
    await memberService.addToMerge(bySimilarity);
    log.info(`Done generating member merge suggestions for tenant ${tenantId}!`);
}
exports.mergeSuggestionsWorker = mergeSuggestionsWorker;
//# sourceMappingURL=mergeSuggestionsWorker.js.map