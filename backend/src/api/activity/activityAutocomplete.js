"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const permissions_1 = __importDefault(require("../../security/permissions"));
const activityService_1 = __importDefault(require("../../services/activityService"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.activityAutocomplete);
    const payload = await new activityService_1.default(req).findAllAutocomplete(req.query.query, req.query.limit);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=activityAutocomplete.js.map