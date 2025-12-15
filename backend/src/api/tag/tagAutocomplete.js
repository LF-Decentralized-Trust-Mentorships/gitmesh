"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const tagService_1 = __importDefault(require("../../services/tagService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.tagAutocomplete);
    const payload = await new tagService_1.default(req).findAllAutocomplete(req.query.query, req.query.limit);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=tagAutocomplete.js.map