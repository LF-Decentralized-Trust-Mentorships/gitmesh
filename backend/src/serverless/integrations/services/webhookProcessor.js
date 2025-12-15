"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookProcessor = void 0;
const logging_1 = require("@gitmesh/logging");
const moment_1 = __importDefault(require("moment"));
const common_1 = require("@gitmesh/common");
const incomingWebhookRepository_1 = __importDefault(require("../../../database/repositories/incomingWebhookRepository"));
const integrationRepository_1 = __importDefault(require("../../../database/repositories/integrationRepository"));
const sequelizeRepository_1 = __importDefault(require("../../../database/repositories/sequelizeRepository"));
const getUserContext_1 = __importDefault(require("../../../database/utils/getUserContext"));
const nodeWorkerProcessWebhookMessage_1 = require("../../../types/mq/nodeWorkerProcessWebhookMessage");
const webhooks_1 = require("../../../types/webhooks");
const operationsWorker_1 = __importDefault(require("../../dbOperations/operationsWorker"));
const nodeWorkerSQS_1 = require("../../utils/nodeWorkerSQS");
const segmentRepository_1 = __importDefault(require("../../../database/repositories/segmentRepository"));
class WebhookProcessor extends logging_1.LoggerBase {
    constructor(options, integrationServices) {
        super(options.log);
        this.integrationServices = integrationServices;
    }
    async processWebhook(webhookId, force, fireGitmeshWebhooks) {
        const options = (await sequelizeRepository_1.default.getDefaultIRepositoryOptions());
        const repo = new incomingWebhookRepository_1.default(options);
        const webhook = await repo.findById(webhookId);
        let logger = (0, logging_1.getChildLogger)('processWebhook', this.log, { webhookId });
        if (webhook === null || webhook === undefined) {
            logger.error('Webhook not found!');
            return;
        }
        logger.debug('Processing webhook!');
        logger = (0, logging_1.getChildLogger)('processWebhook', this.log, {
            type: webhook.type,
            tenantId: webhook.tenantId,
            integrationId: webhook.integrationId,
        });
        logger.debug('Webhook found!');
        if (!(force === true) && webhook.state !== webhooks_1.WebhookState.PENDING) {
            logger.error({ state: webhook.state }, 'Webhook is not in pending state!');
            return;
        }
        const userContext = await (0, getUserContext_1.default)(webhook.tenantId);
        userContext.log = logger;
        const integration = await integrationRepository_1.default.findById(webhook.integrationId, userContext);
        if (integration.platform === 'github' || integration.platform === 'discord') {
            return;
        }
        const segment = await new segmentRepository_1.default(userContext).findById(integration.segmentId);
        userContext.currentSegments = [segment];
        const intService = (0, common_1.singleOrDefault)(this.integrationServices, (s) => s.type === integration.platform);
        if (intService === undefined) {
            logger.error('No integration service configured!');
            throw new Error(`No integration service configured for type '${integration.platform}'!`);
        }
        const stepContext = {
            startTimestamp: (0, moment_1.default)().utc().unix(),
            limitCount: integration.limitCount || 0,
            onboarding: false,
            pipelineData: {},
            webhook,
            integration,
            serviceContext: userContext,
            repoContext: userContext,
            logger,
        };
        if (integration.settings.updateMemberAttributes) {
            logger.trace('Updating member attributes!');
            await intService.createMemberAttributes(stepContext);
            integration.settings.updateMemberAttributes = false;
            await integrationRepository_1.default.update(integration.id, { settings: integration.settings }, userContext);
        }
        const whContext = Object.assign({}, userContext);
        whContext.transaction = await sequelizeRepository_1.default.createTransaction(whContext);
        try {
            const result = await intService.processWebhook(webhook, stepContext);
            for (const operation of result.operations) {
                if (operation.records.length > 0) {
                    logger.trace({ operationType: operation.type }, `Processing bulk operation with ${operation.records.length} records!`);
                    await (0, operationsWorker_1.default)(operation.type, operation.records, userContext, fireGitmeshWebhooks);
                }
            }
            await repo.markCompleted(webhook.id);
            logger.debug('Webhook processed!');
        }
        catch (err) {
            if (err.rateLimitResetSeconds) {
                logger.warn(err, 'Rate limit reached while processing webhook! Delaying...');
                await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(integration.tenantId, new nodeWorkerProcessWebhookMessage_1.NodeWorkerProcessWebhookMessage(integration.tenantId, webhookId), err.rateLimitResetSeconds + 5);
            }
            else {
                logger.error(err, 'Error processing webhook!');
                await repo.markError(webhook.id, err);
            }
        }
        finally {
            await sequelizeRepository_1.default.commitTransaction(whContext.transaction);
        }
    }
}
exports.WebhookProcessor = WebhookProcessor;
WebhookProcessor.MAX_RETRY_LIMIT = 5;
//# sourceMappingURL=webhookProcessor.js.map