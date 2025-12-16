"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscourseDataType = exports.DiscourseWebhookType = exports.DiscourseStreamType = exports.DiscourseActivityType = void 0;
var DiscourseActivityType;
(function (DiscourseActivityType) {
    DiscourseActivityType["CREATE_TOPIC"] = "create_topic";
    DiscourseActivityType["MESSAGE_IN_TOPIC"] = "message_in_topic";
    DiscourseActivityType["JOIN"] = "join";
    DiscourseActivityType["LIKE"] = "like";
})(DiscourseActivityType || (exports.DiscourseActivityType = DiscourseActivityType = {}));
var DiscourseStreamType;
(function (DiscourseStreamType) {
    DiscourseStreamType["CATEGORIES"] = "categories";
    DiscourseStreamType["TOPICS_FROM_CATEGORY"] = "topicsFromCategory";
    DiscourseStreamType["POSTS_FROM_TOPIC"] = "postsFromTopic";
    DiscourseStreamType["POSTS_BY_IDS"] = "postsByIds";
})(DiscourseStreamType || (exports.DiscourseStreamType = DiscourseStreamType = {}));
var DiscourseWebhookType;
(function (DiscourseWebhookType) {
    DiscourseWebhookType["POST_CREATED"] = "post_created";
    DiscourseWebhookType["USER_CREATED"] = "user_created";
    DiscourseWebhookType["LIKED_A_POST"] = "notification_created";
})(DiscourseWebhookType || (exports.DiscourseWebhookType = DiscourseWebhookType = {}));
var DiscourseDataType;
(function (DiscourseDataType) {
    DiscourseDataType["POST"] = "post";
    DiscourseDataType["USER_WEBHOOK"] = "user_webhook";
    DiscourseDataType["NOTIFICATION_WEBHOOK"] = "notification_webhook";
})(DiscourseDataType || (exports.DiscourseDataType = DiscourseDataType = {}));
//# sourceMappingURL=types.js.map