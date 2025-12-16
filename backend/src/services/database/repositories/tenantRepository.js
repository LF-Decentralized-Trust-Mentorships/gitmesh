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
var sequelize_1 = __importStar(require("sequelize"));
var common_1 = require("@gitmesh/common");
var types_1 = require("@gitmesh/types");
var sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
var auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
var sequelizeFilterUtils_1 = __importDefault(require("../utils/sequelizeFilterUtils"));
var userTenantUtils_1 = require("../utils/userTenantUtils");
var segmentRepository_1 = __importDefault(require("./segmentRepository"));
var plans_1 = __importDefault(require("../../security/plans"));
var conf_1 = require("../../conf");
var Op = sequelize_1["default"].Op;
var forbiddenTenantUrls = ['www'];
var TenantRepository = /** @class */ (function () {
    function TenantRepository() {
    }
    TenantRepository.getPayingTenantIds = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var database, plans, transaction, query;
            return __generator(this, function (_a) {
                database = sequelizeRepository_1["default"].getSequelize(options);
                plans = plans_1["default"].values;
                transaction = sequelizeRepository_1["default"].getTransaction(options);
                query = "\n      SELECT \"id\"\n      FROM \"tenants\"\n      WHERE tenants.\"plan\" IN (:growth)\n        OR (tenants.\"isTrialPlan\" is true AND tenants.\"plan\" = :growth)\n      ;\n    ";
                return [2 /*return*/, database.query(query, {
                        type: sequelize_1.QueryTypes.SELECT,
                        transaction: transaction,
                        replacements: {
                            growth: plans.growth
                        }
                    })];
            });
        });
    };
    TenantRepository.create = function (data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, transaction, _a, _b, existsUrl, _c, record;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        // name is required
                        if (!data.name) {
                            throw new common_1.Error400(options.language, 'tenant.errors.nameRequiredOnCreate');
                        }
                        _a = data;
                        _b = data.url;
                        if (_b) return [3 /*break*/, 2];
                        return [4 /*yield*/, TenantRepository.generateTenantUrl(data.name, options)];
                    case 1:
                        _b = (_d.sent());
                        _d.label = 2;
                    case 2:
                        _a.url = _b;
                        _c = Boolean;
                        return [4 /*yield*/, options.database.tenant.count({
                                where: { url: data.url },
                                transaction: transaction
                            })];
                    case 3:
                        existsUrl = _c.apply(void 0, [_d.sent()]);
                        if (forbiddenTenantUrls.includes(data.url) || existsUrl) {
                            throw new common_1.Error400(options.language, 'tenant.url.exists');
                        }
                        return [4 /*yield*/, options.database.tenant.create(__assign(__assign({}, lodash_1["default"].pick(data, [
                                'id',
                                'name',
                                'url',
                                'communitySize',
                                'reasonForUsingGitmesh',
                                'integrationsRequired',
                                'importHash',
                            ])), { plan: conf_1.API_CONFIG.edition === types_1.Edition.LFX ? plans_1["default"].values.enterprise : plans_1["default"].values.essential, createdById: currentUser.id, updatedById: currentUser.id }), {
                                transaction: transaction
                            })];
                    case 4:
                        record = _d.sent();
                        return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].CREATE, record, data, __assign(__assign({}, options), { currentTenant: record }))];
                    case 5:
                        _d.sent();
                        return [2 /*return*/, this.findById(record.id, __assign({}, options))];
                }
            });
        });
    };
    /**
     * Generates hyphen concataned tenant url from the tenant name
     * If url already exists, appends a incremental number to the url
     * @param name tenant name
     * @param options repository options
     * @returns slug like tenant name to be used in tenant.url
     */
    TenantRepository.generateTenantUrl = function (name, options) {
        return __awaiter(this, void 0, void 0, function () {
            var cleanedName, nameWordsArray, cleanedTenantUrl, i, filterUser, checkTenantUrl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cleanedName = (0, common_1.getCleanString)(name);
                        nameWordsArray = cleanedName.split(' ');
                        cleanedTenantUrl = '';
                        for (i = 0; i < nameWordsArray.length; i++) {
                            cleanedTenantUrl += "".concat(nameWordsArray[i], "-");
                        }
                        // remove trailing dash
                        cleanedTenantUrl = cleanedTenantUrl.replace(/-$/gi, '');
                        filterUser = false;
                        return [4 /*yield*/, TenantRepository.findAndCountAll({ filter: { url: cleanedTenantUrl } }, options, filterUser)];
                    case 1:
                        checkTenantUrl = _a.sent();
                        if (checkTenantUrl.count > 0) {
                            cleanedTenantUrl += "-".concat(checkTenantUrl.count);
                        }
                        return [2 /*return*/, cleanedTenantUrl];
                }
            });
        });
    };
    TenantRepository.update = function (id, data, options, force) {
        if (force === void 0) { force = false; }
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, transaction, record, existsUrl, _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.tenant.findByPk(id, {
                                transaction: transaction
                            })];
                    case 1:
                        record = _c.sent();
                        if (!force && !(0, userTenantUtils_1.isUserInTenant)(currentUser, record)) {
                            throw new common_1.Error404();
                        }
                        // When not multi-with-subdomain, the
                        // from passes the URL as undefined.
                        // This way it's ensured that the URL will
                        // remain the old one
                        data.url = data.url || record.url;
                        _a = Boolean;
                        return [4 /*yield*/, options.database.tenant.count({
                                where: {
                                    url: data.url,
                                    id: (_b = {}, _b[Op.ne] = id, _b)
                                },
                                transaction: transaction
                            })];
                    case 2:
                        existsUrl = _a.apply(void 0, [_c.sent()]);
                        if (forbiddenTenantUrls.includes(data.url) || existsUrl) {
                            throw new common_1.Error400(options.language, 'tenant.url.exists');
                        }
                        return [4 /*yield*/, record.update(__assign(__assign({}, lodash_1["default"].pick(data, [
                                'id',
                                'name',
                                'url',
                                'communitySize',
                                'reasonForUsingGitmesh',
                                'integrationsRequired',
                                'onboardedAt',
                                'hasSampleData',
                                'importHash',
                                'plan',
                                'isTrialPlan',
                                'trialEndsAt',
                            ])), { updatedById: currentUser.id }), {
                                transaction: transaction
                            })];
                    case 3:
                        record = _c.sent();
                        return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].UPDATE, record, data, options)];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, this.findById(record.id, options)];
                }
            });
        });
    };
    TenantRepository.updatePlanUser = function (id, planStripeCustomerId, planUserId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, transaction, record, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.tenant.findByPk(id, {
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        data = {
                            planStripeCustomerId: planStripeCustomerId,
                            planUserId: planUserId,
                            updatedById: currentUser.id
                        };
                        return [4 /*yield*/, record.update(data, {
                                transaction: transaction
                            })];
                    case 2:
                        record = _a.sent();
                        return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].UPDATE, record, data, options)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.findById(record.id, options)];
                }
            });
        });
    };
    TenantRepository.updatePlanStatus = function (planStripeCustomerId, plan, planStatus, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, record, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.tenant.findOne({
                                where: {
                                    planStripeCustomerId: planStripeCustomerId
                                },
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        data = {
                            plan: plan,
                            planStatus: planStatus,
                            updatedById: null
                        };
                        return [4 /*yield*/, record.update(data, {
                                transaction: transaction
                            })];
                    case 2:
                        record = _a.sent();
                        return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].UPDATE, record, data, options)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.findById(record.id, options)];
                }
            });
        });
    };
    TenantRepository.destroy = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentUser, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        return [4 /*yield*/, options.database.tenant.findByPk(id, {
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        if (!(0, userTenantUtils_1.isUserInTenant)(currentUser, record)) {
                            throw new common_1.Error404();
                        }
                        return [4 /*yield*/, record.destroy({
                                transaction: transaction
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
    TenantRepository.findById = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, include, record, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        include = ['settings', 'conversationSettings'];
                        return [4 /*yield*/, options.database.tenant.findByPk(id, {
                                include: include,
                                transaction: transaction
                            })];
                    case 1:
                        record = _b.sent();
                        if (!(record && record.settings && record.settings[0] && record.settings[0].dataValues)) return [3 /*break*/, 3];
                        _a = record.settings[0].dataValues;
                        return [4 /*yield*/, segmentRepository_1["default"].fetchTenantActivityTypes(__assign(__assign({}, options), { currentTenant: record }))];
                    case 2:
                        _a.activityTypes =
                            _b.sent();
                        record.settings[0].dataValues.slackWebHook = !!record.settings[0].dataValues.slackWebHook;
                        _b.label = 3;
                    case 3: return [2 /*return*/, record];
                }
            });
        });
    };
    TenantRepository.findByUrl = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, include, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        include = ['settings', 'conversationSettings'];
                        return [4 /*yield*/, options.database.tenant.findOne({
                                where: { url: url },
                                include: include,
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        if (record && record.settings && record.settings[0] && record.settings[0].dataValues) {
                            record.settings[0].dataValues.slackWebHook = !!record.settings[0].dataValues.slackWebHook;
                        }
                        return [2 /*return*/, record];
                }
            });
        });
    };
    TenantRepository.count = function (filter, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction;
            return __generator(this, function (_a) {
                transaction = sequelizeRepository_1["default"].getTransaction(options);
                return [2 /*return*/, options.database.tenant.count({
                        where: filter,
                        transaction: transaction
                    })];
            });
        });
    };
    TenantRepository.findDefault = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, options.database.tenant.findOne({
                        transaction: sequelizeRepository_1["default"].getTransaction(options)
                    })];
            });
        });
    };
    /**
     * Finds and counts all tenants with given filter options
     * @param param0 object representation of filter, limit, offset and order
     * @param options IRepositoryOptions to filter out results by tenant
     * @param filterUser set to false if default user filter is not needed
     * @returns rows and total found count of found tenants
     */
    TenantRepository.findAndCountAll = function (_a, options, filterUser) {
        var filter = _a.filter, _b = _a.limit, limit = _b === void 0 ? 0 : _b, _c = _a.offset, offset = _c === void 0 ? 0 : _c, _d = _a.orderBy, orderBy = _d === void 0 ? '' : _d;
        if (filterUser === void 0) { filterUser = true; }
        return __awaiter(this, void 0, void 0, function () {
            var whereAnd, include, currentUser, _e, start, end, where, _f, rows, count;
            var _g, _h, _j, _k;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        whereAnd = [];
                        include = [];
                        if (filterUser) {
                            currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                            // Fetch only tenant that the current user has access
                            whereAnd.push({
                                id: (_g = {},
                                    _g[Op["in"]] = currentUser.tenants.map(function (tenantUser) { return tenantUser.tenant.id; }),
                                    _g)
                            });
                        }
                        if (filter) {
                            if (filter.id) {
                                whereAnd.push({
                                    id: filter.id
                                });
                            }
                            if (filter.name) {
                                whereAnd.push(sequelizeFilterUtils_1["default"].ilikeIncludes('tenant', 'name', filter.name));
                            }
                            if (filter.url) {
                                whereAnd.push(sequelizeFilterUtils_1["default"].ilikeIncludes('tenant', 'url', filter.url));
                            }
                            if (filter.createdAtRange) {
                                _e = filter.createdAtRange, start = _e[0], end = _e[1];
                                if (start !== undefined && start !== null && start !== '') {
                                    whereAnd.push({
                                        createdAt: (_h = {},
                                            _h[Op.gte] = start,
                                            _h)
                                    });
                                }
                                if (end !== undefined && end !== null && end !== '') {
                                    whereAnd.push({
                                        createdAt: (_j = {},
                                            _j[Op.lte] = end,
                                            _j)
                                    });
                                }
                            }
                        }
                        where = (_k = {}, _k[Op.and] = whereAnd, _k);
                        return [4 /*yield*/, options.database.tenant.findAndCountAll({
                                where: where,
                                include: include,
                                limit: limit ? Number(limit) : undefined,
                                offset: offset ? Number(offset) : undefined,
                                order: orderBy ? [orderBy.split('_')] : [['name', 'ASC']],
                                transaction: sequelizeRepository_1["default"].getTransaction(options)
                            })];
                    case 1:
                        _f = _l.sent(), rows = _f.rows, count = _f.count;
                        return [2 /*return*/, { rows: rows, count: count, limit: false, offset: 0 }];
                }
            });
        });
    };
    TenantRepository.findAllAutocomplete = function (query, limit, options) {
        return __awaiter(this, void 0, void 0, function () {
            var whereAnd, currentUser, where, records;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        whereAnd = [];
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        // Fetch only tenant that the current user has access
                        whereAnd.push({
                            id: (_a = {},
                                _a[Op["in"]] = currentUser.tenants.map(function (tenantUser) { return tenantUser.tenant.id; }),
                                _a)
                        });
                        if (query) {
                            whereAnd.push((_b = {},
                                _b[Op.or] = [
                                    { id: query.id },
                                    (_c = {},
                                        _c[Op.and] = sequelizeFilterUtils_1["default"].ilikeIncludes('tenant', 'name', query.name),
                                        _c),
                                ],
                                _b));
                        }
                        where = (_d = {}, _d[Op.and] = whereAnd, _d);
                        return [4 /*yield*/, options.database.tenant.findAll({
                                attributes: ['id', 'name'],
                                where: where,
                                limit: limit ? Number(limit) : undefined,
                                order: [['name', 'ASC']]
                            })];
                    case 1:
                        records = _e.sent();
                        return [2 /*return*/, records.map(function (record) { return ({
                                id: record.id,
                                label: record.name
                            }); })];
                }
            });
        });
    };
    TenantRepository._createAuditLog = function (action, record, data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        values = {};
                        if (data) {
                            values = __assign({}, record.get({ plain: true }));
                        }
                        return [4 /*yield*/, auditLogRepository_1["default"].log({
                                entityName: 'tenant',
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
    /**
     * Get current tenant
     * @param options Repository options
     * @returns Current tenant
     */
    TenantRepository.getCurrentTenant = function (options) {
        return sequelizeRepository_1["default"].getCurrentTenant(options);
    };
    TenantRepository.getAvailablePlatforms = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var query, parameters, platforms;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n        select distinct platform from \"memberIdentities\" where \"tenantId\" = :tenantId\n    ";
                        parameters = {
                            tenantId: id
                        };
                        return [4 /*yield*/, options.database.sequelize.query(query, {
                                replacements: parameters,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        platforms = _a.sent();
                        return [2 /*return*/, platforms];
                }
            });
        });
    };
    TenantRepository.getTenantInfo = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var query, parameters, info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n        select name, plan, \"isTrialPlan\", \"trialEndsAt\" from tenants where \"id\" = :tenantId\n    ";
                        parameters = {
                            tenantId: id
                        };
                        return [4 /*yield*/, options.database.sequelize.query(query, {
                                replacements: parameters,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        info = _a.sent();
                        return [2 /*return*/, info];
                }
            });
        });
    };
    return TenantRepository;
}());
exports["default"] = TenantRepository;
