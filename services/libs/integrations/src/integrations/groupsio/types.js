"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupsioWebhookEventType = exports.GroupsioPublishDataType = exports.GroupsioStreamType = exports.GroupsioActivityType = void 0;
// types.ts content
var GroupsioActivityType;
(function (GroupsioActivityType) {
    GroupsioActivityType["MEMBER_JOIN"] = "member_join";
    GroupsioActivityType["MESSAGE"] = "message";
    GroupsioActivityType["MEMBER_LEAVE"] = "member_leave";
})(GroupsioActivityType || (exports.GroupsioActivityType = GroupsioActivityType = {}));
var GroupsioStreamType;
(function (GroupsioStreamType) {
    GroupsioStreamType["GROUP"] = "group";
    GroupsioStreamType["GROUP_MEMBERS"] = "group_members";
    GroupsioStreamType["TOPIC"] = "topic";
})(GroupsioStreamType || (exports.GroupsioStreamType = GroupsioStreamType = {}));
var GroupsioPublishDataType;
(function (GroupsioPublishDataType) {
    GroupsioPublishDataType["MESSAGE"] = "message";
    GroupsioPublishDataType["MEMBER_JOIN"] = "member_join";
    GroupsioPublishDataType["MEMBER_LEFT"] = "member_left";
})(GroupsioPublishDataType || (exports.GroupsioPublishDataType = GroupsioPublishDataType = {}));
var GroupsioWebhookEventType;
(function (GroupsioWebhookEventType) {
    GroupsioWebhookEventType["JOINED"] = "joined";
    GroupsioWebhookEventType["SENT_MESSAGE_ACCEPTED"] = "sent_message_accepted";
    GroupsioWebhookEventType["LEFT"] = "left";
})(GroupsioWebhookEventType || (exports.GroupsioWebhookEventType = GroupsioWebhookEventType = {}));
//# sourceMappingURL=types.js.map