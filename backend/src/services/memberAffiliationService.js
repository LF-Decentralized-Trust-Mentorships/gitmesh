"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const memberSegmentAffiliationRepository_1 = __importDefault(require("../database/repositories/memberSegmentAffiliationRepository"));
const memberRepository_1 = __importDefault(require("../database/repositories/memberRepository"));
const memberAffiliationRepository_1 = __importDefault(require("../database/repositories/memberAffiliationRepository"));
class MemberAffiliationService extends logging_1.LoggerBase {
    constructor(options) {
        super(options.log);
        this.options = options;
    }
    async findAffiliation(memberId, timestamp) {
        const memberSegmentAffiliationRepository = new memberSegmentAffiliationRepository_1.default(this.options);
        const manualAffiliation = await memberSegmentAffiliationRepository.findForMember(memberId, timestamp);
        if (manualAffiliation) {
            return manualAffiliation.organizationId;
        }
        const currentEmployment = await memberRepository_1.default.findWorkExperience(memberId, timestamp, this.options);
        if (currentEmployment) {
            return currentEmployment.organizationId;
        }
        const mostRecentOrg = await memberRepository_1.default.findMostRecentOrganization(memberId, timestamp, this.options);
        if (mostRecentOrg) {
            return mostRecentOrg.organizationId;
        }
        const mostRecentOrgEver = await memberRepository_1.default.findMostRecentOrganizationEver(memberId, this.options);
        if (mostRecentOrgEver) {
            return mostRecentOrgEver.organizationId;
        }
        return null;
    }
    async updateAffiliation(memberId) {
        await memberAffiliationRepository_1.default.update(memberId, this.options);
    }
}
exports.default = MemberAffiliationService;
//# sourceMappingURL=memberAffiliationService.js.map