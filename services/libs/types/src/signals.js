"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalsPublishedDates = exports.SignalsPlatforms = exports.SignalsEmailDigestFrequency = exports.SignalsActionType = void 0;
var SignalsActionType;
(function (SignalsActionType) {
    SignalsActionType["THUMBS_UP"] = "thumbs-up";
    SignalsActionType["THUMBS_DOWN"] = "thumbs-down";
    SignalsActionType["BOOKMARK"] = "bookmark";
})(SignalsActionType || (exports.SignalsActionType = SignalsActionType = {}));
var SignalsEmailDigestFrequency;
(function (SignalsEmailDigestFrequency) {
    SignalsEmailDigestFrequency["DAILY"] = "daily";
    SignalsEmailDigestFrequency["WEEKLY"] = "weekly";
})(SignalsEmailDigestFrequency || (exports.SignalsEmailDigestFrequency = SignalsEmailDigestFrequency = {}));
// Enum for SignalsPlatforms
var SignalsPlatforms;
(function (SignalsPlatforms) {
    SignalsPlatforms["GITHUB"] = "github";
    SignalsPlatforms["HACKERNEWS"] = "hackernews";
    SignalsPlatforms["DEVTO"] = "devto";
    SignalsPlatforms["REDDIT"] = "reddit";
    SignalsPlatforms["MEDIUM"] = "medium";
    SignalsPlatforms["STACKOVERFLOW"] = "stackoverflow";
    SignalsPlatforms["TWITTER"] = "twitter";
    SignalsPlatforms["YOUTUBE"] = "youtube";
    SignalsPlatforms["PRODUCTHUNT"] = "producthunt";
    SignalsPlatforms["KAGGLE"] = "kaggle";
    SignalsPlatforms["HASHNODE"] = "hashnode";
    SignalsPlatforms["LINKEDIN"] = "linkedin";
})(SignalsPlatforms || (exports.SignalsPlatforms = SignalsPlatforms = {}));
var SignalsPublishedDates;
(function (SignalsPublishedDates) {
    SignalsPublishedDates["LAST_24_HOURS"] = "Last 24h";
    SignalsPublishedDates["LAST_7_DAYS"] = "Last 7d";
    SignalsPublishedDates["LAST_14_DAYS"] = "Last 14d";
    SignalsPublishedDates["LAST_30_DAYS"] = "Last 30d";
    SignalsPublishedDates["LAST_90_DAYS"] = "Last 90d";
})(SignalsPublishedDates || (exports.SignalsPublishedDates = SignalsPublishedDates = {}));
//# sourceMappingURL=signals.js.map