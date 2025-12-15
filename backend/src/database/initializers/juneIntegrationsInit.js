"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This script is responsible for generating missing integration created
 * events in June
 */
const dotenv_1 = __importDefault(require("dotenv"));
const dotenv_expand_1 = __importDefault(require("dotenv-expand"));
const logging_1 = require("@gitmesh/logging");
const tenantService_1 = __importDefault(require("../../services/tenantService"));
const getUserContext_1 = __importDefault(require("../utils/getUserContext"));
const integrationService_1 = __importDefault(require("../../services/integrationService"));
const track_1 = __importDefault(require("../../segment/track"));
const path = require('path');
const environmentArg = process.argv[2];
const envFile = environmentArg === 'dev' ? '.env' : `.env-${environmentArg}`;
const env = dotenv_1.default.config({
    path: path.resolve(__dirname, `../../../${envFile}`),
});
dotenv_expand_1.default.expand(env);
const log = (0, logging_1.getServiceLogger)();
async function juneIntegrationsInit() {
    const tenants = await tenantService_1.default._findAndCountAllForEveryUser({});
    // for each tenant
    for (const tenant of tenants.rows) {
        log.info(`processing tenant: ${tenant.id}`);
        const userContext = await (0, getUserContext_1.default)(tenant.id);
        const integrationService = new integrationService_1.default(userContext);
        const integrations = await integrationService.findAndCountAll({ filters: {} });
        for (const integration of integrations.rows) {
            (0, track_1.default)('Integration Created', {
                id: integration.id,
                platform: integration.platform,
                status: integration.status,
            }, userContext, false, integration.createdAt);
        }
    }
}
juneIntegrationsInit();
//# sourceMappingURL=juneIntegrationsInit.js.map