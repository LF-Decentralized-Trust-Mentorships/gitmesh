"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const tenantService_1 = __importDefault(require("../../services/tenantService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const permissions_1 = __importDefault(require("../../security/permissions"));
exports.default = async (req, res) => {
    if (!req.currentUser || !req.currentUser.id) {
        throw new common_1.Error403(req.language);
    }
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.memberRead);
    const payload = await new tenantService_1.default(req).findMembersToMerge(req.query);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=tenantMembersToMerge.js.map