"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedditStreamType = exports.RedditActivityType = exports.REDDIT_MAX_RETROSPECT_IN_HOURS = void 0;
exports.REDDIT_MAX_RETROSPECT_IN_HOURS = 5;
var RedditActivityType;
(function (RedditActivityType) {
    RedditActivityType["POST"] = "post";
    RedditActivityType["COMMENT"] = "comment";
})(RedditActivityType = exports.RedditActivityType || (exports.RedditActivityType = {}));
var RedditStreamType;
(function (RedditStreamType) {
    RedditStreamType["SUBREDDIT"] = "subreddit";
    RedditStreamType["COMMENTS"] = "comments";
    RedditStreamType["MORE_COMMENTS"] = "more_comments";
})(RedditStreamType = exports.RedditStreamType || (exports.RedditStreamType = {}));
//# sourceMappingURL=types.js.map