"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const permissions_1 = __importDefault(require("../../security/permissions"));
const activityService_1 = __importDefault(require("../../services/activityService"));
const track_1 = __importDefault(require("../../segment/track"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.activityRead);
    const payload = await new activityService_1.default(req).findAndCountAll(req.query);
    if (req.query.filter && Object.keys(req.query.filter).length > 0) {
        (0, track_1.default)('Activities Filtered', { filter: req.query.filter }, Object.assign({}, req));
    }
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=activityList.js.map