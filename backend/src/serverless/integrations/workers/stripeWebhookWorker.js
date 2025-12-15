"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processStripeWebhook = void 0;
const logging_1 = require("@gitmesh/logging");
const redis_1 = require("@gitmesh/redis");
const moment_1 = __importDefault(require("moment"));
const stripe_1 = require("stripe");
const common_1 = require("@gitmesh/common");
const types_1 = require("@gitmesh/types");
const conf_1 = require("../../../conf");
const sequelizeRepository_1 = __importDefault(require("../../../database/repositories/sequelizeRepository"));
const plans_1 = __importDefault(require("../../../security/plans"));
const workerTypes_1 = require("../../types/workerTypes");
const nodeWorkerSQS_1 = require("../../utils/nodeWorkerSQS");
const log = (0, logging_1.getServiceChildLogger)('stripeWebhookWorker');
const stripe = new stripe_1.Stripe(conf_1.PLANS_CONFIG.stripeSecretKey, {
    apiVersion: '2022-08-01',
    typescript: true,
});
async function stripeWebhookWorker(req) {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, conf_1.PLANS_CONFIG.stripWebhookSigningSecret);
        await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(event.id, {
            type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
            event,
            service: 'stripe-webhooks',
        });
    }
    catch (err) {
        log.error(`Webhook Error: ${err.message}`);
        return {
            status: 400,
        };
    }
    return {
        status: 200,
    };
}
exports.default = stripeWebhookWorker;
const processStripeWebhook = async (message) => {
    log.info({ message }, 'Got event from stripe webhook!');
    log.warn(message);
    const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
    const redis = await (0, redis_1.getRedisClient)(conf_1.REDIS_CONFIG, true);
    const apiPubSubEmitter = new redis_1.RedisPubSubEmitter('api-pubsub', redis, (err) => {
        log.error({ err }, 'Error in api-ws emitter!');
    }, log);
    const stripeWebhookMessage = message.event;
    switch (stripeWebhookMessage.type) {
        case 'checkout.session.completed': {
            log.info({ tenant: stripeWebhookMessage.data.object.client_reference_id }, 'Processing checkout.session.complete');
            // get subscription information from checkout event
            const subscription = await stripe.subscriptions.retrieve(stripeWebhookMessage.data.object.subscription);
            const subscriptionEndsAt = subscription.current_period_end;
            const tenantId = stripeWebhookMessage.data.object.client_reference_id;
            const tenant = await options.database.tenant.findByPk(tenantId);
            let productPlan;
            if (subscription.plan.product === conf_1.PLANS_CONFIG.stripeSignalsPlanProductId) {
                productPlan = plans_1.default.values.signals;
            }
            else if (subscription.plan.product === conf_1.PLANS_CONFIG.stripeGrowthPlanProductId) {
                productPlan = plans_1.default.values.growth;
            }
            else {
                log.error({ subscription }, `Unknown product in subscription`);
                process.exit(1);
            }
            if (!tenant) {
                log.error({ tenantId }, 'Tenant not found!');
                process.exit(1);
            }
            else {
                log.info({ tenantId }, `Tenant found - updating tenant plan to ${productPlan} plan!`);
                await tenant.update({
                    plan: productPlan,
                    isTrialPlan: false,
                    trialEndsAt: null,
                    stripeSubscriptionId: stripeWebhookMessage.data.object.subscription,
                    planSubscriptionEndsAt: (0, moment_1.default)(subscriptionEndsAt, 'X').toISOString(),
                });
                log.info('Emitting to redis pubsub for websocket forwarding from api..');
                // Wait few more seconds to ensure redirect is completed
                await (0, common_1.timeout)(3000);
                // Send websocket message to frontend
                apiPubSubEmitter.emit('user', new types_1.ApiWebsocketMessage('tenant-plan-upgraded', JSON.stringify({
                    plan: productPlan,
                    stripeSubscriptionId: stripeWebhookMessage.data.object.subscription,
                }), undefined, tenantId));
                log.info('Done!');
            }
            break;
        }
        case 'invoice.payment_succeeded': {
            // Since we're already updating the plan on session.completed event,
            // we only need to process this event when billing_reason = `subscription_cycle` for the recurring payments.
            // When subscription is newly created, billing_reason is `subscription_create`
            log.info(stripeWebhookMessage.data.object.billing_reason, 'Invoice payment event');
            if (stripeWebhookMessage.data.object.billing_reason === 'subscription_cycle') {
                // find tenant by stripeSubscriptionId
                const tenant = await options.database.tenant.findOne({
                    where: { stripeSubscriptionId: stripeWebhookMessage.data.object.subscription },
                });
                const subscription = await stripe.subscriptions.retrieve(stripeWebhookMessage.data.object.subscription);
                await tenant.update({
                    planSubscriptionEndsAt: (0, moment_1.default)(subscription.current_period_end, 'X').toISOString(),
                });
            }
            break;
        }
        default:
            log.info({ event: message.event }, 'Unsupported event');
    }
};
exports.processStripeWebhook = processStripeWebhook;
//# sourceMappingURL=stripeWebhookWorker.js.map