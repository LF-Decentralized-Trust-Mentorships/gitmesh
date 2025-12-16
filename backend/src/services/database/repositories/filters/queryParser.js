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
var lodash_1 = __importDefault(require("lodash"));
var validator_1 = __importDefault(require("validator"));
var common_1 = require("@gitmesh/common");
var sequelize_1 = __importDefault(require("sequelize"));
var sequelizeRepository_1 = __importDefault(require("../sequelizeRepository"));
var Op = sequelize_1["default"].Op;
/**
 * Pass `db` connection object which has `Sequelize.Op`
 * @param {*} db
 * @returns object {parse}
 */
var QueryParser = /** @class */ (function () {
    function QueryParser(_a, options) {
        var _b = _a.aggregators, aggregators = _b === void 0 ? {} : _b, _c = _a.nestedFields, nestedFields = _c === void 0 ? {} : _c, _d = _a.manyToMany, manyToMany = _d === void 0 ? {} : _d, _e = _a.customOperators, customOperators = _e === void 0 ? {} : _e, _f = _a.exportMode, exportMode = _f === void 0 ? false : _f, _g = _a.withSegments, withSegments = _g === void 0 ? true : _g, _h = _a.segmentsNullable, segmentsNullable = _h === void 0 ? false : _h;
        this.options = options;
        this.aggregators = aggregators;
        this.nestedFields = nestedFields;
        this.whereOrHaving = 'where';
        if (this.aggregators && Object.keys(this.aggregators).length !== 0) {
            this.whereOrHaving = 'having';
        }
        this.manyToMany = manyToMany;
        this.customOperators = customOperators;
        this.exportMode = exportMode;
        this.withSegments = withSegments;
        this.segmentsNullable = segmentsNullable;
    }
    /**
     * If an invalid UUID is passed to a query, it throws an exception.
     * To hack this behaviour, if the uuid is invalid, it creates a new one,
     * that won't match any of the database.
     * If the uuid is invalid, brings no results.
     */
    QueryParser.uuid = function (value) {
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
     * Replaces operator (json object key) with Sequelize operator.
     * @param {JSON} json
     * @param {string} key
     * @param {Sequelize.op} op
     */
    QueryParser.replaceKeyWithOperator = function (query, key, op) {
        var value = query[key];
        delete query[key];
        query[op] = value;
        return query;
    };
    /**
     * Replace a key with a complex operator. A complex operator is a function that acts on a key.
     * @param query query object
     * @param key key that will be replaced
     * @param complexOp function that will be called with the value of the key
     * @returns The query object with the key replaced by the result of the function
     */
    QueryParser.replaceKeyWithComplexOperator = function (query, key, complexOp, args) {
        if (args === void 0) { args = {}; }
        var value = query[key];
        delete query[key];
        return __assign(__assign({}, query), complexOp(value, args));
    };
    /**
     * Replace a query[key] with a nested field
     * @param query Query object
     * @param key Key that marks the value to be replaced
     * @returns Query where query[key] is replaced with a nested field
     */
    QueryParser.prototype.replaceKeyWithNestedField = function (query, key) {
        var value = query[key];
        delete query[key];
        query[this.nestedFields[key]] = value;
        return query;
    };
    /**
     * Parse order by
     * @param orderBy Order by (string or string[]). If string: 'field_ASC,field2_DESC'. If array: ['field_ASC', 'field2_DESC']
     * @returns {Array<string[]>}
     */
    QueryParser.prototype.parseOrderBy = function (orderBy) {
        var _this = this;
        // If type is string, convert to list of strings
        if (typeof orderBy === 'string') {
            orderBy = orderBy.split(',').map(function (item) { return item.trim(); });
        }
        return orderBy.map(function (item) {
            // Replace nested attributes. For example:
            // if we had {sentiment: sentiment.score} in the nested keys,
            // we would replace [[sentiment], [DESC]] -> [[sentiment.score], [DESC]]
            var splitItem = item.split('_');
            if (_this.nestedFields[splitItem[0]]) {
                splitItem[0] = _this.nestedFields[splitItem[0]];
            }
            return splitItem;
        });
    };
    /**
     * Replace a key with an aggregator
     * @param query Query that we are parsing
     * @param key Key that we are parsing
     * @returns Query replaced by aggregator
     */
    QueryParser.prototype.replaceKeyWithAggregator = function (query, key) {
        // We will need 'having' instead of where for aggregators
        this.whereOrHaving = 'having';
        // Save value and delete
        var value = query[key];
        delete query[key];
        // The LHS of the  query will be the aggregator, instead of the key
        var left = this.aggregators[key];
        // The operator can be a proper operator, if we had for example
        // {activityCount: {gt: 10}} (the operator would be Op.gt)
        // Or it can be equal if we had
        // {platform: github} (then we would be picking Op.eq)
        var op = typeof value === 'object' ? QueryParser.operators[Object.keys(value)[0]] : Op.eq;
        // The RHS of the query will be the value, if we had
        // {platform: github} (then we would be picking github)
        // Or it can be the value of the object, if we had
        // {activityCount: {gt: 10}} (the value would be 10)
        var right = typeof value === 'object' ? value[Object.keys(value)[0]] : value;
        // handle textContains and jsonContains for literals
        if ((typeof value === 'object' && Object.keys(value)[0] === 'textContains') ||
            Object.keys(value)[0] === 'jsonContains') {
            op = Op.iLike;
            right = "%".concat(right, "%");
        }
        // We wrap everything onto a where clause and we return
        var where = sequelize_1["default"].where(left, op, right);
        // When we feed arrays directly in sequelize literals, it tries to cast
        // it to a postgres array.
        // This is not needed in `Op.in` queries. Simple lists are enough
        if (op === Op["in"]) {
            where = sequelize_1["default"].where(left, op, sequelize_1["default"].literal("(".concat(right.map(function (i) { return "'".concat(i, "'"); }).toString(), ")")));
        }
        if (query[Op.and]) {
            query[Op.and].push(where);
        }
        else {
            query[Op.and] = [where];
        }
        return query;
    };
    /**
     *
     * @param query Query object
     * @param key Key that we are parsing
     * @returns
     */
    QueryParser.prototype.replaceWithManyToMany = function (query, key) {
        var _a;
        // Save value and delete
        var value = query[key];
        delete query[key];
        // The mapping comes from the manyToMany field for that key
        var mapping = this.manyToMany[key];
        // We construct the items to filter on. For example, if we were filtering tags for members
        // "memberTags"."tagId"  = '{{id1}}' OR "memberTags"."tagId"  = '{{id2}}'
        var items = value.reduce(function (acc, item, index) {
            if (index === 0) {
                return "".concat(acc, " \"").concat(mapping.relationTable.name, "\".\"").concat(mapping.relationTable.to, "\"  = '").concat(QueryParser.uuid(item), "'");
            }
            return "".concat(acc, " OR \"").concat(mapping.relationTable.name, "\".\"").concat(mapping.relationTable.to, "\"  = '").concat(QueryParser.uuid(item), "'");
        }, '');
        var joinField = (_a = mapping.overrideJoinField) !== null && _a !== void 0 ? _a : 'id';
        // Find all the rows in the table that have the items we are filtering on
        // For example, find all members that have the tags with id1 or id2
        var literal = sequelize_1["default"].literal("(SELECT \"".concat(mapping.table, "\".\"").concat(joinField, "\" FROM \"").concat(mapping.table, "\" INNER JOIN \"").concat(mapping.relationTable.name, "\" ON \"").concat(mapping.relationTable.name, "\".\"").concat(mapping.relationTable.from, "\" = \"").concat(mapping.table, "\".\"").concat(joinField, "\" WHERE ").concat(items, ")"));
        // It coudl be that we have more than 1 many to many filter, so we could need to append. For example:
        // {tags: [id1, id2], organizations: [id3, id4]}
        if (query[Op.and]) {
            query[Op.and].push(sequelize_1["default"].where(sequelize_1["default"].literal("\"".concat(mapping.model, "\".\"").concat(joinField, "\"")), Op["in"], literal));
        }
        else {
            query[Op.and] = [
                sequelize_1["default"].where(sequelize_1["default"].literal("\"".concat(mapping.model, "\".\"").concat(joinField, "\"")), Op["in"], literal),
            ];
        }
        return query;
    };
    /**
     * Iteratively replace json keys with Sequelize formated query operators.
     * @param {JSON} json next json
     */
    QueryParser.prototype.iterativeReplace = function (query) {
        var _this = this;
        Object.keys(query).forEach(function (key) {
            var _a;
            if (_this.nestedFields[key]) {
                // If the key should be replaced by a nested field we update the query and the key.
                // This is not part of the else if since we still want to do the other checks.
                query = _this.replaceKeyWithNestedField(query, key);
                key = _this.nestedFields[key];
            }
            if (_this.aggregators[key]) {
                // If the key is one of the aggregators, replace by aggregator
                query = _this.replaceKeyWithAggregator(query, key);
            }
            else if (key === 'id') {
                // When an ID is sent, we validate it.
                query[key] = QueryParser.uuid(query[key]);
            }
            else if (_this.customOperators[key]) {
                // The complex operator could be substituting the key also.
                // For example, in member.platform, we are sent: {platform: jsonContains: 'github'}
                // and we need to replace the platform key with the function result.
                var complexOp = QueryParser.complexOperators[Object.keys(query[key])[0]];
                query = QueryParser.replaceKeyWithComplexOperator(query, key, complexOp, _this.customOperators[key]);
            }
            else if (_this.manyToMany[key]) {
                // If the key is a many to many field, construct the query
                query = _this.replaceWithManyToMany(query, key);
            }
            else if (query[key] !== null && typeof query[key] === 'object') {
                // When the value of the key is an object
                // Find if the key is an operation in the operations dict
                var op = QueryParser.operators[key];
                if (op) {
                    // If we found an operation
                    // Replace the key (operator string) with the Sequelize operator
                    // Example: { "or": {...} } => { [Op.or]: {...} }
                    query = QueryParser.replaceKeyWithOperator(query, key, op);
                    // Recursively call the function with what is indisde the operator
                    query[op] = _this.iterativeReplace(query[op]);
                }
                else {
                    // If we didn't find an operation, then it is a nested object
                    // Recursively call the function with the nested object
                    query[key] = _this.iterativeReplace(query[key]);
                }
            }
            else if (key === 'model' && _this.options.database[query[key]] != null) {
                // query['as'] = query[key].replace(/^./, char => char.toLowerCase());// /^\w/
                query.model = _this.options.database[query[key]];
            }
            else {
                var op = QueryParser.operators[key];
                var complexOp = QueryParser.complexOperators[key];
                if (op)
                    query = QueryParser.replaceKeyWithOperator(query, key, op);
                else if (complexOp)
                    query = QueryParser.replaceKeyWithComplexOperator(query, key, complexOp);
                // The key is not an operation, but it could be that the value is (NULL, for example)
                else if (QueryParser.operators[query[key]] !== undefined)
                    if (query[key] === 'NULL' || query[key] === 'null')
                        query[key] = null;
                if (query[key] === 'NOT_NULL' || query[key] === 'not_null')
                    query[key] = (_a = {}, _a[Op.not] = null, _a);
            }
        });
        return query;
    };
    /**
     * Parse and build Sequelize format query
     * @param {JSON} query
     * @returns {JSON} sequelize formatted DB query params JSON
     */
    QueryParser.prototype.parseQueryFields = function (query) {
        return this.iterativeReplace(query);
    };
    /**
     * Parse and build Sequelize format query
     * @param {JSON} query
     * @returns {JSON} sequelize formatted DB include params JSON
     */
    QueryParser.prototype.parseIncludeFields = function (query) {
        var json = query;
        this.iterativeReplace(json);
        return json;
    };
    /**
     * Pare a query into a sequelize query
     *
     * @param {QueryInput} query
     * @returns {QueryOutput} sequelize formatted DB query
     */
    QueryParser.prototype.parse = function (query) {
        var _a, _b, _c;
        if (query === void 0) { query = {
            filter: {},
            orderBy: undefined,
            limit: 0,
            offset: 0,
            include: false,
            fields: false
        }; }
        // eslint-disable-next-line prefer-const
        var filter = query.filter, orderBy = query.orderBy, limit = query.limit, offset = query.offset, include = query.include, fields = query.fields;
        var dbQuery = {
            where: {
                tenantId: sequelizeRepository_1["default"].getCurrentTenant(this.options).id
            },
            limit: QueryParser.defaultPageSize,
            offset: 0
        };
        if (this.withSegments) {
            if (this.manyToMany.segments) {
                var segmentsQuery = this.replaceWithManyToMany({
                    segments: sequelizeRepository_1["default"].getSegmentIds(this.options)
                }, 'segments');
                dbQuery.where = (_a = {},
                    _a[Op.and] = [dbQuery.where, segmentsQuery],
                    _a);
            }
            else if (this.segmentsNullable) {
                dbQuery.where.segmentId = (_b = {},
                    _b[Op.or] = [
                        sequelizeRepository_1["default"].getSegmentIds(this.options),
                        (_c = {},
                            _c[Op.is] = null,
                            _c),
                    ],
                    _b);
            }
            else {
                dbQuery.where.segmentId = sequelizeRepository_1["default"].getSegmentIds(this.options);
            }
        }
        if (fields) {
            if (typeof fields === 'string') {
                fields = fields.split(',');
            }
            // assign fields array to .attributes
            if (fields && fields.length > 0)
                dbQuery.attributes = fields;
        }
        if (limit) {
            if (typeof limit === 'string') {
                limit = parseInt(limit, 10);
            }
            dbQuery.limit = this.exportMode
                ? 1000000000
                : Math.min(limit > 0 ? limit : QueryParser.defaultPageSize, QueryParser.maxPageSize);
        }
        if (offset) {
            if (typeof offset === 'string') {
                offset = parseInt(offset, 10);
            }
            dbQuery.offset = offset;
        }
        if (orderBy) {
            dbQuery.order = this.parseOrderBy(orderBy);
        }
        if (!lodash_1["default"].isEmpty(filter)) {
            var parsed = this.parseQueryFields(filter);
            dbQuery[this.whereOrHaving] = __assign(__assign({}, dbQuery[this.whereOrHaving]), parsed);
        }
        if (include) {
            dbQuery.include = this.parseIncludeFields(query.include);
        }
        return dbQuery;
    };
    QueryParser.maxPageSize = 200;
    QueryParser.defaultPageSize = 10;
    QueryParser.operators = {
        gt: Op.gt,
        gte: Op.gte,
        lt: Op.lt,
        lte: Op.lte,
        ne: Op.ne,
        eq: Op.eq,
        not: Op.not,
        // like: Op.like, // LIKE '%hat'
        // notLike: Op.notLike, // NOT LIKE '%hat'
        like: Op.iLike,
        notLike: Op.notILike,
        regexp: Op.regexp,
        notRegexp: Op.notRegexp,
        // iRegexp: Op.iRegexp,            // ~* '^[h|a|t]' (PG only)
        // notIRegexp: Op.notIRegexp       // !~* '^[h|a|t]' (PG only)
        and: Op.and,
        or: Op.or,
        between: Op.between,
        notBetween: Op.notBetween,
        "in": Op["in"],
        notIn: Op.notIn,
        overlap: Op.overlap,
        NULL: null,
        contains: Op.contains
    };
    QueryParser.complexOperators = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        textContains: function (value, _args) {
            var _a;
            if (_args === void 0) { _args = {}; }
            var result = (_a = {},
                _a[Op.iLike] = "%".concat(value, "%"),
                _a);
            return result;
        },
        jsonContains: function (value, args) {
            var _a, _b;
            var where = sequelize_1["default"].where(sequelize_1["default"].literal("CAST(\"".concat(args.model, "\".\"").concat(args.column, "\" AS TEXT)")), (_a = {},
                _a[sequelize_1["default"].Op.like] = "%".concat(Object.values(value)[0], "%").toLowerCase(),
                _a));
            return _b = {}, _b[Op.and] = where, _b;
        }
    };
    return QueryParser;
}());
exports["default"] = QueryParser;
