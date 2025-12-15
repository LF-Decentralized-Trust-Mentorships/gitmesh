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
const crypto_1 = require("../../utils/crypto");
const serviceSQS_1 = require("@/serverless/utils/serviceSQS");
exports.default = async (req, res) => {
    var _a;
    const signature = req.headers['x-discourse-event-signature'];
    const eventId = req.headers['x-discourse-event-id'];
    const eventType = req.headers['x-discourse-event-type'];
    const event = req.headers['x-discourse-event'];
    const data = req.body;
    let integration;
    try {
        integration = await integrationRepository_1.default.findActiveIntegrationByPlatform(types_1.PlatformType.DISCOURSE, req.params.tenantId);
    }
    catch (error) {
        req.log.error({ error }, 'Internal error when verifying Discourse webhook');
        await req.responseHandler.success(req, res, 'Internal error when verifying Discourse webhook', 200);
        return;
    }
    if (integration) {
        try {
            if (!signature) {
                req.log.error({ signature }, 'Discourse Webhook signature header missing!');
                await req.responseHandler.success(req, res, 'Discourse Webhook signature header missing!', 200);
                return;
            }
            if (!(0, crypto_1.verifyWebhookSignature)(JSON.stringify(data), integration.settings.webhookSecret, signature)) {
                req.log.error({ signature }, 'Discourse Webhook signature verification failed!');
                await req.responseHandler.success(req, res, 'Discourse Webhook signature verification failed!', 200);
                return;
            }
        }
        catch (error) {
            req.log.error({ signature, error }, 'Internal error when verifying discourse webhook');
            await req.responseHandler.success(req, res, 'Internal error when verifying discourse webhook', 200);
            return;
        }
        req.log.info({ integrationId: integration.id }, 'Incoming Discourse Webhook!');
        const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const repo = new incomingWebhookRepository_1.default(options);
        const result = await repo.create({
            tenantId: integration.tenantId,
            integrationId: integration.id,
            type: webhooks_1.WebhookType.DISCOURSE,
            payload: {
                signature,
                eventId,
                eventType,
                event,
                data,
            },
        });
        const streamEmitter = await (0, serviceSQS_1.getIntegrationStreamWorkerEmitter)();
        await streamEmitter.triggerWebhookProcessing(integration.tenantId, integration.platform, result.id);
        await req.responseHandler.success(req, res, {}, 204);
    }
    else {
        req.log.error({ tenantId: (_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.tenantId }, 'No integration found for incoming Discourse Webhook!');
        await req.responseHandler.success(req, res, {}, 200);
    }
};
//# sourceMappingURL=discourse.js.map