"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const permissions_1 = __importDefault(require("../../security/permissions"));
const identifyTenant_1 = __importDefault(require("../../segment/identifyTenant"));
const tenantService_1 = __importDefault(require("../../services/tenantService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
exports.default = async (req, res) => {
    req.currentTenant = { id: req.params.id };
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.memberRead);
    let payload;
    if (req.params.id) {
        payload = await new tenantService_1.default(req).findById(req.params.id);
    }
    else {
        payload = await new tenantService_1.default(req).findByUrl(req.query.url);
    }
    if (payload) {
        if (req.currentUser) {
            (0, identifyTenant_1.default)(Object.assign(Object.assign({}, req), { currentTenant: payload }));
        }
        await req.responseHandler.success(req, res, payload);
    }
    else {
        throw new common_1.Error404();
    }
};
//# sourceMappingURL=tenantFind.js.map