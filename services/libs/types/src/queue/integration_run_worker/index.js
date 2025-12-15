"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamProcessedQueueMessage = exports.GenerateRunStreamsQueueMessage = exports.StartIntegrationRunQueueMessage = exports.CheckRunsQueueMessage = exports.IntegrationRunWorkerQueueMessageType = void 0;
var IntegrationRunWorkerQueueMessageType;
(function (IntegrationRunWorkerQueueMessageType) {
    IntegrationRunWorkerQueueMessageType["START_INTEGRATION_RUN"] = "start_integration_run";
    IntegrationRunWorkerQueueMessageType["GENERATE_RUN_STREAMS"] = "generate_run_streams";
    IntegrationRunWorkerQueueMessageType["STREAM_PROCESSED"] = "stream_processed";
    IntegrationRunWorkerQueueMessageType["CHECK_RUNS"] = "check_runs";
})(IntegrationRunWorkerQueueMessageType || (exports.IntegrationRunWorkerQueueMessageType = IntegrationRunWorkerQueueMessageType = {}));
class CheckRunsQueueMessage {
    constructor() {
        this.type = IntegrationRunWorkerQueueMessageType.CHECK_RUNS;
    }
}
exports.CheckRunsQueueMessage = CheckRunsQueueMessage;
class StartIntegrationRunQueueMessage {
    constructor(integrationId, onboarding, isManualRun, manualSettings) {
        this.integrationId = integrationId;
        this.onboarding = onboarding;
        this.isManualRun = isManualRun;
        this.manualSettings = manualSettings;
        this.type = IntegrationRunWorkerQueueMessageType.START_INTEGRATION_RUN;
    }
}
exports.StartIntegrationRunQueueMessage = StartIntegrationRunQueueMessage;
class GenerateRunStreamsQueueMessage {
    constructor(runId, isManualRun, manualSettings) {
        this.runId = runId;
        this.isManualRun = isManualRun;
        this.manualSettings = manualSettings;
        this.type = IntegrationRunWorkerQueueMessageType.GENERATE_RUN_STREAMS;
    }
}
exports.GenerateRunStreamsQueueMessage = GenerateRunStreamsQueueMessage;
class StreamProcessedQueueMessage {
    constructor(runId) {
        this.runId = runId;
        this.type = IntegrationRunWorkerQueueMessageType.STREAM_PROCESSED;
    }
}
exports.StreamProcessedQueueMessage = StreamProcessedQueueMessage;
//# sourceMappingURL=index.js.map