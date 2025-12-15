"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const permissions_1 = __importDefault(require("../../security/permissions"));
const conversationService_1 = __importDefault(require("../../services/conversationService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.conversationEdit);
    if (req.body.customUrl) {
        await req.responseHandler.error(req, res, new common_1.Error403(req.language, 'communityHelpCenter.errors.planNotSupportingCustomUrls', req.currentTenant.plan));
        return;
    }
    const payload = await new conversationService_1.default(req).updateSettings(req.body);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=conversationSettingsUpdate.js.map