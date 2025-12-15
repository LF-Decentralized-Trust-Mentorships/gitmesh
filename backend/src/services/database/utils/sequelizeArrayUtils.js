"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
var sequelize_1 = __importStar(require("sequelize"));
var conf_1 = require("../../conf");
var SequelizeArrayUtils = /** @class */ (function () {
    function SequelizeArrayUtils() {
    }
    Object.defineProperty(SequelizeArrayUtils, "DataType", {
        // MySQL doesn't have Array Field
        get: function () {
            return conf_1.DB_CONFIG.dialect === 'mysql' ? sequelize_1.DataTypes.JSON : sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT);
        },
        enumerable: false,
        configurable: true
    });
    SequelizeArrayUtils.filter = function (tableName, fieldName, filterValue) {
        var _a, _b, _c;
        var filterValueAsArray = Array.isArray(filterValue) ? filterValue : [filterValue];
        if (conf_1.DB_CONFIG.dialect === 'mysql') {
            return _a = {},
                _a[sequelize_1["default"].Op.and] = filterValueAsArray.map(function (filterValue) {
                    return arrayContainsForMySQL(tableName, fieldName, filterValue);
                }),
                _a;
        }
        return _b = {},
            _b[fieldName] = (_c = {},
                _c[sequelize_1["default"].Op.contains] = filterValueAsArray,
                _c),
            _b;
    };
    return SequelizeArrayUtils;
}());
exports["default"] = SequelizeArrayUtils;
function arrayContainsForMySQL(model, column, value) {
    return sequelize_1["default"].fn('JSON_CONTAINS', sequelize_1["default"].col("".concat(model, ".").concat(column)), "\"".concat(value, "\""));
}
