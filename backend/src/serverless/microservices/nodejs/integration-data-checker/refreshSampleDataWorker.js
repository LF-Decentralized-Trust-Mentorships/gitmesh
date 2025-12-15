"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshSampleDataWorker = void 0;
const sequelize_1 = require("sequelize");
const conf_1 = require("../../../../conf");
const getUserContext_1 = __importDefault(require("../../../../database/utils/getUserContext"));
async function refreshSampleDataWorker() {
    // This is only needed for hosted edition
    if (conf_1.API_CONFIG.edition === 'gitmesh-hosted') {
        const tenantId = conf_1.SAMPLE_DATA_CONFIG.tenantId;
        const userContext = await (0, getUserContext_1.default)(conf_1.SAMPLE_DATA_CONFIG.tenantId);
        const updateDays = 1; // Every day we need to refresh
        // These are all the tables that have columns that need to be updated
        const tables = [
            { name: 'activities', columns: ['createdAt', 'timestamp'] },
            { name: 'members', columns: ['joinedAt', 'createdAt'] },
            { name: 'notes', columns: ['createdAt'] },
            { name: 'conversations', columns: ['createdAt'] },
            { name: 'organizations', columns: ['createdAt'] },
            { name: 'tags', columns: ['createdAt'] },
        ];
        // We are using a direct query because it is very specific functionality.
        // There is no point creating repository methods.
        for (const table of tables) {
            for (const column of table.columns) {
                const query = `
        UPDATE ${table.name}
        SET "${column}" = "${column}" + INTERVAL '${updateDays} days'
        WHERE "tenantId" = '${tenantId}'; 
      `;
                await userContext.database.sequelize.query(query, { type: sequelize_1.QueryTypes.UPDATE });
            }
        }
    }
}
exports.refreshSampleDataWorker = refreshSampleDataWorker;
//# sourceMappingURL=refreshSampleDataWorker.js.map