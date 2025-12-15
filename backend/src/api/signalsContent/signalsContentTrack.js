"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const permissions_1 = __importDefault(require("../../security/permissions"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const signalsContentService_1 = __importDefault(require("../../services/signalsContentService"));
const track_1 = __importDefault(require("../../segment/track"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.signalsContentRead);
    const event = req.body.event;
    const params = req.body.params;
    switch (event) {
        case 'postClicked':
            signalsContentService_1.default.trackPostClicked(req.body.url, req.body.platform, req);
            break;
        case 'generatedReply':
            (0, track_1.default)('Signals AI reply generated', {
                title: params.title,
                description: params.description,
                platform: params.platform,
                reply: params.reply,
                url: params.url,
            }, Object.assign({}, req));
            break;
        case 'generatedReplyFeedback':
            (0, track_1.default)('Signals AI reply feedback', {
                type: params.type,
                title: params.title,
                description: params.description,
                platform: params.platform,
                reply: params.reply,
                url: params.url,
            }, Object.assign({}, req));
            break;
        case 'generatedReplyCopied':
            (0, track_1.default)('Signals AI reply copied', {
                title: params.title,
                description: params.description,
                platform: params.platform,
                url: params.url,
                reply: params.reply,
            }, Object.assign({}, req));
            break;
        default:
            throw new common_1.Error404('en', 'erros.signals.invlaidEvent');
    }
    const out = {
        Success: true,
    };
    await req.responseHandler.success(req, res, out);
};
//# sourceMappingURL=signalsContentTrack.js.map