"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This script is responsible for generating non
 * existing parentIds for historical discord activities
 */
const dotenv_1 = __importDefault(require("dotenv"));
const dotenv_expand_1 = __importDefault(require("dotenv-expand"));
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const tenantService_1 = __importDefault(require("../../services/tenantService"));
const activityService_1 = __importDefault(require("../../services/activityService"));
const getUserContext_1 = __importDefault(require("../utils/getUserContext"));
const sequelizeRepository_1 = __importDefault(require("../repositories/sequelizeRepository"));
const path = require('path');
const env = dotenv_1.default.config({
    path: path.resolve(__dirname, `../../../.env.prod`),
});
dotenv_expand_1.default.expand(env);
const log = (0, logging_1.getServiceLogger)();
async function conversationInit() {
    const tenants = await tenantService_1.default._findAndCountAllForEveryUser({});
    // for each tenant
    for (const tenant of tenants.rows) {
        log.info({ tenantId: tenant.id }, 'Processing tenant!');
        const userContext = await (0, getUserContext_1.default)(tenant.id);
        const as = new activityService_1.default(userContext);
        const discordActivities = await as.findAndCountAll({
            filter: { platform: types_1.PlatformType.DISCORD, type: 'message' },
            orderBy: 'timestamp_ASC',
        });
        for (const discordActivity of discordActivities.rows) {
            if (discordActivity.parentId) {
                log.info({ activityId: discordActivity.id, parentId: discordActivity.parentId }, 'Activity has a parent id!');
                // get parent activity
                const parentAct = await as.findById(discordActivity.parentId);
                const transaction = await sequelizeRepository_1.default.createTransaction(userContext);
                await as.addToConversation(discordActivity.id, parentAct.id, transaction);
                await sequelizeRepository_1.default.commitTransaction(transaction);
            }
        }
    }
}
conversationInit();
//# sourceMappingURL=conversationInit.js.map