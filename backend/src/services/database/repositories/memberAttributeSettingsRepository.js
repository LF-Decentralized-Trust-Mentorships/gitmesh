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
var sequelize_1 = __importDefault(require("sequelize"));
var redis_1 = require("@gitmesh/redis");
var common_1 = require("@gitmesh/common");
var sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
var sequelizeFilterUtils_1 = __importDefault(require("../utils/sequelizeFilterUtils"));
var Op = sequelize_1["default"].Op;
var MemberAttributeSettingsRepository = /** @class */ (function () {
    function MemberAttributeSettingsRepository() {
    }
    MemberAttributeSettingsRepository.findById = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentTenant, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.memberAttributeSettings.findOne({
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
                        return [2 /*return*/, this._populateRelations(record)];
                }
            });
        });
    };
    MemberAttributeSettingsRepository._populateRelations = function (record) {
        return __awaiter(this, void 0, void 0, function () {
            var output;
            return __generator(this, function (_a) {
                if (!record) {
                    return [2 /*return*/, record];
                }
                output = record.get({ plain: true });
                return [2 /*return*/, output];
            });
        });
    };
    MemberAttributeSettingsRepository.create = function (data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, tenant, transaction, record, cache;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        if (Object.keys(options.database.member.rawAttributes).includes(data.name)) {
                            throw new common_1.Error400(options.language, 'settings.memberAttributes.errors.reservedField', data.name);
                        }
                        return [4 /*yield*/, options.database.memberAttributeSettings.create({
                                type: data.type,
                                name: data.name,
                                label: data.label,
                                canDelete: data.canDelete,
                                show: data.show,
                                options: data.options,
                                tenantId: tenant.id,
                                createdById: currentUser.id,
                                updatedById: currentUser.id
                            }, {
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        cache = new redis_1.RedisCache('memberAttributes', options.redis, options.log);
                        return [4 /*yield*/, cache["delete"](tenant.id)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.findById(record.id, options)];
                }
            });
        });
    };
    MemberAttributeSettingsRepository.update = function (id, data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, transaction, currentTenant, record, cache;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.memberAttributeSettings.findOne({
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
                        return [4 /*yield*/, record.update(__assign(__assign({}, data), { updatedById: currentUser.id }), {
                                transaction: transaction
                            })];
                    case 2:
                        record = _a.sent();
                        cache = new redis_1.RedisCache('memberAttributes', options.redis, options.log);
                        return [4 /*yield*/, cache["delete"](currentTenant.id)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.findById(record.id, options)];
                }
            });
        });
    };
    MemberAttributeSettingsRepository.destroy = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentTenant, record, cache;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.memberAttributeSettings.findOne({
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
                        if (!record.canDelete) return [3 /*break*/, 4];
                        return [4 /*yield*/, record.destroy({
                                transaction: transaction
                            })];
                    case 2:
                        _a.sent();
                        cache = new redis_1.RedisCache('memberAttributes', options.redis, options.log);
                        return [4 /*yield*/, cache["delete"](currentTenant.id)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MemberAttributeSettingsRepository.findAndCountAll = function (_a, options) {
        var filter = _a.filter, _b = _a.limit, limit = _b === void 0 ? 0 : _b, _c = _a.offset, offset = _c === void 0 ? 0 : _c, _d = _a.orderBy, orderBy = _d === void 0 ? '' : _d;
        return __awaiter(this, void 0, void 0, function () {
            var tenant, whereAnd, _e, start, end, where, _f, rows, count;
            var _g, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        whereAnd = [];
                        whereAnd.push({
                            tenantId: tenant.id
                        });
                        if (filter) {
                            if (filter.id) {
                                whereAnd.push({
                                    id: sequelizeFilterUtils_1["default"].uuid(filter.id)
                                });
                            }
                            if (filter.canDelete === true || filter.canDelete === false) {
                                whereAnd.push({
                                    canDelete: filter.canDelete === true
                                });
                            }
                            if (filter.show === true || filter.show === false) {
                                whereAnd.push({
                                    show: filter.show === true
                                });
                            }
                            if (filter.type) {
                                whereAnd.push({
                                    type: filter.type
                                });
                            }
                            if (filter.label) {
                                whereAnd.push({
                                    label: filter.label
                                });
                            }
                            if (filter.name) {
                                whereAnd.push({
                                    name: filter.name
                                });
                            }
                            if (filter.createdAtRange) {
                                _e = filter.createdAtRange, start = _e[0], end = _e[1];
                                if (start !== undefined && start !== null && start !== '') {
                                    whereAnd.push({
                                        createdAt: (_g = {},
                                            _g[Op.gte] = start,
                                            _g)
                                    });
                                }
                                if (end !== undefined && end !== null && end !== '') {
                                    whereAnd.push({
                                        createdAt: (_h = {},
                                            _h[Op.lte] = end,
                                            _h)
                                    });
                                }
                            }
                        }
                        where = (_j = {}, _j[Op.and] = whereAnd, _j);
                        return [4 /*yield*/, options.database.memberAttributeSettings.findAndCountAll({
                                where: where,
                                limit: limit ? Number(limit) : undefined,
                                offset: offset ? Number(offset) : undefined,
                                order: orderBy ? [orderBy.split('_')] : [['createdAt', 'DESC']],
                                transaction: sequelizeRepository_1["default"].getTransaction(options)
                            })];
                    case 1:
                        _f = _k.sent(), rows = _f.rows, count = _f.count;
                        return [4 /*yield*/, this._populateRelationsForRows(rows)
                            // TODO add limit and offset
                        ];
                    case 2:
                        rows = _k.sent();
                        // TODO add limit and offset
                        return [2 /*return*/, { rows: rows, count: count }];
                }
            });
        });
    };
    MemberAttributeSettingsRepository._populateRelationsForRows = function (rows) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!rows) {
                    return [2 /*return*/, rows];
                }
                return [2 /*return*/, Promise.all(rows.map(function (record) { return _this._populateRelations(record); }))];
            });
        });
    };
    return MemberAttributeSettingsRepository;
}());
exports["default"] = MemberAttributeSettingsRepository;
