"use strict";
exports.__esModule = true;
var common_1 = require("@gitmesh/common");
var types_1 = require("@gitmesh/types");
var queryTypes_1 = require("./queryTypes");
var RawQueryParser = /** @class */ (function () {
    function RawQueryParser() {
    }
    RawQueryParser.parseFilters = function (filters, columnMap, jsonColumnInfos, params) {
        var keys = Object.keys(filters);
        if (keys.length === 0) {
            return '(1=1)';
        }
        var results = [];
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            if (this.isOperator(key)) {
                var operands = [];
                for (var _a = 0, _b = filters[key]; _a < _b.length; _a++) {
                    var operand = _b[_a];
                    operands.push(this.parseFilters(operand, columnMap, jsonColumnInfos, params));
                }
                var condition = operands.join(" ".concat(key, " "));
                results.push("(".concat(condition, ")"));
            }
            else if (key === queryTypes_1.Operator.NOT) {
                var condition = this.parseFilters(filters[key], columnMap, jsonColumnInfos, params);
                results.push("(not ".concat(condition, ")"));
            }
            else {
                var jsonColumnInfo = this.getJsonColumnInfo(key, jsonColumnInfos);
                if (jsonColumnInfo === undefined && !columnMap.has(key)) {
                    throw new Error("Unknown filter key: ".concat(key, "!"));
                }
                if (jsonColumnInfo) {
                    results.push(this.parseJsonColumnCondition(jsonColumnInfo, filters[key], params));
                }
                else {
                    results.push(this.parseColumnCondition(key, columnMap.get(key), filters[key], params));
                }
            }
        }
        return results.join(' and ');
    };
    RawQueryParser.parseJsonColumnCondition = function (property, filters, params) {
        var parts = property.parts.slice(1);
        var jsonColumn;
        if (parts.length > 0) {
            var attribute_1 = parts[0];
            var attributeInfo = (0, common_1.singleOrDefault)(property.info.attributeInfos, function (a) { return a.name === attribute_1; });
            if (attributeInfo === undefined) {
                throw new Error("Unknown ".concat(property.info.property, " attribute: ").concat(attribute_1, "!"));
            }
            var isText = this.isJsonPropertyText(attributeInfo.type);
            var nestedProperty = '';
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                if (isText && i === parts.length - 1) {
                    nestedProperty += " ->> '".concat(part, "'");
                }
                else {
                    nestedProperty += " -> '".concat(part, "'");
                }
            }
            jsonColumn = "(".concat(property.info.column).concat(nestedProperty, ")");
            if (attributeInfo.type === types_1.MemberAttributeType.BOOLEAN) {
                jsonColumn = "".concat(jsonColumn, "::boolean");
            }
            else if (attributeInfo.type === types_1.MemberAttributeType.NUMBER) {
                jsonColumn = "".concat(jsonColumn, "::integer");
            }
            else if (attributeInfo.type === types_1.MemberAttributeType.DATE) {
                jsonColumn = "".concat(jsonColumn, "::timestamptz");
            }
        }
        else {
            jsonColumn = "(".concat(property.info.column, ")");
        }
        var value;
        var operator;
        if (Array.isArray(filters)) {
            operator = queryTypes_1.Operator.CONTAINS;
            value = filters;
        }
        else {
            var conditionKeys = Object.keys(filters);
            if (conditionKeys.length !== 1) {
                throw new Error("Invalid condition! ".concat(JSON.stringify(filters, undefined, 2)));
            }
            operator = conditionKeys[0];
            value = filters[operator];
        }
        var actualOperator = this.getOperator(operator, true);
        if (operator === queryTypes_1.Operator.BETWEEN || operator === queryTypes_1.Operator.NOT_BETWEEN) {
            // we need two values
            var firstParamName = this.getJsonParamName(property.info.property, parts, params);
            params[firstParamName] = value[0];
            var secondParamName = this.getJsonParamName(property.info.property, parts, params);
            params[secondParamName] = value[1];
            return "(".concat(jsonColumn, " ").concat(actualOperator, " :").concat(firstParamName, " and :").concat(secondParamName, ")");
        }
        if (operator === queryTypes_1.Operator.CONTAINS || operator === queryTypes_1.Operator.OVERLAP) {
            // we need an array of values
            var paramNames = [];
            for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                var val = value_1[_i];
                var paramName_1 = this.getJsonParamName(property.info.property, parts, params);
                params[paramName_1] = val;
                paramNames.push(":".concat(paramName_1));
            }
            var paramNamesString = paramNames.join(', ');
            return "(".concat(jsonColumn, " ").concat(actualOperator, " array[").concat(paramNamesString, "])");
        }
        if (operator === queryTypes_1.Operator.IN || operator === queryTypes_1.Operator.NOT_IN) {
            // we need a list of values
            var paramNames = [];
            for (var _a = 0, value_2 = value; _a < value_2.length; _a++) {
                var val = value_2[_a];
                var paramName_2 = this.getJsonParamName(property.info.property, parts, params);
                params[paramName_2] = val;
                paramNames.push(":".concat(paramName_2));
            }
            var paramNamesString = paramNames.join(', ');
            return "(".concat(jsonColumn, " ").concat(actualOperator, " (").concat(paramNamesString, "))");
        }
        var paramName = this.getJsonParamName(property.info.property, parts, params);
        if (operator === queryTypes_1.Operator.LIKE || operator === queryTypes_1.Operator.NOT_LIKE) {
            params[paramName] = "%".concat(value, "%");
        }
        else {
            params[paramName] = value;
        }
        return "(".concat(jsonColumn, " ").concat(actualOperator, " :").concat(paramName, ")");
    };
    RawQueryParser.parseColumnCondition = function (key, column, filters, params) {
        var conditionKeys = Object.keys(filters);
        if (conditionKeys.length !== 1) {
            throw new Error("Invalid condition! ".concat(JSON.stringify(filters, undefined, 2)));
        }
        var operator = conditionKeys[0];
        var actualOperator = this.getOperator(operator);
        var value = filters[operator];
        if (operator === queryTypes_1.Operator.BETWEEN || operator === queryTypes_1.Operator.NOT_BETWEEN) {
            // we need two values
            var firstParamName = this.getParamName(key, params);
            params[firstParamName] = value[0];
            var secondParamName = this.getParamName(key, params);
            params[secondParamName] = value[1];
            return "(".concat(column, " ").concat(actualOperator, " :").concat(firstParamName, " and :").concat(secondParamName, ")");
        }
        if (operator === queryTypes_1.Operator.CONTAINS || operator === queryTypes_1.Operator.OVERLAP) {
            // we need an array of values
            var paramNames = [];
            for (var _i = 0, value_3 = value; _i < value_3.length; _i++) {
                var val = value_3[_i];
                var paramName_3 = this.getParamName(key, params);
                params[paramName_3] = val;
                paramNames.push(":".concat(paramName_3));
            }
            var paramNamesString = paramNames.join(', ');
            return "(".concat(column, " ").concat(actualOperator, " array[").concat(paramNamesString, "])");
        }
        if (operator === queryTypes_1.Operator.IN || operator === queryTypes_1.Operator.NOT_IN) {
            // we need a list of values
            var paramNames = [];
            for (var _a = 0, value_4 = value; _a < value_4.length; _a++) {
                var val = value_4[_a];
                var paramName_4 = this.getParamName(key, params);
                params[paramName_4] = val;
                paramNames.push(":".concat(paramName_4));
            }
            var paramNamesString = paramNames.join(', ');
            return "(".concat(column, " ").concat(actualOperator, " (").concat(paramNamesString, "))");
        }
        var paramName = this.getParamName(key, params);
        if (operator === queryTypes_1.Operator.EQUAL &&
            (value === null || (typeof value === 'string' && value.toLowerCase() === 'null'))) {
            params[paramName] = null;
            return "(".concat(column, " is :").concat(paramName, ")");
        }
        if (operator === queryTypes_1.Operator.NOT_EQUAL &&
            (value === null || (typeof value === 'string' && value.toLowerCase() === 'null'))) {
            params[paramName] = null;
            return "(".concat(column, " is not :").concat(paramName, ")");
        }
        if (operator === queryTypes_1.Operator.LIKE ||
            operator === queryTypes_1.Operator.NOT_LIKE ||
            operator === queryTypes_1.Operator.TEXT_CONTAINS ||
            operator === queryTypes_1.Operator.NOT_TEXT_CONTAINS) {
            params[paramName] = "%".concat(value, "%");
        }
        else {
            params[paramName] = value;
        }
        return "(".concat(column, " ").concat(actualOperator, " :").concat(paramName, ")");
    };
    RawQueryParser.getJsonColumnInfo = function (column, jsonColumnInfos) {
        var parts = column.split('.');
        var actualProperty = parts[0];
        var info = (0, common_1.singleOrDefault)(jsonColumnInfos, function (jsonColumnInfo) { return jsonColumnInfo.property === actualProperty; });
        if (info) {
            return {
                info: info,
                parts: parts
            };
        }
        return undefined;
    };
    RawQueryParser.getOperator = function (operator, json) {
        if (json === void 0) { json = false; }
        switch (operator) {
            case queryTypes_1.Operator.GREATER_THAN:
                return '>';
            case queryTypes_1.Operator.GREATER_THAN_OR_EQUAL:
                return '>=';
            case queryTypes_1.Operator.LESS_THAN:
                return '<';
            case queryTypes_1.Operator.LESS_THAN_OR_EQUAL:
                return '<=';
            case queryTypes_1.Operator.NOT_EQUAL:
            case queryTypes_1.Operator.NOT:
                return '<>';
            case queryTypes_1.Operator.EQUAL:
                return '=';
            case queryTypes_1.Operator.LIKE:
            case queryTypes_1.Operator.TEXT_CONTAINS:
                return 'ilike';
            case queryTypes_1.Operator.NOT_LIKE:
            case queryTypes_1.Operator.NOT_TEXT_CONTAINS:
                return 'not ilike';
            case queryTypes_1.Operator.AND:
                return 'and';
            case queryTypes_1.Operator.OR:
                return 'or';
            case queryTypes_1.Operator.IN:
                return 'in';
            case queryTypes_1.Operator.NOT_IN:
                return 'not in';
            case queryTypes_1.Operator.BETWEEN:
                return 'between';
            case queryTypes_1.Operator.NOT_BETWEEN:
                return 'not between';
            case queryTypes_1.Operator.OVERLAP:
                if (json) {
                    return '?|';
                }
                return '&&';
            case queryTypes_1.Operator.CONTAINS:
                if (json) {
                    return '?&';
                }
                return '@>';
            default:
                throw new Error("Unknown operator: ".concat(operator, "!"));
        }
    };
    RawQueryParser.isJsonPropertyText = function (type) {
        return (type === types_1.MemberAttributeType.STRING ||
            type === types_1.MemberAttributeType.EMAIL ||
            type === types_1.MemberAttributeType.URL);
    };
    RawQueryParser.getParamName = function (column, params) {
        var index = 1;
        var value = params["".concat(column, "_").concat(index)];
        while (value !== undefined) {
            index++;
            value = params["".concat(column, "_").concat(index)];
        }
        return "".concat(column, "_").concat(index);
    };
    RawQueryParser.getJsonParamName = function (column, parts, params) {
        var index = 1;
        var key;
        if (parts.length > 0) {
            key = "".concat(column, "_").concat(parts.join('_'));
        }
        else {
            key = column;
        }
        var value = params["".concat(key, "_").concat(index)];
        while (value !== undefined) {
            index++;
            value = params["".concat(key, "_").concat(index)];
        }
        return "".concat(key, "_").concat(index);
    };
    RawQueryParser.isOperator = function (opOrCondition) {
        var lower = opOrCondition.toLowerCase().trim();
        return lower === 'and' || lower === 'or';
    };
    return RawQueryParser;
}());
exports["default"] = RawQueryParser;
