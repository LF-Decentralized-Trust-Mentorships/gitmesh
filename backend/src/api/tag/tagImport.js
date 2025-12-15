"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const tagService_1 = __importDefault(require("../../services/tagService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.tagImport);
    await new tagService_1.default(req).import(req.body, req.body.importHash);
    const payload = true;
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=tagImport.js.map