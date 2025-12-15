"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const identifyTenant_1 = __importDefault(require("../../segment/identifyTenant"));
const tenantService_1 = __importDefault(require("../../services/tenantService"));
exports.default = async (req, res) => {
    // This endpoint is unauthenticated on purpose, but public reprots.
    const payload = await new tenantService_1.default(req).findById(req.params.id);
    if (payload) {
        if (req.currentUser) {
            (0, identifyTenant_1.default)(Object.assign(Object.assign({}, req), { currentTenant: payload }));
        }
        const payloadOut = {
            name: payload.name,
            id: payload.id,
        };
        await req.responseHandler.success(req, res, payloadOut);
    }
    else {
        throw new common_1.Error404();
    }
};
//# sourceMappingURL=tenantFindName.js.map