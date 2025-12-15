"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordWebsocketEvent = exports.WebhookType = exports.WebhookState = void 0;
var WebhookState;
(function (WebhookState) {
    WebhookState["PENDING"] = "PENDING";
    WebhookState["PROCESSED"] = "PROCESSED";
    WebhookState["ERROR"] = "ERROR";
})(WebhookState || (exports.WebhookState = WebhookState = {}));
var WebhookType;
(function (WebhookType) {
    WebhookType["GITHUB"] = "GITHUB";
    WebhookType["DISCORD"] = "DISCORD";
    WebhookType["DISCOURSE"] = "DISCOURSE";
    WebhookType["GROUPSIO"] = "GROUPSIO";
    WebhookType["GENERATED"] = "GENERATED";
})(WebhookType || (exports.WebhookType = WebhookType = {}));
var DiscordWebsocketEvent;
(function (DiscordWebsocketEvent) {
    DiscordWebsocketEvent["MEMBER_ADDED"] = "member_added";
    DiscordWebsocketEvent["MEMBER_UPDATED"] = "member_updated";
    DiscordWebsocketEvent["MESSAGE_CREATED"] = "message_created";
    DiscordWebsocketEvent["MESSAGE_UPDATED"] = "message_updated";
})(DiscordWebsocketEvent || (exports.DiscordWebsocketEvent = DiscordWebsocketEvent = {}));
//# sourceMappingURL=webhooks.js.map