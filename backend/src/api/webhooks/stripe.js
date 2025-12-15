"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripeWebhookWorker_1 = __importDefault(require("../../serverless/integrations/workers/stripeWebhookWorker"));
exports.default = async (req, res) => {
    const out = await (0, stripeWebhookWorker_1.default)(req);
    let status = 200;
    if (out.status === 204) {
        status = 204;
    }
    await req.responseHandler.success(req, res, out, status);
};
//# sourceMappingURL=stripe.js.map