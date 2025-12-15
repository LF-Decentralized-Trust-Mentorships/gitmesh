"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tenantService_1 = __importDefault(require("../../services/tenantService"));
exports.default = async (req, res) => {
    const payload = await new tenantService_1.default(req).viewContacts();
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=tenantViewContacts.js.map