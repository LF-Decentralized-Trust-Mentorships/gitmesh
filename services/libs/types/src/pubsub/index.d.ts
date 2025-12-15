export declare enum ApiMessageType {
    WEBSOCKET_MESSAGE = "websocket_message"
}
export declare class ApiMessageBase {
    readonly type: ApiMessageType;
    protected constructor(type: ApiMessageType);
}
export declare class ApiWebsocketMessage extends ApiMessageBase {
    readonly event: string;
    readonly data: string;
    readonly userId?: string;
    readonly tenantId?: string;
    constructor(event: string, data: string, userId?: string, tenantId?: string);
}
