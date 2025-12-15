"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationProfileUrl = exports.integrationLabel = exports.IntegrationType = exports.ALL_PLATFORM_TYPES = exports.PlatformType = void 0;
var PlatformType;
(function (PlatformType) {
    PlatformType["DEVTO"] = "devto";
    PlatformType["SLACK"] = "slack";
    PlatformType["DISCORD"] = "discord";
    PlatformType["GITHUB"] = "github";
    PlatformType["TWITTER"] = "twitter";
    PlatformType["REDDIT"] = "reddit";
    PlatformType["HACKERNEWS"] = "hackernews";
    PlatformType["LINKEDIN"] = "linkedin";
    PlatformType["GITMESH"] = "gitmesh";
    PlatformType["ENRICHMENT"] = "enrichment";
    PlatformType["HASHNODE"] = "hashnode";
    PlatformType["KAGGLE"] = "kaggle";
    PlatformType["MEDIUM"] = "medium";
    PlatformType["PRODUCTHUNT"] = "producthunt";
    PlatformType["YOUTUBE"] = "youtube";
    PlatformType["STACKOVERFLOW"] = "stackoverflow";
    PlatformType["DISCOURSE"] = "discourse";
    PlatformType["GIT"] = "git";
    PlatformType["CRUNCHBASE"] = "crunchbase";
    PlatformType["HUBSPOT"] = "hubspot";
    PlatformType["GROUPSIO"] = "groupsio";
    PlatformType["OTHER"] = "other";
})(PlatformType || (exports.PlatformType = PlatformType = {}));
exports.ALL_PLATFORM_TYPES = Object.keys(PlatformType);
var IntegrationType;
(function (IntegrationType) {
    IntegrationType["DEVTO"] = "devto";
    IntegrationType["SLACK"] = "slack";
    IntegrationType["REDDIT"] = "reddit";
    IntegrationType["DISCORD"] = "discord";
    IntegrationType["GITHUB"] = "github";
    IntegrationType["TWITTER"] = "twitter";
    IntegrationType["TWITTER_REACH"] = "twitter-reach";
    IntegrationType["HACKER_NEWS"] = "hackernews";
    IntegrationType["LINKEDIN"] = "linkedin";
    IntegrationType["GITMESH"] = "gitmesh";
    IntegrationType["STACKOVERFLOW"] = "stackoverflow";
    IntegrationType["DISCOURSE"] = "discourse";
    IntegrationType["GIT"] = "git";
    IntegrationType["HUBSPOT"] = "hubspot";
})(IntegrationType || (exports.IntegrationType = IntegrationType = {}));
exports.integrationLabel = {
    [IntegrationType.DEVTO]: 'DEV',
    [IntegrationType.SLACK]: 'Slack',
    [IntegrationType.REDDIT]: 'Reddit',
    [IntegrationType.DISCORD]: 'Discord',
    [IntegrationType.GITHUB]: 'GitHub',
    [IntegrationType.TWITTER]: 'Twitter',
    [IntegrationType.TWITTER_REACH]: 'Twitter',
    [IntegrationType.HACKER_NEWS]: 'Hacker news',
    [IntegrationType.LINKEDIN]: 'LinkedIn',
    [IntegrationType.GITMESH]: 'Gitmesh',
    [IntegrationType.STACKOVERFLOW]: 'Stack Overflow',
    [IntegrationType.DISCOURSE]: 'Discourse',
    [IntegrationType.GIT]: 'Git',
    [IntegrationType.HUBSPOT]: 'HubSpot',
};
// Backup url from username if profile url not present in member.attributes.url
exports.integrationProfileUrl = {
    [IntegrationType.DEVTO]: (username) => `https://dev.to/${username}`,
    [IntegrationType.SLACK]: (username) => `https://slack.com/${username}`,
    [IntegrationType.REDDIT]: (username) => `https://reddit.com/user/${username}`,
    [IntegrationType.DISCORD]: (username) => `https://discord.com/${username}`,
    [IntegrationType.GITHUB]: (username) => `https://github.com/${username}`,
    [IntegrationType.TWITTER]: (username) => `https://twitter.com/${username}`,
    [IntegrationType.TWITTER_REACH]: (username) => `https://twitter.com/${username}`,
    [IntegrationType.HACKER_NEWS]: (username) => `https://news.ycombinator.com/user?id=${username}`,
    [IntegrationType.LINKEDIN]: (username) => !(username === null || username === void 0 ? void 0 : username.includes('private-')) ? `https://linkedin.com/in/${username}` : null,
    [IntegrationType.GITMESH]: () => null,
    [IntegrationType.STACKOVERFLOW]: (username) => `https://stackoverflow.com/users/${username}`,
    [IntegrationType.DISCOURSE]: () => null,
    [IntegrationType.GIT]: () => null,
    [IntegrationType.HUBSPOT]: () => null,
};
//# sourceMappingURL=platforms.js.map