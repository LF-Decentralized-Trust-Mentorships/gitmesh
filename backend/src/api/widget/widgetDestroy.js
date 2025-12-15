"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const widgetService_1 = __importDefault(require("../../services/widgetService"));
const track_1 = __importDefault(require("../../segment/track"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.widgetDestroy);
    await new widgetService_1.default(req).destroyAll(req.query.ids);
    const payload = true;
    (0, track_1.default)('Widget Deleted', { ids: req.query.ids }, Object.assign({}, req));
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=widgetDestroy.js.map