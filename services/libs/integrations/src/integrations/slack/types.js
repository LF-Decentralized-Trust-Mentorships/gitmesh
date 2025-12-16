"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackStreamType = exports.SlackActivityType = void 0;
var SlackActivityType;
(function (SlackActivityType) {
    SlackActivityType["JOINED_CHANNEL"] = "channel_joined";
    SlackActivityType["MESSAGE"] = "message";
})(SlackActivityType || (exports.SlackActivityType = SlackActivityType = {}));
var SlackStreamType;
(function (SlackStreamType) {
    SlackStreamType["ROOT"] = "root";
    SlackStreamType["CHANNEL"] = "channel";
    SlackStreamType["MEMBERS"] = "members";
    SlackStreamType["THREADS"] = "threads";
})(SlackStreamType || (exports.SlackStreamType = SlackStreamType = {}));
//# sourceMappingURL=types.js.map