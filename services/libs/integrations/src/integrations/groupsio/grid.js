"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Groupsio_GRID = void 0;
const types_1 = require("./types");
exports.Groupsio_GRID = {
    [types_1.GroupsioActivityType.MEMBER_JOIN]: {
        score: 2,
        isContribution: false,
    },
    [types_1.GroupsioActivityType.MESSAGE]: {
        score: 6,
        isContribution: true,
    },
    [types_1.GroupsioActivityType.MEMBER_LEAVE]: {
        score: -2,
        isContribution: false,
    },
};
//# sourceMappingURL=grid.js.map