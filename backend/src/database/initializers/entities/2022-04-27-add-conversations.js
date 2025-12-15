"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@gitmesh/types");
const tenantService_1 = __importDefault(require("../../../services/tenantService"));
const getUserContext_1 = __importDefault(require("../../utils/getUserContext"));
const activityService_1 = __importDefault(require("../../../services/activityService"));
const sequelizeRepository_1 = __importDefault(require("../../repositories/sequelizeRepository"));
exports.default = async () => {
    const tenants = (await tenantService_1.default._findAndCountAllForEveryUser({ filter: {} })).rows;
    for (const tenant of tenants) {
        const userContext = await (0, getUserContext_1.default)(tenant.id);
        const as = new activityService_1.default(userContext);
        const discordActivities = await as.findAndCountAll({
            filter: { platform: types_1.PlatformType.DISCORD, type: 'message' },
            orderBy: 'timestamp_ASC',
        });
        for (const discordActivity of discordActivities.rows) {
            if (discordActivity.parentId) {
                // get parent activity
                const parentAct = await as.findById(discordActivity.parentId);
                const transaction = await sequelizeRepository_1.default.createTransaction(userContext);
                await as.addToConversation(discordActivity.id, parentAct.id, transaction);
                await sequelizeRepository_1.default.commitTransaction(transaction);
            }
        }
    }
};
//# sourceMappingURL=2022-04-27-add-conversations.js.map