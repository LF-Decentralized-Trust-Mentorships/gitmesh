"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
const nodeWorkerSQS_1 = require("../../serverless/utils/nodeWorkerSQS");
const workerTypes_1 = require("../../serverless/types/workerTypes");
const job = {
    name: 'Integration Data Checker',
    // every hour on weekdays
    cronTime: '0 * * * 1-5',
    onTrigger: async () => {
        const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const integrations = await options.database.integration.findAll({
            where: {
                status: 'done',
            },
        });
        for (const integration of integrations) {
            await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(integration.id, {
                tenantId: integration.tenantId,
                type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
                integrationId: integration.id,
                service: 'integration-data-checker',
            });
        }
    },
};
exports.default = job;
//# sourceMappingURL=integrationDataChecker.js.map