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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var lodash_1 = __importDefault(require("lodash"));
var sequelize_1 = __importDefault(require("sequelize"));
var common_1 = require("@gitmesh/common");
var sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
var auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
var queryParser_1 = __importDefault(require("./filters/queryParser"));
var sequelizeFilterUtils_1 = __importDefault(require("../utils/sequelizeFilterUtils"));
var Op = sequelize_1["default"].Op;
var TagRepository = /** @class */ (function () {
    function TagRepository() {
    }
    TagRepository.create = function (data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, tenant, transaction, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.tag.create(__assign(__assign({}, lodash_1["default"].pick(data, ['name', 'importHash'])), { tenantId: tenant.id, createdById: currentUser.id, updatedById: currentUser.id }), {
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        return [4 /*yield*/, record.setMembers(data.members || [], {
                                transaction: transaction
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].CREATE, record, data, options)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.findById(record.id, options)];
                }
            });
        });
    };
    TagRepository.update = function (id, data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, transaction, currentTenant, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.tag.findOne({
                                where: {
                                    id: id,
                                    tenantId: currentTenant.id
                                },
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        return [4 /*yield*/, record.update(__assign(__assign({}, lodash_1["default"].pick(data, ['name', 'importHash'])), { updatedById: currentUser.id }), {
                                transaction: transaction
                            })];
                    case 2:
                        record = _a.sent();
                        return [4 /*yield*/, record.setMembers(data.members || [], {
                                transaction: transaction
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].UPDATE, record, data, options)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, this.findById(record.id, options)];
                }
            });
        });
    };
    TagRepository.destroyBulk = function (ids, options, force) {
        if (force === void 0) { force = false; }
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentTenant;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.tag.destroy({
                                where: {
                                    id: ids,
                                    tenantId: currentTenant.id
                                },
                                force: force,
                                transaction: transaction
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TagRepository.destroy = function (id, options, force) {
        if (force === void 0) { force = false; }
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentTenant, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.tag.findOne({
                                where: {
                                    id: id,
                                    tenantId: currentTenant.id
                                },
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        return [4 /*yield*/, record.destroy({
                                transaction: transaction,
                                force: force
                            })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].DELETE, record, record, options)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TagRepository.findById = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, include, currentTenant, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        include = [];
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.tag.findOne({
                                where: {
                                    id: id,
                                    tenantId: currentTenant.id
                                },
                                include: include,
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        return [2 /*return*/, this._populateRelations(record, options)];
                }
            });
        });
    };
    TagRepository.filterIdInTenant = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = lodash_1["default"]).get;
                        return [4 /*yield*/, this.filterIdsInTenant([id], options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent(), '[0]', null])];
                }
            });
        });
    };
    TagRepository.filterIdsInTenant = function (ids, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentTenant, transaction, where, records;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!ids || !ids.length) {
                            return [2 /*return*/, []];
                        }
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        where = {
                            id: (_a = {},
                                _a[Op["in"]] = ids,
                                _a),
                            tenantId: currentTenant.id
                        };
                        return [4 /*yield*/, options.database.tag.findAll({
                                attributes: ['id'],
                                where: where,
                                transaction: transaction
                            })];
                    case 1:
                        records = _b.sent();
                        return [2 /*return*/, records.map(function (record) { return record.id; })];
                }
            });
        });
    };
    TagRepository.count = function (filter, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, tenant;
            return __generator(this, function (_a) {
                transaction = sequelizeRepository_1["default"].getTransaction(options);
                tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                return [2 /*return*/, options.database.tag.count({
                        where: __assign(__assign({}, filter), { tenantId: tenant.id }),
                        transaction: transaction
                    })];
            });
        });
    };
    TagRepository.findAndCountAll = function (_a, options) {
        var _b = _a.filter, filter = _b === void 0 ? {} : _b, _c = _a.advancedFilter, advancedFilter = _c === void 0 ? null : _c, _d = _a.limit, limit = _d === void 0 ? 0 : _d, _e = _a.offset, offset = _e === void 0 ? 0 : _e, _f = _a.orderBy, orderBy = _f === void 0 ? '' : _f;
        return __awaiter(this, void 0, void 0, function () {
            var include, _g, start, end, parser, parsed, _h, rows, count;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        include = [];
                        if (!advancedFilter) {
                            advancedFilter = { and: [] };
                        }
                        if (filter) {
                            if (filter.id) {
                                advancedFilter.and.push({
                                    id: filter.id
                                });
                            }
                            if (filter.ids) {
                                advancedFilter.and.push({
                                    or: filter.ids.map(function (id) { return ({
                                        id: id
                                    }); })
                                });
                            }
                            if (filter.name) {
                                advancedFilter.and.push({
                                    name: {
                                        textContains: filter.name
                                    }
                                });
                            }
                            if (filter.createdAtRange) {
                                _g = filter.createdAtRange, start = _g[0], end = _g[1];
                                if (start !== undefined && start !== null && start !== '') {
                                    advancedFilter.and.push({
                                        createdAt: {
                                            gte: start
                                        }
                                    });
                                }
                                if (end !== undefined && end !== null && end !== '') {
                                    advancedFilter.and.push({
                                        createdAt: {
                                            lte: end
                                        }
                                    });
                                }
                            }
                        }
                        parser = new queryParser_1["default"]({
                            manyToMany: {
                                members: {
                                    table: 'tags',
                                    relationTable: {
                                        name: 'memberTags',
                                        from: 'tagId',
                                        to: 'memberId'
                                    }
                                }
                            },
                            withSegments: false
                        }, options);
                        parsed = parser.parse({
                            filter: advancedFilter,
                            orderBy: orderBy || ['createdAt_DESC'],
                            limit: limit,
                            offset: offset
                        });
                        return [4 /*yield*/, options.database.tag.findAndCountAll(__assign(__assign(__assign({}, (parsed.where ? { where: parsed.where } : {})), (parsed.having ? { having: parsed.having } : {})), { order: parsed.order, limit: parsed.limit, offset: parsed.offset, include: include, transaction: sequelizeRepository_1["default"].getTransaction(options) }))];
                    case 1:
                        _h = _j.sent(), rows = _h.rows, count = _h.count;
                        return [4 /*yield*/, this._populateRelationsForRows(rows, options)];
                    case 2:
                        rows = _j.sent();
                        return [2 /*return*/, { rows: rows, count: count, limit: parsed.limit, offset: parsed.offset }];
                }
            });
        });
    };
    TagRepository.findAllAutocomplete = function (query, limit, options) {
        return __awaiter(this, void 0, void 0, function () {
            var tenant, whereAnd, where, records;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        whereAnd = [
                            {
                                tenantId: tenant.id
                            },
                        ];
                        if (query) {
                            whereAnd.push((_a = {},
                                _a[Op.or] = [
                                    { id: sequelizeFilterUtils_1["default"].uuid(query) },
                                    (_b = {},
                                        _b[Op.and] = sequelizeFilterUtils_1["default"].ilikeIncludes('tag', 'name', query),
                                        _b),
                                ],
                                _a));
                        }
                        where = (_c = {}, _c[Op.and] = whereAnd, _c);
                        return [4 /*yield*/, options.database.tag.findAll({
                                attributes: ['id', 'name'],
                                where: where,
                                limit: limit ? Number(limit) : undefined,
                                order: [['name', 'ASC']]
                            })];
                    case 1:
                        records = _d.sent();
                        return [2 /*return*/, records.map(function (record) { return ({
                                id: record.id,
                                label: record.name
                            }); })];
                }
            });
        });
    };
    TagRepository._createAuditLog = function (action, record, data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        values = {};
                        if (data) {
                            values = __assign(__assign({}, record.get({ plain: true })), { memberIds: data.members });
                        }
                        return [4 /*yield*/, auditLogRepository_1["default"].log({
                                entityName: 'tag',
                                entityId: record.id,
                                action: action,
                                values: values
                            }, options)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TagRepository._populateRelationsForRows = function (rows, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!rows) {
                    return [2 /*return*/, rows];
                }
                return [2 /*return*/, Promise.all(rows.map(function (record) { return _this._populateRelations(record, options); }))];
            });
        });
    };
    TagRepository._populateRelations = function (record, options) {
        return __awaiter(this, void 0, void 0, function () {
            var output, transaction, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!record) {
                            return [2 /*return*/, record];
                        }
                        output = record.get({ plain: true });
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        _a = output;
                        return [4 /*yield*/, record.getMembers({
                                transaction: transaction,
                                joinTableAttributes: []
                            })];
                    case 1:
                        _a.members = _b.sent();
                        return [2 /*return*/, output];
                }
            });
        });
    };
    return TagRepository;
}());
exports["default"] = TagRepository;
