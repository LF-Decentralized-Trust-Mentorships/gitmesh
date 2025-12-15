"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const authService_1 = __importDefault(require("../../services/auth/authService"));
exports.default = async (req, res) => {
    if (!req.currentUser) {
        throw new common_1.Error403(req.language);
    }
    await authService_1.default.sendEmailAddressVerificationEmail(req.language, req.currentUser.email, req.body.tenantId, req);
    const payload = true;
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=authSendEmailAddressVerificationEmail.js.map