import { IQueueMessage } from '../';
export declare enum NodejsWorkerQueueMessageType {
    NODE_MICROSERVICE = "node_microservice"
}
export declare class NewActivityAutomationQueueMessage implements IQueueMessage {
    readonly tenant: string;
    readonly activityId: string;
    readonly segmentId: string;
    readonly type: string;
    readonly trigger = "new_activity";
    readonly service = "automation";
    constructor(tenant: string, activityId: string, segmentId: string);
}
export declare class NewMemberAutomationQueueMessage implements IQueueMessage {
    readonly tenant: string;
    readonly memberId: string;
    readonly type: string;
    readonly trigger = "new_member";
    readonly service = "automation";
    constructor(tenant: string, memberId: string);
}
