"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var validator_1 = __importDefault(require("validator"));
var common_1 = require("@gitmesh/common");
var sequelize_1 = __importDefault(require("sequelize"));
/**
 * Utilities to use on Sequelize queries.
 */
var SequelizeFilterUtils = /** @class */ (function () {
    function SequelizeFilterUtils() {
    }
    /**
     * If you pass an invalid uuid to a query, it throws an exception.
     * To hack this behaviour, if the uuid is invalid, it creates a new one,
     * that won't match any of the database.
     * If the uuid is invalid, brings no results.
     */
    SequelizeFilterUtils.uuid = function (value) {
        var id = value;
        // If ID is invalid, sequelize throws an error.
        // For that not to happen, if the UUID is invalid, it sets
        // some random uuid
        if (!validator_1["default"].isUUID(id)) {
            id = (0, common_1.generateUUIDv4)();
        }
        return id;
    };
    /**
     * Creates an ilike condition.
     */
    SequelizeFilterUtils.ilikeIncludes = function (model, column, value) {
        var _a;
        return sequelize_1["default"].where(sequelize_1["default"].col("".concat(model, ".").concat(column)), (_a = {},
            _a[sequelize_1["default"].Op.iLike] = "%".concat(value, "%").toLowerCase(),
            _a));
    };
    SequelizeFilterUtils.ilikeIncludesCaseSensitive = function (model, column, value) {
        var _a;
        return sequelize_1["default"].where(sequelize_1["default"].col("".concat(model, ".").concat(column)), (_a = {},
            _a[sequelize_1["default"].Op.like] = "%".concat(value, "%"),
            _a));
    };
    SequelizeFilterUtils.ilikeExact = function (model, column, value) {
        var _a;
        return sequelize_1["default"].where(sequelize_1["default"].col("".concat(model, ".").concat(column)), (_a = {},
            _a[sequelize_1["default"].Op.like] = (value || '').toLowerCase(),
            _a));
    };
    SequelizeFilterUtils.jsonbILikeIncludes = function (model, column, value) {
        var _a;
        return sequelize_1["default"].where(sequelize_1["default"].literal("CAST(\"".concat(model, "\".\"").concat(column, "\" AS TEXT)")), (_a = {},
            _a[sequelize_1["default"].Op.like] = "%".concat(value, "%").toLowerCase(),
            _a));
    };
    SequelizeFilterUtils.customOrderByIfExists = function (field, orderBy) {
        if (orderBy.includes(field)) {
            return [sequelize_1["default"].literal("\"".concat(field, "\"")), orderBy.split('_')[1]];
        }
        return [];
    };
    SequelizeFilterUtils.getFieldLiteral = function (field, model) {
        return sequelize_1["default"].col("\"".concat(model, "\".\"").concat(field, "\""));
    };
    SequelizeFilterUtils.getLiteralProjections = function (fields, model) {
        return fields.reduce(function (acc, field) {
            acc.push([SequelizeFilterUtils.getFieldLiteral(field, model), field]);
            return acc;
        }, []);
    };
    SequelizeFilterUtils.getLiteralProjectionsOfModel = function (model, models, modelAlias) {
        if (modelAlias === void 0) { modelAlias = null; }
        return SequelizeFilterUtils.getLiteralProjections(Object.keys(models[model].rawAttributes), modelAlias !== null && modelAlias !== void 0 ? modelAlias : model);
    };
    SequelizeFilterUtils.getNativeTableFieldAggregations = function (fields, model) {
        return fields.reduce(function (acc, field) {
            acc[field] = SequelizeFilterUtils.getFieldLiteral(field, model);
            return acc;
        }, {});
    };
    return SequelizeFilterUtils;
}());
exports["default"] = SequelizeFilterUtils;
