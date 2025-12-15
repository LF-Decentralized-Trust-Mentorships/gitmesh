"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const track_1 = __importDefault(require("../../segment/track"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const widgetService_1 = __importDefault(require("../../services/widgetService"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.widgetCreate);
    const payload = await new widgetService_1.default(req).create(req.body);
    (0, track_1.default)('Widget Created', {
        id: payload.id,
        reportId: payload.report ? payload.report.id : undefined,
    }, Object.assign({}, req));
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=widgetCreate.js.map