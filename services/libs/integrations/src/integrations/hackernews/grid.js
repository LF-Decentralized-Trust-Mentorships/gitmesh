"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HACKERNEWS_GRID = void 0;
const types_1 = require("./types");
exports.HACKERNEWS_GRID = {
    [types_1.HackerNewsActivityType.POST]: {
        score: 10,
        isContribution: true,
    },
    [types_1.HackerNewsActivityType.COMMENT]: {
        score: 6,
        isContribution: true,
    },
};
//# sourceMappingURL=grid.js.map