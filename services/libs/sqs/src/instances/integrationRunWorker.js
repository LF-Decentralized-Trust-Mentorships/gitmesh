"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationRunWorkerEmitter = void 0;
const config_1 = require("../config");
const queue_1 = require("../queue");
const types_1 = require("@gitmesh/types");
class IntegrationRunWorkerEmitter extends queue_1.SqsQueueEmitter {
    constructor(client, tracer, parentLog) {
        super(client, config_1.INTEGRATION_RUN_WORKER_QUEUE_SETTINGS, tracer, parentLog);
    }
    async checkRuns() {
        await this.sendMessage('global', new types_1.CheckRunsQueueMessage());
    }
    async triggerIntegrationRun(tenantId, platform, integrationId, onboarding, isManualRun, manualSettings) {
        await this.sendMessage(integrationId, new types_1.StartIntegrationRunQueueMessage(integrationId, onboarding, isManualRun, manualSettings));
    }
    async triggerRunProcessing(tenantId, platform, runId, isManualRun, manualSettings) {
        await this.sendMessage(runId, new types_1.GenerateRunStreamsQueueMessage(runId, isManualRun, manualSettings), runId);
    }
    async streamProcessed(tenantId, platform, runId) {
        await this.sendMessage(runId, new types_1.StreamProcessedQueueMessage(runId));
    }
}
exports.IntegrationRunWorkerEmitter = IntegrationRunWorkerEmitter;
//# sourceMappingURL=integrationRunWorker.js.map