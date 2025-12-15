"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWebhookProcessRequest = void 0;
const types_1 = require("@gitmesh/types");
const workerTypes_1 = require("../../../../types/workerTypes");
const nodeWorkerSQS_1 = require("../../../../utils/nodeWorkerSQS");
const sendWebhookProcessRequest = async (tenant, automation, eventId, payload, type = types_1.AutomationType.WEBHOOK) => {
    const event = {
        type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
        service: 'automation-process',
        automationType: type,
        tenant,
        automation,
        eventId,
        payload,
    };
    await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(tenant, event);
};
exports.sendWebhookProcessRequest = sendWebhookProcessRequest;
//# sourceMappingURL=util.js.map