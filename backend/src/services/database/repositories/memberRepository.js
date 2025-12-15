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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var types_1 = require("@gitmesh/types");
var lodash_1 = __importStar(require("lodash"));
var moment_1 = __importDefault(require("moment"));
var sequelize_1 = __importStar(require("sequelize"));
var common_1 = require("@gitmesh/common");
var opensearch_1 = require("@gitmesh/opensearch");
var integrations_1 = require("@gitmesh/integrations");
var conf_1 = require("@/conf");
var configTypes_1 = require("../../conf/configTypes");
var isFeatureEnabled_1 = __importDefault(require("../../feature-flags/isFeatureEnabled"));
var sequelizeFilterUtils_1 = __importDefault(require("../utils/sequelizeFilterUtils"));
var auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
var queryParser_1 = __importDefault(require("./filters/queryParser"));
var rawQueryParser_1 = __importDefault(require("./filters/rawQueryParser"));
var memberSegmentAffiliationRepository_1 = __importDefault(require("./memberSegmentAffiliationRepository"));
var segmentRepository_1 = __importDefault(require("./segmentRepository"));
var sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
var tenantRepository_1 = __importDefault(require("./tenantRepository"));
var memberTypes_1 = require("./types/memberTypes");
var organizationRepository_1 = __importDefault(require("./organizationRepository"));
var memberSyncRemoteRepository_1 = __importDefault(require("./memberSyncRemoteRepository"));
var memberAffiliationRepository_1 = __importDefault(require("./memberAffiliationRepository"));
var Op = sequelize_1["default"].Op;
var log = false;
var MemberRepository = /** @class */ (function () {
    function MemberRepository() {
    }
    MemberRepository.create = function (data, options, doPopulateRelations) {
        if (doPopulateRelations === void 0) { doPopulateRelations = true; }
        return __awaiter(this, void 0, void 0, function () {
            var platforms, currentUser, tenant, transaction, segment, record, username, seq, query, _i, _a, platform, identities, _b, identities_1, identity;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!data.username) {
                            throw new Error('Username not set when creating member!');
                        }
                        platforms = Object.keys(data.username);
                        if (platforms.length === 0) {
                            throw new Error('Username object does not have any platforms!');
                        }
                        data.username = (0, memberTypes_1.mapUsernameToIdentities)(data.username);
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        segment = sequelizeRepository_1["default"].getStrictlySingleActiveSegment(options);
                        return [4 /*yield*/, options.database.member.create(__assign(__assign({}, lodash_1["default"].pick(data, [
                                'displayName',
                                'attributes',
                                'emails',
                                'lastEnriched',
                                'enrichedBy',
                                'contributions',
                                'score',
                                'reach',
                                'joinedAt',
                                'manuallyCreated',
                                'importHash',
                            ])), { tenantId: tenant.id, createdById: currentUser.id, updatedById: currentUser.id, segmentId: segment.id }), {
                                transaction: transaction
                            })];
                    case 1:
                        record = _c.sent();
                        username = data.username;
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        query = "\n      insert into \"memberIdentities\"(\"memberId\", platform, username, \"sourceId\", \"tenantId\", \"integrationId\")\n      values(:memberId, :platform, :username, :sourceId, :tenantId, :integrationId);\n    ";
                        _i = 0, _a = Object.keys(username);
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        platform = _a[_i];
                        identities = username[platform];
                        _b = 0, identities_1 = identities;
                        _c.label = 3;
                    case 3:
                        if (!(_b < identities_1.length)) return [3 /*break*/, 6];
                        identity = identities_1[_b];
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    memberId: record.id,
                                    platform: platform,
                                    username: identity.username,
                                    sourceId: identity.sourceId || null,
                                    integrationId: identity.integrationId || null,
                                    tenantId: tenant.id
                                },
                                type: sequelize_1.QueryTypes.INSERT,
                                transaction: transaction
                            })];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        _b++;
                        return [3 /*break*/, 3];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [4 /*yield*/, MemberRepository.includeMemberToSegments(record.id, options)];
                    case 8:
                        _c.sent();
                        return [4 /*yield*/, record.setActivities(data.activities || [], {
                                transaction: transaction
                            })];
                    case 9:
                        _c.sent();
                        return [4 /*yield*/, record.setTags(data.tags || [], {
                                transaction: transaction
                            })];
                    case 10:
                        _c.sent();
                        return [4 /*yield*/, MemberRepository.updateMemberOrganizations(record, data.organizations, true, options)];
                    case 11:
                        _c.sent();
                        return [4 /*yield*/, record.setTasks(data.tasks || [], {
                                transaction: transaction
                            })];
                    case 12:
                        _c.sent();
                        return [4 /*yield*/, record.setNotes(data.notes || [], {
                                transaction: transaction
                            })];
                    case 13:
                        _c.sent();
                        return [4 /*yield*/, record.setNoMerge(data.noMerge || [], {
                                transaction: transaction
                            })];
                    case 14:
                        _c.sent();
                        return [4 /*yield*/, record.setToMerge(data.toMerge || [], {
                                transaction: transaction
                            })];
                    case 15:
                        _c.sent();
                        if (!data.affiliations) return [3 /*break*/, 17];
                        return [4 /*yield*/, this.setAffiliations(record.id, data.affiliations, options)];
                    case 16:
                        _c.sent();
                        _c.label = 17;
                    case 17: return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].CREATE, record, data, options)];
                    case 18:
                        _c.sent();
                        return [2 /*return*/, this.findById(record.id, options, true, doPopulateRelations)];
                }
            });
        });
    };
    MemberRepository.includeMemberToSegments = function (memberId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction, bulkInsertMemberSegments, replacements, idx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        bulkInsertMemberSegments = "INSERT INTO \"memberSegments\" (\"memberId\",\"segmentId\", \"tenantId\", \"createdAt\") VALUES ";
                        replacements = {
                            memberId: memberId,
                            tenantId: options.currentTenant.id
                        };
                        for (idx = 0; idx < options.currentSegments.length; idx++) {
                            bulkInsertMemberSegments += " (:memberId, :segmentId".concat(idx, ", :tenantId, now()) ");
                            replacements["segmentId".concat(idx)] = options.currentSegments[idx].id;
                            if (idx !== options.currentSegments.length - 1) {
                                bulkInsertMemberSegments += ",";
                            }
                        }
                        bulkInsertMemberSegments += " ON CONFLICT DO NOTHING";
                        return [4 /*yield*/, seq.query(bulkInsertMemberSegments, {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.INSERT,
                                transaction: transaction
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MemberRepository.excludeMembersFromSegments = function (memberIds, options) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction, bulkDeleteMemberSegments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        bulkDeleteMemberSegments = "DELETE FROM \"memberSegments\" WHERE \"memberId\" in (:memberIds) and \"segmentId\" in (:segmentIds);";
                        return [4 /*yield*/, seq.query(bulkDeleteMemberSegments, {
                                replacements: {
                                    memberIds: memberIds,
                                    segmentIds: sequelizeRepository_1["default"].getSegmentIds(options)
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
    MemberRepository.findSampleDataMemberIds = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentTenant, sampleMemberIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.sequelize.query("select m.id from members m\n      where (m.attributes->'sample'->'default')::boolean is true\n      and m.\"tenantId\" = :tenantId;\n    ", {
                                replacements: {
                                    tenantId: currentTenant.id
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        sampleMemberIds = _a.sent();
                        return [2 /*return*/, sampleMemberIds.map(function (i) { return i.id; })];
                }
            });
        });
    };
    MemberRepository.findMembersWithMergeSuggestions = function (_a, options) {
        var _b = _a.limit, limit = _b === void 0 ? 20 : _b, _c = _a.offset, offset = _c === void 0 ? 0 : _c;
        return __awaiter(this, void 0, void 0, function () {
            var currentTenant, segmentIds, mems, memberPromises, toMergePromises, _i, mems_1, mem, memberResults, memberToMergeResults_1, result;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        segmentIds = sequelizeRepository_1["default"].getSegmentIds(options);
                        return [4 /*yield*/, options.database.sequelize.query("SELECT \n        \"membersToMerge\".id, \n        \"membersToMerge\".\"toMergeId\",\n        \"membersToMerge\".\"total_count\",\n        \"membersToMerge\".\"similarity\"\n      FROM \n      (\n        SELECT DISTINCT ON (Greatest(Hashtext(Concat(mem.id, mtm.\"toMergeId\")), Hashtext(Concat(mtm.\"toMergeId\", mem.id)))) \n            mem.id, \n            mtm.\"toMergeId\", \n            mem.\"joinedAt\", \n            COUNT(*) OVER() AS total_count,\n            mtm.\"similarity\"\n          FROM members mem\n          INNER JOIN \"memberToMerge\" mtm ON mem.id = mtm.\"memberId\"\n          JOIN \"memberSegments\" ms ON ms.\"memberId\" = mem.id\n          WHERE mem.\"tenantId\" = :tenantId\n            AND ms.\"segmentId\" IN (:segmentIds)\n        ) AS \"membersToMerge\" \n      ORDER BY \n        \"membersToMerge\".\"similarity\" DESC \n      LIMIT :limit OFFSET :offset\n    ", {
                                replacements: {
                                    tenantId: currentTenant.id,
                                    segmentIds: segmentIds,
                                    limit: limit,
                                    offset: offset
                                },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        mems = _d.sent();
                        if (!(mems.length > 0)) return [3 /*break*/, 4];
                        memberPromises = [];
                        toMergePromises = [];
                        for (_i = 0, mems_1 = mems; _i < mems_1.length; _i++) {
                            mem = mems_1[_i];
                            memberPromises.push(MemberRepository.findById(mem.id, options));
                            toMergePromises.push(MemberRepository.findById(mem.toMergeId, options));
                        }
                        return [4 /*yield*/, Promise.all(memberPromises)];
                    case 2:
                        memberResults = _d.sent();
                        return [4 /*yield*/, Promise.all(toMergePromises)];
                    case 3:
                        memberToMergeResults_1 = _d.sent();
                        result = memberResults.map(function (i, idx) { return ({
                            members: [i, memberToMergeResults_1[idx]],
                            similarity: mems[idx].similarity
                        }); });
                        return [2 /*return*/, { rows: result, count: mems[0].total_count / 2, limit: limit, offset: offset }];
                    case 4: return [2 /*return*/, { rows: [{ members: [], similarity: 0 }], count: 0, limit: limit, offset: offset }];
                }
            });
        });
    };
    MemberRepository.moveIdentitiesBetweenMembers = function (fromMemberId, toMemberId, identitiesToMove, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, tenant, query, _i, identitiesToMove_1, identity, _a, _, count;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        query = "\n      update \"memberIdentities\" \n      set \n        \"memberId\" = :newMemberId\n      where \n        \"tenantId\" = :tenantId and \n        \"memberId\" = :oldMemberId and \n        platform = :platform and \n        username = :username;\n    ";
                        _i = 0, identitiesToMove_1 = identitiesToMove;
                        _b.label = 1;
                    case 1:
                        if (!(_i < identitiesToMove_1.length)) return [3 /*break*/, 4];
                        identity = identitiesToMove_1[_i];
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    tenantId: tenant.id,
                                    oldMemberId: fromMemberId,
                                    newMemberId: toMemberId,
                                    platform: identity.platform,
                                    username: identity.username
                                },
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 2:
                        _a = _b.sent(), _ = _a[0], count = _a[1];
                        if (count !== 1) {
                            throw new Error('One row should be updated!');
                        }
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MemberRepository.moveActivitiesBetweenMembers = function (fromMemberId, toMemberId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, tenant, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        query = "\n      update activities set \"memberId\" = :toMemberId where \"memberId\" = :fromMemberId and \"tenantId\" = :tenantId;\n    ";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    fromMemberId: fromMemberId,
                                    toMemberId: toMemberId,
                                    tenantId: tenant.id
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
    MemberRepository.addToMerge = function (suggestions, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, suggestionChunks, insertValues, _loop_1, _i, suggestionChunks_1, suggestionChunk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        // Remove possible duplicates
                        suggestions = lodash_1["default"].uniqWith(suggestions, function (a, b) {
                            return lodash_1["default"].isEqual(lodash_1["default"].sortBy(a.members), lodash_1["default"].sortBy(b.members));
                        });
                        suggestionChunks = (0, lodash_1.chunk)(suggestions, 100);
                        insertValues = function (memberId, toMergeId, similarity, index) {
                            var _a;
                            var idPlaceholder = function (key) { return "".concat(key).concat(index); };
                            return {
                                query: "(:".concat(idPlaceholder('memberId'), ", :").concat(idPlaceholder('toMergeId'), ", :").concat(idPlaceholder('similarity'), ", NOW(), NOW())"),
                                replacements: (_a = {},
                                    _a[idPlaceholder('memberId')] = memberId,
                                    _a[idPlaceholder('toMergeId')] = toMergeId,
                                    _a[idPlaceholder('similarity')] = similarity === null ? null : similarity,
                                    _a)
                            };
                        };
                        _loop_1 = function (suggestionChunk) {
                            var placeholders, replacements, query, error_1;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        placeholders = [];
                                        replacements = {};
                                        suggestionChunk.forEach(function (suggestion, index) {
                                            var _a = insertValues(suggestion.members[0], suggestion.members[1], suggestion.similarity, index), query = _a.query, chunkReplacements = _a.replacements;
                                            placeholders.push(query);
                                            replacements = __assign(__assign({}, replacements), chunkReplacements);
                                        });
                                        query = "\n        INSERT INTO \"memberToMerge\" (\"memberId\", \"toMergeId\", \"similarity\", \"createdAt\", \"updatedAt\")\n        VALUES ".concat(placeholders.join(', '), ";\n      ");
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, seq.query(query, {
                                                replacements: replacements,
                                                type: sequelize_1.QueryTypes.INSERT,
                                                transaction: transaction
                                            })];
                                    case 2:
                                        _b.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        error_1 = _b.sent();
                                        options.log.error('error adding members to merge', error_1);
                                        throw error_1;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, suggestionChunks_1 = suggestionChunks;
                        _a.label = 1;
                    case 1:
                        if (!(_i < suggestionChunks_1.length)) return [3 /*break*/, 4];
                        suggestionChunk = suggestionChunks_1[_i];
                        return [5 /*yield**/, _loop_1(suggestionChunk)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MemberRepository.removeToMerge = function (id, toMergeId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, returnPlain, member, toMergeMember;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        returnPlain = false;
                        return [4 /*yield*/, this.findById(id, options, returnPlain)];
                    case 1:
                        member = _a.sent();
                        return [4 /*yield*/, this.findById(toMergeId, options, returnPlain)];
                    case 2:
                        toMergeMember = _a.sent();
                        return [4 /*yield*/, member.removeToMerge(toMergeMember, { transaction: transaction })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.findById(id, options)];
                }
            });
        });
    };
    MemberRepository.addNoMerge = function (id, toMergeId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, returnPlain, member, toMergeMember;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        returnPlain = false;
                        return [4 /*yield*/, this.findById(id, options, returnPlain)];
                    case 1:
                        member = _a.sent();
                        return [4 /*yield*/, this.findById(toMergeId, options, returnPlain)];
                    case 2:
                        toMergeMember = _a.sent();
                        return [4 /*yield*/, member.addNoMerge(toMergeMember, { transaction: transaction })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.findById(id, options)];
                }
            });
        });
    };
    MemberRepository.removeNoMerge = function (id, toMergeId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, returnPlain, member, toMergeMember;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        returnPlain = false;
                        return [4 /*yield*/, this.findById(id, options, returnPlain)];
                    case 1:
                        member = _a.sent();
                        return [4 /*yield*/, this.findById(toMergeId, options, returnPlain)];
                    case 2:
                        toMergeMember = _a.sent();
                        return [4 /*yield*/, member.removeNoMerge(toMergeMember, { transaction: transaction })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.findById(id, options)];
                }
            });
        });
    };
    MemberRepository.memberExists = function (username, platform, options, doPopulateRelations) {
        if (doPopulateRelations === void 0) { doPopulateRelations = true; }
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentTenant, seq, usernames, results, ids, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        usernames = [];
                        if (typeof username === 'string') {
                            usernames.push(username);
                        }
                        else if (Array.isArray(username)) {
                            usernames.push.apply(usernames, username);
                        }
                        else {
                            throw new Error('Unknown username format! Allowed formats are string or string[]. For example: "username" or ["username1", "username2"]');
                        }
                        return [4 /*yield*/, seq.query("\n    select mi.\"memberId\"\n    from \"memberIdentities\" mi\n    where mi.\"tenantId\" = :tenantId and\n          mi.platform = :platform and\n          mi.username in (:usernames) and\n          exists (select 1 from \"memberSegments\" ms where ms.\"memberId\" = mi.\"memberId\")\n  ", {
                                type: sequelize_1["default"].QueryTypes.SELECT,
                                replacements: {
                                    tenantId: currentTenant.id,
                                    platform: platform,
                                    usernames: usernames
                                },
                                transaction: transaction
                            })];
                    case 1:
                        results = _a.sent();
                        ids = results.map(function (r) { return r.memberId; });
                        if (ids.length === 0) {
                            return [2 /*return*/, null];
                        }
                        if (doPopulateRelations) {
                            return [2 /*return*/, this.findById(ids[0], options)];
                        }
                        return [4 /*yield*/, seq.query("\n      with segment_ids as (\n        select \"memberId\", array_agg(\"segmentId\") as \"segmentIds\" from\n        \"memberSegments\"\n        where \"memberId\" = :memberId\n        group by \"memberId\"\n      ),\n      identities as (select mi.\"memberId\",\n                            array_agg(distinct mi.platform)             as identities,\n                            jsonb_object_agg(mi.platform, mi.usernames) as username\n                      from (select \"memberId\",\n                                  platform,\n                                  array_agg(username) as usernames\n                            from (select \"memberId\",\n                                        platform,\n                                        username,\n                                        \"createdAt\",\n                                        row_number() over (partition by \"memberId\", platform order by \"createdAt\" desc) =\n                                        1 as is_latest\n                                  from \"memberIdentities\" where \"memberId\" = :memberId) sub\n                            group by \"memberId\", platform) mi\n                      group by mi.\"memberId\"),\n        member_organizations as (\n          select\n            \"memberId\",\n            JSONB_AGG(\n                DISTINCT JSONB_BUILD_OBJECT(\n                  'id', \"organizationId\",\n                  'memberOrganizations',\n                  JSONB_BUILD_OBJECT(\n                    'memberId', \"memberId\",\n                    'organizationId', \"organizationId\",\n                    'dateStart', \"dateStart\",\n                    'dateEnd', \"dateEnd\",\n                    'createdAt', \"createdAt\",\n                    'updatedAt', \"updatedAt\",\n                    'title', title,\n                    'source', source\n                  )\n                )\n            ) AS orgs\n          from \"memberOrganizations\"\n          where \"memberId\" = :memberId\n            and \"deletedAt\" is null\n          group by \"memberId\"\n        )\n        select m.\"id\",\n              m.\"displayName\",\n              m.\"attributes\",\n              m.\"emails\",\n              m.\"score\",\n              m.\"lastEnriched\",\n              m.\"enrichedBy\",\n              m.\"contributions\",\n              m.\"reach\",\n              m.\"joinedAt\",\n              m.\"importHash\",\n              m.\"createdAt\",\n              m.\"updatedAt\",\n              m.\"deletedAt\",\n              m.\"tenantId\",\n              m.\"createdById\",\n              m.\"updatedById\",\n              i.username,\n              si.\"segmentIds\" as segments,\n              coalesce(mo.orgs, '[]'::JSONB) as \"organizations\"\n        from members m\n                inner join identities i on i.\"memberId\" = m.id\n                inner join segment_ids si on si.\"memberId\" = m.id\n                left join member_organizations mo on mo.\"memberId\" = m.id\n        where m.id = :memberId;", {
                                type: sequelize_1["default"].QueryTypes.SELECT,
                                replacements: {
                                    memberId: ids[0]
                                },
                                transaction: transaction
                            })];
                    case 2:
                        records = _a.sent();
                        if (records.length !== 1) {
                            throw new Error('Invalid number of records found!');
                        }
                        return [2 /*return*/, records[0]];
                }
            });
        });
    };
    MemberRepository.update = function (id, data, options, doPopulateRelations) {
        var _a;
        if (doPopulateRelations === void 0) { doPopulateRelations = true; }
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, transaction, currentTenant, record, seq, platforms, query, deleteQuery, platformsToDelete, usernamesToDelete, _i, platforms_1, platform, identities, _b, identities_2, identity;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.member.findOne({
                                where: {
                                    id: id,
                                    tenantId: currentTenant.id
                                },
                                transaction: transaction
                            })];
                    case 1:
                        record = _c.sent();
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        // exclude syncRemote attributes, since these are populated from memberSyncRemote table
                        if ((_a = data.attributes) === null || _a === void 0 ? void 0 : _a.syncRemote) {
                            delete data.attributes.syncRemote;
                        }
                        return [4 /*yield*/, record.update(__assign(__assign({}, lodash_1["default"].pick(data, [
                                'displayName',
                                'attributes',
                                'emails',
                                'lastEnriched',
                                'enrichedBy',
                                'contributions',
                                'score',
                                'reach',
                                'joinedAt',
                                'importHash',
                            ])), { updatedById: currentUser.id }), {
                                transaction: transaction
                            })];
                    case 2:
                        record = _c.sent();
                        if (!data.activities) return [3 /*break*/, 4];
                        return [4 /*yield*/, record.setActivities(data.activities || [], {
                                transaction: transaction
                            })];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        if (!data.tags) return [3 /*break*/, 6];
                        return [4 /*yield*/, record.setTags(data.tags || [], {
                                transaction: transaction
                            })];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        if (!data.tasks) return [3 /*break*/, 8];
                        return [4 /*yield*/, record.setTasks(data.tasks || [], {
                                transaction: transaction
                            })];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8:
                        if (!data.notes) return [3 /*break*/, 10];
                        return [4 /*yield*/, record.setNotes(data.notes || [], {
                                transaction: transaction
                            })];
                    case 9:
                        _c.sent();
                        _c.label = 10;
                    case 10: return [4 /*yield*/, MemberRepository.updateMemberOrganizations(record, data.organizations, data.organizationsReplace, options)];
                    case 11:
                        _c.sent();
                        if (!data.noMerge) return [3 /*break*/, 13];
                        return [4 /*yield*/, record.setNoMerge(data.noMerge || [], {
                                transaction: transaction
                            })];
                    case 12:
                        _c.sent();
                        _c.label = 13;
                    case 13:
                        if (!data.toMerge) return [3 /*break*/, 15];
                        return [4 /*yield*/, record.setToMerge(data.toMerge || [], {
                                transaction: transaction
                            })];
                    case 14:
                        _c.sent();
                        _c.label = 15;
                    case 15:
                        if (!data.affiliations) return [3 /*break*/, 17];
                        return [4 /*yield*/, MemberRepository.setAffiliations(id, data.affiliations, options)];
                    case 16:
                        _c.sent();
                        _c.label = 17;
                    case 17:
                        if (!(options.currentSegments && options.currentSegments.length > 0)) return [3 /*break*/, 19];
                        return [4 /*yield*/, MemberRepository.includeMemberToSegments(record.id, options)];
                    case 18:
                        _c.sent();
                        _c.label = 19;
                    case 19:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        if (!data.username) return [3 /*break*/, 28];
                        data.username = (0, memberTypes_1.mapUsernameToIdentities)(data.username);
                        platforms = Object.keys(data.username);
                        if (!(platforms.length > 0)) return [3 /*break*/, 28];
                        query = "\n          insert into \"memberIdentities\"(\"memberId\", platform, username, \"sourceId\", \"tenantId\", \"integrationId\")\n          values (:memberId, :platform, :username, :sourceId, :tenantId, :integrationId);\n          ";
                        deleteQuery = "\n          delete from \"memberIdentities\"\n          where (\"memberId\", \"tenantId\", \"platform\", \"username\") in\n                (select mi.\"memberId\", mi.\"tenantId\", mi.\"platform\", mi.\"username\"\n                from \"memberIdentities\" mi\n                          join (select :memberId::uuid            as memberid,\n                                      :tenantId::uuid            as tenantid,\n                                      unnest(:platforms::text[]) as platform,\n                                      unnest(:usernames::text[]) as username) as combinations\n                              on mi.\"memberId\" = combinations.memberid\n                                  and mi.\"tenantId\" = combinations.tenantid\n                                  and mi.\"platform\" = combinations.platform\n                                  and mi.\"username\" = combinations.username);";
                        platformsToDelete = [];
                        usernamesToDelete = [];
                        _i = 0, platforms_1 = platforms;
                        _c.label = 20;
                    case 20:
                        if (!(_i < platforms_1.length)) return [3 /*break*/, 26];
                        platform = platforms_1[_i];
                        identities = data.username[platform];
                        _b = 0, identities_2 = identities;
                        _c.label = 21;
                    case 21:
                        if (!(_b < identities_2.length)) return [3 /*break*/, 25];
                        identity = identities_2[_b];
                        if (!identity["delete"]) return [3 /*break*/, 22];
                        platformsToDelete.push(identity.platform);
                        usernamesToDelete.push(identity.username);
                        return [3 /*break*/, 24];
                    case 22: return [4 /*yield*/, seq.query(query, {
                            replacements: {
                                memberId: record.id,
                                platform: platform,
                                username: identity.username,
                                sourceId: identity.sourceId || null,
                                integrationId: identity.integrationId || null,
                                tenantId: currentTenant.id
                            },
                            type: sequelize_1.QueryTypes.INSERT,
                            transaction: transaction
                        })];
                    case 23:
                        _c.sent();
                        _c.label = 24;
                    case 24:
                        _b++;
                        return [3 /*break*/, 21];
                    case 25:
                        _i++;
                        return [3 /*break*/, 20];
                    case 26:
                        if (!(platformsToDelete.length > 0)) return [3 /*break*/, 28];
                        return [4 /*yield*/, seq.query(deleteQuery, {
                                replacements: {
                                    tenantId: currentTenant.id,
                                    memberId: record.id,
                                    platforms: "{".concat(platformsToDelete.join(','), "}"),
                                    usernames: "{".concat(usernamesToDelete.join(','), "}")
                                },
                                type: sequelize_1.QueryTypes.DELETE,
                                transaction: transaction
                            })];
                    case 27:
                        _c.sent();
                        _c.label = 28;
                    case 28: return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].UPDATE, record, data, options)];
                    case 29:
                        _c.sent();
                        return [2 /*return*/, this.findById(record.id, options, true, doPopulateRelations)];
                }
            });
        });
    };
    MemberRepository.destroy = function (id, options, force) {
        if (force === void 0) { force = false; }
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentTenant, member, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, MemberRepository.excludeMembersFromSegments([id], __assign(__assign({}, options), { transaction: transaction }))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.findById(id, options, true, false)
                            // if member doesn't belong to any other segment anymore, remove it
                        ];
                    case 2:
                        member = _a.sent();
                        if (!(member.segments.length === 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, options.database.member.findOne({
                                where: {
                                    id: id,
                                    tenantId: currentTenant.id
                                },
                                transaction: transaction
                            })];
                    case 3:
                        record = _a.sent();
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        return [4 /*yield*/, record.destroy({
                                force: force,
                                transaction: transaction
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].DELETE, record, record, options)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    MemberRepository.destroyBulk = function (ids, options, force) {
        if (force === void 0) { force = false; }
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentTenant;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, MemberRepository.excludeMembersFromSegments(ids, __assign(__assign({}, options), { transaction: transaction }))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, options.database.member.destroy({
                                where: {
                                    id: ids,
                                    tenantId: currentTenant.id
                                },
                                force: force,
                                transaction: transaction
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MemberRepository.getMemberSegments = function (memberId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, segmentRepository, query, data, segmentIds, segments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        segmentRepository = new segmentRepository_1["default"](options);
                        query = "\n        SELECT \"segmentId\"\n        FROM \"memberSegments\"\n        WHERE \"memberId\" = :memberId\n        ORDER BY \"createdAt\";\n    ";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    memberId: memberId
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        data = _a.sent();
                        segmentIds = data.map(function (item) { return item.segmentId; });
                        return [4 /*yield*/, segmentRepository.findInIds(segmentIds)];
                    case 2:
                        segments = _a.sent();
                        return [2 /*return*/, segments];
                }
            });
        });
    };
    MemberRepository.getActivityAggregates = function (memberId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, currentTenant, query, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        query = "\n        SELECT\n        a.\"memberId\",\n        a.\"segmentId\",\n        count(a.id)::integer AS \"activityCount\",\n        max(a.timestamp) AS \"lastActive\",\n        array_agg(DISTINCT concat(a.platform, ':', a.type)) FILTER (WHERE a.platform IS NOT NULL) AS \"activityTypes\",\n        array_agg(DISTINCT a.platform) FILTER (WHERE a.platform IS NOT NULL) AS \"activeOn\",\n        count(DISTINCT a.\"timestamp\"::date)::integer AS \"activeDaysCount\",\n        round(avg(\n            CASE WHEN (a.sentiment ->> 'sentiment'::text) IS NOT NULL THEN\n                (a.sentiment ->> 'sentiment'::text)::double precision\n            ELSE\n                NULL::double precision\n            END\n        )::numeric, 2):: float AS \"averageSentiment\"\n        FROM activities a\n        WHERE a.\"memberId\" = :memberId\n        and a.\"tenantId\" = :tenantId\n        GROUP BY a.\"memberId\", a.\"segmentId\"\n    ";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    memberId: memberId,
                                    tenantId: currentTenant.id
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, (data === null || data === void 0 ? void 0 : data[0]) || null];
                }
            });
        });
    };
    MemberRepository.setAffiliations = function (memberId, data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var affiliationRepository;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        affiliationRepository = new memberSegmentAffiliationRepository_1["default"](options);
                        return [4 /*yield*/, affiliationRepository.setForMember(memberId, data)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, memberAffiliationRepository_1["default"].update(memberId, options)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MemberRepository.getAffiliations = function (memberId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, query, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        query = "\n      select \n        msa.id,\n        s.id as \"segmentId\", \n        s.slug as \"segmentSlug\",\n        s.name as \"segmentName\",\n        s.\"parentName\" as \"segmentParentName\", \n        o.id as \"organizationId\", \n        o.\"displayName\" as \"organizationName\",\n        o.logo as \"organizationLogo\",\n        msa.\"dateStart\" as \"dateStart\",\n        msa.\"dateEnd\" as \"dateEnd\"\n      from \"memberSegmentAffiliations\" msa \n      left join organizations o on o.id = msa.\"organizationId\"\n      join segments s on s.id = msa.\"segmentId\"\n      where msa.\"memberId\" = :memberId\n    ";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    memberId: memberId
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data];
                }
            });
        });
    };
    MemberRepository.getIdentities = function (memberIds, options) {
        return __awaiter(this, void 0, void 0, function () {
            var results, transaction, seq, query, data, _i, memberIds_1, id, _a, _b, res, memberId, platform, username, sourceId, integrationId, createdAt, identities;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        results = new Map();
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        query = "\n      select \"memberId\", platform, username, \"sourceId\", \"integrationId\", \"createdAt\" from \"memberIdentities\" where \"memberId\" in (:memberIds)\n      order by \"createdAt\" asc;\n    ";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    memberIds: memberIds
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        data = _c.sent();
                        for (_i = 0, memberIds_1 = memberIds; _i < memberIds_1.length; _i++) {
                            id = memberIds_1[_i];
                            results.set(id, []);
                        }
                        for (_a = 0, _b = data; _a < _b.length; _a++) {
                            res = _b[_a];
                            memberId = res.memberId, platform = res.platform, username = res.username, sourceId = res.sourceId, integrationId = res.integrationId, createdAt = res.createdAt;
                            identities = results.get(memberId);
                            identities.push({
                                platform: platform,
                                username: username,
                                sourceId: sourceId,
                                integrationId: integrationId,
                                createdAt: createdAt
                            });
                        }
                        return [2 /*return*/, results];
                }
            });
        });
    };
    MemberRepository.findById = function (id, options, returnPlain, doPopulateRelations, ignoreTenant) {
        if (returnPlain === void 0) { returnPlain = true; }
        if (doPopulateRelations === void 0) { doPopulateRelations = true; }
        if (ignoreTenant === void 0) { ignoreTenant = false; }
        return __awaiter(this, void 0, void 0, function () {
            var transaction, include, where, currentTenant, record, data, identities, _i, identities_3, identity, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        include = [
                            {
                                model: options.database.organization,
                                attributes: ['id', 'displayName'],
                                as: 'organizations',
                                order: [['createdAt', 'ASC']],
                                through: {
                                    attributes: ['memberId', 'organizationId', 'dateStart', 'dateEnd', 'title', 'source'],
                                    where: {
                                        deletedAt: null
                                    }
                                }
                            },
                            {
                                model: options.database.segment,
                                as: 'segments',
                                through: {
                                    attributes: []
                                }
                            },
                        ];
                        where = {
                            id: id
                        };
                        if (!ignoreTenant) {
                            currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                            where.tenantId = currentTenant.id;
                        }
                        return [4 /*yield*/, options.database.member.findOne({
                                where: where,
                                include: include,
                                transaction: transaction
                            })];
                    case 1:
                        record = _b.sent();
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        if (doPopulateRelations) {
                            return [2 /*return*/, this._populateRelations(record, options, returnPlain)];
                        }
                        data = record.get({ plain: returnPlain });
                        MemberRepository.sortOrganizations(data.organizations);
                        return [4 /*yield*/, this.getIdentities([data.id], options)];
                    case 2:
                        identities = (_b.sent()).get(data.id);
                        data.username = {};
                        for (_i = 0, identities_3 = identities; _i < identities_3.length; _i++) {
                            identity = identities_3[_i];
                            if (data.username[identity.platform]) {
                                data.username[identity.platform].push(identity.username);
                            }
                            else {
                                data.username[identity.platform] = [identity.username];
                            }
                        }
                        _a = data;
                        return [4 /*yield*/, MemberRepository.getAffiliations(id, options)];
                    case 3:
                        _a.affiliations = _b.sent();
                        return [2 /*return*/, data];
                }
            });
        });
    };
    MemberRepository.filterIdInTenant = function (id, options) {
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
    MemberRepository.filterIdsInTenant = function (ids, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentTenant, where, records;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!ids || !ids.length) {
                            return [2 /*return*/, []];
                        }
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        where = {
                            id: (_a = {},
                                _a[Op["in"]] = ids,
                                _a),
                            tenantId: currentTenant.id
                        };
                        return [4 /*yield*/, options.database.member.findAll({
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
    MemberRepository.count = function (filter, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, tenant;
            return __generator(this, function (_a) {
                transaction = sequelizeRepository_1["default"].getTransaction(options);
                tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                return [2 /*return*/, options.database.member.count({
                        where: __assign(__assign({}, filter), { tenantId: tenant.id }),
                        transaction: transaction
                    })];
            });
        });
    };
    MemberRepository.findAndCountActiveOpensearch = function (filter, limit, offset, orderBy, options, attributesSettings, segments) {
        if (attributesSettings === void 0) { attributesSettings = []; }
        if (segments === void 0) { segments = []; }
        return __awaiter(this, void 0, void 0, function () {
            var tenant, segmentsEnabled, originalSegment, segmentRepository, segment, activityPageSize, activityOffset, activityQuery, subQueries, subQueries, direction, memberIds, memberMap, activities, memberQueryPayload, customSortFunction, members;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, (0, isFeatureEnabled_1["default"])(types_1.FeatureFlag.SEGMENTS, options)];
                    case 1:
                        segmentsEnabled = _a.sent();
                        if (!segmentsEnabled) return [3 /*break*/, 3];
                        if (segments.length !== 1) {
                            throw new common_1.Error400("This operation can have exactly one segment. Found ".concat(segments.length, " segments."));
                        }
                        originalSegment = segments[0];
                        segmentRepository = new segmentRepository_1["default"](options);
                        return [4 /*yield*/, segmentRepository.findById(originalSegment)];
                    case 2:
                        segment = _a.sent();
                        if (segment === null) {
                            return [2 /*return*/, {
                                    rows: [],
                                    count: 0,
                                    limit: limit,
                                    offset: offset
                                }];
                        }
                        if (segmentRepository_1["default"].isProjectGroup(segment)) {
                            segments = segment.projects.reduce(function (acc, p) {
                                acc.push.apply(acc, p.subprojects.map(function (sp) { return sp.id; }));
                                return acc;
                            }, []);
                        }
                        else if (segmentRepository_1["default"].isProject(segment)) {
                            segments = segment.subprojects.map(function (sp) { return sp.id; });
                        }
                        else {
                            segments = [originalSegment];
                        }
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, new segmentRepository_1["default"](options).getDefaultSegment()];
                    case 4:
                        originalSegment = (_a.sent()).id;
                        _a.label = 5;
                    case 5:
                        activityPageSize = 10000;
                        activityOffset = 0;
                        activityQuery = {
                            query: {
                                bool: {
                                    must: [
                                        {
                                            range: {
                                                date_timestamp: {
                                                    gte: filter.activityTimestampFrom,
                                                    lte: filter.activityTimestampTo
                                                }
                                            }
                                        },
                                        {
                                            term: {
                                                uuid_tenantId: tenant.id
                                            }
                                        },
                                    ]
                                }
                            },
                            aggs: {
                                group_by_member: {
                                    terms: {
                                        field: 'uuid_memberId',
                                        size: 10000000
                                    },
                                    aggs: {
                                        activity_count: {
                                            value_count: {
                                                field: 'uuid_id'
                                            }
                                        },
                                        active_days_count: {
                                            cardinality: {
                                                field: 'date_timestamp',
                                                script: {
                                                    source: "doc['date_timestamp'].value.toInstant().toEpochMilli()/86400000"
                                                }
                                            }
                                        },
                                        active_members_bucket_sort: {
                                            bucket_sort: {
                                                sort: [{ activity_count: { order: 'desc' } }],
                                                size: activityPageSize,
                                                from: activityOffset
                                            }
                                        }
                                    }
                                }
                            },
                            size: 0
                        };
                        if (filter.platforms) {
                            subQueries = filter.platforms.map(function (p) { return ({ match_phrase: { keyword_platform: p } }); });
                            activityQuery.query.bool.must.push({
                                bool: {
                                    should: subQueries
                                }
                            });
                        }
                        if (filter.activityIsContribution === true) {
                            activityQuery.query.bool.must.push({
                                term: {
                                    bool_isContribution: true
                                }
                            });
                        }
                        if (segmentsEnabled) {
                            subQueries = segments.map(function (s) { return ({ term: { uuid_segmentId: s } }); });
                            activityQuery.query.bool.must.push({
                                bool: {
                                    should: subQueries
                                }
                            });
                        }
                        direction = orderBy.split('_')[1].toLowerCase() === 'desc' ? 'desc' : 'asc';
                        if (orderBy.startsWith('activityCount')) {
                            activityQuery.aggs.group_by_member.aggs.active_members_bucket_sort.bucket_sort.sort = [
                                { activity_count: { order: direction } },
                            ];
                        }
                        else if (orderBy.startsWith('activeDaysCount')) {
                            activityQuery.aggs.group_by_member.aggs.active_members_bucket_sort.bucket_sort.sort = [
                                { active_days_count: { order: direction } },
                            ];
                        }
                        else {
                            throw new Error("Invalid order by: ".concat(orderBy));
                        }
                        memberIds = [];
                        memberMap = {};
                        _a.label = 6;
                    case 6: return [4 /*yield*/, options.opensearch.search({
                            index: types_1.OpenSearchIndex.ACTIVITIES,
                            body: activityQuery
                        })];
                    case 7:
                        activities = _a.sent();
                        memberIds.push.apply(memberIds, activities.body.aggregations.group_by_member.buckets.map(function (b) { return b.key; }));
                        memberMap = __assign(__assign({}, memberMap), activities.body.aggregations.group_by_member.buckets.reduce(function (acc, b) {
                            acc[b.key] = {
                                activityCount: b.activity_count,
                                activeDaysCount: b.active_days_count
                            };
                            return acc;
                        }, {}));
                        activityOffset += activityPageSize;
                        // update page
                        activityQuery.aggs.group_by_member.aggs.active_members_bucket_sort.bucket_sort.from =
                            activityOffset;
                        _a.label = 8;
                    case 8:
                        if (activities.body.aggregations.group_by_member.buckets.length === activityPageSize) return [3 /*break*/, 6];
                        _a.label = 9;
                    case 9:
                        if (memberIds.length === 0) {
                            return [2 /*return*/, {
                                    rows: [],
                                    count: 0,
                                    limit: limit,
                                    offset: offset
                                }];
                        }
                        memberQueryPayload = {
                            and: [
                                {
                                    id: {
                                        "in": memberIds
                                    }
                                },
                            ]
                        };
                        if (filter.isBot === true) {
                            memberQueryPayload.and.push({
                                isBot: {
                                    eq: true
                                }
                            });
                        }
                        else if (filter.isBot === false) {
                            memberQueryPayload.and.push({
                                isBot: {
                                    not: true
                                }
                            });
                        }
                        if (filter.isTeamMember === true) {
                            memberQueryPayload.and.push({
                                isTeamMember: {
                                    eq: true
                                }
                            });
                        }
                        else if (filter.isTeamMember === false) {
                            memberQueryPayload.and.push({
                                isTeamMember: {
                                    not: true
                                }
                            });
                        }
                        if (filter.isOrganization === true) {
                            memberQueryPayload.and.push({
                                isOrganization: {
                                    eq: true
                                }
                            });
                        }
                        else if (filter.isOrganization === false) {
                            memberQueryPayload.and.push({
                                isOrganization: {
                                    not: true
                                }
                            });
                        }
                        customSortFunction = {
                            _script: {
                                type: 'number',
                                script: {
                                    lang: 'painless',
                                    source: "\n              def memberId = doc['uuid_memberId'].value;\n              return params.memberIds.indexOf(memberId);\n            ",
                                    params: {
                                        memberIds: memberIds.map(function (i) { return "".concat(i); })
                                    }
                                },
                                order: 'asc'
                            }
                        };
                        return [4 /*yield*/, this.findAndCountAllOpensearch({
                                filter: memberQueryPayload,
                                attributesSettings: attributesSettings,
                                segments: [originalSegment],
                                countOnly: false,
                                limit: limit,
                                offset: offset,
                                customSortFunction: customSortFunction
                            }, options)];
                    case 10:
                        members = _a.sent();
                        return [2 /*return*/, {
                                rows: members.rows.map(function (m) {
                                    m.activityCount = memberMap[m.id].activityCount.value;
                                    m.activeDaysCount = memberMap[m.id].activeDaysCount.value;
                                    return m;
                                }),
                                count: members.count,
                                offset: offset,
                                limit: limit
                            }];
                }
            });
        });
    };
    MemberRepository.findAndCountActive = function (filter, limit, offset, orderBy, options) {
        return __awaiter(this, void 0, void 0, function () {
            var tenant, segmentIds, transaction, seq, conditions, parameters, activityConditions, conditionsString, activityConditionsString, direction, orderString, limitCondition, query, results, count, rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        segmentIds = sequelizeRepository_1["default"].getSegmentIds(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        conditions = ['m."tenantId" = :tenantId', 'ms."segmentId" in (:segmentIds)'];
                        parameters = {
                            tenantId: tenant.id,
                            segmentIds: segmentIds,
                            periodStart: filter.activityTimestampFrom,
                            periodEnd: filter.activityTimestampTo
                        };
                        if (filter.isTeamMember === true) {
                            conditions.push("COALESCE((m.attributes->'isTeamMember'->'default')::boolean, false) = true");
                        }
                        else if (filter.isTeamMember === false) {
                            conditions.push("COALESCE((m.attributes->'isTeamMember'->'default')::boolean, false) = false");
                        }
                        if (filter.isBot === true) {
                            conditions.push("COALESCE((m.attributes->'isBot'->'default')::boolean, false) = true");
                        }
                        else if (filter.isBot === false) {
                            conditions.push("COALESCE((m.attributes->'isBot'->'default')::boolean, false) = false");
                        }
                        if (filter.isOrganization === true) {
                            conditions.push("COALESCE((m.attributes->'isOrganization'->'default')::boolean, false) = true");
                        }
                        else if (filter.isOrganization === false) {
                            conditions.push("COALESCE((m.attributes->'isOrganization'->'default')::boolean, false) = false");
                        }
                        activityConditions = ['1=1'];
                        if (filter.platforms && filter.platforms.length > 0) {
                            activityConditions.push('platform in (:platforms)');
                            parameters.platforms = filter.platforms;
                        }
                        if (filter.activityIsContribution) {
                            activityConditions.push('"isContribution" = (:isContribution)');
                            parameters.isContribution = filter.activityIsContribution;
                        }
                        conditionsString = conditions.join(' and ');
                        activityConditionsString = activityConditions.join(' and ');
                        direction = orderBy.split('_')[1].toLowerCase() === 'desc' ? 'desc' : 'asc';
                        if (orderBy.startsWith('activityCount')) {
                            orderString = "ad.\"activityCount\" ".concat(direction);
                        }
                        else if (orderBy.startsWith('activeDaysCount')) {
                            orderString = "ad.\"activeDaysCount\" ".concat(direction);
                        }
                        else {
                            throw new Error("Invalid order by: ".concat(orderBy));
                        }
                        limitCondition = "limit ".concat(limit, " offset ").concat(offset);
                        query = "\n        WITH\n            orgs AS (\n                SELECT mo.\"memberId\", JSON_AGG(ROW_TO_JSON(o.*)) AS organizations\n                FROM \"memberOrganizations\" mo\n                INNER JOIN organizations o ON mo.\"organizationId\" = o.id\n                WHERE mo.\"deletedAt\" IS NULL\n                GROUP BY mo.\"memberId\"\n            ),\n            activity_data AS (\n                SELECT\n                    \"memberId\",\n                    COUNT(id) AS \"activityCount\",\n                    COUNT(DISTINCT timestamp::DATE) AS \"activeDaysCount\"\n                FROM activities\n                WHERE ".concat(activityConditionsString, "\n                  AND timestamp >= :periodStart\n                  AND timestamp < :periodEnd\n                GROUP BY \"memberId\"\n            ),\n            identities AS (\n                SELECT\n                    mi.\"memberId\",\n                    ARRAY_AGG(DISTINCT mi.platform) AS identities,\n                    JSONB_OBJECT_AGG(mi.platform, mi.usernames) AS username\n                FROM (\n                    SELECT\n                        \"memberId\",\n                        platform,\n                        ARRAY_AGG(username) AS usernames\n                    FROM (\n                        SELECT\n                            \"memberId\",\n                            platform,\n                            username,\n                            \"createdAt\",\n                            ROW_NUMBER() OVER (PARTITION BY \"memberId\", platform ORDER BY \"createdAt\" DESC) =\n                            1 AS is_latest\n                        FROM \"memberIdentities\"\n                        WHERE \"tenantId\" = :tenantId\n                    ) sub\n                    WHERE is_latest\n                    GROUP BY \"memberId\", platform\n                ) mi\n                GROUP BY mi.\"memberId\"\n            )\n        SELECT\n            m.id,\n            m.\"displayName\",\n            i.username,\n            i.identities,\n            m.attributes,\n            ad.\"activityCount\",\n            ad.\"activeDaysCount\",\n            m.\"joinedAt\",\n            COALESCE(o.organizations, JSON_BUILD_ARRAY()) AS organizations,\n            COUNT(*) OVER () AS \"totalCount\"\n        FROM members m\n        INNER JOIN activity_data ad ON ad.\"memberId\" = m.id\n        INNER JOIN identities i ON i.\"memberId\" = m.id\n        LEFT JOIN orgs o ON o.\"memberId\" = m.id\n        JOIN \"memberSegments\" ms ON ms.\"memberId\" = m.id\n        WHERE ").concat(conditionsString, "\n        ORDER BY ").concat(orderString, "\n                     ").concat(limitCondition, ";\n    ");
                        options.log.debug({ query: query, filter: filter, orderBy: orderBy, limit: limit, offset: offset, test: orderBy.split('_')[1].toLowerCase() }, 'Active members query!');
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
                                    offset: offset,
                                    limit: limit
                                }];
                        }
                        count = parseInt(results[0].totalCount, 10);
                        rows = results.map(function (r) {
                            var row = r;
                            return {
                                id: row.id,
                                displayName: row.displayName,
                                username: row.username,
                                attributes: row.attributes,
                                organizations: row.organizations,
                                activityCount: parseInt(row.activityCount, 10),
                                activeDaysCount: parseInt(row.activeDaysCount, 10),
                                joinedAt: row.joinedAt
                            };
                        });
                        return [2 /*return*/, {
                                rows: rows,
                                count: count,
                                offset: offset,
                                limit: limit
                            }];
                }
            });
        });
    };
    MemberRepository.countMembersPerSegment = function (options, segmentIds) {
        return __awaiter(this, void 0, void 0, function () {
            var countResults;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, MemberRepository.countMembers(options, segmentIds)];
                    case 1:
                        countResults = _a.sent();
                        return [2 /*return*/, countResults.reduce(function (acc, curr) {
                                acc[curr.segmentId] = parseInt(curr.totalCount, 10);
                                return acc;
                            }, {})];
                }
            });
        });
    };
    MemberRepository.countMembers = function (options, segmentIds, filterString, params) {
        if (filterString === void 0) { filterString = '1=1'; }
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var countQuery, seq;
            return __generator(this, function (_a) {
                countQuery = "\n        WITH\n            member_tags AS (\n                SELECT\n                    mt.\"memberId\",\n                    JSONB_AGG(t.id) AS all_ids\n                FROM \"memberTags\" mt\n                INNER JOIN members m ON mt.\"memberId\" = m.id\n                JOIN \"memberSegments\" ms ON ms.\"memberId\" = m.id\n                INNER JOIN tags t ON mt.\"tagId\" = t.id\n                WHERE m.\"tenantId\" = :tenantId\n                  AND m.\"deletedAt\" IS NULL\n                  AND ms.\"segmentId\" IN (:segmentIds)\n                  AND t.\"tenantId\" = :tenantId\n                  AND t.\"deletedAt\" IS NULL\n                GROUP BY mt.\"memberId\"\n            ),\n            member_organizations AS (\n                SELECT\n                    mo.\"memberId\",\n                    JSONB_AGG(o.id) AS all_ids\n                FROM \"memberOrganizations\" mo\n                INNER JOIN members m ON mo.\"memberId\" = m.id\n                INNER JOIN organizations o ON mo.\"organizationId\" = o.id\n                JOIN \"memberSegments\" ms ON ms.\"memberId\" = m.id\n                JOIN \"organizationSegments\" os ON o.id = os.\"organizationId\"\n                WHERE m.\"tenantId\" = :tenantId\n                  AND m.\"deletedAt\" IS NULL\n                  AND ms.\"segmentId\" IN (:segmentIds)\n                  AND o.\"tenantId\" = :tenantId\n                  AND o.\"deletedAt\" IS NULL\n                  AND os.\"segmentId\" IN (:segmentIds)\n                  AND mo.\"deletedAt\" IS NULL\n                GROUP BY mo.\"memberId\"\n            )\n        SELECT\n            COUNT(m.id) AS \"totalCount\",\n            ms.\"segmentId\"\n        FROM members m\n        JOIN \"memberSegments\" ms ON ms.\"memberId\" = m.id\n        LEFT JOIN \"memberActivityAggregatesMVs\" aggs ON aggs.id = m.id AND aggs.\"segmentId\" = ms.\"segmentId\"\n        LEFT JOIN member_tags mt ON m.id = mt.\"memberId\"\n        LEFT JOIN member_organizations mo ON m.id = mo.\"memberId\"\n        WHERE m.\"deletedAt\" IS NULL\n          AND m.\"tenantId\" = :tenantId\n          AND ms.\"segmentId\" IN (:segmentIds)\n          AND ".concat(filterString, "\n        GROUP BY ms.\"segmentId\";\n    ");
                seq = sequelizeRepository_1["default"].getSequelize(options);
                return [2 /*return*/, seq.query(countQuery, {
                        replacements: __assign({ tenantId: options.currentTenant.id, segmentIds: segmentIds }, params),
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            });
        });
    };
    MemberRepository.findAndCountAllv2 = function (_a, options) {
        var _b = _a.filter, filter = _b === void 0 ? {} : _b, _c = _a.limit, limit = _c === void 0 ? 20 : _c, _d = _a.offset, offset = _d === void 0 ? 0 : _d, _e = _a.orderBy, orderBy = _e === void 0 ? 'joinedAt_DESC' : _e, _f = _a.countOnly, countOnly = _f === void 0 ? false : _f, _g = _a.attributesSettings, attributesSettings = _g === void 0 ? [] : _g;
        return __awaiter(this, void 0, void 0, function () {
            var tenant, segmentIds, seq, params, orderByString, orderByParts, direction, jsonColumnInfos, filterString, query, sumMemberCount, countResults_1, count_1, _h, results, countResults, memberIds, lastActivities, _loop_2, _i, results_1, row, count;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        segmentIds = sequelizeRepository_1["default"].getSegmentIds(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        params = {
                            tenantId: tenant.id,
                            segmentIds: segmentIds,
                            limit: limit,
                            offset: offset
                        };
                        orderByString = '';
                        orderByParts = orderBy.split('_');
                        direction = orderByParts[1].toLowerCase();
                        switch (orderByParts[0]) {
                            case 'joinedAt':
                                orderByString = 'm."joinedAt"';
                                break;
                            case 'displayName':
                                orderByString = 'm."displayName"';
                                break;
                            case 'reach':
                                orderByString = "(m.reach ->> 'total')::int";
                                break;
                            case 'score':
                                orderByString = 'm.score';
                                break;
                            case 'lastActive':
                                orderByString = 'aggs."lastActive"';
                                break;
                            case 'averageSentiment':
                                orderByString = 'aggs."averageSentiment"';
                                break;
                            case 'activeDaysCount':
                                orderByString = 'aggs."activeDaysCount"';
                                break;
                            case 'activityCount':
                                orderByString = 'aggs."activityCount"';
                                break;
                            case 'numberOfOpenSourceContributions':
                                orderByString = '"numberOfOpenSourceContributions"';
                                break;
                            default:
                                throw new Error("Invalid order by: ".concat(orderBy, "!"));
                        }
                        orderByString = "".concat(orderByString, " ").concat(direction);
                        jsonColumnInfos = [
                            {
                                property: 'attributes',
                                column: 'm.attributes',
                                attributeInfos: attributesSettings
                            },
                            {
                                property: 'username',
                                column: 'aggs.username',
                                attributeInfos: types_1.ALL_PLATFORM_TYPES.map(function (p) { return ({
                                    name: p,
                                    type: types_1.MemberAttributeType.STRING
                                }); })
                            },
                            {
                                property: 'tags',
                                column: 'mt.all_ids',
                                attributeInfos: []
                            },
                            {
                                property: 'organizations',
                                column: 'mo.all_ids',
                                attributeInfos: []
                            },
                        ];
                        filterString = rawQueryParser_1["default"].parseFilters(filter, MemberRepository.MEMBER_QUERY_FILTER_COLUMN_MAP, jsonColumnInfos, params);
                        if (filterString.trim().length === 0) {
                            filterString = '1=1';
                        }
                        query = "\n        WITH\n            to_merge_data AS (\n                SELECT mtm.\"memberId\", STRING_AGG(DISTINCT mtm.\"toMergeId\"::TEXT, ',') AS to_merge_ids\n                FROM \"memberToMerge\" mtm\n                INNER JOIN members m ON mtm.\"memberId\" = m.id\n                INNER JOIN members m2 ON mtm.\"toMergeId\" = m2.id\n                JOIN \"memberSegments\" ms ON m.id = ms.\"memberId\"\n                JOIN \"memberSegments\" ms2 ON m2.id = ms2.\"memberId\"\n                WHERE m.\"tenantId\" = :tenantId\n                  AND m2.\"deletedAt\" IS NULL\n                  AND ms.\"segmentId\" IN (:segmentIds)\n                  AND ms2.\"segmentId\" IN (:segmentIds)\n                GROUP BY mtm.\"memberId\"\n            ),\n            no_merge_data AS (\n                SELECT mnm.\"memberId\", STRING_AGG(DISTINCT mnm.\"noMergeId\"::TEXT, ',') AS no_merge_ids\n                FROM \"memberNoMerge\" mnm\n                INNER JOIN members m ON mnm.\"memberId\" = m.id\n                INNER JOIN members m2 ON mnm.\"noMergeId\" = m2.id\n                JOIN \"memberSegments\" ms ON m.id = ms.\"memberId\"\n                JOIN \"memberSegments\" ms2 ON m2.id = ms2.\"memberId\"\n                WHERE m.\"tenantId\" = :tenantId\n                  AND m2.\"deletedAt\" IS NULL\n                  AND ms.\"segmentId\" IN (:segmentIds)\n                  AND ms2.\"segmentId\" IN (:segmentIds)\n                GROUP BY mnm.\"memberId\"\n            ),\n            member_tags AS (\n                SELECT\n                    mt.\"memberId\",\n                    JSON_AGG(\n                            DISTINCT JSONB_BUILD_OBJECT(\n                                    'id', t.id,\n                                    'name', t.name\n                                )\n                        ) AS all_tags,\n                    JSONB_AGG(t.id) AS all_ids\n                FROM \"memberTags\" mt\n                INNER JOIN members m ON mt.\"memberId\" = m.id\n                JOIN \"memberSegments\" ms ON ms.\"memberId\" = m.id\n                INNER JOIN tags t ON mt.\"tagId\" = t.id\n                WHERE m.\"tenantId\" = :tenantId\n                  AND m.\"deletedAt\" IS NULL\n                  AND ms.\"segmentId\" IN (:segmentIds)\n                  AND t.\"tenantId\" = :tenantId\n                  AND t.\"deletedAt\" IS NULL\n                GROUP BY mt.\"memberId\"\n            ),\n            member_organizations AS (\n                SELECT\n                    mo.\"memberId\",\n                    JSON_AGG(\n                            ROW_TO_JSON(o.*)\n                        ) AS all_organizations,\n                    JSONB_AGG(o.id) AS all_ids\n                FROM \"memberOrganizations\" mo\n                INNER JOIN members m ON mo.\"memberId\" = m.id\n                INNER JOIN organizations o ON mo.\"organizationId\" = o.id\n                JOIN \"memberSegments\" ms ON ms.\"memberId\" = m.id\n                JOIN \"organizationSegments\" os ON o.id = os.\"organizationId\"\n                WHERE m.\"tenantId\" = :tenantId\n                  AND m.\"deletedAt\" IS NULL\n                  AND ms.\"segmentId\" IN (:segmentIds)\n                  AND o.\"tenantId\" = :tenantId\n                  AND o.\"deletedAt\" IS NULL\n                  AND os.\"segmentId\" IN (:segmentIds)\n                  AND ms.\"segmentId\" = os.\"segmentId\"\n                  AND mo.\"deletedAt\" IS NULL\n                GROUP BY mo.\"memberId\"\n            ),\n            aggs AS (\n                SELECT\n                    id,\n                    MAX(\"lastActive\") AS \"lastActive\",\n                    ARRAY(SELECT DISTINCT UNNEST(ARRAY_AGG(identities))) AS identities,\n                    jsonb_merge_agg(username) AS username,\n                    SUM(\"activityCount\") AS \"activityCount\",\n                    ARRAY(SELECT DISTINCT UNNEST(array_accum(\"activityTypes\"))) AS \"activityTypes\",\n                    ARRAY(SELECT DISTINCT UNNEST(array_accum(\"activeOn\"))) AS \"activeOn\",\n                    SUM(\"activeDaysCount\") AS \"activeDaysCount\",\n                    ROUND(SUM(\"averageSentiment\" * \"activityCount\") / SUM(\"activityCount\"), 2) AS \"averageSentiment\",\n                    ARRAY_AGG(DISTINCT \"segmentId\") AS \"segmentIds\"\n                FROM \"memberActivityAggregatesMVs\"\n                WHERE \"segmentId\" IN (:segmentIds)\n                GROUP BY id\n            )\n        SELECT\n            m.id,\n            m.\"displayName\",\n            m.attributes,\n            m.emails,\n            m.\"tenantId\",\n            m.score,\n            m.\"lastEnriched\",\n            m.contributions,\n            m.\"joinedAt\",\n            m.\"importHash\",\n            m.\"createdAt\",\n            m.\"updatedAt\",\n            m.reach,\n            tmd.to_merge_ids AS \"toMergeIds\",\n            nmd.no_merge_ids AS \"noMergeIds\",\n            aggs.username,\n            aggs.identities,\n            aggs.\"activeOn\",\n            aggs.\"activityCount\",\n            aggs.\"activityTypes\",\n            aggs.\"activeDaysCount\",\n            aggs.\"lastActive\",\n            aggs.\"averageSentiment\",\n            aggs.\"segmentIds\",\n            COALESCE(mt.all_tags, JSON_BUILD_ARRAY()) AS tags,\n            COALESCE(mo.all_organizations, JSON_BUILD_ARRAY()) AS organizations,\n            COALESCE(JSONB_ARRAY_LENGTH(m.contributions), 0) AS \"numberOfOpenSourceContributions\"\n        FROM members m\n        JOIN \"memberSegments\" ms ON ms.\"memberId\" = m.id\n        LEFT JOIN aggs ON aggs.id = m.id\n        LEFT JOIN to_merge_data tmd ON m.id = tmd.\"memberId\"\n        LEFT JOIN no_merge_data nmd ON m.id = nmd.\"memberId\"\n        LEFT JOIN member_tags mt ON m.id = mt.\"memberId\"\n        LEFT JOIN member_organizations mo ON m.id = mo.\"memberId\"\n        WHERE m.\"deletedAt\" IS NULL\n          AND m.\"tenantId\" = :tenantId\n          AND ms.\"segmentId\" IN (:segmentIds)\n          AND ".concat(filterString, "\n        ORDER BY ").concat(orderByString, "\n        LIMIT :limit OFFSET :offset;\n    ");
                        sumMemberCount = function (countResults) {
                            return countResults.map(function (row) { return parseInt(row.totalCount, 10); }).reduce(function (a, b) { return a + b; }, 0);
                        };
                        if (!countOnly) return [3 /*break*/, 2];
                        return [4 /*yield*/, MemberRepository.countMembers(options, segmentIds, filterString, params)];
                    case 1:
                        countResults_1 = _j.sent();
                        count_1 = sumMemberCount(countResults_1);
                        return [2 /*return*/, {
                                rows: [],
                                count: count_1,
                                limit: limit,
                                offset: offset
                            }];
                    case 2:
                        options.log.info({ sql: query, replacements: params, segmentIds: segmentIds }, 'findAndCountAllv2 - executing main query');
                        return [4 /*yield*/, Promise.all([
                                seq.query(query, {
                                    replacements: params,
                                    type: sequelize_1.QueryTypes.SELECT
                                }),
                                MemberRepository.countMembers(options, segmentIds, filterString, params),
                            ])];
                    case 3:
                        _h = _j.sent(), results = _h[0], countResults = _h[1];
                        memberIds = results.map(function (r) { return r.id; });
                        if (!(memberIds.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, seq.query("\n            WITH\n                raw_data AS (\n                    SELECT *, ROW_NUMBER() OVER (PARTITION BY \"memberId\" ORDER BY timestamp DESC) AS rn\n                    FROM activities\n                    WHERE \"tenantId\" = :tenantId\n                      AND \"memberId\" IN (:memberIds)\n                      AND \"segmentId\" IN (:segmentIds)\n                )\n            SELECT *\n            FROM raw_data\n            WHERE rn = 1;\n        ", {
                                replacements: {
                                    tenantId: tenant.id,
                                    segmentIds: segmentIds,
                                    memberIds: memberIds
                                },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 4:
                        lastActivities = _j.sent();
                        _loop_2 = function (row) {
                            var r = row;
                            r.lastActivity = lastActivities.find(function (a) { return a.memberId === r.id; });
                            if (r.lastActivity) {
                                r.lastActivity.display = integrations_1.ActivityDisplayService.getDisplayOptions(r.lastActivity, segmentRepository_1["default"].getActivityTypes(options), [types_1.ActivityDisplayVariant.SHORT, types_1.ActivityDisplayVariant.CHANNEL]);
                            }
                        };
                        for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                            row = results_1[_i];
                            _loop_2(row);
                        }
                        _j.label = 5;
                    case 5:
                        count = sumMemberCount(countResults);
                        return [2 /*return*/, {
                                rows: results,
                                count: count,
                                limit: limit,
                                offset: offset
                            }];
                }
            });
        });
    };
    MemberRepository.findAndCountAllOpensearch = function (_a, options) {
        var _b = _a.filter, filter = _b === void 0 ? {} : _b, _c = _a.limit, limit = _c === void 0 ? 20 : _c, _d = _a.offset, offset = _d === void 0 ? 0 : _d, _e = _a.orderBy, orderBy = _e === void 0 ? 'joinedAt_DESC' : _e, _f = _a.countOnly, countOnly = _f === void 0 ? false : _f, _g = _a.attributesSettings, attributesSettings = _g === void 0 ? [] : _g, _h = _a.segments, segments = _h === void 0 ? [] : _h, _j = _a.customSortFunction, customSortFunction = _j === void 0 ? undefined : _j;
        return __awaiter(this, void 0, void 0, function () {
            var tenant, segmentsEnabled, segment, translator, _k, _l, _m, _o, parsed, _i, _p, organizationId, countResponse, response, translatedRows, _q, translatedRows_1, row, identities, username, _r, _s, identity, memberIds, seq, segmentIds, lastActivities, _loop_3, _t, translatedRows_2, row;
            return __generator(this, function (_u) {
                switch (_u.label) {
                    case 0:
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, (0, isFeatureEnabled_1["default"])(types_1.FeatureFlag.SEGMENTS, options)];
                    case 1:
                        segmentsEnabled = _u.sent();
                        segment = segments[0];
                        _l = (_k = opensearch_1.FieldTranslatorFactory).getTranslator;
                        _m = [types_1.OpenSearchIndex.MEMBERS,
                            attributesSettings];
                        _o = [[
                                'default',
                                'custom',
                                'gitmesh',
                                'enrichment'
                            ]];
                        return [4 /*yield*/, tenantRepository_1["default"].getAvailablePlatforms(options.currentTenant.id, options)];
                    case 2:
                        translator = _l.apply(_k, _m.concat([__spreadArray.apply(void 0, _o.concat([(_u.sent()).map(function (p) { return p.platform; }), true]))]));
                        parsed = opensearch_1.OpensearchQueryParser.parse({ filter: filter, limit: limit, offset: offset, orderBy: orderBy }, types_1.OpenSearchIndex.MEMBERS, translator);
                        // add tenant filter to parsed query
                        parsed.query.bool.must.push({
                            term: {
                                uuid_tenantId: tenant.id
                            }
                        });
                        if (segmentsEnabled) {
                            // add segment filter
                            parsed.query.bool.must.push({
                                term: {
                                    uuid_segmentId: segment
                                }
                            });
                        }
                        if (customSortFunction) {
                            parsed.sort = customSortFunction;
                        }
                        if (filter.organizations && filter.organizations.length > 0) {
                            parsed.query.bool.must = parsed.query.bool.must.filter(function (d) { var _a, _b, _c; return ((_c = (_b = (_a = d.nested) === null || _a === void 0 ? void 0 : _a.query) === null || _b === void 0 ? void 0 : _b.term) === null || _c === void 0 ? void 0 : _c['nested_organizations.uuid_id']) === undefined; });
                            // add organizations filter manually for now
                            for (_i = 0, _p = filter.organizations; _i < _p.length; _i++) {
                                organizationId = _p[_i];
                                parsed.query.bool.must.push({
                                    nested: {
                                        path: 'nested_organizations',
                                        query: {
                                            bool: {
                                                must: [
                                                    {
                                                        term: {
                                                            'nested_organizations.uuid_id': organizationId
                                                        }
                                                    },
                                                    {
                                                        bool: {
                                                            must_not: {
                                                                exists: {
                                                                    field: 'nested_organizations.obj_memberOrganizations.date_dateEnd'
                                                                }
                                                            }
                                                        }
                                                    },
                                                ]
                                            }
                                        }
                                    }
                                });
                            }
                        }
                        return [4 /*yield*/, options.opensearch.count({
                                index: types_1.OpenSearchIndex.MEMBERS,
                                body: { query: parsed.query }
                            })];
                    case 3:
                        countResponse = _u.sent();
                        if (countOnly) {
                            return [2 /*return*/, {
                                    rows: [],
                                    count: countResponse.body.count,
                                    limit: limit,
                                    offset: offset
                                }];
                        }
                        return [4 /*yield*/, options.opensearch.search({
                                index: types_1.OpenSearchIndex.MEMBERS,
                                body: parsed
                            })];
                    case 4:
                        response = _u.sent();
                        translatedRows = response.body.hits.hits.map(function (o) {
                            return translator.translateObjectToGitmesh(o._source);
                        });
                        for (_q = 0, translatedRows_1 = translatedRows; _q < translatedRows_1.length; _q++) {
                            row = translatedRows_1[_q];
                            identities = [];
                            username = {};
                            for (_r = 0, _s = row.identities; _r < _s.length; _r++) {
                                identity = _s[_r];
                                identities.push(identity.platform);
                                if (identity.platform in username) {
                                    username[identity.platform].push(identity.username);
                                }
                                else {
                                    username[identity.platform] = [identity.username];
                                }
                            }
                            row.identities = identities;
                            row.username = username;
                            row.activeDaysCount = parseInt(row.activeDaysCount, 10);
                            row.activityCount = parseInt(row.activityCount, 10);
                        }
                        memberIds = translatedRows.map(function (r) { return r.id; });
                        if (!(memberIds.length > 0)) return [3 /*break*/, 6];
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        segmentIds = segments;
                        return [4 /*yield*/, seq.query("\n            WITH\n                raw_data AS (\n                    SELECT *, ROW_NUMBER() OVER (PARTITION BY \"memberId\" ORDER BY timestamp DESC) AS rn\n                    FROM activities\n                    WHERE \"tenantId\" = :tenantId\n                      AND \"memberId\" IN (:memberIds)\n                      AND \"segmentId\" IN (:segmentIds)\n                )\n            SELECT *\n            FROM raw_data\n            WHERE rn = 1;\n        ", {
                                replacements: {
                                    tenantId: tenant.id,
                                    segmentIds: segmentIds,
                                    memberIds: memberIds
                                },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 5:
                        lastActivities = _u.sent();
                        _loop_3 = function (row) {
                            var r = row;
                            r.lastActivity = lastActivities.find(function (a) { return a.memberId === r.id; });
                            if (r.lastActivity) {
                                r.lastActivity.display = integrations_1.ActivityDisplayService.getDisplayOptions(r.lastActivity, segmentRepository_1["default"].getActivityTypes(options), [types_1.ActivityDisplayVariant.SHORT, types_1.ActivityDisplayVariant.CHANNEL]);
                            }
                        };
                        for (_t = 0, translatedRows_2 = translatedRows; _t < translatedRows_2.length; _t++) {
                            row = translatedRows_2[_t];
                            _loop_3(row);
                        }
                        _u.label = 6;
                    case 6: return [2 /*return*/, { rows: translatedRows, count: countResponse.body.count, limit: limit, offset: offset }];
                }
            });
        });
    };
    MemberRepository.findAndCountAll = function (_a, options) {
        var _b = _a.filter, filter = _b === void 0 ? {} : _b, _c = _a.advancedFilter, advancedFilter = _c === void 0 ? null : _c, _d = _a.limit, limit = _d === void 0 ? 0 : _d, _e = _a.offset, offset = _e === void 0 ? 0 : _e, _f = _a.orderBy, orderBy = _f === void 0 ? '' : _f, _g = _a.attributesSettings, attributesSettings = _g === void 0 ? [] : _g, _h = _a.exportMode, exportMode = _h === void 0 ? false : _h;
        return __awaiter(this, void 0, void 0, function () {
            var customOrderBy, include, _j, start, end, _k, start, end, _l, start, end, _m, start, end, _o, start, end, _p, start, end, _q, start, end, _r, start, end, _s, start, end, _t, dynamicAttributesDefaultNestedFields, dynamicAttributesPlatformNestedFields, dynamicAttributesProjection, activityCount, activityTypes, activeDaysCount, lastActive, activeOn, averageSentiment, identities, username, toMergeArray, noMergeArray, numberOfOpenSourceContributions, parser, parsed, order, _u, rows, count;
            return __generator(this, function (_v) {
                switch (_v.label) {
                    case 0:
                        customOrderBy = [];
                        include = [
                            {
                                model: options.database.memberActivityAggregatesMV,
                                attributes: [],
                                required: false,
                                as: 'memberActivityAggregatesMVs'
                            },
                            {
                                model: options.database.member,
                                as: 'toMerge',
                                attributes: [],
                                through: {
                                    attributes: []
                                }
                            },
                            {
                                model: options.database.member,
                                as: 'noMerge',
                                attributes: [],
                                through: {
                                    attributes: []
                                }
                            },
                        ];
                        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1["default"].customOrderByIfExists('activityCount', orderBy));
                        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1["default"].customOrderByIfExists('activeDaysCount', orderBy));
                        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1["default"].customOrderByIfExists('lastActive', orderBy));
                        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1["default"].customOrderByIfExists('averageSentiment', orderBy));
                        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1["default"].customOrderByIfExists('numberOfOpenSourceContributions', orderBy));
                        if (orderBy.includes('reach')) {
                            customOrderBy = customOrderBy.concat([
                                sequelize_1["default"].literal("(\"member\".reach->'total')::int"),
                                orderBy.split('_')[1],
                            ]);
                        }
                        if (!advancedFilter) {
                            advancedFilter = { and: [] };
                            if (filter) {
                                if (filter.id) {
                                    advancedFilter.and.push({ id: filter.id });
                                }
                                if (filter.platform) {
                                    advancedFilter.and.push({
                                        platform: {
                                            jsonContains: filter.platform
                                        }
                                    });
                                }
                                if (filter.tags) {
                                    advancedFilter.and.push({
                                        tags: filter.tags
                                    });
                                }
                                if (filter.organizations) {
                                    advancedFilter.and.push({
                                        organizations: filter.organizations
                                    });
                                }
                                // TODO: member identitites FIX
                                if (filter.username) {
                                    advancedFilter.and.push({ username: { jsonContains: filter.username } });
                                }
                                if (filter.displayName) {
                                    advancedFilter.and.push({
                                        displayName: {
                                            textContains: filter.displayName
                                        }
                                    });
                                }
                                if (filter.emails) {
                                    advancedFilter.and.push({
                                        emails: {
                                            contains: filter.emails
                                        }
                                    });
                                }
                                if (filter.scoreRange) {
                                    _j = filter.scoreRange, start = _j[0], end = _j[1];
                                    if (start !== undefined && start !== null && start !== '') {
                                        advancedFilter.and.push({
                                            score: {
                                                gte: start
                                            }
                                        });
                                    }
                                    if (end !== undefined && end !== null && end !== '') {
                                        advancedFilter.and.push({
                                            score: {
                                                lte: end
                                            }
                                        });
                                    }
                                }
                                if (filter.createdAtRange) {
                                    _k = filter.createdAtRange, start = _k[0], end = _k[1];
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
                                if (filter.reachRange) {
                                    _l = filter.reachRange, start = _l[0], end = _l[1];
                                    if (start !== undefined && start !== null && start !== '') {
                                        advancedFilter.and.push({
                                            reach: {
                                                gte: start
                                            }
                                        });
                                    }
                                    if (end !== undefined && end !== null && end !== '') {
                                        advancedFilter.and.push({
                                            reach: {
                                                lte: end
                                            }
                                        });
                                    }
                                }
                                if (filter.activityCountRange) {
                                    _m = filter.activityCountRange, start = _m[0], end = _m[1];
                                    if (start !== undefined && start !== null && start !== '') {
                                        advancedFilter.and.push({
                                            activityCount: {
                                                gte: start
                                            }
                                        });
                                    }
                                    if (end !== undefined && end !== null && end !== '') {
                                        advancedFilter.and.push({
                                            activityCount: {
                                                lte: end
                                            }
                                        });
                                    }
                                }
                                if (filter.activityTypes) {
                                    advancedFilter.and.push({
                                        activityTypes: {
                                            overlap: filter.activityTypes.split(',')
                                        }
                                    });
                                }
                                if (filter.activeDaysCountRange) {
                                    _o = filter.activeDaysCountRange, start = _o[0], end = _o[1];
                                    if (start !== undefined && start !== null && start !== '') {
                                        advancedFilter.and.push({
                                            activeDaysCount: {
                                                gte: start
                                            }
                                        });
                                    }
                                    if (end !== undefined && end !== null && end !== '') {
                                        advancedFilter.and.push({
                                            activeDaysCount: {
                                                lte: end
                                            }
                                        });
                                    }
                                }
                                if (filter.joinedAtRange) {
                                    _p = filter.joinedAtRange, start = _p[0], end = _p[1];
                                    if (start !== undefined && start !== null && start !== '') {
                                        advancedFilter.and.push({
                                            joinedAt: {
                                                gte: start
                                            }
                                        });
                                    }
                                    if (end !== undefined && end !== null && end !== '') {
                                        advancedFilter.and.push({
                                            joinedAt: {
                                                lte: end
                                            }
                                        });
                                    }
                                }
                                if (filter.lastActiveRange) {
                                    _q = filter.lastActiveRange, start = _q[0], end = _q[1];
                                    if (start !== undefined && start !== null && start !== '') {
                                        advancedFilter.and.push({
                                            lastActive: {
                                                gte: start
                                            }
                                        });
                                    }
                                    if (end !== undefined && end !== null && end !== '') {
                                        advancedFilter.and.push({
                                            lastActive: {
                                                lte: end
                                            }
                                        });
                                    }
                                }
                                if (filter.averageSentimentRange) {
                                    _r = filter.averageSentimentRange, start = _r[0], end = _r[1];
                                    if (start !== undefined && start !== null && start !== '') {
                                        advancedFilter.and.push({
                                            averageSentiment: {
                                                gte: start
                                            }
                                        });
                                    }
                                    if (end !== undefined && end !== null && end !== '') {
                                        advancedFilter.and.push({
                                            averageSentiment: {
                                                lte: end
                                            }
                                        });
                                    }
                                }
                                if (filter.numberOfOpenSourceContributionsRange) {
                                    _s = filter.numberOfOpenSourceContributionsRange, start = _s[0], end = _s[1];
                                    if (start !== undefined && start !== null && start !== '') {
                                        advancedFilter.and.push({
                                            numberOfOpenSourceContributions: {
                                                gte: start
                                            }
                                        });
                                    }
                                    if (end !== undefined && end !== null && end !== '') {
                                        advancedFilter.and.push({
                                            numberOfOpenSourceContributions: {
                                                lte: end
                                            }
                                        });
                                    }
                                }
                            }
                        }
                        return [4 /*yield*/, MemberRepository.getDynamicAttributesLiterals(attributesSettings, options)];
                    case 1:
                        _t = _v.sent(), dynamicAttributesDefaultNestedFields = _t.dynamicAttributesDefaultNestedFields, dynamicAttributesPlatformNestedFields = _t.dynamicAttributesPlatformNestedFields, dynamicAttributesProjection = _t.dynamicAttributesProjection;
                        activityCount = sequelize_1["default"].literal("\"memberActivityAggregatesMVs\".\"activityCount\"");
                        activityTypes = sequelize_1["default"].literal("\"memberActivityAggregatesMVs\".\"activityTypes\"");
                        activeDaysCount = sequelize_1["default"].literal("\"memberActivityAggregatesMVs\".\"activeDaysCount\"");
                        lastActive = sequelize_1["default"].literal("\"memberActivityAggregatesMVs\".\"lastActive\"");
                        activeOn = sequelize_1["default"].literal("\"memberActivityAggregatesMVs\".\"activeOn\"");
                        averageSentiment = sequelize_1["default"].literal("\"memberActivityAggregatesMVs\".\"averageSentiment\"");
                        identities = sequelize_1["default"].literal("\"memberActivityAggregatesMVs\".\"identities\"");
                        username = sequelize_1["default"].literal("\"memberActivityAggregatesMVs\".\"username\"");
                        toMergeArray = sequelize_1["default"].literal("STRING_AGG( distinct \"toMerge\".\"id\"::text, ',')");
                        noMergeArray = sequelize_1["default"].literal("STRING_AGG( distinct \"noMerge\".\"id\"::text, ',')");
                        numberOfOpenSourceContributions = sequelize_1["default"].literal("COALESCE(jsonb_array_length(\"member\".\"contributions\"), 0)");
                        parser = new queryParser_1["default"]({
                            nestedFields: __assign(__assign({}, dynamicAttributesDefaultNestedFields), { reach: 'reach.total', username: 'username.asString' }),
                            aggregators: __assign(__assign(__assign({ activityCount: activityCount, activityTypes: activityTypes, activeDaysCount: activeDaysCount, lastActive: lastActive, averageSentiment: averageSentiment, activeOn: activeOn, identities: identities, username: username, numberOfOpenSourceContributions: numberOfOpenSourceContributions }, dynamicAttributesPlatformNestedFields), { 'reach.total': sequelize_1["default"].literal("(\"member\".reach->'total')::int"), 'username.asString': sequelize_1["default"].literal("CAST(\"memberActivityAggregatesMVs\".\"username\" AS TEXT)") }), sequelizeFilterUtils_1["default"].getNativeTableFieldAggregations([
                                'id',
                                'attributes',
                                'displayName',
                                'emails',
                                'score',
                                'lastEnriched',
                                'enrichedBy',
                                'contributions',
                                'joinedAt',
                                'importHash',
                                'reach',
                                'createdAt',
                                'updatedAt',
                                'createdById',
                                'updatedById',
                            ], 'member')),
                            manyToMany: {
                                tags: {
                                    table: 'members',
                                    model: 'member',
                                    relationTable: {
                                        name: 'memberTags',
                                        from: 'memberId',
                                        to: 'tagId'
                                    }
                                },
                                organizations: {
                                    table: 'members',
                                    model: 'member',
                                    relationTable: {
                                        name: 'memberOrganizations',
                                        from: 'memberId',
                                        to: 'organizationId'
                                    }
                                },
                                segments: {
                                    table: 'members',
                                    model: 'member',
                                    relationTable: {
                                        name: 'memberSegments',
                                        from: 'memberId',
                                        to: 'segmentId'
                                    }
                                }
                            },
                            // TODO: member identitites FIX
                            // customOperators: {
                            //   username: {
                            //     model: 'member',
                            //     column: 'username',
                            //   },
                            //   platform: {
                            //     model: 'member',
                            //     column: 'username',
                            //   },
                            // },
                            exportMode: exportMode
                        }, options);
                        parsed = parser.parse({
                            filter: advancedFilter,
                            orderBy: orderBy || ['joinedAt_DESC'],
                            limit: limit,
                            offset: offset
                        });
                        order = parsed.order;
                        if (customOrderBy.length > 0) {
                            order = [customOrderBy];
                        }
                        return [4 /*yield*/, options.database.member.findAndCountAll({
                                where: parsed.where ? parsed.where : {},
                                having: parsed.having ? parsed.having : {},
                                include: include,
                                attributes: __spreadArray(__spreadArray(__spreadArray([], sequelizeFilterUtils_1["default"].getLiteralProjections([
                                    'id',
                                    'attributes',
                                    'displayName',
                                    'emails',
                                    'tenantId',
                                    'score',
                                    'lastEnriched',
                                    'enrichedBy',
                                    'contributions',
                                    'joinedAt',
                                    'importHash',
                                    'createdAt',
                                    'updatedAt',
                                    'createdById',
                                    'updatedById',
                                    'reach',
                                ], 'member'), true), [
                                    [activeOn, 'activeOn'],
                                    [identities, 'identities'],
                                    [username, 'username'],
                                    [activityCount, 'activityCount'],
                                    [activityTypes, 'activityTypes'],
                                    [activeDaysCount, 'activeDaysCount'],
                                    [lastActive, 'lastActive'],
                                    [averageSentiment, 'averageSentiment'],
                                    [toMergeArray, 'toMergeIds'],
                                    [noMergeArray, 'noMergeIds'],
                                    [numberOfOpenSourceContributions, 'numberOfOpenSourceContributions']
                                ], false), dynamicAttributesProjection, true),
                                limit: parsed.limit || 50,
                                offset: offset ? Number(offset) : 0,
                                order: order,
                                subQuery: false,
                                group: [
                                    'member.id',
                                    'memberActivityAggregatesMVs.activeOn',
                                    'memberActivityAggregatesMVs.activityCount',
                                    'memberActivityAggregatesMVs.activityTypes',
                                    'memberActivityAggregatesMVs.activeDaysCount',
                                    'memberActivityAggregatesMVs.lastActive',
                                    'memberActivityAggregatesMVs.averageSentiment',
                                    'memberActivityAggregatesMVs.username',
                                    'memberActivityAggregatesMVs.identities',
                                    'toMerge.id',
                                ],
                                distinct: true
                            })];
                    case 2:
                        _u = _v.sent(), rows = _u.rows, count = _u.count;
                        return [4 /*yield*/, this._populateRelationsForRows(rows, attributesSettings, exportMode)];
                    case 3:
                        rows = _v.sent();
                        return [2 /*return*/, {
                                rows: rows,
                                count: count.length,
                                limit: limit ? Number(limit) : 50,
                                offset: offset ? Number(offset) : 0
                            }];
                }
            });
        });
    };
    /**
     * Returns sequelize literals for dynamic member attributes.
     * @param memberAttributeSettings
     * @param options
     * @returns
     */
    MemberRepository.getDynamicAttributesLiterals = function (memberAttributeSettings, options) {
        return __awaiter(this, void 0, void 0, function () {
            var availableDynamicAttributePlatformKeys, _a, dynamicAttributesDefaultNestedFields, dynamicAttributesPlatformNestedFields, dynamicAttributesProjection;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = [[
                                'default',
                                'custom'
                            ]];
                        return [4 /*yield*/, tenantRepository_1["default"].getAvailablePlatforms(options.currentTenant.id, options)];
                    case 1:
                        availableDynamicAttributePlatformKeys = __spreadArray.apply(void 0, _a.concat([(_b.sent()).map(function (p) { return p.platform; }), true]));
                        dynamicAttributesDefaultNestedFields = memberAttributeSettings.reduce(function (acc, attribute) {
                            acc[attribute.name] = "attributes.".concat(attribute.name, ".default");
                            return acc;
                        }, {});
                        dynamicAttributesPlatformNestedFields = memberAttributeSettings.reduce(function (acc, attribute) {
                            for (var _i = 0, availableDynamicAttributePlatformKeys_1 = availableDynamicAttributePlatformKeys; _i < availableDynamicAttributePlatformKeys_1.length; _i++) {
                                var key = availableDynamicAttributePlatformKeys_1[_i];
                                if (attribute.type === types_1.MemberAttributeType.NUMBER) {
                                    acc["attributes.".concat(attribute.name, ".").concat(key)] = sequelize_1["default"].literal("(\"member\".\"attributes\"#>>'{".concat(attribute.name, ",").concat(key, "}')::integer"));
                                }
                                else if (attribute.type === types_1.MemberAttributeType.BOOLEAN) {
                                    acc["attributes.".concat(attribute.name, ".").concat(key)] = sequelize_1["default"].literal("(\"member\".\"attributes\"#>>'{".concat(attribute.name, ",").concat(key, "}')::boolean"));
                                }
                                else if (attribute.type === types_1.MemberAttributeType.MULTI_SELECT) {
                                    acc["attributes.".concat(attribute.name, ".").concat(key)] = sequelize_1["default"].literal("ARRAY( SELECT jsonb_array_elements_text(\"member\".\"attributes\"#>'{".concat(attribute.name, ",").concat(key, "}'))"));
                                }
                                else {
                                    acc["attributes.".concat(attribute.name, ".").concat(key)] = sequelize_1["default"].literal("\"member\".\"attributes\"#>>'{".concat(attribute.name, ",").concat(key, "}'"));
                                }
                            }
                            return acc;
                        }, {});
                        dynamicAttributesProjection = memberAttributeSettings.reduce(function (acc, attribute) {
                            for (var _i = 0, availableDynamicAttributePlatformKeys_2 = availableDynamicAttributePlatformKeys; _i < availableDynamicAttributePlatformKeys_2.length; _i++) {
                                var key = availableDynamicAttributePlatformKeys_2[_i];
                                if (key === 'default') {
                                    acc.push([
                                        sequelize_1["default"].literal("\"member\".\"attributes\"#>>'{".concat(attribute.name, ",default}'")),
                                        attribute.name,
                                    ]);
                                }
                                else {
                                    acc.push([
                                        sequelize_1["default"].literal("\"member\".\"attributes\"#>>'{".concat(attribute.name, ",").concat(key, "}'")),
                                        "".concat(attribute.name, ".").concat(key),
                                    ]);
                                }
                            }
                            return acc;
                        }, []);
                        return [2 /*return*/, {
                                dynamicAttributesDefaultNestedFields: dynamicAttributesDefaultNestedFields,
                                dynamicAttributesPlatformNestedFields: dynamicAttributesPlatformNestedFields,
                                availableDynamicAttributePlatformKeys: availableDynamicAttributePlatformKeys,
                                dynamicAttributesProjection: dynamicAttributesProjection
                            }];
                }
            });
        });
    };
    MemberRepository.findAllAutocomplete = function (query, limit, options) {
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
                                    {
                                        displayName: (_b = {},
                                            _b[Op.iLike] = "".concat(query, "%"),
                                            _b)
                                    },
                                ],
                                _a));
                        }
                        where = (_c = {}, _c[Op.and] = whereAnd, _c);
                        return [4 /*yield*/, options.database.member.findAll({
                                attributes: ['id', 'displayName', 'attributes', 'emails'],
                                where: where,
                                limit: limit ? Number(limit) : undefined,
                                order: [['displayName', 'ASC']],
                                include: [
                                    {
                                        model: options.database.organization,
                                        attributes: ['id', 'displayName'],
                                        as: 'organizations'
                                    },
                                    {
                                        model: options.database.segment,
                                        as: 'segments',
                                        where: {
                                            id: sequelizeRepository_1["default"].getSegmentIds(options)
                                        }
                                    },
                                ]
                            })];
                    case 1:
                        records = _d.sent();
                        return [2 /*return*/, records.map(function (record) {
                                var _a, _b;
                                return ({
                                    id: record.id,
                                    label: record.displayName,
                                    email: record.emails.length > 0 ? record.emails[0] : null,
                                    avatar: ((_b = (_a = record.attributes) === null || _a === void 0 ? void 0 : _a.avatarUrl) === null || _b === void 0 ? void 0 : _b["default"]) || null,
                                    organizations: record.organizations.map(function (org) { return ({
                                        id: org.id,
                                        name: org.name
                                    }); })
                                });
                            })];
                }
            });
        });
    };
    MemberRepository.mergeSuggestionsByUsername = function (numberOfHours, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, tenant, segmentIds, query, suggestions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        segmentIds = sequelizeRepository_1["default"].getSegmentIds(options);
                        query = "\n    -- Define a CTE named \"new_members\" to get members created in the last 2 hours with a specific tenantId\n    WITH new_members AS (\n      SELECT m.id, m.\"tenantId\"\n      FROM members m\n      JOIN \"memberSegments\" ms ON ms.\"memberId\" = m.id\n      WHERE m.\"createdAt\" >= now() - INTERVAL :numberOfHours\n      AND m.\"tenantId\" = :tenantId\n      AND ms.\"segmentId\" IN (:segmentIds)\n    ),\n    -- Define a CTE named \"identity_join\" to find members with the same usernames across different platforms\n    identity_join AS (\n      SELECT\n        m1.id AS m1_id,\n        m2.id AS m2_id,\n        i1.platform AS i1_platform,\n        i2.platform AS i2_platform,\n        i1.username AS i1_username,\n        i2.username AS i2_username\n      FROM new_members m1\n      -- Join memberIdentities and members to get related records\n      JOIN \"memberIdentities\" i1 ON m1.id = i1.\"memberId\"\n      JOIN \"memberIdentities\" i2 ON i1.username = i2.username AND i1.platform <> i2.platform\n      JOIN members m2 ON m2.id = i2.\"memberId\"\n      -- Filter out records where tenantId is different and memberIds are the same\n      WHERE m1.\"tenantId\" = m2.\"tenantId\"\n      AND m1.id <> m2.id\n      -- Filter out records present in memberToMerge table\n      AND NOT EXISTS (\n        SELECT 1\n        FROM \"memberToMerge\"\n        WHERE (\n          \"memberId\" = m1.id\n          AND \"toMergeId\" = m2.id\n        ) OR (\n          \"memberId\" = m2.id\n          AND \"toMergeId\" = m1.id\n        )\n      )\n      -- Filter out records present in memberNoMerge table\n      AND NOT EXISTS (\n        SELECT 1\n        FROM \"memberNoMerge\"\n        WHERE (\n          \"memberId\" = m1.id\n          AND \"noMergeId\" = m2.id\n        ) OR (\n          \"memberId\" = m2.id\n          AND \"noMergeId\" = m1.id\n        )\n      )\n    )\n    -- Select everything from the final CTE \"identity_join\"\n    SELECT *\n    FROM identity_join;";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    tenantId: tenant.id,
                                    segmentIds: segmentIds,
                                    numberOfHours: "".concat(numberOfHours, " hours")
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        suggestions = _a.sent();
                        return [2 /*return*/, suggestions.map(function (suggestion) { return ({
                                members: [suggestion.m1_id, suggestion.m2_id],
                                // 100% confidence only from emails
                                similarity: 0.95
                            }); })];
                }
            });
        });
    };
    MemberRepository.mergeSuggestionsByEmail = function (numberOfHours, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, tenant, segmentIds, query, suggestions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        segmentIds = sequelizeRepository_1["default"].getSegmentIds(options);
                        query = "\n    -- Define a CTE named \"new_members\" to get members created in the last 7 days with a specific tenantId and their emails\n    WITH new_members AS (\n      SELECT m.id, m.\"tenantId\", m.emails\n      FROM members m\n      JOIN \"memberSegments\" ms ON ms.\"memberId\" = m.id\n      WHERE m.\"createdAt\" >= now() - INTERVAL :numberOfHours\n      AND m.\"tenantId\" = :tenantId\n      AND ms.\"segmentId\" IN (:segmentIds)\n    ),\n    -- Define a CTE named \"email_join\" to find overlapping emails across different members\n    email_join AS (\n      SELECT\n        m1.id AS m1_id,            -- Member 1 ID\n        m2.id AS m2_id,            -- Member 2 ID\n        m1.emails AS m1_emails,    -- Member 1 emails\n        m2.emails AS m2_emails     -- Member 2 emails\n      FROM new_members m1\n      -- Join the members table on the tenantId field and ensuring the IDs are different\n      JOIN members m2 ON m1.\"tenantId\" = m2.\"tenantId\"\n        AND m1.id <> m2.id\n      -- Filter for overlapping emails\n      WHERE m1.emails && m2.emails\n      -- Exclude pairs that are already in the memberToMerge table\n      AND NOT EXISTS (\n        SELECT 1\n        FROM \"memberToMerge\"\n        WHERE (\n          \"memberId\" = m1.id\n          AND \"toMergeId\" = m2.id\n        ) OR (\n          \"memberId\" = m2.id\n          AND \"toMergeId\" = m1.id\n        )\n      )\n      -- Exclude pairs that are in the memberNoMerge table\n      AND NOT EXISTS (\n        SELECT 1\n        FROM \"memberNoMerge\"\n        WHERE (\n          \"memberId\" = m1.id\n          AND \"noMergeId\" = m2.id\n        ) OR (\n          \"memberId\" = m2.id\n          AND \"noMergeId\" = m1.id\n        )\n      )\n    )\n    -- Select all columns from the email_join CTE\n    SELECT *\n    FROM email_join;";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    tenantId: tenant.id,
                                    segmentIds: segmentIds,
                                    numberOfHours: "".concat(numberOfHours, " hours")
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        suggestions = _a.sent();
                        return [2 /*return*/, suggestions.map(function (suggestion) { return ({
                                members: [suggestion.m1_id, suggestion.m2_id],
                                similarity: 1
                            }); })];
                }
            });
        });
    };
    MemberRepository.mergeSuggestionsBySimilarity = function (numberOfHours, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, tenant, segmentIds, query, suggestions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        segmentIds = sequelizeRepository_1["default"].getSegmentIds(options);
                        query = "\n    -- Define a CTE named \"new_members\" to get members created in the last 7 days with a specific tenantId\n    WITH new_members AS (\n      SELECT m.*\n      FROM members m\n      JOIN \"memberSegments\" ms ON ms.\"memberId\" = m.id\n      WHERE m.\"createdAt\" >= now() - INTERVAL :numberOfHours\n      AND m.\"tenantId\" = :tenantId\n      AND ms.\"segmentId\" IN (:segmentIds)\n      LIMIT 1000\n    ),\n    -- Define a CTE named \"identity_join\" to find similar identities across platforms\n    identity_join AS (\n      -- Select distinct pairs of memberIds and relevant information, along with the similarity score\n      SELECT DISTINCT ON(m1_id, m2_id)\n        m1.id AS m1_id,\n        m2.id AS m2_id,\n        similarity(i1.username, i2.username) AS similarity\n      FROM new_members m1\n      -- Join memberIdentities and members to get related records\n      JOIN \"memberIdentities\" i1 ON m1.id = i1.\"memberId\"\n      JOIN \"memberIdentities\" i2 ON i1.platform <> i2.platform\n      JOIN members m2 ON m2.id = i2.\"memberId\"\n      -- Filter out records where tenantId is different and memberIds are the same\n      WHERE m1.\"tenantId\" = m2.\"tenantId\"\n      AND m1.id <> m2.id\n      -- Consider only records with similarity > 0.5 (adjust this threshold as needed)\n      AND similarity(i1.username, i2.username) > 0.5\n      -- Order by similarity descending to get the most similar records first\n      ORDER BY m1_id, m2_id, similarity DESC\n    ),\n    -- Define a CTE named \"exclude_already_processed\" to remove the already processed members\n    exclude_already_processed AS (\n      SELECT *\n      FROM identity_join\n      -- Filter out records present in memberToMerge table\n      WHERE NOT EXISTS (\n        SELECT 1\n        FROM \"memberToMerge\"\n        WHERE (\n          \"memberId\" = identity_join.m1_id\n          AND \"toMergeId\" = identity_join.m2_id\n        ) OR (\n          \"memberId\" = identity_join.m2_id\n          AND \"toMergeId\" = identity_join.m1_id\n        )\n        -- Filter out records present in memberNoMerge table\n      ) AND NOT EXISTS (\n        SELECT 1\n        FROM \"memberNoMerge\"\n        WHERE (\n          \"memberId\" = identity_join.m1_id\n          AND \"noMergeId\" = identity_join.m2_id\n        ) OR (\n          \"memberId\" = identity_join.m2_id\n          AND \"noMergeId\" = identity_join.m1_id\n        )\n      )\n    )\n    -- Select everything from the final CTE \"exclude_already_processed\"\n    SELECT *\n    FROM exclude_already_processed;";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    tenantId: tenant.id,
                                    segmentIds: segmentIds,
                                    numberOfHours: "".concat(numberOfHours, " hours")
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        suggestions = _a.sent();
                        return [2 /*return*/, suggestions.map(function (suggestion) { return ({
                                members: [suggestion.m1_id, suggestion.m2_id],
                                // 100% confidence only from emails
                                similarity: suggestion.similarity > 0.95 ? 0.95 : suggestion.similarity
                            }); })];
                }
            });
        });
    };
    MemberRepository.addToWeakIdentities = function (memberIds, username, platform, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, tenant, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        query = "\n    update members\n    set \"weakIdentities\" = \"weakIdentities\" || jsonb_build_object('username', :username, 'platform', :platform)::jsonb\n    where id in (:memberIds)\n      and not exists (select 1\n                      from jsonb_array_elements(\"weakIdentities\") as wi\n                      where wi ->> 'username' = :username\n                        and wi ->> 'platform' = :platform);\n    ";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    memberIds: memberIds,
                                    username: username,
                                    platform: platform,
                                    tenantId: tenant.id
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
    MemberRepository._createAuditLog = function (action, record, data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!log) return [3 /*break*/, 2];
                        values = {};
                        if (data) {
                            values = __assign(__assign({}, record.get({ plain: true })), { activitiesIds: data.activities, tagsIds: data.tags, noMergeIds: data.noMerge });
                        }
                        return [4 /*yield*/, auditLogRepository_1["default"].log({
                                entityName: 'member',
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
    MemberRepository._populateRelationsForRows = function (rows, attributesSettings, exportMode) {
        if (exportMode === void 0) { exportMode = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!rows) {
                    return [2 /*return*/, rows];
                }
                // No need for lazyloading tags for integrations or microservices
                if ((conf_1.KUBE_MODE &&
                    (conf_1.SERVICE === configTypes_1.ServiceType.NODEJS_WORKER || conf_1.SERVICE === configTypes_1.ServiceType.JOB_GENERATOR) &&
                    !exportMode) ||
                    process.env.SERVICE === 'integrations' ||
                    process.env.SERVICE === 'microservices-nodejs') {
                    return [2 /*return*/, rows.map(function (record) {
                            var plainRecord = record.get({ plain: true });
                            plainRecord.noMerge = plainRecord.noMergeIds ? plainRecord.noMergeIds.split(',') : [];
                            plainRecord.toMerge = plainRecord.toMergeIds ? plainRecord.toMergeIds.split(',') : [];
                            delete plainRecord.toMergeIds;
                            delete plainRecord.noMergeIds;
                            return plainRecord;
                        })];
                }
                return [2 /*return*/, Promise.all(rows.map(function (record) { return __awaiter(_this, void 0, void 0, function () {
                        var plainRecord, _a, _b, _i, attributesSettings_1, attribute, attributeName, _c, _d, _e;
                        var _f;
                        return __generator(this, function (_g) {
                            switch (_g.label) {
                                case 0:
                                    plainRecord = record.get({ plain: true });
                                    plainRecord.noMerge = plainRecord.noMergeIds ? plainRecord.noMergeIds.split(',') : [];
                                    plainRecord.toMerge = plainRecord.toMergeIds ? plainRecord.toMergeIds.split(',') : [];
                                    _a = plainRecord;
                                    if (!plainRecord.lastActive) return [3 /*break*/, 2];
                                    return [4 /*yield*/, record.getActivities({
                                            order: [['timestamp', 'DESC']],
                                            limit: 1
                                        })];
                                case 1:
                                    _b = (_g.sent())[0].get({ plain: true });
                                    return [3 /*break*/, 3];
                                case 2:
                                    _b = null;
                                    _g.label = 3;
                                case 3:
                                    _a.lastActivity = _b;
                                    delete plainRecord.toMergeIds;
                                    delete plainRecord.noMergeIds;
                                    plainRecord.activeOn = (_f = plainRecord.activeOn) !== null && _f !== void 0 ? _f : [];
                                    for (_i = 0, attributesSettings_1 = attributesSettings; _i < attributesSettings_1.length; _i++) {
                                        attribute = attributesSettings_1[_i];
                                        if (Object.prototype.hasOwnProperty.call(plainRecord, attribute.name)) {
                                            delete plainRecord[attribute.name];
                                        }
                                    }
                                    for (attributeName in plainRecord.attributes) {
                                        if (!lodash_1["default"].find(attributesSettings, { name: attributeName })) {
                                            delete plainRecord.attributes[attributeName];
                                        }
                                    }
                                    delete plainRecord.contributions;
                                    delete plainRecord.company;
                                    _c = plainRecord;
                                    return [4 /*yield*/, record.getOrganizations({
                                            joinTableAttributes: []
                                        })];
                                case 4:
                                    _c.organizations = _g.sent();
                                    _d = plainRecord;
                                    return [4 /*yield*/, record.getTags({
                                            joinTableAttributes: []
                                        })];
                                case 5:
                                    _d.tags = _g.sent();
                                    if (!exportMode) return [3 /*break*/, 7];
                                    _e = plainRecord;
                                    return [4 /*yield*/, record.getNotes({
                                            joinTableAttributes: []
                                        })];
                                case 6:
                                    _e.notes = _g.sent();
                                    _g.label = 7;
                                case 7: return [2 /*return*/, plainRecord];
                            }
                        });
                    }); }))];
            });
        });
    };
    /**
     * Fill a record with the relations and files (if any)
     * @param record Record to get relations and files for
     * @param options IRepository options
     * @param returnPlain If true: return object, otherwise  return model
     * @returns The model/object with filled relations and files
     */
    MemberRepository._populateRelations = function (record, options, returnPlain) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (returnPlain === void 0) { returnPlain = true; }
        return __awaiter(this, void 0, void 0, function () {
            var output, transaction, activityAggregates, _h, _j, _k, _l, _m, _o, _p, memberIdentities, _i, memberIdentities_1, identity, _q, manualSyncRemote, _r, manualSyncRemote_1, syncRemote;
            var _s;
            return __generator(this, function (_t) {
                switch (_t.label) {
                    case 0:
                        if (!record) {
                            return [2 /*return*/, record];
                        }
                        if (returnPlain) {
                            output = record.get({ plain: true });
                        }
                        else {
                            output = record;
                        }
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, MemberRepository.getActivityAggregates(output.id, options)];
                    case 1:
                        activityAggregates = _t.sent();
                        output.activeOn = (activityAggregates === null || activityAggregates === void 0 ? void 0 : activityAggregates.activeOn) || [];
                        output.activityCount = (activityAggregates === null || activityAggregates === void 0 ? void 0 : activityAggregates.activityCount) || 0;
                        output.activityTypes = (activityAggregates === null || activityAggregates === void 0 ? void 0 : activityAggregates.activityTypes) || [];
                        output.activeDaysCount = (activityAggregates === null || activityAggregates === void 0 ? void 0 : activityAggregates.activeDaysCount) || 0;
                        output.averageSentiment = (activityAggregates === null || activityAggregates === void 0 ? void 0 : activityAggregates.averageSentiment) || 0;
                        _h = output;
                        return [4 /*yield*/, record.getActivities({
                                order: [['timestamp', 'DESC']],
                                limit: 1,
                                transaction: transaction
                            })];
                    case 2:
                        _h.lastActivity =
                            (_b = (_a = (_t.sent())[0]) === null || _a === void 0 ? void 0 : _a.get({ plain: true })) !== null && _b !== void 0 ? _b : null;
                        output.lastActive = (_d = (_c = output.lastActivity) === null || _c === void 0 ? void 0 : _c.timestamp) !== null && _d !== void 0 ? _d : null;
                        output.numberOfOpenSourceContributions = (_f = (_e = output.contributions) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0;
                        _j = output;
                        return [4 /*yield*/, record.getTags({
                                transaction: transaction,
                                order: [['createdAt', 'ASC']],
                                joinTableAttributes: []
                            })];
                    case 3:
                        _j.tags = _t.sent();
                        _k = output;
                        return [4 /*yield*/, record.getOrganizations({
                                transaction: transaction,
                                order: [['createdAt', 'ASC']],
                                joinTableAttributes: ['dateStart', 'dateEnd', 'title', 'source'],
                                through: {
                                    where: {
                                        deletedAt: null
                                    }
                                }
                            })];
                    case 4:
                        _k.organizations = _t.sent();
                        MemberRepository.sortOrganizations(output.organizations);
                        _l = output;
                        return [4 /*yield*/, record.getTasks({
                                transaction: transaction,
                                order: [['createdAt', 'ASC']],
                                joinTableAttributes: []
                            })];
                    case 5:
                        _l.tasks = _t.sent();
                        _m = output;
                        return [4 /*yield*/, record.getNotes({
                                transaction: transaction,
                                joinTableAttributes: []
                            })];
                    case 6:
                        _m.notes = _t.sent();
                        _o = output;
                        return [4 /*yield*/, record.getNoMerge({
                                transaction: transaction
                            })];
                    case 7:
                        _o.noMerge = (_t.sent()).map(function (i) { return i.id; });
                        _p = output;
                        return [4 /*yield*/, record.getToMerge({
                                transaction: transaction
                            })];
                    case 8:
                        _p.toMerge = (_t.sent()).map(function (i) { return i.id; });
                        return [4 /*yield*/, this.getIdentities([record.id], options)];
                    case 9:
                        memberIdentities = (_t.sent()).get(record.id);
                        output.username = {};
                        for (_i = 0, memberIdentities_1 = memberIdentities; _i < memberIdentities_1.length; _i++) {
                            identity = memberIdentities_1[_i];
                            if (output.username[identity.platform]) {
                                output.username[identity.platform].push(identity.username);
                            }
                            else {
                                output.username[identity.platform] = [identity.username];
                            }
                        }
                        output.identities = Object.keys(output.username);
                        _q = output;
                        return [4 /*yield*/, this.getAffiliations(record.id, options)];
                    case 10:
                        _q.affiliations = _t.sent();
                        return [4 /*yield*/, new memberSyncRemoteRepository_1["default"](options).findMemberManualSync(record.id)];
                    case 11:
                        manualSyncRemote = _t.sent();
                        for (_r = 0, manualSyncRemote_1 = manualSyncRemote; _r < manualSyncRemote_1.length; _r++) {
                            syncRemote = manualSyncRemote_1[_r];
                            if ((_g = output.attributes) === null || _g === void 0 ? void 0 : _g.syncRemote) {
                                output.attributes.syncRemote[syncRemote.platform] = syncRemote.status === types_1.SyncStatus.ACTIVE;
                            }
                            else {
                                output.attributes.syncRemote = (_s = {},
                                    _s[syncRemote.platform] = syncRemote.status === types_1.SyncStatus.ACTIVE,
                                    _s);
                            }
                        }
                        return [2 /*return*/, output];
                }
            });
        });
    };
    MemberRepository.updateMemberOrganizations = function (record, organizations, replace, options) {
        return __awaiter(this, void 0, void 0, function () {
            function iso(v) {
                return (0, moment_1["default"])(v).toISOString();
            }
            var originalOrgs, toDelete, _i, toDelete_1, item, _a, organizations_1, item, org;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!organizations) {
                            return [2 /*return*/];
                        }
                        if (!replace) return [3 /*break*/, 5];
                        return [4 /*yield*/, MemberRepository.fetchWorkExperiences(record.id, options)];
                    case 1:
                        originalOrgs = _b.sent();
                        toDelete = originalOrgs.filter(function (originalOrg) {
                            return !organizations.find(function (newOrg) {
                                return originalOrg.organizationId === newOrg.id &&
                                    originalOrg.title === (newOrg.title || null) &&
                                    iso(originalOrg.dateStart) === iso(newOrg.startDate || null) &&
                                    iso(originalOrg.dateEnd) === iso(newOrg.endDate || null);
                            });
                        });
                        _i = 0, toDelete_1 = toDelete;
                        _b.label = 2;
                    case 2:
                        if (!(_i < toDelete_1.length)) return [3 /*break*/, 5];
                        item = toDelete_1[_i];
                        return [4 /*yield*/, MemberRepository.deleteWorkExperience(item.id, options)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        _a = 0, organizations_1 = organizations;
                        _b.label = 6;
                    case 6:
                        if (!(_a < organizations_1.length)) return [3 /*break*/, 10];
                        item = organizations_1[_a];
                        org = typeof item === 'string' ? { id: item } : item;
                        return [4 /*yield*/, MemberRepository.createOrUpdateWorkExperience({
                                memberId: record.id,
                                organizationId: org.id,
                                title: org.title,
                                dateStart: org.startDate,
                                dateEnd: org.endDate,
                                source: org.source
                            }, options)];
                    case 7:
                        _b.sent();
                        return [4 /*yield*/, organizationRepository_1["default"].includeOrganizationToSegments(org.id, options)];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        _a++;
                        return [3 /*break*/, 6];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    MemberRepository.createOrUpdateWorkExperience = function (_a, options) {
        var memberId = _a.memberId, organizationId = _a.organizationId, source = _a.source, _b = _a.title, title = _b === void 0 ? null : _b, _c = _a.dateStart, dateStart = _c === void 0 ? null : _c, _d = _a.dateEnd, dateEnd = _d === void 0 ? null : _d, _e = _a.updateAffiliation, updateAffiliation = _e === void 0 ? true : _e;
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction, rows, row, conflictCondition, onConflict;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        if (!dateStart) return [3 /*break*/, 2];
                        // clean up organizations without dates if we're getting ones with dates
                        return [4 /*yield*/, seq.query("\n          UPDATE \"memberOrganizations\"\n          SET \"deletedAt\" = NOW()\n          WHERE \"memberId\" = :memberId\n          AND \"organizationId\" = :organizationId\n          AND \"dateStart\" IS NULL\n          AND \"dateEnd\" IS NULL\n        ", {
                                replacements: {
                                    memberId: memberId,
                                    organizationId: organizationId
                                },
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 1:
                        // clean up organizations without dates if we're getting ones with dates
                        _f.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, seq.query("\n          SELECT COUNT(*) AS count FROM \"memberOrganizations\"\n          WHERE \"memberId\" = :memberId\n          AND \"organizationId\" = :organizationId\n          AND \"dateStart\" IS NOT NULL\n          AND \"deletedAt\" IS NULL\n        ", {
                            replacements: {
                                memberId: memberId,
                                organizationId: organizationId
                            },
                            type: sequelize_1.QueryTypes.SELECT,
                            transaction: transaction
                        })];
                    case 3:
                        rows = _f.sent();
                        row = rows[0];
                        if (row.count > 0) {
                            // if we're getting organization without dates, but there's already one with dates, don't insert
                            return [2 /*return*/];
                        }
                        _f.label = 4;
                    case 4:
                        conflictCondition = "(\"memberId\", \"organizationId\", \"dateStart\", \"dateEnd\")";
                        if (!dateEnd) {
                            conflictCondition = "(\"memberId\", \"organizationId\", \"dateStart\") WHERE \"dateEnd\" IS NULL";
                        }
                        if (!dateStart) {
                            conflictCondition = "(\"memberId\", \"organizationId\") WHERE \"dateStart\" IS NULL AND \"dateEnd\" IS NULL";
                        }
                        onConflict = source === types_1.OrganizationSource.UI
                            ? "ON CONFLICT ".concat(conflictCondition, " DO UPDATE SET \"title\" = :title, \"dateStart\" = :dateStart, \"dateEnd\" = :dateEnd, \"deletedAt\" = NULL, \"source\" = :source")
                            : 'ON CONFLICT DO NOTHING';
                        return [4 /*yield*/, seq.query("\n        INSERT INTO \"memberOrganizations\" (\"memberId\", \"organizationId\", \"createdAt\", \"updatedAt\", \"title\", \"dateStart\", \"dateEnd\", \"source\")\n        VALUES (:memberId, :organizationId, NOW(), NOW(), :title, :dateStart, :dateEnd, :source)\n        ".concat(onConflict, "\n      "), {
                                replacements: {
                                    memberId: memberId,
                                    organizationId: organizationId,
                                    title: title || null,
                                    dateStart: dateStart || null,
                                    dateEnd: dateEnd || null,
                                    source: source || null
                                },
                                type: sequelize_1.QueryTypes.INSERT,
                                transaction: transaction
                            })];
                    case 5:
                        _f.sent();
                        if (!updateAffiliation) return [3 /*break*/, 7];
                        return [4 /*yield*/, memberAffiliationRepository_1["default"].update(memberId, options)];
                    case 6:
                        _f.sent();
                        _f.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    MemberRepository.deleteWorkExperience = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, seq.query("\n        UPDATE \"memberOrganizations\"\n        SET \"deletedAt\" = NOW()\n        WHERE \"id\" = :id\n      ", {
                                replacements: {
                                    id: id
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
    MemberRepository.fetchWorkExperiences = function (memberId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction, query, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        query = "\n      SELECT * FROM \"memberOrganizations\"\n      WHERE \"memberId\" = :memberId\n        AND \"deletedAt\" IS NULL\n    ";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    memberId: memberId
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
    MemberRepository.findWorkExperience = function (memberId, timestamp, options) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction, query, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        query = "\n      SELECT * FROM \"memberOrganizations\"\n      WHERE \"memberId\" = :memberId\n        AND (\n          (\"dateStart\" <= :timestamp AND \"dateEnd\" >= :timestamp)\n          OR (\"dateStart\" <= :timestamp AND \"dateEnd\" IS NULL)\n        )\n        AND \"deletedAt\" IS NULL\n      ORDER BY \"dateStart\" DESC, id\n      LIMIT 1\n    ";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    memberId: memberId,
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
    MemberRepository.findMostRecentOrganization = function (memberId, timestamp, options) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction, query, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        query = "\n      SELECT * FROM \"memberOrganizations\"\n      WHERE \"memberId\" = :memberId\n        AND \"dateStart\" IS NULL\n        AND \"dateEnd\" IS NULL\n        AND \"createdAt\" <= :timestamp\n        AND \"deletedAt\" IS NULL\n      ORDER BY \"createdAt\" DESC, id\n      LIMIT 1\n    ";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    memberId: memberId,
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
    MemberRepository.findMostRecentOrganizationEver = function (memberId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction, query, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        query = "\n      SELECT * FROM \"memberOrganizations\"\n      WHERE \"memberId\" = :memberId\n        AND \"dateStart\" IS NULL\n        AND \"dateEnd\" IS NULL\n        AND \"deletedAt\" IS NULL\n      ORDER BY \"createdAt\", id\n      LIMIT 1\n    ";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    memberId: memberId
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
    MemberRepository.sortOrganizations = function (organizations) {
        organizations.sort(function (a, b) {
            var _a, _b, _c, _d;
            a = a.dataValues ? a.get({ plain: true }) : a;
            b = b.dataValues ? b.get({ plain: true }) : b;
            var aStart = (_a = a.memberOrganizations) === null || _a === void 0 ? void 0 : _a.dateStart;
            var bStart = (_b = b.memberOrganizations) === null || _b === void 0 ? void 0 : _b.dateStart;
            var aEnd = (_c = a.memberOrganizations) === null || _c === void 0 ? void 0 : _c.dateEnd;
            var bEnd = (_d = b.memberOrganizations) === null || _d === void 0 ? void 0 : _d.dateEnd;
            // Sorting:
            // 1. Those without dateEnd, but with dateStart should be at the top, orderd by dateStart
            // 2. Those with dateEnd and dateStart should be in the middle, ordered by dateEnd
            // 3. Those without dateEnd and dateStart should be at the bottom, ordered by name
            if (!aEnd && aStart) {
                if (!bEnd && bStart) {
                    return aStart > bStart ? -1 : 1;
                }
                if (bEnd && bStart) {
                    return -1;
                }
                return -1;
            }
            if (aEnd && aStart) {
                if (!bEnd && bStart) {
                    return 1;
                }
                if (bEnd && bStart) {
                    return aEnd > bEnd ? -1 : 1;
                }
                return -1;
            }
            if (!bEnd && bStart) {
                return 1;
            }
            if (bEnd && bStart) {
                return 1;
            }
            return a.name > b.name ? 1 : -1;
        });
    };
    MemberRepository.getMemberIdsandCount = function (_a, options) {
        var _b = _a.limit, limit = _b === void 0 ? 20 : _b, _c = _a.offset, offset = _c === void 0 ? 0 : _c, _d = _a.orderBy, orderBy = _d === void 0 ? 'joinedAt_DESC' : _d, _e = _a.countOnly, countOnly = _e === void 0 ? false : _e;
        return __awaiter(this, void 0, void 0, function () {
            var tenant, segmentIds, seq, params, orderByString, orderByParts, direction, countQuery, memberCount, members;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        segmentIds = sequelizeRepository_1["default"].getSegmentIds(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        params = {
                            tenantId: tenant.id,
                            segmentIds: segmentIds,
                            limit: limit,
                            offset: offset
                        };
                        orderByString = '';
                        orderByParts = orderBy.split('_');
                        direction = orderByParts[1].toLowerCase();
                        switch (orderByParts[0]) {
                            case 'joinedAt':
                                orderByString = 'm."joinedAt"';
                                break;
                            case 'displayName':
                                orderByString = 'm."displayName"';
                                break;
                            case 'reach':
                                orderByString = "(m.reach ->> 'total')::int";
                                break;
                            case 'score':
                                orderByString = 'm.score';
                                break;
                            default:
                                throw new Error("Invalid order by: ".concat(orderBy, "!"));
                        }
                        orderByString = "".concat(orderByString, " ").concat(direction);
                        countQuery = "\n    SELECT count(*) FROM (\n      SELECT m.id\n      FROM members m\n      JOIN \"memberSegments\" ms ON ms.\"memberId\" = m.id\n      WHERE m.\"tenantId\" = :tenantId\n      AND ms.\"segmentId\" IN (:segmentIds)\n    ) as count\n    ";
                        return [4 /*yield*/, seq.query(countQuery, {
                                replacements: params,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        memberCount = _f.sent();
                        if (countOnly) {
                            return [2 /*return*/, {
                                    count: memberCount[0].count,
                                    ids: []
                                }];
                        }
                        return [4 /*yield*/, seq.query("SELECT m.id FROM members m\n      JOIN \"memberSegments\" ms ON ms.\"memberId\" = m.id\n      WHERE m.\"tenantId\" = :tenantId and ms.\"segmentId\" in (:segmentIds) \n      ORDER BY ".concat(orderByString, " \n      LIMIT :limit OFFSET :offset"), {
                                replacements: params,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        members = _f.sent();
                        return [2 /*return*/, {
                                count: memberCount[0].count,
                                ids: members.map(function (i) { return i.id; })
                            }];
                }
            });
        });
    };
    MemberRepository.MEMBER_QUERY_FILTER_COLUMN_MAP = new Map([
        ['isOrganization', "coalesce((m.attributes -> 'isOrganization' -> 'default')::boolean, false)"],
        ['isTeamMember', "coalesce((m.attributes -> 'isTeamMember' -> 'default')::boolean, false)"],
        ['isBot', "coalesce((m.attributes -> 'isBot' -> 'default')::boolean, false)"],
        ['activeOn', 'aggs."activeOn"'],
        ['activityCount', 'aggs."activityCount"'],
        ['activityTypes', 'aggs."activityTypes"'],
        ['activeDaysCount', 'aggs."activeDaysCount"'],
        ['lastActive', 'aggs."lastActive"'],
        ['averageSentiment', 'aggs."averageSentiment"'],
        ['identities', 'aggs.identities'],
        ['reach', "(m.reach -> 'total')::integer"],
        ['numberOfOpenSourceContributions', 'coalesce(jsonb_array_length(m.contributions), 0)'],
        ['id', 'm.id'],
        ['displayName', 'm."displayName"'],
        ['tenantId', 'm."tenantId"'],
        ['score', 'm.score'],
        ['lastEnriched', 'm."lastEnriched"'],
        ['joinedAt', 'm."joinedAt"'],
        ['importHash', 'm."importHash"'],
        ['createdAt', 'm."createdAt"'],
        ['updatedAt', 'm."updatedAt"'],
        ['emails', 'm.emails'],
    ]);
    return MemberRepository;
}());
exports["default"] = MemberRepository;
