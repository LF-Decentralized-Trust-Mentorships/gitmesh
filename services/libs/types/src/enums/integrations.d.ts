export declare enum IntegrationState {
    IN_PROGRESS = "in-progress",
    DONE = "done",
    ERROR = "error",
    INACTIVE = "inactive",
    WAITING_APPROVAL = "waiting-approval",
    NEEDS_RECONNECT = "needs-reconnect"
}
export declare enum IntegrationRunState {
    DELAYED = "delayed",
    PENDING = "pending",
    PROCESSING = "processing",
    PROCESSED = "processed",
    ERROR = "error",
    INTEGRATION_DELETED = "integration-deleted"
}
export declare enum IntegrationStreamState {
    DELAYED = "delayed",
    PENDING = "pending",
    PROCESSED = "processed",
    ERROR = "error"
}
export declare enum IntegrationStreamType {
    ROOT = "root",
    CHILD = "child"
}
export declare enum IntegrationStreamDataState {
    DELAYED = "delayed",
    PENDING = "pending",
    PROCESSING = "processing",
    PROCESSED = "processed",
    ERROR = "error"
}
export declare enum IntegrationResultState {
    PENDING = "pending",
    PROCESSING = "processing",
    PROCESSED = "processed",
    ERROR = "error",
    DELAYED = "delayed"
}
export declare enum IntegrationResultType {
    ACTIVITY = "activity",
    MEMBER_ENRICH = "member_enrich",
    ORGANIZATION_ENRICH = "organization_enrich",
    TWITTER_MEMBER_REACH = "twitter_member_reach"
}
