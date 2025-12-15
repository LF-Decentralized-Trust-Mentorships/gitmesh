"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendgridWebhookWorker_1 = __importDefault(require("../../serverless/integrations/workers/sendgridWebhookWorker"));
exports.default = async (req, res) => {
    const out = await (0, sendgridWebhookWorker_1.default)(req);
    let status = 200;
    if (out.status === 204) {
        status = 204;
    }
    await req.responseHandler.success(req, res, out, status);
};
//# sourceMappingURL=sendgrid.js.map