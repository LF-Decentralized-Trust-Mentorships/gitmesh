"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authService_1 = __importDefault(require("../../services/auth/authService"));
exports.default = async (req, res) => {
    const payload = await authService_1.default.signin(req.body.email, req.body.password, req.body.invitationToken, req.body.tenantId, req);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=authSignIn.js.map