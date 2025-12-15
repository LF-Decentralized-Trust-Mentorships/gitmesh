import { IQueueMessage } from '../';
export declare enum IntegrationDataWorkerQueueMessageType {
    PROCESS_STREAM_DATA = "process_stream_data"
}
export declare class ProcessStreamDataQueueMessage implements IQueueMessage {
    readonly dataId: string;
    readonly type: string;
    constructor(dataId: string);
}
