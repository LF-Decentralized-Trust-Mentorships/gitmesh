"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationProcessor = void 0;
const logging_1 = require("@gitmesh/logging");
const redis_1 = require("@gitmesh/redis");
const integrationRunRepository_1 = __importDefault(require("../../../database/repositories/integrationRunRepository"));
const integrationStreamRepository_1 = __importDefault(require("../../../database/repositories/integrationStreamRepository"));
const integrationRunProcessor_1 = require("./integrationRunProcessor");
const integrationTickProcessor_1 = require("./integrationTickProcessor");
const webhookProcessor_1 = require("./webhookProcessor");
class IntegrationProcessor extends logging_1.LoggerBase {
    constructor(options, redisEmitterClient) {
        super(options.log);
        const integrationServices = [];
        this.log.debug({ supportedIntegrations: integrationServices.map((i) => i.type) }, 'Successfully detected supported integrations!');
        let apiPubSubEmitter;
        if (redisEmitterClient) {
            apiPubSubEmitter = new redis_1.ApiPubSubEmitter(redisEmitterClient, this.log);
        }
        const integrationRunRepository = new integrationRunRepository_1.default(options);
        const integrationStreamRepository = new integrationStreamRepository_1.default(options);
        this.tickProcessor = new integrationTickProcessor_1.IntegrationTickProcessor(options, integrationServices, integrationRunRepository);
        this.webhookProcessor = new webhookProcessor_1.WebhookProcessor(options, integrationServices);
        if (apiPubSubEmitter) {
            this.runProcessor = new integrationRunProcessor_1.IntegrationRunProcessor(options, integrationServices, integrationRunRepository, integrationStreamRepository, apiPubSubEmitter);
        }
        else {
            this.log.warn('No apiPubSubEmitter provided, runProcessor will not be initialized!');
        }
    }
    async processTick() {
        await this.tickProcessor.processTick();
    }
    async processWebhook(webhookId, force, fireGitmeshWebhooks) {
        await this.webhookProcessor.processWebhook(webhookId, force, fireGitmeshWebhooks);
    }
    async process(req) {
        if (this.runProcessor) {
            await this.runProcessor.process(req);
        }
        else {
            throw new Error('runProcessor is not initialized!');
        }
    }
}
exports.IntegrationProcessor = IntegrationProcessor;
//# sourceMappingURL=integrationProcessor.js.map