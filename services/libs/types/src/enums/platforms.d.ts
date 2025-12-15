export declare enum PlatformType {
    DEVTO = "devto",
    SLACK = "slack",
    DISCORD = "discord",
    GITHUB = "github",
    TWITTER = "twitter",
    REDDIT = "reddit",
    HACKERNEWS = "hackernews",
    LINKEDIN = "linkedin",
    GITMESH = "gitmesh",
    ENRICHMENT = "enrichment",
    HASHNODE = "hashnode",
    KAGGLE = "kaggle",
    MEDIUM = "medium",
    PRODUCTHUNT = "producthunt",
    YOUTUBE = "youtube",
    STACKOVERFLOW = "stackoverflow",
    DISCOURSE = "discourse",
    GIT = "git",
    CRUNCHBASE = "crunchbase",
    HUBSPOT = "hubspot",
    GROUPSIO = "groupsio",
    OTHER = "other"
}
export declare const ALL_PLATFORM_TYPES: PlatformType[];
export declare enum IntegrationType {
    DEVTO = "devto",
    SLACK = "slack",
    REDDIT = "reddit",
    DISCORD = "discord",
    GITHUB = "github",
    TWITTER = "twitter",
    TWITTER_REACH = "twitter-reach",
    HACKER_NEWS = "hackernews",
    LINKEDIN = "linkedin",
    GITMESH = "gitmesh",
    STACKOVERFLOW = "stackoverflow",
    DISCOURSE = "discourse",
    GIT = "git",
    HUBSPOT = "hubspot"
}
export declare const integrationLabel: Record<IntegrationType, string>;
export declare const integrationProfileUrl: Record<IntegrationType, (username: string) => string | null>;
