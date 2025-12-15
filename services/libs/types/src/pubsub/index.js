"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiWebsocketMessage = exports.ApiMessageBase = exports.ApiMessageType = void 0;
var ApiMessageType;
(function (ApiMessageType) {
    ApiMessageType["WEBSOCKET_MESSAGE"] = "websocket_message";
})(ApiMessageType || (exports.ApiMessageType = ApiMessageType = {}));
class ApiMessageBase {
    constructor(type) {
        this.type = type;
    }
}
exports.ApiMessageBase = ApiMessageBase;
class ApiWebsocketMessage extends ApiMessageBase {
    constructor(event, data, userId, tenantId) {
        super(ApiMessageType.WEBSOCKET_MESSAGE);
        this.event = event;
        this.data = data;
        this.userId = userId;
        this.tenantId = tenantId;
    }
}
exports.ApiWebsocketMessage = ApiWebsocketMessage;
//# sourceMappingURL=index.js.map