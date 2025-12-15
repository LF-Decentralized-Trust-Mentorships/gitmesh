"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const conf_1 = require("../../../conf");
const plans_1 = __importDefault(require("../../../security/plans"));
const tenantService_1 = __importDefault(require("../../../services/tenantService"));
const tenantSubdomain_1 = require("../../../services/tenantSubdomain");
exports.default = async (req, res) => {
    if (!conf_1.PLANS_CONFIG.stripeSecretKey) {
        throw new common_1.Error400(req.language, 'tenant.stripeNotConfigured');
    }
    const stripe = require('stripe')(conf_1.PLANS_CONFIG.stripeSecretKey);
    const { currentTenant } = req;
    const { currentUser } = req;
    if (!currentTenant || !currentUser) {
        throw new common_1.Error403(req.language);
    }
    if (currentTenant.plan !== plans_1.default.values.essential &&
        currentTenant.planStatus !== 'cancel_at_period_end' &&
        currentTenant.planUserId !== currentUser.id) {
        throw new common_1.Error403(req.language);
    }
    let { planStripeCustomerId } = currentTenant;
    if (!planStripeCustomerId || currentTenant.planUserId !== currentUser.id) {
        const stripeCustomer = await stripe.customers.create({
            email: currentUser.email,
            metadata: {
                tenantId: currentTenant.id,
            },
        });
        planStripeCustomerId = stripeCustomer.id;
    }
    await new tenantService_1.default(req).updatePlanUser(currentTenant.id, planStripeCustomerId, currentUser.id);
    const session = await stripe.billingPortal.sessions.create({
        customer: planStripeCustomerId,
        return_url: `${tenantSubdomain_1.tenantSubdomain.frontendUrl(currentTenant)}/plan`,
    });
    await req.responseHandler.success(req, res, session);
};
//# sourceMappingURL=portal.js.map