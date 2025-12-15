"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const tenantService_1 = __importDefault(require("../../services/tenantService"));
exports.default = async (req, res) => {
    if (!req.currentUser || !req.currentUser.id) {
        throw new common_1.Error403(req.language);
    }
    // In the case of the Tenant, specific permissions like tenantDestroy and tenantEdit are
    // checked inside the service
    const payload = await new tenantService_1.default(req).update(req.params.id, req.body);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=tenantUpdate.js.map