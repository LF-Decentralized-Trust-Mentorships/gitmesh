"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cron_time_generator_1 = __importDefault(require("cron-time-generator"));
const common_1 = require("@gitmesh/common");
const tenantService_1 = __importDefault(require("../../services/tenantService"));
const nodeWorkerSQS_1 = require("../../serverless/utils/nodeWorkerSQS");
const workerTypes_1 = require("../../serverless/types/workerTypes");
const job = {
    name: 'Merge suggestions',
    // every 12 hours
    cronTime: cron_time_generator_1.default.every(12).hours(),
    onTrigger: async () => {
        const tenants = await tenantService_1.default._findAndCountAllForEveryUser({});
        for (const tenant of tenants.rows) {
            await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(tenant.id, {
                type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
                tenant: tenant.id,
                service: 'merge-suggestions',
            });
            await (0, common_1.timeout)(300);
        }
    },
};
exports.default = job;
//# sourceMappingURL=mergeSuggestions.js.map