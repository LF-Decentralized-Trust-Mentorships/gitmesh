"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessWebhookStreamQueueMessage = exports.ProcessStreamQueueMessage = exports.ContinueProcessingRunStreamsQueueMessage = exports.CheckStreamsQueueMessage = exports.IntegrationStreamWorkerQueueMessageType = void 0;
var IntegrationStreamWorkerQueueMessageType;
(function (IntegrationStreamWorkerQueueMessageType) {
    IntegrationStreamWorkerQueueMessageType["CHECK_STREAMS"] = "check_streams";
    IntegrationStreamWorkerQueueMessageType["CONTINUE_PROCESSING_RUN_STREAMS"] = "continue_processing_run_streams";
    IntegrationStreamWorkerQueueMessageType["PROCESS_STREAM"] = "process_stream";
    IntegrationStreamWorkerQueueMessageType["PROCESS_WEBHOOK_STREAM"] = "process_webhook_stream";
})(IntegrationStreamWorkerQueueMessageType || (exports.IntegrationStreamWorkerQueueMessageType = IntegrationStreamWorkerQueueMessageType = {}));
class CheckStreamsQueueMessage {
    constructor() {
        this.type = IntegrationStreamWorkerQueueMessageType.CHECK_STREAMS;
    }
}
exports.CheckStreamsQueueMessage = CheckStreamsQueueMessage;
class ContinueProcessingRunStreamsQueueMessage {
    constructor(runId) {
        this.runId = runId;
        this.type = IntegrationStreamWorkerQueueMessageType.CONTINUE_PROCESSING_RUN_STREAMS;
    }
}
exports.ContinueProcessingRunStreamsQueueMessage = ContinueProcessingRunStreamsQueueMessage;
class ProcessStreamQueueMessage {
    constructor(streamId) {
        this.streamId = streamId;
        this.type = IntegrationStreamWorkerQueueMessageType.PROCESS_STREAM;
    }
}
exports.ProcessStreamQueueMessage = ProcessStreamQueueMessage;
class ProcessWebhookStreamQueueMessage {
    constructor(webhookId) {
        this.webhookId = webhookId;
        this.type = IntegrationStreamWorkerQueueMessageType.PROCESS_WEBHOOK_STREAM;
    }
}
exports.ProcessWebhookStreamQueueMessage = ProcessWebhookStreamQueueMessage;
//# sourceMappingURL=index.js.map