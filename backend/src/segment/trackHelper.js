"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
function getTenatUser(userId, options) {
    let userIdOut;
    if (!userId) {
        // Get current user
        userIdOut = sequelizeRepository_1.default.getCurrentUser(Object.assign({}, options)).id;
    }
    else {
        userIdOut = userId;
    }
    const tenantIdOut = sequelizeRepository_1.default.getCurrentTenant(Object.assign({}, options)).id;
    return {
        userIdOut,
        tenantIdOut,
    };
}
exports.default = getTenatUser;
//# sourceMappingURL=trackHelper.js.map