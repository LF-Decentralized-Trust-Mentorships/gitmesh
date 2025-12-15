"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSinkWorkerEmitter = void 0;
const config_1 = require("../config");
const queue_1 = require("../queue");
const types_1 = require("@gitmesh/types");
class DataSinkWorkerEmitter extends queue_1.SqsQueueEmitter {
    constructor(client, tracer, parentLog) {
        super(client, config_1.DATA_SINK_WORKER_QUEUE_SETTINGS, tracer, parentLog);
    }
    async triggerResultProcessing(tenantId, platform, resultId, sourceId, deduplicationId) {
        await this.sendMessage(sourceId, new types_1.ProcessIntegrationResultQueueMessage(resultId), deduplicationId || resultId);
    }
    async createAndProcessActivityResult(tenantId, segmentId, integrationId, activity) {
        await this.sendMessage(new Date().toISOString(), new types_1.CreateAndProcessActivityResultQueueMessage(tenantId, segmentId, integrationId, activity));
    }
    async checkResults() {
        await this.sendMessage('global', new types_1.CheckResultsQueueMessage());
    }
}
exports.DataSinkWorkerEmitter = DataSinkWorkerEmitter;
//# sourceMappingURL=dataSinkWorker.js.map