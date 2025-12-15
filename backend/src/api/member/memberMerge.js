"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const track_1 = __importDefault(require("../../segment/track"));
const memberService_1 = __importDefault(require("../../services/memberService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.memberEdit);
    const payload = await new memberService_1.default(req).merge(req.params.memberId, req.body.memberToMerge);
    (0, track_1.default)('Merge members', Object.assign({}, payload), Object.assign({}, req));
    const status = payload.status || 200;
    await req.responseHandler.success(req, res, payload, status);
};
//# sourceMappingURL=memberMerge.js.map