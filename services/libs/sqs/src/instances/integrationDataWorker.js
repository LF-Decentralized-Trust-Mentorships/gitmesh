"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationDataWorkerEmitter = void 0;
const config_1 = require("../config");
const queue_1 = require("../queue");
const types_1 = require("@gitmesh/types");
class IntegrationDataWorkerEmitter extends queue_1.SqsQueueEmitter {
    constructor(client, tracer, parentLog) {
        super(client, config_1.INTEGRATION_DATA_WORKER_QUEUE_SETTINGS, tracer, parentLog);
    }
    async triggerDataProcessing(tenantId, platform, dataId) {
        await this.sendMessage(dataId, new types_1.ProcessStreamDataQueueMessage(dataId), dataId);
    }
}
exports.IntegrationDataWorkerEmitter = IntegrationDataWorkerEmitter;
//# sourceMappingURL=integrationDataWorker.js.map