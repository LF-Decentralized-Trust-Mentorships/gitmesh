"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dimensions_1 = __importDefault(require("../dimensions"));
const measures_1 = __importDefault(require("../measures"));
/**
 * Gets `new conversations` count for a given date range.
 * Conversations are new when conversation.firstActivityTime is in between given date range.
 * @param cjs cubejs service instance
 * @param startDate
 * @param endDate
 * @returns
 */
exports.default = async (cjs, startDate, endDate) => {
    var _a;
    const newConversations = (_a = (await cjs.load({
        measures: [measures_1.default.CONVERSATION_COUNT],
        timeDimensions: [
            {
                dimension: dimensions_1.default.CONVERSATION_FIRST_ACTIVITY_TIME,
                dateRange: [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')],
            },
        ],
        limit: 1,
    }))[0][measures_1.default.CONVERSATION_COUNT]) !== null && _a !== void 0 ? _a : 0;
    return parseInt(newConversations, 10);
};
//# sourceMappingURL=newConversations.js.map