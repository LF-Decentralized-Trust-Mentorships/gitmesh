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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var common_1 = require("@gitmesh/common");
var types_1 = require("@gitmesh/types");
var sequelize_1 = require("sequelize");
var repositoryBase_1 = require("./repositoryBase");
var sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
var OrganizationSyncRemoteRepository = /** @class */ (function (_super) {
    __extends(OrganizationSyncRemoteRepository, _super);
    function OrganizationSyncRemoteRepository(options) {
        return _super.call(this, options, true) || this;
    }
    OrganizationSyncRemoteRepository.prototype.stopSyncingAutomation = function (automationId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.options.database.sequelize.query("update \"organizationsSyncRemote\" set status = :status where \"syncFrom\" = :automationId\n        ", {
                            replacements: {
                                status: types_1.SyncStatus.STOPPED,
                                automationId: automationId
                            },
                            type: sequelize_1.QueryTypes.UPDATE
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OrganizationSyncRemoteRepository.prototype.stopOrganizationManualSync = function (organizationId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.options.database.sequelize.query("update \"organizationsSyncRemote\" set status = :status where \"organizationId\" = :organizationId and \"syncFrom\" = :manualSync\n        ", {
                            replacements: {
                                status: types_1.SyncStatus.STOPPED,
                                organizationId: organizationId,
                                manualSync: 'manual'
                            },
                            type: sequelize_1.QueryTypes.UPDATE
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OrganizationSyncRemoteRepository.prototype.startManualSync = function (id, sourceId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(this.options);
                        return [4 /*yield*/, this.options.database.sequelize.query("update \"organizationsSyncRemote\" set status = :status, \"sourceId\" = :sourceId where \"id\" = :id\n        ", {
                                replacements: {
                                    status: types_1.SyncStatus.ACTIVE,
                                    id: id,
                                    sourceId: sourceId || null
                                },
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OrganizationSyncRemoteRepository.prototype.findRemoteSync = function (integrationId, organizationId, syncFrom) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(this.options);
                        return [4 /*yield*/, this.options.database.sequelize.query("SELECT *\n             FROM \"organizationsSyncRemote\"\n             WHERE \"integrationId\" = :integrationId and \"organizationId\" = :organizationId and \"syncFrom\" = :syncFrom;\n            ", {
                                replacements: {
                                    integrationId: integrationId,
                                    organizationId: organizationId,
                                    syncFrom: syncFrom
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        records = _a.sent();
                        if (records.length === 0) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, records[0]];
                }
            });
        });
    };
    OrganizationSyncRemoteRepository.prototype.markOrganizationForSyncing = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, existingSyncRemote, existingManualSyncRemote, organizationSyncRemoteInserted, organizationSyncRemote;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(this.options);
                        return [4 /*yield*/, this.findByOrganizationId(data.organizationId)];
                    case 1:
                        existingSyncRemote = _a.sent();
                        if (existingSyncRemote) {
                            data.sourceId = existingSyncRemote.sourceId;
                        }
                        return [4 /*yield*/, this.findRemoteSync(data.integrationId, data.organizationId, data.syncFrom)];
                    case 2:
                        existingManualSyncRemote = _a.sent();
                        if (!existingManualSyncRemote) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.startManualSync(existingManualSyncRemote.id, data.sourceId)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, existingManualSyncRemote];
                    case 4: return [4 /*yield*/, this.options.database.sequelize.query("insert into \"organizationsSyncRemote\" (\"id\", \"organizationId\", \"sourceId\", \"integrationId\", \"syncFrom\", \"metaData\", \"lastSyncedAt\", \"status\")\n          VALUES\n              (:id, :organizationId, :sourceId, :integrationId, :syncFrom, :metaData, :lastSyncedAt, :status)\n          returning \"id\"\n        ", {
                            replacements: {
                                id: (0, common_1.generateUUIDv1)(),
                                organizationId: data.organizationId,
                                integrationId: data.integrationId,
                                syncFrom: data.syncFrom,
                                metaData: data.metaData,
                                lastSyncedAt: data.lastSyncedAt || null,
                                sourceId: data.sourceId || null,
                                status: types_1.SyncStatus.ACTIVE
                            },
                            type: sequelize_1.QueryTypes.INSERT,
                            transaction: transaction
                        })];
                    case 5:
                        organizationSyncRemoteInserted = _a.sent();
                        return [4 /*yield*/, this.findById(organizationSyncRemoteInserted[0][0].id)];
                    case 6:
                        organizationSyncRemote = _a.sent();
                        return [2 /*return*/, organizationSyncRemote];
                }
            });
        });
    };
    OrganizationSyncRemoteRepository.prototype.destroyAllAutomation = function (automationIds) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = this.transaction;
                        seq = this.seq;
                        query = "\n    delete \n    from \"organizationsSyncRemote\"\n    where \"syncFrom\" in (:automationIds);";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    automationIds: automationIds
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
    OrganizationSyncRemoteRepository.prototype.destroyAllIntegration = function (integrationIds) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = this.transaction;
                        seq = this.seq;
                        query = "\n    delete \n    from \"organizationsSyncRemote\"\n    where \"integrationId\" in (:integrationIds);";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    integrationIds: integrationIds
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
    OrganizationSyncRemoteRepository.prototype.findOrganizationManualSync = function (organizationId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(this.options);
                        return [4 /*yield*/, this.options.database.sequelize.query("select i.platform, osr.status from \"organizationsSyncRemote\" osr\n      inner join integrations i on osr.\"integrationId\" = i.id\n      where osr.\"syncFrom\" = :syncFrom and osr.\"organizationId\" = :organizationId;\n            ", {
                                replacements: {
                                    organizationId: organizationId,
                                    syncFrom: 'manual'
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        records = _a.sent();
                        return [2 /*return*/, records];
                }
            });
        });
    };
    OrganizationSyncRemoteRepository.prototype.findByOrganizationId = function (organizationId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(this.options);
                        return [4 /*yield*/, this.options.database.sequelize.query("SELECT *\n             FROM \"organizationsSyncRemote\"\n             WHERE \"organizationId\" = :organizationId\n             and \"sourceId\" is not null\n             limit 1;\n            ", {
                                replacements: {
                                    organizationId: organizationId
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        records = _a.sent();
                        if (records.length === 0) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, records[0]];
                }
            });
        });
    };
    OrganizationSyncRemoteRepository.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(this.options);
                        return [4 /*yield*/, this.options.database.sequelize.query("SELECT *\n             FROM \"organizationsSyncRemote\"\n             WHERE id = :id;\n            ", {
                                replacements: {
                                    id: id
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        records = _a.sent();
                        if (records.length === 0) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, records[0]];
                }
            });
        });
    };
    return OrganizationSyncRemoteRepository;
}(repositoryBase_1.RepositoryBase));
exports["default"] = OrganizationSyncRemoteRepository;
