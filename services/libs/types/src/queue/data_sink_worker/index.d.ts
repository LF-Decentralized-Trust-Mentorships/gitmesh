import { IActivityData } from '../../activities';
import { IQueueMessage } from '../';
export declare enum DataSinkWorkerQueueMessageType {
    PROCESS_INTEGRATION_RESULT = "process_integration_result",
    CALCULATE_SENTIMENT = "calculate_sentiment",
    CREATE_AND_PROCESS_ACTIVITY_RESULT = "create_and_process_activity_result",
    CHECK_RESULTS = "check_results"
}
export declare class ProcessIntegrationResultQueueMessage implements IQueueMessage {
    readonly resultId: string;
    readonly type: string;
    constructor(resultId: string);
}
export declare class CalculateSentimentQueueMessage implements IQueueMessage {
    readonly activityId: string;
    readonly type: string;
    constructor(activityId: string);
}
export declare class CreateAndProcessActivityResultQueueMessage implements IQueueMessage {
    readonly tenantId: string;
    readonly segmentId: string;
    readonly integrationId: string;
    readonly activityData: IActivityData;
    readonly type: string;
    constructor(tenantId: string, segmentId: string, integrationId: string, activityData: IActivityData);
}
export declare class CheckResultsQueueMessage implements IQueueMessage {
    readonly type: string;
}
