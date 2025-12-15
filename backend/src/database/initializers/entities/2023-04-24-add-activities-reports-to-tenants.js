"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tenantService_1 = __importDefault(require("../../../services/tenantService"));
const getUserContext_1 = __importDefault(require("../../utils/getUserContext"));
const reportService_1 = __importDefault(require("../../../services/reportService"));
/* eslint-disable no-console */
exports.default = async () => {
    const tenants = await tenantService_1.default._findAndCountAllForEveryUser({});
    // for each tenant
    for (const tenant of tenants.rows) {
        const userContext = await (0, getUserContext_1.default)(tenant.id);
        const rs = new reportService_1.default(userContext);
        console.log(`Creating activities report for tenant ${tenant.id}`);
        await rs.create({
            name: 'Activities report',
            public: false,
            isTemplate: true,
        });
    }
};
//# sourceMappingURL=2023-04-24-add-activities-reports-to-tenants.js.map