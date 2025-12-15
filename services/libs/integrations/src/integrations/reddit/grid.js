"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REDDIT_GRID = void 0;
const types_1 = require("./types");
exports.REDDIT_GRID = {
    [types_1.RedditActivityType.POST]: {
        score: 10,
        isContribution: true,
    },
    [types_1.RedditActivityType.COMMENT]: {
        score: 6,
        isContribution: true,
    },
};
//# sourceMappingURL=grid.js.map