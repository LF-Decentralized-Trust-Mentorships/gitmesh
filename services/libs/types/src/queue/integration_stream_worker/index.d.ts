import { IQueueMessage } from '../';
export declare enum IntegrationStreamWorkerQueueMessageType {
    CHECK_STREAMS = "check_streams",
    CONTINUE_PROCESSING_RUN_STREAMS = "continue_processing_run_streams",
    PROCESS_STREAM = "process_stream",
    PROCESS_WEBHOOK_STREAM = "process_webhook_stream"
}
export declare class CheckStreamsQueueMessage implements IQueueMessage {
    readonly type: string;
}
export declare class ContinueProcessingRunStreamsQueueMessage implements IQueueMessage {
    readonly runId: string;
    readonly type: string;
    constructor(runId: string);
}
export declare class ProcessStreamQueueMessage implements IQueueMessage {
    readonly streamId: string;
    readonly type: string;
    constructor(streamId: string);
}
export declare class ProcessWebhookStreamQueueMessage implements IQueueMessage {
    readonly webhookId: string;
    readonly type: string;
    constructor(webhookId: string);
}
