"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@gitmesh/types");
const integrationRepository_1 = __importDefault(require("../../database/repositories/integrationRepository"));
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
const incomingWebhookRepository_1 = __importDefault(require("../../database/repositories/incomingWebhookRepository"));
const webhooks_1 = require("../../types/webhooks");
const serviceSQS_1 = require("@/serverless/utils/serviceSQS");
exports.default = async (req, res) => {
    const signature = req.headers['x-hub-signature'];
    const event = req.headers['x-github-event'];
    const data = req.body;
    const identifier = data.installation.id.toString();
    const integration = (await integrationRepository_1.default.findByIdentifier(identifier, types_1.PlatformType.GITHUB));
    if (integration) {
        req.log.info({ integrationId: integration.id }, 'Incoming GitHub Webhook!');
        const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const repo = new incomingWebhookRepository_1.default(options);
        const result = await repo.create({
            tenantId: integration.tenantId,
            integrationId: integration.id,
            type: webhooks_1.WebhookType.GITHUB,
            payload: {
                signature,
                event,
                data,
            },
        });
        const streamEmitter = await (0, serviceSQS_1.getIntegrationStreamWorkerEmitter)();
        await streamEmitter.triggerWebhookProcessing(integration.tenantId, integration.platform, result.id);
        await req.responseHandler.success(req, res, {}, 204);
    }
    else {
        req.log.error({ identifier }, 'No integration found for incoming GitHub Webhook!');
        await req.responseHandler.success(req, res, {}, 200);
    }
};
//# sourceMappingURL=github.js.map