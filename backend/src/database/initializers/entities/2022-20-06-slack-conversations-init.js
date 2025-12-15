"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@gitmesh/types");
const tenantService_1 = __importDefault(require("../../../services/tenantService"));
const activityService_1 = __importDefault(require("../../../services/activityService"));
const getUserContext_1 = __importDefault(require("../../utils/getUserContext"));
const sequelizeRepository_1 = __importDefault(require("../../repositories/sequelizeRepository"));
exports.default = async () => {
    const tenants = await tenantService_1.default._findAndCountAllForEveryUser({});
    // for each tenant
    for (const tenant of tenants.rows) {
        const userContext = await (0, getUserContext_1.default)(tenant.id);
        const as = new activityService_1.default(userContext);
        const slackActs = await as.findAndCountAll({
            filter: { platform: types_1.PlatformType.SLACK, type: 'message' },
            orderBy: 'timestamp_ASC',
        });
        for (const slackActivity of slackActs.rows) {
            if (slackActivity.parentId && slackActivity.conversationId === null) {
                // get parent activity
                const parentAct = await as.findById(slackActivity.parentId);
                const transaction = await sequelizeRepository_1.default.createTransaction(userContext);
                await as.addToConversation(slackActivity.id, parentAct.id, transaction);
                await sequelizeRepository_1.default.commitTransaction(transaction);
            }
        }
    }
};
//# sourceMappingURL=2022-20-06-slack-conversations-init.js.map