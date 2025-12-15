"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodeWorkerSQS_1 = require("../../serverless/utils/nodeWorkerSQS");
const workerTypes_1 = require("../../serverless/types/workerTypes");
const job = {
    name: 'Refresh sample data',
    // every day
    cronTime: '0 0 * * *',
    onTrigger: async () => {
        await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)('refresh-sample-data', {
            type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
            service: 'refresh-sample-data',
        });
    },
};
exports.default = job;
//# sourceMappingURL=refreshSampleData.js.map