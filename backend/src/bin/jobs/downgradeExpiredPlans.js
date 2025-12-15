"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const cron_time_generator_1 = __importDefault(require("cron-time-generator"));
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
const plans_1 = __importDefault(require("../../security/plans"));
const log = (0, logging_1.getServiceChildLogger)('downgradeExpiredPlansCronJob');
const job = {
    name: 'Downgrade Expired Trial Plans',
    // every day
    cronTime: cron_time_generator_1.default.every(1).days(),
    onTrigger: async () => {
        log.info('Downgrading expired trial plans.');
        const dbOptions = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const expiredTrialTenants = await dbOptions.database.sequelize.query(`select t.id, t.name from tenants t
      where t."isTrialPlan" and t."trialEndsAt" < now()`);
        for (const tenant of expiredTrialTenants[0]) {
            await dbOptions.database.tenant.update({ isTrialPlan: false, trialEndsAt: null, plan: plans_1.default.values.essential }, { returning: true, raw: true, where: { id: tenant.id } });
        }
        log.info('Downgrading expired non-trial plans');
        const expiredNonTrialTenants = await dbOptions.database.sequelize.query(`select t.id, t.name from tenants t
      where (t.plan = ${plans_1.default.values.growth} or t.plan = ${plans_1.default.values.signals} or t.plan = ${plans_1.default.values.scale}) and t."planSubscriptionEndsAt" is not null and t."planSubscriptionEndsAt" + interval '3 days' < now()`);
        for (const tenant of expiredNonTrialTenants[0]) {
            await dbOptions.database.tenant.update({ plan: plans_1.default.values.essential }, { returning: true, raw: true, where: { id: tenant.id } });
        }
    },
};
exports.default = job;
//# sourceMappingURL=downgradeExpiredPlans.js.map