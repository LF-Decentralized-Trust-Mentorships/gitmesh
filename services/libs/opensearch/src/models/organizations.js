"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsOpensearch = void 0;
const types_1 = require("@gitmesh/types");
const base_1 = __importDefault(require("./base"));
class OrganizationsOpensearch extends base_1.default {
    constructor() {
        super(...arguments);
        this.fields = {
            id: {
                type: types_1.OpensearchFieldType.UUID,
                customTranslation: {
                    toOpensearch: 'uuid_organizationId',
                    fromOpensearch: 'uuid_organizationId',
                },
            },
            segmentId: {
                type: types_1.OpensearchFieldType.UUID,
            },
            tenantId: {
                type: types_1.OpensearchFieldType.UUID,
            },
            address: {
                type: types_1.OpensearchFieldType.OBJECT,
            },
            logo: {
                type: types_1.OpensearchFieldType.STRING,
            },
            attributes: {
                type: types_1.OpensearchFieldType.STRING,
            },
            createdAt: {
                type: types_1.OpensearchFieldType.DATE,
            },
            description: {
                type: types_1.OpensearchFieldType.STRING,
            },
            displayName: {
                type: types_1.OpensearchFieldType.STRING,
            },
            emails: {
                type: types_1.OpensearchFieldType.STRING_ARR,
            },
            tags: {
                type: types_1.OpensearchFieldType.STRING_ARR,
            },
            employeeCountByCountry: {
                type: types_1.OpensearchFieldType.OBJECT,
            },
            employees: {
                type: types_1.OpensearchFieldType.INT,
            },
            founded: {
                type: types_1.OpensearchFieldType.INT,
            },
            geoLocation: {
                type: types_1.OpensearchFieldType.STRING,
            },
            location: {
                type: types_1.OpensearchFieldType.STRING,
            },
            headline: {
                type: types_1.OpensearchFieldType.STRING,
            },
            industry: {
                type: types_1.OpensearchFieldType.STRING,
            },
            phoneNumbers: {
                type: types_1.OpensearchFieldType.STRING_ARR,
            },
            profiles: {
                type: types_1.OpensearchFieldType.STRING_ARR,
            },
            revenueRange: {
                type: types_1.OpensearchFieldType.OBJECT,
                preventNestedFieldTranslation: true,
            },
            revenueRangeMin: {
                type: types_1.OpensearchFieldType.INT,
            },
            revenueRangeMax: {
                type: types_1.OpensearchFieldType.INT,
            },
            size: {
                type: types_1.OpensearchFieldType.STRING,
            },
            type: {
                type: types_1.OpensearchFieldType.STRING,
            },
            website: {
                type: types_1.OpensearchFieldType.STRING,
            },
            linkedin: {
                type: types_1.OpensearchFieldType.OBJECT,
                preventNestedFieldTranslation: true,
            },
            github: {
                type: types_1.OpensearchFieldType.OBJECT,
                preventNestedFieldTranslation: true,
            },
            crunchbase: {
                type: types_1.OpensearchFieldType.OBJECT,
                preventNestedFieldTranslation: true,
            },
            twitter: {
                type: types_1.OpensearchFieldType.OBJECT,
                preventNestedFieldTranslation: true,
            },
            joinedAt: {
                type: types_1.OpensearchFieldType.DATE,
            },
            lastEnrichedAt: {
                type: types_1.OpensearchFieldType.DATE,
            },
            lastActive: {
                type: types_1.OpensearchFieldType.DATE,
            },
            activeOn: {
                type: types_1.OpensearchFieldType.STRING_ARR,
            },
            activityCount: {
                type: types_1.OpensearchFieldType.INT,
            },
            memberCount: {
                type: types_1.OpensearchFieldType.INT,
            },
            identities: {
                type: types_1.OpensearchFieldType.NESTED,
                customTranslation: {
                    toOpensearch: 'nested_identities.string_name',
                    fromOpensearch: 'nested_identities',
                },
            },
            isTeamOrganization: {
                type: types_1.OpensearchFieldType.BOOL,
            },
            manuallyCreated: {
                type: types_1.OpensearchFieldType.BOOL,
            },
            immediateParent: {
                type: types_1.OpensearchFieldType.STRING_ARR,
            },
            ultimateParent: {
                type: types_1.OpensearchFieldType.STRING_ARR,
            },
            affiliatedProfiles: {
                type: types_1.OpensearchFieldType.STRING_ARR,
            },
            allSubsidiaries: {
                type: types_1.OpensearchFieldType.STRING_ARR,
            },
            alternativeDomains: {
                type: types_1.OpensearchFieldType.STRING_ARR,
            },
            alternativeNames: {
                type: types_1.OpensearchFieldType.STRING_ARR,
            },
            averageEmployeeTenure: {
                type: types_1.OpensearchFieldType.FLOAT,
            },
            averageTenureByLevel: {
                type: types_1.OpensearchFieldType.OBJECT,
            },
            averageTenureByRole: {
                type: types_1.OpensearchFieldType.OBJECT,
            },
            directSubsidiaries: {
                type: types_1.OpensearchFieldType.STRING_ARR,
            },
            employeeChurnRate: {
                type: types_1.OpensearchFieldType.OBJECT,
                preventNestedFieldTranslation: true,
            },
            employeeCountByMonth: {
                type: types_1.OpensearchFieldType.OBJECT,
            },
            employeeGrowthRate: {
                type: types_1.OpensearchFieldType.OBJECT,
                preventNestedFieldTranslation: true,
            },
            employeeCountByMonthByLevel: {
                type: types_1.OpensearchFieldType.OBJECT,
            },
            employeeCountByMonthByRole: {
                type: types_1.OpensearchFieldType.OBJECT,
            },
            gicsSector: {
                type: types_1.OpensearchFieldType.STRING_ARR,
            },
            grossAdditionsByMonth: {
                type: types_1.OpensearchFieldType.OBJECT,
            },
            grossDeparturesByMonth: {
                type: types_1.OpensearchFieldType.OBJECT,
            },
            employeeChurnRate12Month: {
                type: types_1.OpensearchFieldType.FLOAT,
            },
            employeeGrowthRate12Month: {
                type: types_1.OpensearchFieldType.FLOAT,
            },
        };
    }
}
exports.OrganizationsOpensearch = OrganizationsOpensearch;
//# sourceMappingURL=organizations.js.map