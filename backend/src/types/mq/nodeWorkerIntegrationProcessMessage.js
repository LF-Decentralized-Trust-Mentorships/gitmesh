"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeWorkerIntegrationProcessMessage = void 0;
const workerTypes_1 = require("../../serverless/types/workerTypes");
const nodeWorkerMessageBase_1 = require("./nodeWorkerMessageBase");
class NodeWorkerIntegrationProcessMessage extends nodeWorkerMessageBase_1.NodeWorkerMessageBase {
    constructor(runId, streamId, fireGitmeshWebhooks) {
        super(workerTypes_1.NodeWorkerMessageType.INTEGRATION_PROCESS);
        this.runId = runId;
        this.streamId = streamId;
        this.fireGitmeshWebhooks = fireGitmeshWebhooks;
    }
}
exports.NodeWorkerIntegrationProcessMessage = NodeWorkerIntegrationProcessMessage;
//# sourceMappingURL=nodeWorkerIntegrationProcessMessage.js.map