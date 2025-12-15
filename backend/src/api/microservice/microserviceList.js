"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const microserviceService_1 = __importDefault(require("../../services/microserviceService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.microserviceRead);
    const payload = await new microserviceService_1.default(req).findAndCountAll(req.query);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=microserviceList.js.map