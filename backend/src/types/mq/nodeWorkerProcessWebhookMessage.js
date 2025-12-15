"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeWorkerProcessWebhookMessage = void 0;
const workerTypes_1 = require("../../serverless/types/workerTypes");
const nodeWorkerMessageBase_1 = require("./nodeWorkerMessageBase");
class NodeWorkerProcessWebhookMessage extends nodeWorkerMessageBase_1.NodeWorkerMessageBase {
    constructor(tenantId, webhookId, force, fireGitmeshWebhooks) {
        super(workerTypes_1.NodeWorkerMessageType.PROCESS_WEBHOOK);
        this.tenantId = tenantId;
        this.webhookId = webhookId;
        this.force = force;
        this.fireGitmeshWebhooks = fireGitmeshWebhooks;
    }
}
exports.NodeWorkerProcessWebhookMessage = NodeWorkerProcessWebhookMessage;
//# sourceMappingURL=nodeWorkerProcessWebhookMessage.js.map