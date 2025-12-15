"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessStreamDataQueueMessage = exports.IntegrationDataWorkerQueueMessageType = void 0;
var IntegrationDataWorkerQueueMessageType;
(function (IntegrationDataWorkerQueueMessageType) {
    IntegrationDataWorkerQueueMessageType["PROCESS_STREAM_DATA"] = "process_stream_data";
})(IntegrationDataWorkerQueueMessageType || (exports.IntegrationDataWorkerQueueMessageType = IntegrationDataWorkerQueueMessageType = {}));
class ProcessStreamDataQueueMessage {
    constructor(dataId) {
        this.dataId = dataId;
        this.type = IntegrationDataWorkerQueueMessageType.PROCESS_STREAM_DATA;
    }
}
exports.ProcessStreamDataQueueMessage = ProcessStreamDataQueueMessage;
//# sourceMappingURL=index.js.map