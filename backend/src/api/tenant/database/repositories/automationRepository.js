"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var types_1 = require("@gitmesh/types");
var sequelize_1 = __importStar(require("sequelize"));
var common_1 = require("@gitmesh/common");
var isFeatureEnabled_1 = require("@/feature-flags/isFeatureEnabled");
var auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
var repositoryBase_1 = require("./repositoryBase");
var Op = sequelize_1["default"].Op;
var AutomationRepository = /** @class */ (function (_super) {
    __extends(AutomationRepository, _super);
    function AutomationRepository(options) {
        return _super.call(this, options, true) || this;
    }
    AutomationRepository.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, tenant, transaction, existingActiveAutomations, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = this.currentUser;
                        tenant = this.currentTenant;
                        transaction = this.transaction;
                        return [4 /*yield*/, this.findAndCountAll({
                                state: types_1.AutomationState.ACTIVE
                            })];
                    case 1:
                        existingActiveAutomations = _a.sent();
                        return [4 /*yield*/, this.database.automation.create({
                                name: data.name,
                                type: data.type,
                                trigger: data.trigger,
                                settings: data.settings,
                                state: existingActiveAutomations.count >= isFeatureEnabled_1.PLAN_LIMITS[tenant.plan][types_1.FeatureFlag.AUTOMATIONS]
                                    ? types_1.AutomationState.DISABLED
                                    : data.state,
                                tenantId: tenant.id,
                                createdById: currentUser.id,
                                updatedById: currentUser.id
                            }, {
                                transaction: transaction
                            })];
                    case 2:
                        record = _a.sent();
                        return [4 /*yield*/, this.createAuditLog('automation', auditLogRepository_1["default"].CREATE, record, data)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.findById(record.id)];
                }
            });
        });
    };
    AutomationRepository.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, currentTenant, transaction, existingActiveAutomations, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = this.currentUser;
                        currentTenant = this.currentTenant;
                        transaction = this.transaction;
                        return [4 /*yield*/, this.findAndCountAll({
                                state: types_1.AutomationState.ACTIVE
                            })];
                    case 1:
                        existingActiveAutomations = _a.sent();
                        if (data.state === types_1.AutomationState.ACTIVE &&
                            existingActiveAutomations.count >= isFeatureEnabled_1.PLAN_LIMITS[currentTenant.plan][types_1.FeatureFlag.AUTOMATIONS]) {
                            throw new Error("Maximum number of active automations reached for the plan!");
                        }
                        return [4 /*yield*/, this.database.automation.findOne({
                                where: {
                                    id: id,
                                    tenantId: currentTenant.id
                                },
                                transaction: transaction
                            })];
                    case 2:
                        record = _a.sent();
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        return [4 /*yield*/, record.update({
                                name: data.name,
                                trigger: data.trigger,
                                settings: data.settings,
                                state: data.state,
                                updatedById: currentUser.id
                            }, {
                                transaction: transaction
                            })];
                    case 3:
                        record = _a.sent();
                        return [4 /*yield*/, this.createAuditLog('automation', auditLogRepository_1["default"].UPDATE, record, data)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, this.findById(record.id)];
                }
            });
        });
    };
    AutomationRepository.prototype.destroyAll = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentTenant, records;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = this.transaction;
                        currentTenant = this.currentTenant;
                        return [4 /*yield*/, this.database.automation.findAll({
                                where: {
                                    id: (_a = {},
                                        _a[Op["in"]] = ids,
                                        _a),
                                    tenantId: currentTenant.id
                                },
                                transaction: transaction
                            })];
                    case 1:
                        records = _b.sent();
                        if (ids.some(function (id) { return records.find(function (r) { return r.id === id; }) === undefined; })) {
                            throw new common_1.Error404();
                        }
                        return [4 /*yield*/, Promise.all(records.flatMap(function (r) { return [
                                r.destroy({ transaction: transaction }),
                                _this.createAuditLog('automation', auditLogRepository_1["default"].DELETE, r, r),
                            ]; }))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutomationRepository.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findAndCountAll({
                            id: id,
                            offset: 0,
                            limit: 1
                        })];
                    case 1:
                        results = _a.sent();
                        if (results.count === 1) {
                            return [2 /*return*/, results.rows[0]];
                        }
                        if (results.count === 0) {
                            throw new common_1.Error404();
                        }
                        throw new Error('More than one row returned when fetching by automation unique ID!');
                }
            });
        });
    };
    AutomationRepository.prototype.findAndCountAll = function (criteria) {
        return __awaiter(this, void 0, void 0, function () {
            var currentTenant, transaction, seq, conditions, parameters, conditionsString, query, results, count, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentTenant = this.currentTenant;
                        transaction = this.transaction;
                        seq = this.seq;
                        conditions = ['a."tenantId" = :tenantId'];
                        parameters = {
                            tenantId: currentTenant.id
                        };
                        if (criteria.id) {
                            conditions.push('a.id = :id');
                            parameters.id = criteria.id;
                        }
                        if (criteria.state) {
                            conditions.push('a.state = :state');
                            parameters.state = criteria.state;
                        }
                        if (criteria.type) {
                            conditions.push('a.type = :type');
                            parameters.type = criteria.type;
                        }
                        if (criteria.trigger) {
                            conditions.push('a.trigger = :trigger');
                            parameters.trigger = criteria.trigger;
                        }
                        conditionsString = conditions.join(' and ');
                        query = "\n    -- common table expression (CTE) to prepare the last execution information for each automationId\n      with latest_executions as (select distinct on (\"automationId\") \"automationId\", \"executedAt\", state, error\n                                from \"automationExecutions\"\n                                order by \"automationId\", \"executedAt\" desc)\n      select a.id,\n            a.name,\n            a.type,\n            a.\"tenantId\",\n            a.trigger,\n            a.settings,\n            a.state,\n            a.\"createdAt\",\n            a.\"updatedAt\",\n            le.\"executedAt\" as \"lastExecutionAt\",\n            le.state        as \"lastExecutionState\",\n            le.error        as \"lastExecutionError\",\n            count(*) over () as \"paginatedItemsCount\"\n      from automations a\n              left join latest_executions le on a.id = le.\"automationId\"\n      where ".concat(conditionsString, "\n      order by \"updatedAt\" desc\n      ").concat(this.getPaginationString(criteria), "\n    ");
                        return [4 /*yield*/, seq.query(query, {
                                replacements: parameters,
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        results = _a.sent();
                        if (results.length === 0) {
                            return [2 /*return*/, {
                                    rows: [],
                                    count: 0,
                                    offset: criteria.offset,
                                    limit: criteria.limit
                                }];
                        }
                        count = parseInt(results[0].paginatedItemsCount, 10);
                        rows = results.map(function (r) {
                            var row = r;
                            return {
                                id: row.id,
                                name: row.name,
                                type: row.type,
                                tenantId: row.tenantId,
                                trigger: row.trigger,
                                settings: row.settings,
                                state: row.state,
                                createdAt: row.createdAt,
                                updatedAt: row.updatedAt,
                                lastExecutionAt: row.lastExecutionAt,
                                lastExecutionState: row.lastExecutionState,
                                lastExecutionError: row.lastExecutionError
                            };
                        });
                        return [2 /*return*/, {
                                rows: rows,
                                count: count,
                                offset: criteria.offset,
                                limit: criteria.limit
                            }];
                }
            });
        });
    };
    AutomationRepository.countAllActive = function (database, tenantId) {
        return __awaiter(this, void 0, void 0, function () {
            var automationCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, database.automation.count({
                            where: {
                                tenantId: tenantId,
                                state: types_1.AutomationState.ACTIVE
                            },
                            useMaster: true
                        })];
                    case 1:
                        automationCount = _a.sent();
                        return [2 /*return*/, automationCount];
                }
            });
        });
    };
    AutomationRepository.prototype.findSyncAutomations = function (tenantId, platform) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction, pageSize, syncAutomations, results, offset;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = this.seq;
                        transaction = this.transaction;
                        pageSize = 10;
                        syncAutomations = [];
                        _a.label = 1;
                    case 1:
                        offset = results ? pageSize + offset : 0;
                        return [4 /*yield*/, seq.query("select * from automations \n      where type = :platform and \"tenantId\" = :tenantId and trigger in (:syncAutomationTriggers)\n      limit :limit offset :offset", {
                                replacements: {
                                    tenantId: tenantId,
                                    platform: platform,
                                    syncAutomationTriggers: [
                                        types_1.AutomationSyncTrigger.MEMBER_ATTRIBUTES_MATCH,
                                        types_1.AutomationSyncTrigger.ORGANIZATION_ATTRIBUTES_MATCH,
                                    ],
                                    limit: pageSize,
                                    offset: offset
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 2:
                        results = _a.sent();
                        syncAutomations.push.apply(syncAutomations, results);
                        _a.label = 3;
                    case 3:
                        if (results.length > 0) return [3 /*break*/, 1];
                        _a.label = 4;
                    case 4: return [2 /*return*/, syncAutomations];
                }
            });
        });
    };
    return AutomationRepository;
}(repositoryBase_1.RepositoryBase));
exports["default"] = AutomationRepository;
