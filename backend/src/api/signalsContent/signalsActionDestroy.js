"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const signalsActionService_1 = __importDefault(require("../../services/signalsActionService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.signalsActionDestroy);
    const payload = await new signalsActionService_1.default(req).destroy(req.params.actionId);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=signalsActionDestroy.js.map