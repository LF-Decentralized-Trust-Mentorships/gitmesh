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
exports.__esModule = true;
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
var sequelize_1 = require("sequelize");
var types_1 = require("@gitmesh/types");
var repositoryBase_1 = require("./repositoryBase");
var AutomationExecutionRepository = /** @class */ (function (_super) {
    __extends(AutomationExecutionRepository, _super);
    function AutomationExecutionRepository(options) {
        return _super.call(this, options, false) || this;
    }
    AutomationExecutionRepository.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction;
            return __generator(this, function (_a) {
                transaction = this.transaction;
                return [2 /*return*/, this.database.automationExecution.create({
                        automationId: data.automationId,
                        type: data.type,
                        tenantId: data.tenantId,
                        trigger: data.trigger,
                        state: data.state,
                        error: data.error,
                        executedAt: data.executedAt,
                        eventId: data.eventId,
                        payload: data.payload
                    }, { transaction: transaction })];
            });
        });
    };
    AutomationExecutionRepository.prototype.findAndCountAll = function (criteria) {
        return __awaiter(this, void 0, void 0, function () {
            var currentTenant, seq, query, results, count, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentTenant = this.currentTenant;
                        seq = this.seq;
                        query = "\n      select id,\n             \"automationId\",\n             state,\n             error,\n             \"executedAt\",\n             \"eventId\",\n             payload,\n             count(*) over () as \"paginatedItemsCount\"\n      from \"automationExecutions\"\n      where \"tenantId\" = :tenantId\n        and \"automationId\" = :automationId\n      order by \"executedAt\" desc\n      limit ".concat(criteria.limit, " offset ").concat(criteria.offset, "\n      \n    ");
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    tenantId: currentTenant.id,
                                    automationId: criteria.automationId
                                },
                                type: sequelize_1.QueryTypes.SELECT
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
                                automationId: row.automationId,
                                executedAt: row.executedAt,
                                eventId: row.eventId,
                                payload: row.payload,
                                error: row.error,
                                state: row.state
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
    AutomationExecutionRepository.prototype.hasAlreadyBeenTriggered = function (automationId, eventId) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, query, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = this.seq;
                        query = "\n        select id\n        from \"automationExecutions\"\n        where \"automationId\" = :automationId\n          and \"eventId\" = :eventId\n          and state = '".concat(types_1.AutomationExecutionState.SUCCESS, "';\n    ");
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    automationId: automationId,
                                    eventId: eventId
                                },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results.length > 0];
                }
            });
        });
    };
    AutomationExecutionRepository.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Method not implemented.');
            });
        });
    };
    AutomationExecutionRepository.prototype.destroy = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Method not implemented.');
            });
        });
    };
    AutomationExecutionRepository.prototype.destroyAllAutomation = function (automationIds) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, currentTenant, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = this.transaction;
                        seq = this.seq;
                        currentTenant = this.currentTenant;
                        query = "\n    delete \n    from \"automationExecutions\"\n    where \"automationId\" in (:automationIds)\n      and \"tenantId\" = :tenantId;";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    automationIds: automationIds,
                                    tenantId: currentTenant.id
                                },
                                type: sequelize_1.QueryTypes.DELETE,
                                transaction: transaction
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AutomationExecutionRepository.prototype.destroyAll = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Method not implemented.');
            });
        });
    };
    AutomationExecutionRepository.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Method not implemented.');
            });
        });
    };
    return AutomationExecutionRepository;
}(repositoryBase_1.RepositoryBase));
exports["default"] = AutomationExecutionRepository;
