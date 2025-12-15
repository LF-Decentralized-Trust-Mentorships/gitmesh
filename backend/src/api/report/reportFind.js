"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const reportService_1 = __importDefault(require("../../services/reportService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const track_1 = __importDefault(require("../../segment/track"));
exports.default = async (req, res) => {
    const reportService = new reportService_1.default(req);
    const payload = await reportService.findById(req.params.id);
    if (!payload.public) {
        new permissionChecker_1.default(req).validateHas(permissions_1.default.values.reportRead);
    }
    if (req.currentUser && req.currentUser.id) {
        const viewedBy = new Set(payload.viewedBy).add(req.currentUser.id);
        await reportService.update(payload.id, { viewedBy: Array.from(viewedBy) });
    }
    (0, track_1.default)('Report Viewed', { id: payload.id, name: payload.name, public: payload.public }, Object.assign({}, req));
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=reportFind.js.map