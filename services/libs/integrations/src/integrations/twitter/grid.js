"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TWITTER_GRID = void 0;
const types_1 = require("./types");
exports.TWITTER_GRID = {
    [types_1.TwitterActivityType.HASHTAG]: {
        score: 6,
        isContribution: true,
    },
    [types_1.TwitterActivityType.MENTION]: {
        score: 6,
        isContribution: true,
    },
    [types_1.TwitterActivityType.FOLLOW]: {
        score: 2,
        isContribution: false,
    },
};
//# sourceMappingURL=grid.js.map