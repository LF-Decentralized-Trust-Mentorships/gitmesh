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
var types_1 = require("@gitmesh/types");
var common_1 = require("@gitmesh/common");
var sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
var auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
var sequelizeFilterUtils_1 = __importDefault(require("../utils/sequelizeFilterUtils"));
var queryParser_1 = __importDefault(require("./filters/queryParser"));
var automationRepository_1 = __importDefault(require("./automationRepository"));
var automationExecutionRepository_1 = __importDefault(require("./automationExecutionRepository"));
var memberSyncRemoteRepository_1 = __importDefault(require("./memberSyncRemoteRepository"));
var organizationSyncRemoteRepository_1 = __importDefault(require("./organizationSyncRemoteRepository"));
var Op = sequelize_1["default"].Op;
var log = false;
var IntegrationRepository = /** @class */ (function () {
    function IntegrationRepository() {
    }
    IntegrationRepository.create = function (data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, tenant, transaction, segment, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        segment = sequelizeRepository_1["default"].getStrictlySingleActiveSegment(options);
                        return [4 /*yield*/, options.database.integration.create(__assign(__assign({}, lodash_1["default"].pick(data, [
                                'platform',
                                'status',
                                'limitCount',
                                'limitLastResetAt',
                                'token',
                                'refreshToken',
                                'settings',
                                'integrationIdentifier',
                                'importHash',
                                'emailSentAt',
                            ])), { segmentId: segment.id, tenantId: tenant.id, createdById: currentUser.id, updatedById: currentUser.id }), {
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].CREATE, record, data, options)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.findById(record.id, options)];
                }
            });
        });
    };
    IntegrationRepository.update = function (id, data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, transaction, currentTenant, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.integration.findOne({
                                where: {
                                    id: id,
                                    tenantId: currentTenant.id,
                                    segmentId: sequelizeRepository_1["default"].getSegmentIds(options)
                                },
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        return [4 /*yield*/, record.update(__assign(__assign({}, lodash_1["default"].pick(data, [
                                'platform',
                                'status',
                                'limitCount',
                                'limitLastResetAt',
                                'token',
                                'refreshToken',
                                'settings',
                                'integrationIdentifier',
                                'importHash',
                                'emailSentAt',
                            ])), { updatedById: currentUser.id }), {
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
    IntegrationRepository.destroy = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentTenant, record, seq, syncAutomationIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.integration.findOne({
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
                                transaction: transaction
                            })
                            // also mark integration runs as deleted
                        ];
                    case 2:
                        _a.sent();
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        return [4 /*yield*/, seq.query("update \"integrationRuns\" set state = :newState\n     where \"integrationId\" = :integrationId and state in (:delayed, :pending, :processing)\n    ", {
                                replacements: {
                                    newState: types_1.IntegrationRunState.INTEGRATION_DELETED,
                                    delayed: types_1.IntegrationRunState.DELAYED,
                                    pending: types_1.IntegrationRunState.PENDING,
                                    processing: types_1.IntegrationRunState.PROCESSING,
                                    integrationId: id
                                },
                                transaction: transaction
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, seq.query("update integration.runs set state = :newState\n     where \"integrationId\" = :integrationId and state in (:delayed, :pending, :processing)", {
                                replacements: {
                                    newState: types_1.IntegrationRunState.INTEGRATION_DELETED,
                                    delayed: types_1.IntegrationRunState.DELAYED,
                                    pending: types_1.IntegrationRunState.PENDING,
                                    processing: types_1.IntegrationRunState.PROCESSING,
                                    integrationId: id
                                },
                                transaction: transaction
                            })
                            // delete syncRemote rows coming from integration
                        ];
                    case 4:
                        _a.sent();
                        // delete syncRemote rows coming from integration
                        return [4 /*yield*/, new memberSyncRemoteRepository_1["default"](__assign(__assign({}, options), { transaction: transaction })).destroyAllIntegration([
                                record.id,
                            ])];
                    case 5:
                        // delete syncRemote rows coming from integration
                        _a.sent();
                        return [4 /*yield*/, new organizationSyncRemoteRepository_1["default"](__assign(__assign({}, options), { transaction: transaction })).destroyAllIntegration([
                                record.id,
                            ])
                            // destroy existing automations for outgoing integrations
                        ];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, new automationRepository_1["default"](__assign(__assign({}, options), { transaction: transaction })).findSyncAutomations(currentTenant.id, record.platform)];
                    case 7:
                        syncAutomationIds = (_a.sent()).map(function (a) { return a.id; });
                        if (!(syncAutomationIds.length > 0)) return [3 /*break*/, 9];
                        return [4 /*yield*/, new automationExecutionRepository_1["default"](__assign(__assign({}, options), { transaction: transaction })).destroyAllAutomation(syncAutomationIds)];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [4 /*yield*/, new automationRepository_1["default"](__assign(__assign({}, options), { transaction: transaction })).destroyAll(syncAutomationIds)];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].DELETE, record, record, options)];
                    case 11:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    IntegrationRepository.findAllByPlatform = function (platform, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, include, currentTenant, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        include = [];
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.integration.findAll({
                                where: {
                                    platform: platform,
                                    tenantId: currentTenant.id
                                },
                                include: include,
                                transaction: transaction
                            })];
                    case 1:
                        records = _a.sent();
                        return [2 /*return*/, records.map(function (record) { return record.get({ plain: true }); })];
                }
            });
        });
    };
    IntegrationRepository.findByPlatform = function (platform, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, segment, include, currentTenant, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        segment = sequelizeRepository_1["default"].getStrictlySingleActiveSegment(options);
                        include = [];
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.integration.findOne({
                                where: {
                                    platform: platform,
                                    tenantId: currentTenant.id,
                                    segmentId: segment.id
                                },
                                include: include,
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
    IntegrationRepository.findActiveIntegrationByPlatform = function (platform, tenantId) {
        return __awaiter(this, void 0, void 0, function () {
            var options, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sequelizeRepository_1["default"].getDefaultIRepositoryOptions()];
                    case 1:
                        options = _a.sent();
                        return [4 /*yield*/, options.database.integration.findOne({
                                where: {
                                    platform: platform,
                                    tenantId: tenantId
                                }
                            })];
                    case 2:
                        record = _a.sent();
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        return [2 /*return*/, this._populateRelations(record)];
                }
            });
        });
    };
    /**
     * Find all active integrations for a platform
     * @param platform The platform we want to find all active integrations for
     * @returns All active integrations for the platform
     */
    IntegrationRepository.findAllActive = function (platform, page, perPage) {
        return __awaiter(this, void 0, void 0, function () {
            var options, records;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sequelizeRepository_1["default"].getDefaultIRepositoryOptions()];
                    case 1:
                        options = _a.sent();
                        return [4 /*yield*/, options.database.integration.findAll({
                                where: {
                                    status: 'done',
                                    platform: platform
                                },
                                limit: perPage,
                                offset: (page - 1) * perPage,
                                order: [['id', 'ASC']]
                            })];
                    case 2:
                        records = _a.sent();
                        if (!records) {
                            throw new common_1.Error404();
                        }
                        return [2 /*return*/, Promise.all(records.map(function (record) { return _this._populateRelations(record); }))];
                }
            });
        });
    };
    IntegrationRepository.findByStatus = function (status, page, perPage, options) {
        return __awaiter(this, void 0, void 0, function () {
            var query, seq, transaction, integrations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      select * from integrations where status = :status\n      limit ".concat(perPage, " offset ").concat((page - 1) * perPage, "\n    ");
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    status: status
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        integrations = _a.sent();
                        return [2 /*return*/, integrations];
                }
            });
        });
    };
    /**
     * Find an integration using the integration identifier and a platform.
     * Tenant not needed.
     * @param identifier The integration identifier
     * @returns The integration object
     */
    // TODO: Test
    IntegrationRepository.findByIdentifier = function (identifier, platform) {
        return __awaiter(this, void 0, void 0, function () {
            var options, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sequelizeRepository_1["default"].getDefaultIRepositoryOptions()];
                    case 1:
                        options = _a.sent();
                        return [4 /*yield*/, options.database.integration.findOne({
                                where: {
                                    integrationIdentifier: identifier,
                                    platform: platform,
                                    deletedAt: null
                                }
                            })];
                    case 2:
                        record = _a.sent();
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        return [2 /*return*/, this._populateRelations(record)];
                }
            });
        });
    };
    IntegrationRepository.findById = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, include, currentTenant, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        include = [];
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.integration.findOne({
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
                        return [2 /*return*/, this._populateRelations(record)];
                }
            });
        });
    };
    IntegrationRepository.filterIdInTenant = function (id, options) {
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
    IntegrationRepository.filterIdsInTenant = function (ids, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentTenant, where, records;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!ids || !ids.length) {
                            return [2 /*return*/, []];
                        }
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        where = {
                            id: (_a = {},
                                _a[Op["in"]] = ids,
                                _a),
                            tenantId: currentTenant.id
                        };
                        return [4 /*yield*/, options.database.integration.findAll({
                                attributes: ['id'],
                                where: where
                            })];
                    case 1:
                        records = _b.sent();
                        return [2 /*return*/, records.map(function (record) { return record.id; })];
                }
            });
        });
    };
    IntegrationRepository.count = function (filter, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, tenant;
            return __generator(this, function (_a) {
                transaction = sequelizeRepository_1["default"].getTransaction(options);
                tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                return [2 /*return*/, options.database.integration.count({
                        where: __assign(__assign({}, filter), { tenantId: tenant.id }),
                        transaction: transaction
                    })];
            });
        });
    };
    IntegrationRepository.findAndCountAll = function (_a, options) {
        var _b = _a.filter, filter = _b === void 0 ? {} : _b, _c = _a.advancedFilter, advancedFilter = _c === void 0 ? null : _c, _d = _a.limit, limit = _d === void 0 ? 0 : _d, _e = _a.offset, offset = _e === void 0 ? 0 : _e, _f = _a.orderBy, orderBy = _f === void 0 ? '' : _f;
        return __awaiter(this, void 0, void 0, function () {
            var include, _g, start, end, _h, start, end, _j, start, end, parser, parsed, _k, rows, count, seq, integrationIds, results, query, processedAtMap;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        include = [];
                        // If the advanced filter is empty, we construct it from the query parameter filter
                        if (!advancedFilter) {
                            advancedFilter = { and: [] };
                            if (filter.id) {
                                advancedFilter.and.push({
                                    id: filter.id
                                });
                            }
                            if (filter.platform) {
                                advancedFilter.and.push({
                                    platform: filter.platform
                                });
                            }
                            if (filter.status) {
                                advancedFilter.and.push({
                                    status: filter.status
                                });
                            }
                            if (filter.limitCountRange) {
                                _g = filter.limitCountRange, start = _g[0], end = _g[1];
                                if (start !== undefined && start !== null && start !== '') {
                                    advancedFilter.and.push({
                                        limitCount: {
                                            gte: start
                                        }
                                    });
                                }
                                if (end !== undefined && end !== null && end !== '') {
                                    advancedFilter.and.push({
                                        limitCount: {
                                            lte: end
                                        }
                                    });
                                }
                            }
                            if (filter.limitLastResetAtRange) {
                                _h = filter.limitLastResetAtRange, start = _h[0], end = _h[1];
                                if (start !== undefined && start !== null && start !== '') {
                                    advancedFilter.and.push({
                                        limitLastResetAt: {
                                            gte: start
                                        }
                                    });
                                }
                                if (end !== undefined && end !== null && end !== '') {
                                    advancedFilter.and.push({
                                        limitLastResetAt: {
                                            lte: end
                                        }
                                    });
                                }
                            }
                            if (filter.integrationIdentifier) {
                                advancedFilter.and.push({
                                    integrationIdentifier: filter.integrationIdentifier
                                });
                            }
                            if (filter.createdAtRange) {
                                _j = filter.createdAtRange, start = _j[0], end = _j[1];
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
                            nestedFields: {
                                sentiment: 'sentiment.sentiment'
                            }
                        }, options);
                        parsed = parser.parse({
                            filter: advancedFilter,
                            orderBy: orderBy || ['createdAt_DESC'],
                            limit: limit,
                            offset: offset
                        });
                        return [4 /*yield*/, options.database.integration.findAndCountAll(__assign(__assign(__assign({}, (parsed.where ? { where: parsed.where } : {})), (parsed.having ? { having: parsed.having } : {})), { order: parsed.order, limit: parsed.limit, offset: parsed.offset, include: include, transaction: sequelizeRepository_1["default"].getTransaction(options) }))];
                    case 1:
                        _k = _l.sent(), rows = _k.rows, count = _k.count;
                        return [4 /*yield*/, this._populateRelationsForRows(rows)
                            // Some integrations (i.e GitHub, Discord, Discourse, Groupsio) receive new data via webhook post-onboarding.
                            // We track their last processedAt separately, and not using updatedAt.
                        ];
                    case 2:
                        rows = _l.sent();
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        integrationIds = rows.map(function (row) { return row.id; });
                        results = [];
                        if (!(integrationIds.length > 0)) return [3 /*break*/, 4];
                        query = "select \"integrationId\", max(\"processedAt\") as \"processedAt\" from \"incomingWebhooks\" \n      where \"integrationId\" in (:integrationIds) and state = 'PROCESSED'\n      group by \"integrationId\"";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    integrationIds: integrationIds
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: sequelizeRepository_1["default"].getTransaction(options)
                            })];
                    case 3:
                        results = _l.sent();
                        _l.label = 4;
                    case 4:
                        processedAtMap = results.reduce(function (map, item) {
                            map[item.integrationId] = item.processedAt;
                            return map;
                        }, {});
                        rows.forEach(function (row) {
                            // Either use the last processedAt, or fall back updatedAt
                            row.lastProcessedAt = processedAtMap[row.id] || row.updatedAt;
                        });
                        return [2 /*return*/, { rows: rows, count: count, limit: parsed.limit, offset: parsed.offset }];
                }
            });
        });
    };
    IntegrationRepository.findAllAutocomplete = function (query, limit, options) {
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
                                        _b[Op.and] = sequelizeFilterUtils_1["default"].ilikeIncludes('integration', 'platform', query),
                                        _b),
                                ],
                                _a));
                        }
                        where = (_c = {}, _c[Op.and] = whereAnd, _c);
                        return [4 /*yield*/, options.database.integration.findAll({
                                attributes: ['id', 'platform'],
                                where: where,
                                limit: limit ? Number(limit) : undefined,
                                order: [['platform', 'ASC']]
                            })];
                    case 1:
                        records = _d.sent();
                        return [2 /*return*/, records.map(function (record) { return ({
                                id: record.id,
                                label: record.platform
                            }); })];
                }
            });
        });
    };
    IntegrationRepository._createAuditLog = function (action, record, data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!log) return [3 /*break*/, 2];
                        values = {};
                        if (data) {
                            values = __assign({}, record.get({ plain: true }));
                        }
                        return [4 /*yield*/, auditLogRepository_1["default"].log({
                                entityName: 'integration',
                                entityId: record.id,
                                action: action,
                                values: values
                            }, options)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    IntegrationRepository._populateRelationsForRows = function (rows) {
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
    IntegrationRepository._populateRelations = function (record) {
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
    return IntegrationRepository;
}());
exports["default"] = IntegrationRepository;
