"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISCOURSE_GRID = void 0;
const types_1 = require("./types");
exports.DISCOURSE_GRID = {
    [types_1.DiscourseActivityType.CREATE_TOPIC]: {
        score: 8,
        isContribution: true,
    },
    [types_1.DiscourseActivityType.MESSAGE_IN_TOPIC]: {
        score: 6,
        isContribution: true,
    },
    [types_1.DiscourseActivityType.JOIN]: {
        score: 3,
        isContribution: false,
    },
    [types_1.DiscourseActivityType.LIKE]: {
        score: 1,
        isContribution: false,
    },
};
//# sourceMappingURL=grid.js.map