"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const signalsSettingsService_1 = __importDefault(require("../../services/signalsSettingsService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.signalsActionCreate);
    const payload = await new signalsSettingsService_1.default(req).update(req.body);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=signalsSettingsUpdate.js.map