"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STACKOVERFLOW_GRID = void 0;
const types_1 = require("./types");
exports.STACKOVERFLOW_GRID = {
    [types_1.StackOverflowActivityType.QUESTION]: {
        score: 10,
        isContribution: true,
    },
    [types_1.StackOverflowActivityType.ANSWER]: {
        score: 6,
        isContribution: true,
    },
};
//# sourceMappingURL=grid.js.map