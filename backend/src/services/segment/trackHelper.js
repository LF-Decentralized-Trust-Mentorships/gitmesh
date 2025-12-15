"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
function getTenatUser(userId, options) {
    var userIdOut;
    if (!userId) {
        // Get current user
        userIdOut = sequelizeRepository_1["default"].getCurrentUser(__assign({}, options)).id;
    }
    else {
        userIdOut = userId;
    }
    var tenantIdOut = sequelizeRepository_1["default"].getCurrentTenant(__assign({}, options)).id;
    return {
        userIdOut: userIdOut,
        tenantIdOut: tenantIdOut
    };
}
exports["default"] = getTenatUser;
