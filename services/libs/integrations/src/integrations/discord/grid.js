"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISCORD_GRID = void 0;
const types_1 = require("./types");
exports.DISCORD_GRID = {
    [types_1.DiscordActivityType.JOINED_GUILD]: {
        score: 3,
        isContribution: false,
    },
    [types_1.DiscordActivityType.MESSAGE]: {
        score: 6,
        isContribution: true,
    },
    [types_1.DiscordActivityType.THREAD_STARTED]: {
        score: 6,
        isContribution: true,
    },
    [types_1.DiscordActivityType.THREAD_MESSAGE]: {
        score: 6,
        isContribution: true,
    },
};
//# sourceMappingURL=grid.js.map