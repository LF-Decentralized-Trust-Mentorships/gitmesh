"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordAPIDataType = exports.DiscordStreamType = exports.DiscordActivityType = void 0;
var DiscordActivityType;
(function (DiscordActivityType) {
    DiscordActivityType["JOINED_GUILD"] = "joined_guild";
    DiscordActivityType["MESSAGE"] = "message";
    DiscordActivityType["THREAD_STARTED"] = "thread_started";
    DiscordActivityType["THREAD_MESSAGE"] = "thread_message";
})(DiscordActivityType || (exports.DiscordActivityType = DiscordActivityType = {}));
var DiscordStreamType;
(function (DiscordStreamType) {
    DiscordStreamType["ROOT"] = "root";
    DiscordStreamType["CHANNEL"] = "channel";
    DiscordStreamType["MEMBERS"] = "members";
    DiscordStreamType["THREADS"] = "threads";
})(DiscordStreamType || (exports.DiscordStreamType = DiscordStreamType = {}));
var DiscordAPIDataType;
(function (DiscordAPIDataType) {
    DiscordAPIDataType["CHANNEL"] = "channel";
    DiscordAPIDataType["MEMBER"] = "member";
})(DiscordAPIDataType || (exports.DiscordAPIDataType = DiscordAPIDataType = {}));
//# sourceMappingURL=types.js.map