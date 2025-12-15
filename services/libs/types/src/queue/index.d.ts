export interface IQueueMessage {
    type: string;
}
export interface ISqsQueueReceiver {
    start(): Promise<void>;
    stop(): any;
    processMessage(data: IQueueMessage): Promise<void>;
}
export interface ISqsQueueEmitter {
    init(): Promise<void>;
    sendMessage(groupId: string, message: IQueueMessage, deduplicationId?: string): Promise<void>;
}
