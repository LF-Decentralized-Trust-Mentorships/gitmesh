"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewMemberAutomationQueueMessage = exports.NewActivityAutomationQueueMessage = exports.NodejsWorkerQueueMessageType = void 0;
var NodejsWorkerQueueMessageType;
(function (NodejsWorkerQueueMessageType) {
    NodejsWorkerQueueMessageType["NODE_MICROSERVICE"] = "node_microservice";
})(NodejsWorkerQueueMessageType || (exports.NodejsWorkerQueueMessageType = NodejsWorkerQueueMessageType = {}));
class NewActivityAutomationQueueMessage {
    constructor(tenant, activityId, segmentId) {
        this.tenant = tenant;
        this.activityId = activityId;
        this.segmentId = segmentId;
        this.type = NodejsWorkerQueueMessageType.NODE_MICROSERVICE;
        this.trigger = 'new_activity';
        this.service = 'automation';
    }
}
exports.NewActivityAutomationQueueMessage = NewActivityAutomationQueueMessage;
class NewMemberAutomationQueueMessage {
    constructor(tenant, memberId) {
        this.tenant = tenant;
        this.memberId = memberId;
        this.type = NodejsWorkerQueueMessageType.NODE_MICROSERVICE;
        this.trigger = 'new_member';
        this.service = 'automation';
    }
}
exports.NewMemberAutomationQueueMessage = NewMemberAutomationQueueMessage;
//# sourceMappingURL=index.js.map