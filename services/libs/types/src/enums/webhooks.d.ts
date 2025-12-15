export declare enum WebhookState {
    PENDING = "PENDING",
    PROCESSED = "PROCESSED",
    ERROR = "ERROR"
}
export declare enum WebhookType {
    GITHUB = "GITHUB",
    DISCORD = "DISCORD",
    DISCOURSE = "DISCOURSE",
    GROUPSIO = "GROUPSIO",
    GENERATED = "GENERATED"
}
export declare enum DiscordWebsocketEvent {
    MEMBER_ADDED = "member_added",
    MEMBER_UPDATED = "member_updated",
    MESSAGE_CREATED = "message_created",
    MESSAGE_UPDATED = "message_updated"
}
export interface DiscordWebsocketPayload {
    event: DiscordWebsocketEvent;
    data: any;
}
