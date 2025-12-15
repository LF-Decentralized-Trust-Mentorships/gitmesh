"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const integrations_1 = require("@gitmesh/integrations");
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
        const githubActs = await as.findAndCountAll({
            filter: { platform: types_1.PlatformType.GITHUB },
            orderBy: 'timestamp_ASC',
        });
        githubActs.rows = githubActs.rows.filter((i) => i.type === integrations_1.GithubActivityType.PULL_REQUEST_COMMENT ||
            i.type === integrations_1.GithubActivityType.ISSUE_COMMENT);
        for (const githubActivity of githubActs.rows) {
            if (githubActivity.parentId && githubActivity.conversationId === null) {
                // get parent activity
                const parentAct = await as.findById(githubActivity.parentId);
                const transaction = await sequelizeRepository_1.default.createTransaction(userContext);
                await as.addToConversation(githubActivity.id, parentAct.id, transaction);
                await sequelizeRepository_1.default.commitTransaction(transaction);
            }
        }
    }
};
//# sourceMappingURL=2022-20-06-github-conversations-init.js.map