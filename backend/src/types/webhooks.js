"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookError = exports.SendgridWebhookEventType = exports.DiscordWebsocketEvent = exports.WebhookType = exports.WebhookState = void 0;
const baseError_1 = require("./baseError");
var WebhookState;
(function (WebhookState) {
    WebhookState["PENDING"] = "PENDING";
    WebhookState["PROCESSED"] = "PROCESSED";
    WebhookState["PROCESSING"] = "PROCESSING";
    WebhookState["ERROR"] = "ERROR";
})(WebhookState = exports.WebhookState || (exports.WebhookState = {}));
var WebhookType;
(function (WebhookType) {
    WebhookType["GITHUB"] = "GITHUB";
    WebhookType["DISCORD"] = "DISCORD";
    WebhookType["DISCOURSE"] = "DISCOURSE";
    WebhookType["GROUPSIO"] = "GROUPSIO";
})(WebhookType = exports.WebhookType || (exports.WebhookType = {}));
var DiscordWebsocketEvent;
(function (DiscordWebsocketEvent) {
    DiscordWebsocketEvent["MEMBER_ADDED"] = "member_added";
    DiscordWebsocketEvent["MEMBER_UPDATED"] = "member_updated";
    DiscordWebsocketEvent["MESSAGE_CREATED"] = "message_created";
    DiscordWebsocketEvent["MESSAGE_UPDATED"] = "message_updated";
})(DiscordWebsocketEvent = exports.DiscordWebsocketEvent || (exports.DiscordWebsocketEvent = {}));
var SendgridWebhookEventType;
(function (SendgridWebhookEventType) {
    SendgridWebhookEventType["DIGEST_OPENED"] = "open";
    SendgridWebhookEventType["POST_CLICKED"] = "click";
})(SendgridWebhookEventType = exports.SendgridWebhookEventType || (exports.SendgridWebhookEventType = {}));
class WebhookError extends baseError_1.BaseError {
    constructor(webhookId, message, origError) {
        super(message, origError);
        this.webhookId = webhookId;
    }
}
exports.WebhookError = WebhookError;
//# sourceMappingURL=webhooks.js.map