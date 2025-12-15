"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const userEditor_1 = __importDefault(require("../../services/user/userEditor"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.userEdit);
    const editor = new userEditor_1.default(req);
    await editor.update(req.body);
    const payload = true;
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=userEdit.js.map