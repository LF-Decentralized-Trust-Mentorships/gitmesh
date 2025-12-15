"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const auditLogRepository_1 = __importDefault(require("../../database/repositories/auditLogRepository"));
const permissions_1 = __importDefault(require("../../security/permissions"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.auditLogRead);
    const payload = await auditLogRepository_1.default.findAndCountAll(req.query, req);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=auditLogList.js.map