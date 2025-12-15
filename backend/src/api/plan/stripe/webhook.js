"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const conf_1 = require("../../../conf");
const plans_1 = __importDefault(require("../../../security/plans"));
const tenantService_1 = __importDefault(require("../../../services/tenantService"));
exports.default = async (req, res) => {
    const stripe = require('stripe')(conf_1.PLANS_CONFIG.stripeSecretKey);
    const event = stripe.webhooks.constructEvent(req.rawBody, req.headers['stripe-signature'], conf_1.PLANS_CONFIG.stripWebhookSigningSecret);
    if (event.type === 'checkout.session.completed') {
        let data = event.data.object;
        data = await stripe.checkout.sessions.retrieve(data.id, { expand: ['line_items'] });
        const stripePriceId = lodash_1.default.get(data, 'line_items.data[0].price.id');
        if (!stripePriceId) {
            throw new Error('line_items.data[0].price.id NULL!');
        }
        const plan = plans_1.default.selectPlanByStripePriceId(stripePriceId);
        const planStripeCustomerId = data.customer;
        await new tenantService_1.default(req).updatePlanStatus(planStripeCustomerId, plan, 'active');
    }
    if (event.type === 'customer.subscription.updated') {
        const data = event.data.object;
        const stripePriceId = lodash_1.default.get(data, 'items.data[0].price.id');
        const plan = plans_1.default.selectPlanByStripePriceId(stripePriceId);
        const planStripeCustomerId = data.customer;
        if (plans_1.default.selectPlanStatus(data) === 'canceled') {
            await new tenantService_1.default(req).updatePlanToFree(planStripeCustomerId);
        }
        else {
            await new tenantService_1.default(req).updatePlanStatus(planStripeCustomerId, plan, plans_1.default.selectPlanStatus(data));
        }
    }
    if (event.type === 'customer.subscription.deleted') {
        const data = event.data.object;
        const planStripeCustomerId = data.customer;
        await new tenantService_1.default(req).updatePlanToFree(planStripeCustomerId);
    }
    await req.responseHandler.success(req, res, {
        received: true,
    });
};
//# sourceMappingURL=webhook.js.map