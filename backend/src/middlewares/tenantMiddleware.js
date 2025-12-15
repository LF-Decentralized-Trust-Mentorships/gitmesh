"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantMiddleware = void 0;
const tenantService_1 = __importDefault(require("../services/tenantService"));
async function tenantMiddleware(req, res, next, value) {
    try {
        const tenant = await new tenantService_1.default(req).findById(value);
        req.currentTenant = tenant;
        next();
    }
    catch (error) {
        next(error);
    }
}
exports.tenantMiddleware = tenantMiddleware;
//# sourceMappingURL=tenantMiddleware.js.map