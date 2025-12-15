"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodejsWorkerEmitter = void 0;
const config_1 = require("../config");
const queue_1 = require("../queue");
const types_1 = require("@gitmesh/types");
class NodejsWorkerEmitter extends queue_1.SqsQueueEmitter {
    constructor(client, tracer, parentLog) {
        super(client, config_1.NODEJS_WORKER_QUEUE_SETTINGS, tracer, parentLog);
    }
    sendMessage(groupId, message, deduplicationId) {
        return super.sendMessage(groupId, message, deduplicationId);
    }
    async processAutomationForNewActivity(tenantId, activityId, segmentId) {
        await this.sendMessage(`${activityId}--${segmentId}`, new types_1.NewActivityAutomationQueueMessage(tenantId, activityId, segmentId), `${activityId}--${segmentId}`);
    }
    async processAutomationForNewMember(tenantId, memberId) {
        await this.sendMessage(memberId, new types_1.NewMemberAutomationQueueMessage(tenantId, memberId), memberId);
    }
}
exports.NodejsWorkerEmitter = NodejsWorkerEmitter;
//# sourceMappingURL=nodejsWorker.js.map