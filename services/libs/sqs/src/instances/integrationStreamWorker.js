"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationStreamWorkerEmitter = void 0;
const config_1 = require("../config");
const queue_1 = require("../queue");
const types_1 = require("@gitmesh/types");
const common_1 = require("@gitmesh/common");
class IntegrationStreamWorkerEmitter extends queue_1.SqsQueueEmitter {
    constructor(client, tracer, parentLog) {
        super(client, config_1.INTEGRATION_STREAM_WORKER_QUEUE_SETTINGS, tracer, parentLog);
    }
    async checkStreams() {
        await this.sendMessage('global', new types_1.CheckStreamsQueueMessage());
    }
    async continueProcessingRunStreams(tenantId, platform, runId) {
        await this.sendMessage(runId, new types_1.ContinueProcessingRunStreamsQueueMessage(runId));
    }
    async triggerStreamProcessing(tenantId, platform, streamId) {
        await this.sendMessage((0, common_1.generateUUIDv1)(), new types_1.ProcessStreamQueueMessage(streamId));
    }
    async triggerWebhookProcessing(tenantId, platform, webhookId) {
        await this.sendMessage((0, common_1.generateUUIDv1)(), new types_1.ProcessWebhookStreamQueueMessage(webhookId));
    }
}
exports.IntegrationStreamWorkerEmitter = IntegrationStreamWorkerEmitter;
//# sourceMappingURL=integrationStreamWorker.js.map