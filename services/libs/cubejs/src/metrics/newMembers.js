"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dimensions_1 = __importDefault(require("../dimensions"));
const measures_1 = __importDefault(require("../measures"));
/**
 * Gets `new members` count for a given date range.
 * Members are new when member.joinedAt is in between given date range.
 * @param cjs cubejs service instance
 * @param startDate
 * @param endDate
 * @returns
 */
exports.default = async (cjs, startDate, endDate) => {
    var _a;
    const newMembers = (_a = (await cjs.load({
        measures: [measures_1.default.MEMBER_COUNT],
        timeDimensions: [
            {
                dimension: dimensions_1.default.MEMBER_JOINED_AT,
                dateRange: [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')],
            },
        ],
        limit: 1,
        order: { [dimensions_1.default.MEMBER_JOINED_AT]: 'asc' },
        filters: [
            {
                member: dimensions_1.default.IS_TEAM_MEMBER,
                operator: 'equals',
                values: ['false'],
            },
        ],
    }))[0][measures_1.default.MEMBER_COUNT]) !== null && _a !== void 0 ? _a : 0;
    return parseInt(newMembers, 10);
};
//# sourceMappingURL=newMembers.js.map