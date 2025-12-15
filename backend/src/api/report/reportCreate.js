"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const permissions_1 = __importDefault(require("../../security/permissions"));
const track_1 = __importDefault(require("../../segment/track"));
const reportService_1 = __importDefault(require("../../services/reportService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.reportCreate);
    if (req.body.isTemplate) {
        await req.responseHandler.error(req, res, new common_1.Error403(req.language, 'errors.report.templateReportsCreateNotAllowed'));
        return;
    }
    const payload = await new reportService_1.default(req).create(req.body);
    (0, track_1.default)('Report Created', { id: payload.id, name: payload.name, public: payload.public }, Object.assign({}, req));
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=reportCreate.js.map