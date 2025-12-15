"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckResultsQueueMessage = exports.CreateAndProcessActivityResultQueueMessage = exports.CalculateSentimentQueueMessage = exports.ProcessIntegrationResultQueueMessage = exports.DataSinkWorkerQueueMessageType = void 0;
var DataSinkWorkerQueueMessageType;
(function (DataSinkWorkerQueueMessageType) {
    DataSinkWorkerQueueMessageType["PROCESS_INTEGRATION_RESULT"] = "process_integration_result";
    DataSinkWorkerQueueMessageType["CALCULATE_SENTIMENT"] = "calculate_sentiment";
    DataSinkWorkerQueueMessageType["CREATE_AND_PROCESS_ACTIVITY_RESULT"] = "create_and_process_activity_result";
    DataSinkWorkerQueueMessageType["CHECK_RESULTS"] = "check_results";
})(DataSinkWorkerQueueMessageType || (exports.DataSinkWorkerQueueMessageType = DataSinkWorkerQueueMessageType = {}));
class ProcessIntegrationResultQueueMessage {
    constructor(resultId) {
        this.resultId = resultId;
        this.type = DataSinkWorkerQueueMessageType.PROCESS_INTEGRATION_RESULT;
    }
}
exports.ProcessIntegrationResultQueueMessage = ProcessIntegrationResultQueueMessage;
class CalculateSentimentQueueMessage {
    constructor(activityId) {
        this.activityId = activityId;
        this.type = DataSinkWorkerQueueMessageType.CALCULATE_SENTIMENT;
    }
}
exports.CalculateSentimentQueueMessage = CalculateSentimentQueueMessage;
class CreateAndProcessActivityResultQueueMessage {
    constructor(tenantId, segmentId, integrationId, activityData) {
        this.tenantId = tenantId;
        this.segmentId = segmentId;
        this.integrationId = integrationId;
        this.activityData = activityData;
        this.type = DataSinkWorkerQueueMessageType.CREATE_AND_PROCESS_ACTIVITY_RESULT;
    }
}
exports.CreateAndProcessActivityResultQueueMessage = CreateAndProcessActivityResultQueueMessage;
class CheckResultsQueueMessage {
    constructor() {
        this.type = DataSinkWorkerQueueMessageType.CHECK_RESULTS;
    }
}
exports.CheckResultsQueueMessage = CheckResultsQueueMessage;
//# sourceMappingURL=index.js.map