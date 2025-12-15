"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cron_time_generator_1 = __importDefault(require("cron-time-generator"));
const logging_1 = require("@gitmesh/logging");
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
const nodeWorkerSQS_1 = require("../../serverless/utils/nodeWorkerSQS");
const workerTypes_1 = require("../../serverless/types/workerTypes");
const tenantRepository_1 = __importDefault(require("../../database/repositories/tenantRepository"));
const job = {
    name: 'organization enricher',
    cronTime: cron_time_generator_1.default.everyDay(),
    onTrigger: sendWorkerMessage,
};
async function sendWorkerMessage() {
    const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
    const log = (0, logging_1.getServiceLogger)();
    const tenants = await tenantRepository_1.default.getPayingTenantIds(options);
    log.info(tenants);
    for (const { id } of tenants) {
        const payload = {
            type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
            service: 'enrich-organizations',
            tenantId: id,
        };
        log.info({ payload }, 'enricher worker payload');
        await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(id, payload);
    }
}
exports.default = job;
//# sourceMappingURL=organizationEnricher.js.map