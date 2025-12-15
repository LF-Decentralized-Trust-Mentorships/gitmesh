import { IQueueMessage } from '../';
export declare enum IntegrationRunWorkerQueueMessageType {
    START_INTEGRATION_RUN = "start_integration_run",
    GENERATE_RUN_STREAMS = "generate_run_streams",
    STREAM_PROCESSED = "stream_processed",
    CHECK_RUNS = "check_runs"
}
export declare class CheckRunsQueueMessage implements IQueueMessage {
    readonly type: string;
}
export declare class StartIntegrationRunQueueMessage implements IQueueMessage {
    readonly integrationId: string;
    readonly onboarding: boolean;
    readonly isManualRun?: boolean;
    readonly manualSettings?: unknown;
    readonly type: string;
    constructor(integrationId: string, onboarding: boolean, isManualRun?: boolean, manualSettings?: unknown);
}
export declare class GenerateRunStreamsQueueMessage implements IQueueMessage {
    readonly runId: string;
    readonly isManualRun?: boolean;
    readonly manualSettings?: unknown;
    readonly type: string;
    constructor(runId: string, isManualRun?: boolean, manualSettings?: unknown);
}
export declare class StreamProcessedQueueMessage implements IQueueMessage {
    readonly runId: string;
    readonly type: string;
    constructor(runId: string);
}
