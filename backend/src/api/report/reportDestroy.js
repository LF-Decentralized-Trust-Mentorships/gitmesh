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
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.reportDestroy);
    await new reportService_1.default(req).destroyAll(req.query.ids);
    (0, track_1.default)('Report Deleted', { ids: req.query.ids }, Object.assign({}, req));
    const payload = true;
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=reportDestroy.js.map