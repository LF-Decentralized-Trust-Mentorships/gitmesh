"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const track_1 = __importDefault(require("../../segment/track"));
const userCreator_1 = __importDefault(require("../../services/user/userCreator"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.userCreate);
    const creator = new userCreator_1.default(req);
    const payload = await creator.execute(req.body);
    (0, track_1.default)('User Invited', Object.assign({}, req.body), Object.assign({}, req));
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=userCreate.js.map