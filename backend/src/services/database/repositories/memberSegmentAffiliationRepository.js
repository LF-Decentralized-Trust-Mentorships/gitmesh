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
var uuid_1 = require("uuid");
var sequelize_1 = require("sequelize");
var common_1 = require("@gitmesh/common");
var repositoryBase_1 = require("./repositoryBase");
var sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
var MemberSegmentAffiliationRepository = /** @class */ (function (_super) {
    __extends(MemberSegmentAffiliationRepository, _super);
    function MemberSegmentAffiliationRepository(options) {
        return _super.call(this, options, true) || this;
    }
    MemberSegmentAffiliationRepository.prototype.createOrUpdate = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, affiliationInsertResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!data.memberId) {
                            throw new Error('memberId is required when creating a member segment affiliation.');
                        }
                        if (!data.segmentId) {
                            throw new Error('segmentId is required when creating a member segment affiliation.');
                        }
                        if (data.organizationId === undefined) {
                            throw new Error('organizationId is required when creating a member segment affiliation.');
                        }
                        transaction = this.transaction;
                        return [4 /*yield*/, this.options.database.sequelize.query("INSERT INTO \"memberSegmentAffiliations\" (\"id\", \"memberId\", \"segmentId\", \"organizationId\", \"dateStart\", \"dateEnd\")\n          VALUES\n              (:id, :memberId, :segmentId, :organizationId, :dateStart, :dateEnd)\n          RETURNING \"id\"\n        ", {
                                replacements: {
                                    id: (0, uuid_1.v4)(),
                                    memberId: data.memberId,
                                    segmentId: data.segmentId,
                                    organizationId: data.organizationId,
                                    dateStart: data.dateStart || null,
                                    dateEnd: data.dateEnd || null
                                },
                                type: sequelize_1.QueryTypes.INSERT,
                                transaction: transaction
                            })];
                    case 1:
                        affiliationInsertResult = _a.sent();
                        return [4 /*yield*/, this.updateAffiliation(data.memberId, data.segmentId, data.organizationId)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.findById(affiliationInsertResult[0][0].id)];
                }
            });
        });
    };
    MemberSegmentAffiliationRepository.prototype.setForMember = function (memberId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction, valuePlaceholders;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(this.options);
                        transaction = sequelizeRepository_1["default"].getTransaction(this.options);
                        return [4 /*yield*/, seq.query("\n        DELETE FROM \"memberSegmentAffiliations\"\n        WHERE \"memberId\" = :memberId\n      ", {
                                replacements: {
                                    memberId: memberId
                                },
                                type: sequelize_1.QueryTypes.DELETE,
                                transaction: transaction
                            })];
                    case 1:
                        _a.sent();
                        if (data.length === 0) {
                            return [2 /*return*/];
                        }
                        valuePlaceholders = data
                            .map(function (_, i) {
                            return "(:id_".concat(i, ", :memberId_").concat(i, ", :segmentId_").concat(i, ", :organizationId_").concat(i, ", :dateStart_").concat(i, ", :dateEnd_").concat(i, ")");
                        })
                            .join(', ');
                        return [4 /*yield*/, seq.query("\n        INSERT INTO \"memberSegmentAffiliations\" (\"id\", \"memberId\", \"segmentId\", \"organizationId\", \"dateStart\", \"dateEnd\")\n        VALUES ".concat(valuePlaceholders, "\n      "), {
                                replacements: data.reduce(function (acc, item, i) {
                                    acc["id_".concat(i)] = (0, uuid_1.v4)();
                                    acc["memberId_".concat(i)] = memberId;
                                    acc["segmentId_".concat(i)] = item.segmentId;
                                    acc["organizationId_".concat(i)] = item.organizationId;
                                    acc["dateStart_".concat(i)] = item.dateStart || null;
                                    acc["dateEnd_".concat(i)] = item.dateEnd || null;
                                    return acc;
                                }, {}),
                                type: sequelize_1.QueryTypes.INSERT,
                                transaction: transaction
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MemberSegmentAffiliationRepository.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = this.transaction;
                        return [4 /*yield*/, this.options.database.sequelize.query("SELECT *\n       FROM \"memberSegmentAffiliations\"\n       WHERE id = :id\n      ", {
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
    MemberSegmentAffiliationRepository.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, affiliation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = this.transaction;
                        if (data.organizationId === undefined) {
                            throw new Error('When updating member segment affiliation, organizationId is required.');
                        }
                        return [4 /*yield*/, this.findById(id)];
                    case 1:
                        affiliation = _a.sent();
                        if (!affiliation) {
                            throw new common_1.Error404();
                        }
                        return [4 /*yield*/, this.options.database.sequelize.query("UPDATE \"memberSegmentAffiliations\" SET \"organizationId\" = :organizationId", {
                                replacements: {
                                    organizationId: data.organizationId
                                },
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.findById(id)];
                }
            });
        });
    };
    MemberSegmentAffiliationRepository.prototype.destroyAll = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = this.transaction;
                        return [4 /*yield*/, this.findInIds(ids)];
                    case 1:
                        records = _a.sent();
                        if (ids.some(function (id) { return records.find(function (r) { return r.id === id; }) === undefined; })) {
                            throw new common_1.Error404();
                        }
                        return [4 /*yield*/, this.options.database.sequelize.query("DELETE FROM \"memberSegmentAffiliations\" WHERE id in (:ids)\n              ", {
                                replacements: {
                                    ids: ids
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MemberSegmentAffiliationRepository.prototype.findInIds = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = this.transaction;
                        return [4 /*yield*/, this.options.database.sequelize.query("SELECT *\n             FROM \"memberSegmentAffiliations\"\n             WHERE id in (:ids)\n            ", {
                                replacements: {
                                    ids: ids
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
    MemberSegmentAffiliationRepository.prototype.findForMember = function (memberId, timestamp) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, segment, seq, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(this.options);
                        segment = sequelizeRepository_1["default"].getStrictlySingleActiveSegment(this.options);
                        seq = sequelizeRepository_1["default"].getSequelize(this.options);
                        return [4 /*yield*/, seq.query("\n        SELECT * FROM \"memberSegmentAffiliations\"\n        WHERE \"memberId\" = :memberId\n          AND \"segmentId\" = :segmentId\n          AND (\n            (\"dateStart\" <= :timestamp AND \"dateEnd\" >= :timestamp)\n            OR (\"dateStart\" <= :timestamp AND \"dateEnd\" IS NULL)\n          )\n        ORDER BY \"dateStart\" DESC, id\n        LIMIT 1\n      ", {
                                replacements: {
                                    memberId: memberId,
                                    segmentId: segment.id,
                                    timestamp: timestamp
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
    MemberSegmentAffiliationRepository.prototype.updateAffiliation = function (memberId, segmentId, organizationId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = this.transaction;
                        query = "\n      UPDATE activities\n      SET \"organizationId\" = :organizationId\n      WHERE \"memberId\" = :memberId\n        AND \"segmentId\" = :segmentId\n    ";
                        return [4 /*yield*/, this.options.database.sequelize.query(query, {
                                replacements: {
                                    memberId: memberId,
                                    segmentId: segmentId,
                                    organizationId: organizationId
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
    return MemberSegmentAffiliationRepository;
}(repositoryBase_1.RepositoryBase));
exports["default"] = MemberSegmentAffiliationRepository;
