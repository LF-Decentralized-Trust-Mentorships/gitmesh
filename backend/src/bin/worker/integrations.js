"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processWebhook = exports.processIntegration = void 0;
const redis_1 = require("@gitmesh/redis");
const conf_1 = require("../../conf");
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
const integrationProcessor_1 = require("../../serverless/integrations/services/integrationProcessor");
let integrationProcessorInstance;
async function getIntegrationProcessor(logger) {
    if (integrationProcessorInstance)
        return integrationProcessorInstance;
    const options = Object.assign(Object.assign({}, (await sequelizeRepository_1.default.getDefaultIRepositoryOptions())), { log: logger });
    const redisEmitter = await (0, redis_1.getRedisClient)(conf_1.REDIS_CONFIG);
    integrationProcessorInstance = new integrationProcessor_1.IntegrationProcessor(options, redisEmitter);
    return integrationProcessorInstance;
}
const processIntegration = async (msg, messageLogger) => {
    const processor = await getIntegrationProcessor(messageLogger);
    await processor.process(msg);
};
exports.processIntegration = processIntegration;
const processWebhook = async (msg, messageLogger) => {
    const processor = await getIntegrationProcessor(messageLogger);
    await processor.processWebhook(msg.webhookId, msg.force, msg.fireGitmeshWebhooks);
};
exports.processWebhook = processWebhook;
//# sourceMappingURL=integrations.js.map