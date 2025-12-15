"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const tenantService_1 = __importDefault(require("../../services/tenantService"));
const nodeWorkerSQS_1 = require("../../serverless/utils/nodeWorkerSQS");
const workerTypes_1 = require("../../serverless/types/workerTypes");
const job = {
    name: 'Weekly Analytics Emails coordinator',
    cronTime: '0 8 * * MON',
    onTrigger: async () => {
        const tenants = await tenantService_1.default._findAndCountAllForEveryUser({});
        for (const tenant of tenants.rows) {
            await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(tenant.id, {
                type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
                tenant: tenant.id,
                service: 'weekly-analytics-emails',
            });
            // Wait 1 second between messages to potentially reduce spike load on cube between each tenant runs
            await (0, common_1.timeout)(1000);
        }
    },
};
exports.default = job;
//# sourceMappingURL=weeklyAnalyticsEmailsCoordinator.js.map