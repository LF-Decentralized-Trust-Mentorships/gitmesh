"use strict";
exports.__esModule = true;
var conf_1 = require("../conf");
var Plans = /** @class */ (function () {
    function Plans() {
    }
    Object.defineProperty(Plans, "values", {
        get: function () {
            return {
                essential: 'Essential',
                growth: 'Growth',
                signals: 'Signals',
                scale: 'Scale',
                enterprise: 'Enterprise'
            };
        },
        enumerable: false,
        configurable: true
    });
    Plans.selectPlanByStripePriceId = function (stripePriceId) {
        var premiumStripePriceId = conf_1.PLANS_CONFIG.stripePricePremium;
        if (premiumStripePriceId === stripePriceId) {
            return Plans.values.growth;
        }
        return Plans.values.essential;
    };
    Plans.selectStripePriceIdByPlan = function (plan) {
        if (plan === Plans.values.growth) {
            return conf_1.PLANS_CONFIG.stripePricePremium;
        }
        return null;
    };
    /**
     * When the plan is:
     * - active: The plan will be active.
     * - cancel_at_period_end: The plan will remain active until the end of the period.
     * - error: The plan will remain active, but a warning message will be displayed to the user.
     * - canceled: The workspace plan will change to Free.
     */
    Plans.selectPlanStatus = function (stripePlan) {
        if (!stripePlan) {
            return 'canceled';
        }
        var status = stripePlan.status, cancelAtPeriodEnd = stripePlan.cancelAtPeriodEnd;
        if (status === 'active') {
            if (cancelAtPeriodEnd) {
                return 'cancel_at_period_end';
            }
            return 'active';
        }
        if (status === 'canceled' || status === 'incomplete_expired') {
            return 'canceled';
        }
        return 'error';
    };
    /**
     * If the plan exists and it is not marked
     * to cancel, the tenant can't be destroyed,
     * because future charges might occur
     */
    Plans.allowTenantDestroy = function (plan, planStatus) {
        if (plan === Plans.values.essential || plan === Plans.values.growth) {
            return true;
        }
        return planStatus === 'cancel_at_period_end';
    };
    return Plans;
}());
exports["default"] = Plans;
