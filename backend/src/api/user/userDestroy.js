"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const userDestroyer_1 = __importDefault(require("../../services/user/userDestroyer"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.userDestroy);
    const remover = new userDestroyer_1.default(req);
    await remover.destroyAll(req.query);
    const payload = true;
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=userDestroy.js.map