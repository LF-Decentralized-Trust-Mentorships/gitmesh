"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cron_time_generator_1 = __importDefault(require("cron-time-generator"));
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
let processingRefreshMemberAggregteMVs = false;
const job = {
    name: 'Refresh Materialized View',
    // every two hours
    cronTime: cron_time_generator_1.default.every(2).hours(),
    onTrigger: async () => {
        if (!processingRefreshMemberAggregteMVs) {
            processingRefreshMemberAggregteMVs = true;
        }
        else {
            return;
        }
        const dbOptions = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        await dbOptions.database.sequelize.query('refresh materialized view concurrently "memberActivityAggregatesMVs"');
        processingRefreshMemberAggregteMVs = false;
    },
};
exports.default = job;
//# sourceMappingURL=refreshMaterializedViews.js.map