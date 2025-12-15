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
    const payload = await new tenantService_1.default(req).declineInvitation(req.params.token);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=tenantInvitationDecline.js.map