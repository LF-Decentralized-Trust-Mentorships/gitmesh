"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLACK_GRID = void 0;
const types_1 = require("./types");
exports.SLACK_GRID = {
    [types_1.SlackActivityType.JOINED_CHANNEL]: {
        score: 3,
        isContribution: false,
    },
    [types_1.SlackActivityType.MESSAGE]: {
        score: 6,
        isContribution: true,
    },
};
//# sourceMappingURL=grid.js.map