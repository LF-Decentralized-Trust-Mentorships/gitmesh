"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersOpensearch = void 0;
const types_1 = require("@gitmesh/types");
const base_1 = __importDefault(require("./base"));
class MembersOpensearch extends base_1.default {
    constructor() {
        super(...arguments);
        this.fields = {
            id: {
                type: types_1.OpensearchFieldType.UUID,
                customTranslation: {
                    toOpensearch: 'uuid_memberId',
                    fromOpensearch: 'uuid_memberId',
                },
            },
            tenantId: {
                type: types_1.OpensearchFieldType.UUID,
            },
            segmentId: {
                type: types_1.OpensearchFieldType.UUID,
            },
            displayName: {
                type: types_1.OpensearchFieldType.STRING,
            },
            emails: {
                type: types_1.OpensearchFieldType.STRING_ARR,
            },
            score: {
                type: types_1.OpensearchFieldType.INT,
            },
            lastEnriched: {
                type: types_1.OpensearchFieldType.DATE,
            },
            joinedAt: {
                type: types_1.OpensearchFieldType.DATE,
            },
            createdAt: {
                type: types_1.OpensearchFieldType.DATE,
            },
            manuallyCreated: {
                type: types_1.OpensearchFieldType.BOOL,
            },
            reach: {
                type: types_1.OpensearchFieldType.INT,
                customTranslation: {
                    toOpensearch: 'int_totalReach',
                    fromOpensearch: 'int_totalReach',
                },
            },
            numberOfOpenSourceContributions: {
                type: types_1.OpensearchFieldType.INT,
            },
            activeOn: {
                type: types_1.OpensearchFieldType.STRING_ARR,
            },
            activityCount: {
                type: types_1.OpensearchFieldType.INT,
            },
            activityTypes: {
                type: types_1.OpensearchFieldType.STRING_ARR,
            },
            activeDaysCount: {
                type: types_1.OpensearchFieldType.INT,
            },
            lastActive: {
                type: types_1.OpensearchFieldType.DATE,
            },
            averageSentiment: {
                type: types_1.OpensearchFieldType.FLOAT,
            },
            identities: {
                type: types_1.OpensearchFieldType.NESTED,
                customTranslation: {
                    toOpensearch: 'nested_identities.string_platform',
                    fromOpensearch: 'nested_identities',
                },
            },
            attributes: {
                type: types_1.OpensearchFieldType.OBJECT,
            },
            toMergeIds: {
                type: types_1.OpensearchFieldType.UUID_ARR,
            },
            noMergeIds: {
                type: types_1.OpensearchFieldType.UUID_ARR,
            },
            tags: {
                type: types_1.OpensearchFieldType.NESTED,
                customTranslation: {
                    toOpensearch: 'nested_tags.uuid_id',
                    fromOpensearch: 'nested_tags',
                },
            },
            organizations: {
                type: types_1.OpensearchFieldType.NESTED,
                customTranslation: {
                    toOpensearch: 'nested_organizations.uuid_id',
                    fromOpensearch: 'nested_organizations',
                },
            },
        };
    }
}
exports.MembersOpensearch = MembersOpensearch;
//# sourceMappingURL=members.js.map