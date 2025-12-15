"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const track_1 = __importDefault(require("../../segment/track"));
const signalsContentService_1 = __importDefault(require("../../services/signalsContentService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.signalsActionCreate);
    const payload = await signalsContentService_1.default.reply(req.query.title, req.query.description);
    (0, track_1.default)('Signals reply generated', {
        title: req.query.title,
        description: req.query.description,
        reply: payload.reply,
    }, Object.assign({}, req));
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=signalsContentReply.js.map