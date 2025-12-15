"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSendgridWebhook = void 0;
const logging_1 = require("@gitmesh/logging");
const eventwebhook_1 = require("@sendgrid/eventwebhook");
const types_1 = require("@gitmesh/types");
const conf_1 = require("../../../conf");
const sequelizeRepository_1 = __importDefault(require("../../../database/repositories/sequelizeRepository"));
const userRepository_1 = __importDefault(require("../../../database/repositories/userRepository"));
const getUserContext_1 = __importDefault(require("../../../database/utils/getUserContext"));
const signalsContentService_1 = __importDefault(require("../../../services/signalsContentService"));
const webhooks_1 = require("../../../types/webhooks");
const workerTypes_1 = require("../../types/workerTypes");
const nodeWorkerSQS_1 = require("../../utils/nodeWorkerSQS");
const log = (0, logging_1.getServiceChildLogger)('sendgridWebhookWorker');
async function sendgridWebhookWorker(req) {
    if (!conf_1.SENDGRID_CONFIG.webhookSigningSecret) {
        log.error('Sendgrid webhook signing secret is not found.');
        return {
            status: 400,
        };
    }
    if (!conf_1.IS_PROD_ENV) {
        log.warn('Sendgrid events will be only sent for production.');
        return {
            status: 200,
        };
    }
    const events = req.body;
    const signature = req.headers[eventwebhook_1.EventWebhookHeader.SIGNATURE().toLowerCase()];
    const timestamp = req.headers[eventwebhook_1.EventWebhookHeader.TIMESTAMP().toLowerCase()];
    const eventWebhookVerifier = new eventwebhook_1.EventWebhook();
    const ecdsaPublicKey = eventWebhookVerifier.convertPublicKeyToECDSA(conf_1.SENDGRID_CONFIG.webhookSigningSecret);
    if (!eventWebhookVerifier.verifySignature(ecdsaPublicKey, req.rawBody, signature, timestamp)) {
        log.error('Sendgrid webhook cannot be verified.');
        return {
            status: 400,
        };
    }
    for (const event of events) {
        if (event.sg_template_id === conf_1.SENDGRID_CONFIG.templateSignalsDigest) {
            await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(event.sg_event_id, {
                type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
                event,
                service: 'sendgrid-webhooks',
            });
        }
    }
    return {
        status: 200,
    };
}
exports.default = sendgridWebhookWorker;
const findPlatform = (str, arr) => {
    const match = arr.find((item) => str.includes(item));
    return match || null;
};
const processSendgridWebhook = async (message) => {
    log.info({ message }, 'Got event from sendgrid webhook!');
    log.warn(message);
    const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
    const sendgridEvent = message.event;
    const user = await userRepository_1.default.findByEmail(sendgridEvent.email, options);
    const userContext = await (0, getUserContext_1.default)(sendgridEvent.tenantId, user.id);
    switch (sendgridEvent.event) {
        case webhooks_1.SendgridWebhookEventType.DIGEST_OPENED: {
            signalsContentService_1.default.trackDigestEmailOpened(userContext);
            break;
        }
        case webhooks_1.SendgridWebhookEventType.POST_CLICKED: {
            const platform = findPlatform(new URL(sendgridEvent.url).hostname, Object.values(types_1.PlatformType));
            signalsContentService_1.default.trackPostClicked(sendgridEvent.url, platform, userContext, 'email');
            break;
        }
        default:
            log.info({ event: message.event }, 'Unsupported event');
    }
};
exports.processSendgridWebhook = processSendgridWebhook;
//# sourceMappingURL=sendgridWebhookWorker.js.map