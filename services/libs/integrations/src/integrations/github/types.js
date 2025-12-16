"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubPullRequestEvents = exports.GithubManualStreamType = exports.GithubStreamType = exports.GithubWehookEvent = exports.GithubWebhookSubType = exports.GithubActivitySubType = exports.GithubActivityType = void 0;
/* eslint-disable  @typescript-eslint/no-explicit-any */
var GithubActivityType;
(function (GithubActivityType) {
    GithubActivityType["DISCUSSION_STARTED"] = "discussion-started";
    GithubActivityType["PULL_REQUEST_OPENED"] = "pull_request-opened";
    GithubActivityType["PULL_REQUEST_CLOSED"] = "pull_request-closed";
    GithubActivityType["PULL_REQUEST_REVIEW_REQUESTED"] = "pull_request-review-requested";
    GithubActivityType["PULL_REQUEST_REVIEWED"] = "pull_request-reviewed";
    GithubActivityType["PULL_REQUEST_ASSIGNED"] = "pull_request-assigned";
    GithubActivityType["PULL_REQUEST_MERGED"] = "pull_request-merged";
    GithubActivityType["ISSUE_OPENED"] = "issues-opened";
    GithubActivityType["ISSUE_CLOSED"] = "issues-closed";
    GithubActivityType["FORK"] = "fork";
    GithubActivityType["STAR"] = "star";
    GithubActivityType["UNSTAR"] = "unstar";
    GithubActivityType["PULL_REQUEST_COMMENT"] = "pull_request-comment";
    GithubActivityType["PULL_REQUEST_REVIEW_THREAD_COMMENT"] = "pull_request-review-thread-comment";
    GithubActivityType["ISSUE_COMMENT"] = "issue-comment";
    GithubActivityType["DISCUSSION_COMMENT"] = "discussion-comment";
    GithubActivityType["AUTHORED_COMMIT"] = "authored-commit";
})(GithubActivityType || (exports.GithubActivityType = GithubActivityType = {}));
var GithubActivitySubType;
(function (GithubActivitySubType) {
    GithubActivitySubType["PULL_REQUEST_REVIEW_REQUESTED_SINGLE"] = "pull_request-review-requested-single";
    GithubActivitySubType["PULL_REQUEST_REVIEW_REQUESTED_MULTIPLE"] = "pull_request-review-requested-multiple";
    GithubActivitySubType["DISCUSSION_COMMENT_START"] = "discussion-comment-start";
    GithubActivitySubType["DISCUSSION_COMMENT_REPLY"] = "discussion-comment-reply";
})(GithubActivitySubType || (exports.GithubActivitySubType = GithubActivitySubType = {}));
var GithubWebhookSubType;
(function (GithubWebhookSubType) {
    GithubWebhookSubType["DISCUSSION_COMMENT_START"] = "discussion-comment-start";
    GithubWebhookSubType["DISCUSSION_COMMENT_REPLY"] = "discussion-comment-reply";
})(GithubWebhookSubType || (exports.GithubWebhookSubType = GithubWebhookSubType = {}));
var GithubWehookEvent;
(function (GithubWehookEvent) {
    GithubWehookEvent["ISSUES"] = "issues";
    GithubWehookEvent["DISCUSSION"] = "discussion";
    GithubWehookEvent["PULL_REQUEST"] = "pull_request";
    GithubWehookEvent["PULL_REQUEST_REVIEW"] = "pull_request_review";
    GithubWehookEvent["STAR"] = "star";
    GithubWehookEvent["FORK"] = "fork";
    GithubWehookEvent["DISCUSSION_COMMENT"] = "discussion_comment";
    GithubWehookEvent["PULL_REQUEST_REVIEW_COMMENT"] = "pull_request_review_comment";
    GithubWehookEvent["ISSUE_COMMENT"] = "issue_comment";
    GithubWehookEvent["PULL_REQUEST_COMMENT"] = "pull_request_comment";
})(GithubWehookEvent || (exports.GithubWehookEvent = GithubWehookEvent = {}));
var GithubStreamType;
(function (GithubStreamType) {
    GithubStreamType["ROOT"] = "root";
    GithubStreamType["STARGAZERS"] = "stargazers";
    GithubStreamType["FORKS"] = "forks";
    GithubStreamType["PULLS"] = "pulls";
    GithubStreamType["PULL_COMMENTS"] = "pull-comments";
    GithubStreamType["PULL_REVIEW_THREADS"] = "pull-review-threads";
    GithubStreamType["PULL_REVIEW_THREAD_COMMENTS"] = "pull-review-thread-comments";
    GithubStreamType["PULL_COMMITS"] = "pull-commits";
    GithubStreamType["ISSUES"] = "issues";
    GithubStreamType["ISSUE_COMMENTS"] = "issue-comments";
    GithubStreamType["DISCUSSIONS"] = "discussions";
    GithubStreamType["DISCUSSION_COMMENTS"] = "discussion-comments";
})(GithubStreamType || (exports.GithubStreamType = GithubStreamType = {}));
var GithubManualStreamType;
(function (GithubManualStreamType) {
    GithubManualStreamType["ALL"] = "all";
    GithubManualStreamType["STARGAZERS"] = "stargazers";
    GithubManualStreamType["FORKS"] = "forks";
    GithubManualStreamType["PULLS"] = "pulls";
    GithubManualStreamType["ISSUES"] = "issues";
    GithubManualStreamType["DISCUSSIONS"] = "discussions";
})(GithubManualStreamType || (exports.GithubManualStreamType = GithubManualStreamType = {}));
var GithubPullRequestEvents;
(function (GithubPullRequestEvents) {
    GithubPullRequestEvents["REQUEST_REVIEW"] = "ReviewRequestedEvent";
    GithubPullRequestEvents["REVIEW"] = "PullRequestReview";
    GithubPullRequestEvents["ASSIGN"] = "AssignedEvent";
    GithubPullRequestEvents["MERGE"] = "MergedEvent";
    GithubPullRequestEvents["CLOSE"] = "ClosedEvent";
})(GithubPullRequestEvents || (exports.GithubPullRequestEvents = GithubPullRequestEvents = {}));
//# sourceMappingURL=types.js.map