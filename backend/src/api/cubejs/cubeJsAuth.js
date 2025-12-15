"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cubejs_1 = require("@gitmesh/cubejs");
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
// import PermissionChecker from '../../services/user/permissionChecker'
// import Permissions from '../../security/permissions'
exports.default = async (req, res) => {
    // new PermissionChecker(req).validateHas(Permissions.values.memberRead)
    const segments = sequelizeRepository_1.default.getSegmentIds(req);
    const payload = await cubejs_1.CubeJsService.generateJwtToken(req.params.tenantId, segments);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=cubeJsAuth.js.map