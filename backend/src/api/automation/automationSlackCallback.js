"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const permissions_1 = __importDefault(require("../../security/permissions"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const settingsService_1 = __importDefault(require("../../services/settingsService"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.automationCreate);
    const { redirectUrl } = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
    const { url } = req.account;
    await settingsService_1.default.save({ slackWebHook: url }, req);
    await axios_1.default.post(url, {
        text: 'gitmesh.dev notifier has been successfully connected.',
    });
    res.redirect(redirectUrl);
};
//# sourceMappingURL=automationSlackCallback.js.map