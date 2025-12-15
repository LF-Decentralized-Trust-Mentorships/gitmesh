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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
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
var lodash_1 = __importStar(require("lodash"));
var fast_levenshtein_1 = require("fast-levenshtein");
var validator_1 = __importDefault(require("validator"));
var opensearch_1 = require("@gitmesh/opensearch");
var common_1 = require("@gitmesh/common");
var types_1 = require("@gitmesh/types");
var sequelize_1 = __importStar(require("sequelize"));
var sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
var auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
var sequelizeFilterUtils_1 = __importDefault(require("../utils/sequelizeFilterUtils"));
var queryParser_1 = __importDefault(require("./filters/queryParser"));
var organizationSyncRemoteRepository_1 = __importDefault(require("./organizationSyncRemoteRepository"));
var isFeatureEnabled_1 = __importDefault(require("@/feature-flags/isFeatureEnabled"));
var segmentRepository_1 = __importDefault(require("./segmentRepository"));
var mergeActionsRepository_1 = require("./mergeActionsRepository");
var Op = sequelize_1["default"].Op;
var OrganizationRepository = /** @class */ (function () {
    function OrganizationRepository() {
    }
    OrganizationRepository.filterByPayingTenant = function (tenantId, limit, options) {
        return __awaiter(this, void 0, void 0, function () {
            var database, transaction, query, orgs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        database = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        query = "\n    with org_activities as (select a.\"organizationId\", count(a.id) as \"orgActivityCount\"\n                        from activities a\n                        where a.\"tenantId\" = :tenantId\n                          and a.\"deletedAt\" is null\n                        group by a.\"organizationId\"\n                        having count(id) > 0),\n     identities as (select oi.\"organizationId\", jsonb_agg(oi) as \"identities\"\n                    from \"organizationIdentities\" oi\n                    where oi.\"tenantId\" = :tenantId\n                    group by oi.\"organizationId\")\n    select org.id,\n          i.identities,\n          org.\"displayName\",\n          org.\"location\",\n          org.\"website\",\n          org.\"lastEnrichedAt\",\n          org.\"twitter\",\n          org.\"employees\",\n          org.\"size\",\n          org.\"founded\",\n          org.\"industry\",\n          org.\"naics\",\n          org.\"profiles\",\n          org.\"headline\",\n          org.\"ticker\",\n          org.\"type\",\n          org.\"address\",\n          org.\"geoLocation\",\n          org.\"employeeCountByCountry\",\n          org.\"twitter\",\n          org.\"linkedin\",\n          org.\"crunchbase\",\n          org.\"github\",\n          org.\"description\",\n          org.\"revenueRange\",\n          org.\"tags\",\n          org.\"affiliatedProfiles\",\n          org.\"allSubsidiaries\",\n          org.\"alternativeDomains\",\n          org.\"alternativeNames\",\n          org.\"averageEmployeeTenure\",\n          org.\"averageTenureByLevel\",\n          org.\"averageTenureByRole\",\n          org.\"directSubsidiaries\",\n          org.\"employeeChurnRate\",\n          org.\"employeeCountByMonth\",\n          org.\"employeeGrowthRate\",\n          org.\"employeeCountByMonthByLevel\",\n          org.\"employeeCountByMonthByRole\",\n          org.\"gicsSector\",\n          org.\"grossAdditionsByMonth\",\n          org.\"grossDeparturesByMonth\",\n          org.\"ultimateParent\",\n          org.\"immediateParent\",\n          activity.\"orgActivityCount\"\n    from \"organizations\" as org\n            join org_activities activity on activity.\"organizationId\" = org.\"id\"\n            join identities i on i.\"organizationId\" = org.id\n    where :tenantId = org.\"tenantId\"\n      and (org.\"lastEnrichedAt\" is null or date_part('month', age(now(), org.\"lastEnrichedAt\")) >= 6)\n    order by org.\"lastEnrichedAt\" asc, org.\"website\", activity.\"orgActivityCount\" desc, org.\"createdAt\" desc\n    limit :limit\n    ";
                        return [4 /*yield*/, database.query(query, {
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction,
                                replacements: {
                                    tenantId: tenantId,
                                    limit: limit
                                }
                            })];
                    case 1:
                        orgs = _a.sent();
                        return [2 /*return*/, orgs];
                }
            });
        });
    };
    OrganizationRepository.filterByActiveLastYear = function (tenantId, limit, options) {
        return __awaiter(this, void 0, void 0, function () {
            var database, transaction, query, orgs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        database = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        query = "\n    with org_activities as (select a.\"organizationId\", count(a.id) as \"orgActivityCount\"\n                        from activities a\n                        where a.\"tenantId\" = :tenantId\n                          and a.\"deletedAt\" is null\n                          and a.\"createdAt\" > (CURRENT_DATE - INTERVAL '1 year')\n                        group by a.\"organizationId\"\n                        having count(id) > 0),\n     identities as (select oi.\"organizationId\", jsonb_agg(oi) as \"identities\"\n                    from \"organizationIdentities\" oi\n                    where oi.\"tenantId\" = :tenantId\n                    group by oi.\"organizationId\")\n    select org.id,\n          i.identities,\n          org.\"displayName\",\n          org.\"location\",\n          org.\"website\",\n          org.\"lastEnrichedAt\",\n          org.\"twitter\",\n          org.\"employees\",\n          org.\"size\",\n          org.\"founded\",\n          org.\"industry\",\n          org.\"naics\",\n          org.\"profiles\",\n          org.\"headline\",\n          org.\"ticker\",\n          org.\"type\",\n          org.\"address\",\n          org.\"geoLocation\",\n          org.\"employeeCountByCountry\",\n          org.\"twitter\",\n          org.\"linkedin\",\n          org.\"crunchbase\",\n          org.\"github\",\n          org.\"description\",\n          org.\"revenueRange\",\n          org.\"tags\",\n          org.\"affiliatedProfiles\",\n          org.\"allSubsidiaries\",\n          org.\"alternativeDomains\",\n          org.\"alternativeNames\",\n          org.\"averageEmployeeTenure\",\n          org.\"averageTenureByLevel\",\n          org.\"averageTenureByRole\",\n          org.\"directSubsidiaries\",\n          org.\"employeeChurnRate\",\n          org.\"employeeCountByMonth\",\n          org.\"employeeGrowthRate\",\n          org.\"employeeCountByMonthByLevel\",\n          org.\"employeeCountByMonthByRole\",\n          org.\"gicsSector\",\n          org.\"grossAdditionsByMonth\",\n          org.\"grossDeparturesByMonth\",\n          org.\"ultimateParent\",\n          org.\"immediateParent\",\n          activity.\"orgActivityCount\"\n    from \"organizations\" as org\n            join org_activities activity on activity.\"organizationId\" = org.\"id\"\n            join identities i on i.\"organizationId\" = org.id\n    where :tenantId = org.\"tenantId\"\n    order by org.\"lastEnrichedAt\" asc, org.\"website\", activity.\"orgActivityCount\" desc, org.\"createdAt\" desc\n    limit :limit\n    ";
                        return [4 /*yield*/, database.query(query, {
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction,
                                replacements: {
                                    tenantId: tenantId,
                                    limit: limit
                                }
                            })];
                    case 1:
                        orgs = _a.sent();
                        return [2 /*return*/, orgs];
                }
            });
        });
    };
    OrganizationRepository.create = function (data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, tenant, transaction, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        if (!data.displayName) {
                            data.displayName = data.identities[0].name;
                        }
                        return [4 /*yield*/, options.database.organization.create(__assign(__assign({}, lodash_1["default"].pick(data, [
                                'displayName',
                                'description',
                                'emails',
                                'phoneNumbers',
                                'logo',
                                'tags',
                                'website',
                                'location',
                                'github',
                                'twitter',
                                'linkedin',
                                'crunchbase',
                                'employees',
                                'revenueRange',
                                'importHash',
                                'isTeamOrganization',
                                'employeeCountByCountry',
                                'type',
                                'ticker',
                                'headline',
                                'profiles',
                                'naics',
                                'industry',
                                'founded',
                                'size',
                                'lastEnrichedAt',
                                'manuallyCreated',
                                'affiliatedProfiles',
                                'allSubsidiaries',
                                'alternativeDomains',
                                'alternativeNames',
                                'averageEmployeeTenure',
                                'averageTenureByLevel',
                                'averageTenureByRole',
                                'directSubsidiaries',
                                'employeeChurnRate',
                                'employeeCountByMonth',
                                'employeeGrowthRate',
                                'employeeCountByMonthByLevel',
                                'employeeCountByMonthByRole',
                                'gicsSector',
                                'grossAdditionsByMonth',
                                'grossDeparturesByMonth',
                                'ultimateParent',
                                'immediateParent',
                            ])), { tenantId: tenant.id, createdById: currentUser.id, updatedById: currentUser.id }), {
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        return [4 /*yield*/, record.setMembers(data.members || [], {
                                transaction: transaction
                            })];
                    case 2:
                        _a.sent();
                        if (!(data.identities && data.identities.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, OrganizationRepository.setIdentities(record.id, data.identities, options)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, OrganizationRepository.includeOrganizationToSegments(record.id, options)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].CREATE, record, data, options)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, this.findById(record.id, options)];
                }
            });
        });
    };
    OrganizationRepository.bulkUpdate = function (data, fields, options, isEnrichment) {
        if (isEnrichment === void 0) { isEnrichment = false; }
        return __awaiter(this, void 0, void 0, function () {
            var transaction, isValid, existingOrgs_1, orgs, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        isValid = new Set(data.filter(function (org) { return org.id; }).map(function (org) { return org.id; })).size !== data.length;
                        if (isValid)
                            return [2 /*return*/, []];
                        if (!isEnrichment) return [3 /*break*/, 2];
                        return [4 /*yield*/, options.database.organization.findAll({
                                where: {
                                    id: (_a = {},
                                        _a[options.database.Sequelize.Op["in"]] = data.map(function (org) { return org.id; }),
                                        _a)
                                }
                            })
                            // Append new tags to existing tags instead of overwriting
                        ];
                    case 1:
                        existingOrgs_1 = _b.sent();
                        // Append new tags to existing tags instead of overwriting
                        if (fields.includes('tags')) {
                            // @ts-ignore
                            data = data.map(function (org) {
                                var existingOrg = existingOrgs_1.find(function (o) { return o.id === org.id; });
                                if (existingOrg && existingOrg.tags) {
                                    // Merge existing and new tags without duplicates
                                    var incomingTags = org.tags || [];
                                    org.tags = lodash_1["default"].uniq(__spreadArray(__spreadArray([], existingOrg.tags, true), incomingTags, true));
                                }
                                return org;
                            });
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, options.database.organization.bulkCreate(data, {
                                fields: __spreadArray(['id', 'tenantId'], fields, true),
                                updateOnDuplicate: fields,
                                returning: fields,
                                transaction: transaction
                            })];
                    case 3:
                        orgs = _b.sent();
                        return [2 /*return*/, orgs];
                    case 4:
                        error_1 = _b.sent();
                        options.log.error('Error while bulk updating organizations!', error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    OrganizationRepository.checkIdentities = function (data, options, organizationId) {
        return __awaiter(this, void 0, void 0, function () {
            var strongNotOwnedIdentities, strongIdentities_2, _i, _a, weakIdentity, _loop_1, _b, strongIdentities_1, identity, strongNotOwnedIdentities, weakIdentities_2, _c, _d, identity, _loop_2, _e, weakIdentities_1, weakIdentity;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        if (!(data.weakIdentities && data.weakIdentities.length > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, OrganizationRepository.findIdentities(data.weakIdentities, options, organizationId)];
                    case 1:
                        strongNotOwnedIdentities = _f.sent();
                        strongIdentities_2 = [];
                        // find weak identities in the payload that doesn't exist as a strong identity yet
                        for (_i = 0, _a = data.weakIdentities; _i < _a.length; _i++) {
                            weakIdentity = _a[_i];
                            if (!strongNotOwnedIdentities.has("".concat(weakIdentity.platform, ":").concat(weakIdentity.name))) {
                                strongIdentities_2.push(weakIdentity);
                            }
                        }
                        // exclude identities that are converted to a strong one from weakIdentities
                        if (strongIdentities_2.length > 0) {
                            data.weakIdentities = data.weakIdentities.filter(function (i) {
                                return strongIdentities_2.find(function (s) { return s.platform === i.platform && s.name === i.name; }) ===
                                    undefined;
                            });
                            _loop_1 = function (identity) {
                                if (data.identities.find(function (i) { return i.platform === identity.platform && i.name === identity.name; }) === undefined) {
                                    data.identities.push(identity);
                                }
                            };
                            // push new strong identities to the payload
                            for (_b = 0, strongIdentities_1 = strongIdentities_2; _b < strongIdentities_1.length; _b++) {
                                identity = strongIdentities_1[_b];
                                _loop_1(identity);
                            }
                        }
                        _f.label = 2;
                    case 2:
                        if (!(data.identities && data.identities.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, OrganizationRepository.findIdentities(data.identities, options, organizationId)];
                    case 3:
                        strongNotOwnedIdentities = _f.sent();
                        weakIdentities_2 = [];
                        // find strong identities in payload that already exist in some other organization, and convert these to weak
                        for (_c = 0, _d = data.identities; _c < _d.length; _c++) {
                            identity = _d[_c];
                            if (strongNotOwnedIdentities.has("".concat(identity.platform, ":").concat(identity.name))) {
                                weakIdentities_2.push(identity);
                            }
                        }
                        // exclude identities that are converted to a weak one from strong identities
                        if (weakIdentities_2.length > 0) {
                            data.identities = data.identities.filter(function (i) {
                                return weakIdentities_2.find(function (w) { return w.platform === i.platform && w.name === i.name; }) ===
                                    undefined;
                            });
                            _loop_2 = function (weakIdentity) {
                                if (!data.weakIdentities) {
                                    data.weakIdentities = [];
                                }
                                if (data.weakIdentities.find(function (w) { return w.platform === weakIdentity.platform && w.name === weakIdentity.name; }) === undefined) {
                                    data.weakIdentities.push(weakIdentity);
                                }
                            };
                            // push new weak identities to the payload
                            for (_e = 0, weakIdentities_1 = weakIdentities_2; _e < weakIdentities_1.length; _e++) {
                                weakIdentity = weakIdentities_1[_e];
                                _loop_2(weakIdentity);
                            }
                        }
                        _f.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    OrganizationRepository.includeOrganizationToSegments = function (organizationId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction, bulkInsertOrganizationSegments, replacements, idx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        bulkInsertOrganizationSegments = "INSERT INTO \"organizationSegments\" (\"organizationId\",\"segmentId\", \"tenantId\", \"createdAt\") VALUES ";
                        replacements = {
                            organizationId: organizationId,
                            tenantId: options.currentTenant.id
                        };
                        for (idx = 0; idx < options.currentSegments.length; idx++) {
                            bulkInsertOrganizationSegments += " (:organizationId, :segmentId".concat(idx, ", :tenantId, now()) ");
                            replacements["segmentId".concat(idx)] = options.currentSegments[idx].id;
                            if (idx !== options.currentSegments.length - 1) {
                                bulkInsertOrganizationSegments += ",";
                            }
                        }
                        bulkInsertOrganizationSegments += " ON CONFLICT DO NOTHING";
                        return [4 /*yield*/, seq.query(bulkInsertOrganizationSegments, {
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
    OrganizationRepository.excludeOrganizationsFromSegments = function (organizationIds, options) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction, bulkDeleteOrganizationSegments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        bulkDeleteOrganizationSegments = "DELETE FROM \"organizationSegments\" WHERE \"organizationId\" in (:organizationIds) and \"segmentId\" in (:segmentIds);";
                        return [4 /*yield*/, seq.query(bulkDeleteOrganizationSegments, {
                                replacements: {
                                    organizationIds: organizationIds,
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
    OrganizationRepository.excludeOrganizationsFromAllSegments = function (organizationIds, options) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction, bulkDeleteOrganizationSegments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        bulkDeleteOrganizationSegments = "DELETE FROM \"organizationSegments\" WHERE \"organizationId\" in (:organizationIds);";
                        return [4 /*yield*/, seq.query(bulkDeleteOrganizationSegments, {
                                replacements: {
                                    organizationIds: organizationIds
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
    OrganizationRepository.removeMemberRole = function (role, options) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction, deleteMemberRole, replacements;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        deleteMemberRole = "DELETE FROM \"memberOrganizations\" \n                                            WHERE \n                                            \"organizationId\" = :organizationId and \n                                            \"memberId\" = :memberId";
                        replacements = {
                            organizationId: role.organizationId,
                            memberId: role.memberId
                        };
                        if (role.dateStart === null) {
                            deleteMemberRole += " and \"dateStart\" is null ";
                        }
                        else {
                            deleteMemberRole += " and \"dateStart\" = :dateStart ";
                            replacements.dateStart = role.dateStart.toISOString();
                        }
                        if (role.dateEnd === null) {
                            deleteMemberRole += " and \"dateEnd\" is null ";
                        }
                        else {
                            deleteMemberRole += " and \"dateEnd\" = :dateEnd ";
                            replacements.dateEnd = role.dateEnd.toISOString();
                        }
                        return [4 /*yield*/, seq.query(deleteMemberRole, {
                                replacements: replacements,
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
    OrganizationRepository.addMemberRole = function (role, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, sequelize, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        sequelize = sequelizeRepository_1["default"].getSequelize(options);
                        query = "\n          insert into \"memberOrganizations\" (\"memberId\", \"organizationId\", \"createdAt\", \"updatedAt\", \"title\", \"dateStart\", \"dateEnd\", \"source\")\n          values (:memberId, :organizationId, NOW(), NOW(), :title, :dateStart, :dateEnd, :source)\n          on conflict do nothing;\n    ";
                        return [4 /*yield*/, sequelize.query(query, {
                                replacements: {
                                    memberId: role.memberId,
                                    organizationId: role.organizationId,
                                    title: role.title || null,
                                    dateStart: role.dateStart,
                                    dateEnd: role.dateEnd,
                                    source: role.source || null
                                },
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
    OrganizationRepository.update = function (id, data, options, overrideIdentities) {
        var _a;
        if (overrideIdentities === void 0) { overrideIdentities = false; }
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, transaction, currentTenant, record, _i, _b, identity;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.organization.findOne({
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
                        // exclude syncRemote attributes, since these are populated from organizationSyncRemote table
                        if ((_a = data.attributes) === null || _a === void 0 ? void 0 : _a.syncRemote) {
                            delete data.attributes.syncRemote;
                        }
                        return [4 /*yield*/, record.update(__assign(__assign({}, lodash_1["default"].pick(data, [
                                'displayName',
                                'description',
                                'emails',
                                'phoneNumbers',
                                'logo',
                                'tags',
                                'website',
                                'location',
                                'github',
                                'twitter',
                                'linkedin',
                                'crunchbase',
                                'employees',
                                'revenueRange',
                                'importHash',
                                'isTeamOrganization',
                                'employeeCountByCountry',
                                'type',
                                'ticker',
                                'headline',
                                'profiles',
                                'naics',
                                'industry',
                                'founded',
                                'size',
                                'employees',
                                'twitter',
                                'lastEnrichedAt',
                                'affiliatedProfiles',
                                'allSubsidiaries',
                                'alternativeDomains',
                                'alternativeNames',
                                'averageEmployeeTenure',
                                'averageTenureByLevel',
                                'averageTenureByRole',
                                'directSubsidiaries',
                                'employeeChurnRate',
                                'employeeCountByMonth',
                                'employeeGrowthRate',
                                'employeeCountByMonthByLevel',
                                'employeeCountByMonthByRole',
                                'gicsSector',
                                'grossAdditionsByMonth',
                                'grossDeparturesByMonth',
                                'ultimateParent',
                                'immediateParent',
                                'attributes',
                                'weakIdentities',
                            ])), { updatedById: currentUser.id }), {
                                transaction: transaction
                            })];
                    case 2:
                        record = _c.sent();
                        if (!data.members) return [3 /*break*/, 4];
                        return [4 /*yield*/, record.setMembers(data.members || [], {
                                transaction: transaction
                            })];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        if (!(data.isTeamOrganization === true ||
                            data.isTeamOrganization === 'true' ||
                            data.isTeamOrganization === false ||
                            data.isTeamOrganization === 'false')) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.setOrganizationIsTeam(record.id, data.isTeamOrganization, options)];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6:
                        if (!data.segments) return [3 /*break*/, 8];
                        return [4 /*yield*/, OrganizationRepository.includeOrganizationToSegments(record.id, options)];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8:
                        if (!(data.identities && data.identities.length > 0)) return [3 /*break*/, 14];
                        if (!overrideIdentities) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.setIdentities(id, data.identities, options)];
                    case 9:
                        _c.sent();
                        return [3 /*break*/, 14];
                    case 10:
                        _i = 0, _b = data.identities;
                        _c.label = 11;
                    case 11:
                        if (!(_i < _b.length)) return [3 /*break*/, 14];
                        identity = _b[_i];
                        return [4 /*yield*/, this.addIdentity(id, identity, options)];
                    case 12:
                        _c.sent();
                        _c.label = 13;
                    case 13:
                        _i++;
                        return [3 /*break*/, 11];
                    case 14: return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].UPDATE, record, data, options)];
                    case 15:
                        _c.sent();
                        return [2 /*return*/, this.findById(record.id, options)];
                }
            });
        });
    };
    /**
     * Marks/unmarks an organization's members as team members
     * @param organizationId
     * @param isTeam
     * @param options
     */
    OrganizationRepository.setOrganizationIsTeam = function (organizationId, isTeam, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.sequelize.query("update members as m\n      set attributes = jsonb_set(\"attributes\", '{isTeamMember}', '{\"default\": ".concat(isTeam, "}'::jsonb)\n      from \"memberOrganizations\" as mo\n      where mo.\"memberId\" = m.id\n      and mo.\"organizationId\" = :organizationId\n      and mo.\"deletedAt\" is null\n      and m.\"tenantId\" = :tenantId;\n   "), {
                                replacements: {
                                    isTeam: isTeam,
                                    organizationId: organizationId,
                                    tenantId: options.currentTenant.id
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
    OrganizationRepository.destroy = function (id, options, force, destroyIfOnlyNoSegmentsLeft) {
        if (force === void 0) { force = false; }
        if (destroyIfOnlyNoSegmentsLeft === void 0) { destroyIfOnlyNoSegmentsLeft = true; }
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentTenant, record, org;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.organization.findOne({
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
                        if (!destroyIfOnlyNoSegmentsLeft) return [3 /*break*/, 6];
                        return [4 /*yield*/, OrganizationRepository.excludeOrganizationsFromSegments([id], __assign(__assign({}, options), { transaction: transaction }))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.findById(id, options)];
                    case 3:
                        org = _a.sent();
                        if (!(org.segments.length === 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, record.destroy({
                                transaction: transaction,
                                force: force
                            })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 9];
                    case 6: return [4 /*yield*/, OrganizationRepository.excludeOrganizationsFromAllSegments([id], __assign(__assign({}, options), { transaction: transaction }))];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, record.destroy({
                                transaction: transaction,
                                force: force
                            })];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].DELETE, record, record, options)];
                    case 10:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OrganizationRepository.setIdentities = function (organizationId, identities, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, sequelize, currentTenant, _i, identities_1, identity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        sequelize = sequelizeRepository_1["default"].getSequelize(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, sequelize.query("delete from \"organizationIdentities\" where \"organizationId\" = :organizationId and \"tenantId\" = :tenantId", {
                                replacements: {
                                    organizationId: organizationId,
                                    tenantId: currentTenant.id
                                },
                                type: sequelize_1.QueryTypes.DELETE,
                                transaction: transaction
                            })];
                    case 1:
                        _a.sent();
                        _i = 0, identities_1 = identities;
                        _a.label = 2;
                    case 2:
                        if (!(_i < identities_1.length)) return [3 /*break*/, 5];
                        identity = identities_1[_i];
                        return [4 /*yield*/, OrganizationRepository.addIdentity(organizationId, identity, options)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    OrganizationRepository.addIdentity = function (organizationId, identity, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, sequelize, currentTenant, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        sequelize = sequelizeRepository_1["default"].getSequelize(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        query = "\n          insert into \n              \"organizationIdentities\"(\"organizationId\", \"platform\", \"name\", \"url\", \"sourceId\", \"tenantId\", \"integrationId\", \"createdAt\")\n          values \n              (:organizationId, :platform, :name, :url, :sourceId, :tenantId, :integrationId, now())\n          on conflict do nothing;\n    ";
                        return [4 /*yield*/, sequelize.query(query, {
                                replacements: {
                                    organizationId: organizationId,
                                    platform: identity.platform,
                                    sourceId: identity.sourceId || null,
                                    url: identity.url || null,
                                    tenantId: currentTenant.id,
                                    integrationId: identity.integrationId || null,
                                    name: identity.name
                                },
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
    OrganizationRepository.getIdentities = function (organizationIds, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, sequelize, currentTenant, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        sequelize = sequelizeRepository_1["default"].getSequelize(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, sequelize.query("\n      select \"sourceId\", \"platform\", \"name\", \"integrationId\", \"organizationId\" from \"organizationIdentities\"\n      where \"tenantId\" = :tenantId and \"organizationId\" in (:organizationIds) \n    ", {
                                replacements: {
                                    organizationIds: organizationIds,
                                    tenantId: currentTenant.id
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    };
    OrganizationRepository.moveIdentitiesBetweenOrganizations = function (fromOrganizationId, toOrganizationId, identitiesToMove, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, tenant, query, _i, identitiesToMove_1, identity, _a, _, count;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        query = "\n      update \"organizationIdentities\" \n      set \n        \"organizationId\" = :newOrganizationId\n      where \n        \"tenantId\" = :tenantId and \n        \"organizationId\" = :oldOrganizationId and \n        platform = :platform and \n        name = :name;\n    ";
                        _i = 0, identitiesToMove_1 = identitiesToMove;
                        _b.label = 1;
                    case 1:
                        if (!(_i < identitiesToMove_1.length)) return [3 /*break*/, 4];
                        identity = identitiesToMove_1[_i];
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    tenantId: tenant.id,
                                    oldOrganizationId: fromOrganizationId,
                                    newOrganizationId: toOrganizationId,
                                    platform: identity.platform,
                                    name: identity.name
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
    OrganizationRepository.addNoMerge = function (organizationId, noMergeId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction, query, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        query = "\n    insert into \"organizationNoMerge\" (\"organizationId\", \"noMergeId\", \"createdAt\", \"updatedAt\")\n    values \n    (:organizationId, :noMergeId, now(), now()),\n    (:noMergeId, :organizationId, now(), now())\n    on conflict do nothing;\n  ";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    organizationId: organizationId,
                                    noMergeId: noMergeId
                                },
                                type: sequelize_1.QueryTypes.INSERT,
                                transaction: transaction
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        options.log.error('Error adding organizations no merge!', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    OrganizationRepository.removeToMerge = function (organizationId, toMergeId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction, query, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        query = "\n    delete from \"organizationToMerge\"\n    where (\"organizationId\" = :organizationId and \"toMergeId\" = :toMergeId) or (\"organizationId\" = :toMergeId and \"toMergeId\" = :organizationId);\n  ";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    organizationId: organizationId,
                                    toMergeId: toMergeId
                                },
                                type: sequelize_1.QueryTypes.DELETE,
                                transaction: transaction
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        options.log.error('Error while removing organizations to merge!', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    OrganizationRepository.findNonExistingIds = function (ids, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, idValues, i, query, results, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        idValues = "";
                        for (i = 0; i < ids.length; i++) {
                            idValues += "('".concat(ids[i], "'::uuid)");
                            if (i !== ids.length - 1) {
                                idValues += ',';
                            }
                        }
                        query = "WITH id_list (id) AS (\n      VALUES\n          ".concat(idValues, "\n        )\n        SELECT id\n        FROM id_list\n        WHERE NOT EXISTS (\n            SELECT 1\n            FROM organizations o\n            WHERE o.id = id_list.id\n        );");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, seq.query(query, {
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 2:
                        results = _a.sent();
                        return [2 /*return*/, results.map(function (r) { return r.id; })];
                    case 3:
                        error_4 = _a.sent();
                        options.log.error('error while getting non existing organizations from db', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    OrganizationRepository.findNoMergeIds = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, query, results, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        query = "select onm.\"organizationId\", onm.\"noMergeId\" from \"organizationNoMerge\" onm\n                  where onm.\"organizationId\" = :id or onm.\"noMergeId\" = :id;";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, seq.query(query, {
                                type: sequelize_1.QueryTypes.SELECT,
                                replacements: {
                                    id: id
                                },
                                transaction: transaction
                            })];
                    case 2:
                        results = _a.sent();
                        return [2 /*return*/, Array.from(results.reduce(function (acc, r) {
                                if (id === r.organizationId) {
                                    acc.add(r.noMergeId);
                                }
                                else if (id === r.noMergeId) {
                                    acc.add(r.organizationId);
                                }
                                return acc;
                            }, new Set()))];
                    case 3:
                        error_5 = _a.sent();
                        options.log.error('error while getting non existing organizations from db', error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    OrganizationRepository.addToMerge = function (suggestions, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, uniqueOrganizationIds, nonExistingIds, suggestionChunks, insertValues, _loop_3, _i, suggestionChunks_1, suggestionChunk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        // Remove possible duplicates
                        suggestions = lodash_1["default"].uniqWith(suggestions, function (a, b) {
                            return lodash_1["default"].isEqual(lodash_1["default"].sortBy(a.organizations), lodash_1["default"].sortBy(b.organizations));
                        });
                        uniqueOrganizationIds = Array.from(suggestions.reduce(function (acc, suggestion) {
                            acc.add(suggestion.organizations[0]);
                            acc.add(suggestion.organizations[1]);
                            return acc;
                        }, new Set()));
                        return [4 /*yield*/, OrganizationRepository.findNonExistingIds(uniqueOrganizationIds, options)];
                    case 1:
                        nonExistingIds = _a.sent();
                        suggestions = suggestions.filter(function (s) {
                            return !nonExistingIds.includes(s.organizations[0]) &&
                                !nonExistingIds.includes(s.organizations[1]);
                        });
                        suggestionChunks = (0, lodash_1.chunk)(suggestions, 100);
                        insertValues = function (organizationId, toMergeId, similarity, index) {
                            var _a;
                            var idPlaceholder = function (key) { return "".concat(key).concat(index); };
                            return {
                                query: "(:".concat(idPlaceholder('organizationId'), ", :").concat(idPlaceholder('toMergeId'), ", :").concat(idPlaceholder('similarity'), ", NOW(), NOW())"),
                                replacements: (_a = {},
                                    _a[idPlaceholder('organizationId')] = organizationId,
                                    _a[idPlaceholder('toMergeId')] = toMergeId,
                                    _a[idPlaceholder('similarity')] = similarity === null ? null : similarity,
                                    _a)
                            };
                        };
                        _loop_3 = function (suggestionChunk) {
                            var placeholders, replacements, query, error_6;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        placeholders = [];
                                        replacements = {};
                                        suggestionChunk.forEach(function (suggestion, index) {
                                            var _a = insertValues(suggestion.organizations[0], suggestion.organizations[1], suggestion.similarity, index), query = _a.query, chunkReplacements = _a.replacements;
                                            placeholders.push(query);
                                            replacements = __assign(__assign({}, replacements), chunkReplacements);
                                        });
                                        query = "\n        INSERT INTO \"organizationToMerge\" (\"organizationId\", \"toMergeId\", \"similarity\", \"createdAt\", \"updatedAt\")\n        VALUES ".concat(placeholders.join(', '), "\n        on conflict do nothing;\n      ");
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
                                        error_6 = _b.sent();
                                        options.log.error('error adding organizations to merge', error_6);
                                        throw error_6;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, suggestionChunks_1 = suggestionChunks;
                        _a.label = 2;
                    case 2:
                        if (!(_i < suggestionChunks_1.length)) return [3 /*break*/, 5];
                        suggestionChunk = suggestionChunks_1[_i];
                        return [5 /*yield**/, _loop_3(suggestionChunk)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    OrganizationRepository.findMembersBelongToBothOrganizations = function (organizationId1, organizationId2, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, sequelize, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        sequelize = sequelizeRepository_1["default"].getSequelize(options);
                        return [4 /*yield*/, sequelize.query("\n      SELECT  mo.*\n      FROM \"memberOrganizations\" AS mo\n      WHERE mo.\"deletedAt\" is null and\n         mo.\"memberId\" IN (\n          SELECT \"memberId\"\n          FROM \"memberOrganizations\"\n          WHERE \"organizationId\" = :organizationId1\n      )\n      AND mo.\"memberId\" IN (\n          SELECT \"memberId\"\n          FROM \"memberOrganizations\"\n          WHERE \"organizationId\" = :organizationId2);\n    ", {
                                replacements: {
                                    organizationId1: organizationId1,
                                    organizationId2: organizationId2
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    };
    OrganizationRepository.moveActivitiesBetweenOrganizations = function (fromOrganizationId, toOrganizationId, options, batchSize) {
        if (batchSize === void 0) { batchSize = 10000; }
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, tenant, updatedRowsCount, query, _a, rowCount;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        updatedRowsCount = 0;
                        _b.label = 1;
                    case 1:
                        options.log.info("[Move Activities] - Moving maximum of ".concat(batchSize, " activities from ").concat(fromOrganizationId, " to ").concat(toOrganizationId, "."));
                        query = "\n        UPDATE \"activities\" \n        SET \"organizationId\" = :newOrganizationId\n        WHERE id IN (\n          SELECT id \n          FROM \"activities\" \n          WHERE \"tenantId\" = :tenantId \n            AND \"organizationId\" = :oldOrganizationId\n          LIMIT :limit\n        )\n      ";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    tenantId: tenant.id,
                                    oldOrganizationId: fromOrganizationId,
                                    newOrganizationId: toOrganizationId,
                                    limit: batchSize
                                },
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 2:
                        _a = _b.sent(), rowCount = _a[1];
                        updatedRowsCount = rowCount !== null && rowCount !== void 0 ? rowCount : 0;
                        _b.label = 3;
                    case 3:
                        if (updatedRowsCount === batchSize) return [3 /*break*/, 1];
                        _b.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    OrganizationRepository.getMergeSuggestions = function (options) {
        var _a, _b, _c, _d;
        return __asyncGenerator(this, arguments, function getMergeSuggestions_1() {
            var BATCH_SIZE, YIELD_CHUNK_SIZE, yieldChunk, prefixLength, calculateSimilarity, tenant, queryBody, organizations, lastUuid, _i, organizations_1, organization, identitiesPartialQuery, hasFuzzySearch, _e, _f, identity, cleanedIdentityName, noMergeIds, _g, noMergeIds_1, noMergeId, sameOrganizationsQueryBody, organizationsToMerge, _h, organizationsToMerge_1, organizationToMerge;
            var _j, _k, _l, _m, _o;
            return __generator(this, function (_p) {
                switch (_p.label) {
                    case 0:
                        BATCH_SIZE = 100;
                        YIELD_CHUNK_SIZE = 100;
                        yieldChunk = [];
                        prefixLength = function (string) {
                            if (string.length > 5 && string.length < 8) {
                                return 6;
                            }
                            return 10;
                        };
                        calculateSimilarity = function (primaryOrganization, similarOrganization) {
                            var smallestEditDistance = null;
                            var similarPrimaryIdentity = null;
                            var _loop_4 = function (primaryIdentity) {
                                // similar organization has a weakIdentity as one of primary organization's strong identity, return score 95
                                if (similarOrganization._source.nested_weakIdentities.length > 0 &&
                                    similarOrganization._source.nested_weakIdentities.some(function (weakIdentity) {
                                        return weakIdentity.string_name === primaryIdentity.string_name &&
                                            weakIdentity.string_platform === primaryIdentity.string_platform;
                                    })) {
                                    return { value: 0.95 };
                                }
                                for (var _b = 0, _c = similarOrganization._source.nested_identities; _b < _c.length; _b++) {
                                    var secondaryIdentity = _c[_b];
                                    var currentLevenstheinDistance = (0, fast_levenshtein_1.get)(primaryIdentity.string_name, secondaryIdentity.string_name);
                                    if (smallestEditDistance === null || smallestEditDistance > currentLevenstheinDistance) {
                                        smallestEditDistance = currentLevenstheinDistance;
                                        similarPrimaryIdentity = primaryIdentity;
                                    }
                                }
                            };
                            // find the smallest edit distance between both identity arrays
                            for (var _i = 0, _a = primaryOrganization._source.nested_identities; _i < _a.length; _i++) {
                                var primaryIdentity = _a[_i];
                                var state_1 = _loop_4(primaryIdentity);
                                if (typeof state_1 === "object")
                                    return state_1.value;
                            }
                            // calculate similarity percentage
                            var identityLength = similarPrimaryIdentity.string_name.length;
                            if (identityLength < smallestEditDistance) {
                                // if levensthein distance is bigger than the word itself, it might be a prefix match, return medium similarity
                                return (Math.floor(Math.random() * 21) + 20) / 100;
                            }
                            return Math.floor(((identityLength - smallestEditDistance) / identityLength) * 100) / 100;
                        };
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        queryBody = {
                            from: 0,
                            size: BATCH_SIZE,
                            query: {},
                            sort: (_j = {},
                                _j["uuid_organizationId"] = 'asc',
                                _j),
                            collapse: {
                                field: 'uuid_organizationId'
                            },
                            _source: ['uuid_organizationId', 'nested_identities', 'uuid_arr_noMergeIds']
                        };
                        organizations = [];
                        _p.label = 1;
                    case 1:
                        if (organizations.length > 0) {
                            queryBody.query = {
                                bool: {
                                    filter: [
                                        {
                                            bool: {
                                                should: [
                                                    {
                                                        range: {
                                                            int_activityCount: {
                                                                gt: 0
                                                            }
                                                        }
                                                    },
                                                    {
                                                        term: {
                                                            bool_manuallyCreated: true
                                                        }
                                                    },
                                                ],
                                                minimum_should_match: 1
                                            }
                                        },
                                        {
                                            term: {
                                                uuid_tenantId: tenant.id
                                            }
                                        },
                                        {
                                            range: {
                                                uuid_organizationId: {
                                                    gt: lastUuid
                                                }
                                            }
                                        },
                                    ]
                                }
                            };
                        }
                        else {
                            queryBody.query = {
                                bool: {
                                    filter: [
                                        {
                                            bool: {
                                                should: [
                                                    {
                                                        range: {
                                                            int_activityCount: {
                                                                gt: 0
                                                            }
                                                        }
                                                    },
                                                    {
                                                        term: {
                                                            bool_manuallyCreated: true
                                                        }
                                                    },
                                                ],
                                                minimum_should_match: 1
                                            }
                                        },
                                        {
                                            term: {
                                                uuid_tenantId: tenant.id
                                            }
                                        },
                                    ]
                                }
                            };
                        }
                        return [4 /*yield*/, __await(options.opensearch.search({
                                index: types_1.OpenSearchIndex.ORGANIZATIONS,
                                body: queryBody
                            }))];
                    case 2:
                        organizations =
                            ((_b = (_a = (_p.sent()).body) === null || _a === void 0 ? void 0 : _a.hits) === null || _b === void 0 ? void 0 : _b.hits) || [];
                        if (organizations.length > 0) {
                            lastUuid = organizations[organizations.length - 1]._source.uuid_organizationId;
                        }
                        _i = 0, organizations_1 = organizations;
                        _p.label = 3;
                    case 3:
                        if (!(_i < organizations_1.length)) return [3 /*break*/, 9];
                        organization = organizations_1[_i];
                        if (!(organization._source.nested_identities &&
                            organization._source.nested_identities.length > 0)) return [3 /*break*/, 8];
                        identitiesPartialQuery = {
                            should: [
                                {
                                    nested: {
                                        path: 'nested_weakIdentities',
                                        query: {
                                            bool: {
                                                should: [],
                                                boost: 1000,
                                                minimum_should_match: 1
                                            }
                                        }
                                    }
                                },
                                {
                                    nested: {
                                        path: 'nested_identities',
                                        query: {
                                            bool: {
                                                should: [],
                                                boost: 1,
                                                minimum_should_match: 1
                                            }
                                        }
                                    }
                                },
                            ],
                            minimum_should_match: 1,
                            must_not: [
                                {
                                    term: {
                                        uuid_organizationId: organization._source.uuid_organizationId
                                    }
                                },
                            ],
                            must: [
                                {
                                    term: {
                                        uuid_tenantId: tenant.id
                                    }
                                },
                                {
                                    bool: {
                                        should: [
                                            {
                                                range: {
                                                    int_activityCount: {
                                                        gt: 0
                                                    }
                                                }
                                            },
                                            {
                                                term: {
                                                    bool_manuallyCreated: true
                                                }
                                            },
                                        ],
                                        minimum_should_match: 1
                                    }
                                },
                            ]
                        };
                        hasFuzzySearch = false;
                        for (_e = 0, _f = organization._source.nested_identities; _e < _f.length; _e++) {
                            identity = _f[_e];
                            if (identity.string_name.length > 0) {
                                // weak identity search
                                identitiesPartialQuery.should[0].nested.query.bool.should.push({
                                    bool: {
                                        must: [
                                            { match: (_k = {}, _k["nested_weakIdentities.keyword_name"] = identity.string_name, _k) },
                                            {
                                                match: (_l = {},
                                                    _l["nested_weakIdentities.string_platform"] = identity.string_platform,
                                                    _l)
                                            },
                                        ]
                                    }
                                });
                                cleanedIdentityName = identity.string_name.replace(/^https?:\/\//, '');
                                // only do fuzzy/wildcard/partial search when identity name is not all numbers (like linkedin organization profiles)
                                if (Number.isNaN(Number(identity.string_name))) {
                                    hasFuzzySearch = true;
                                    // fuzzy search for identities
                                    identitiesPartialQuery.should[1].nested.query.bool.should.push({
                                        match: (_m = {},
                                            _m["nested_identities.keyword_name"] = {
                                                query: cleanedIdentityName,
                                                prefix_length: 1,
                                                fuzziness: 'auto'
                                            },
                                            _m)
                                    });
                                    // also check for prefix for identities that has more than 5 characters and no whitespace
                                    if (identity.string_name.length > 5 && identity.string_name.indexOf(' ') === -1) {
                                        identitiesPartialQuery.should[1].nested.query.bool.should.push({
                                            prefix: (_o = {},
                                                _o["nested_identities.keyword_name"] = {
                                                    value: cleanedIdentityName.slice(0, prefixLength(cleanedIdentityName))
                                                },
                                                _o)
                                        });
                                    }
                                }
                            }
                        }
                        // check if we have any actual identity searches, if not remove it from the query
                        if (!hasFuzzySearch) {
                            identitiesPartialQuery.should.pop();
                        }
                        return [4 /*yield*/, __await(OrganizationRepository.findNoMergeIds(organization._source.uuid_organizationId, options))];
                    case 4:
                        noMergeIds = _p.sent();
                        if (noMergeIds && noMergeIds.length > 0) {
                            for (_g = 0, noMergeIds_1 = noMergeIds; _g < noMergeIds_1.length; _g++) {
                                noMergeId = noMergeIds_1[_g];
                                identitiesPartialQuery.must_not.push({
                                    term: {
                                        uuid_organizationId: noMergeId
                                    }
                                });
                            }
                        }
                        sameOrganizationsQueryBody = {
                            query: {
                                bool: identitiesPartialQuery
                            },
                            collapse: {
                                field: 'uuid_organizationId'
                            },
                            _source: ['uuid_organizationId', 'nested_identities', 'nested_weakIdentities']
                        };
                        return [4 /*yield*/, __await(options.opensearch.search({
                                index: types_1.OpenSearchIndex.ORGANIZATIONS,
                                body: sameOrganizationsQueryBody
                            }))];
                    case 5:
                        organizationsToMerge = ((_d = (_c = (_p.sent()).body) === null || _c === void 0 ? void 0 : _c.hits) === null || _d === void 0 ? void 0 : _d.hits) || [];
                        for (_h = 0, organizationsToMerge_1 = organizationsToMerge; _h < organizationsToMerge_1.length; _h++) {
                            organizationToMerge = organizationsToMerge_1[_h];
                            yieldChunk.push({
                                similarity: calculateSimilarity(organization, organizationToMerge),
                                organizations: [
                                    organization._source.uuid_organizationId,
                                    organizationToMerge._source.uuid_organizationId,
                                ]
                            });
                        }
                        if (!(yieldChunk.length >= YIELD_CHUNK_SIZE)) return [3 /*break*/, 8];
                        return [4 /*yield*/, __await(yieldChunk)];
                    case 6: return [4 /*yield*/, _p.sent()];
                    case 7:
                        _p.sent();
                        yieldChunk = [];
                        _p.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 3];
                    case 9:
                        if (organizations.length > 0) return [3 /*break*/, 1];
                        _p.label = 10;
                    case 10:
                        if (!(yieldChunk.length > 0)) return [3 /*break*/, 13];
                        return [4 /*yield*/, __await(yieldChunk)];
                    case 11: return [4 /*yield*/, _p.sent()];
                    case 12:
                        _p.sent();
                        _p.label = 13;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    OrganizationRepository.findOrganizationsWithMergeSuggestions = function (_a, options) {
        var _b = _a.limit, limit = _b === void 0 ? 20 : _b, _c = _a.offset, offset = _c === void 0 ? 0 : _c;
        return __awaiter(this, void 0, void 0, function () {
            var currentTenant, segmentIds, orgs, organizationPromises, toMergePromises, _i, orgs_1, org, organizationResults, organizationToMergeResults_1, result;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        segmentIds = sequelizeRepository_1["default"].getSegmentIds(options);
                        return [4 /*yield*/, options.database.sequelize.query("WITH\n      cte AS (\n        SELECT\n          Greatest(Hashtext(Concat(org.id, otm.\"toMergeId\")), Hashtext(Concat(otm.\"toMergeId\", org.id))) as hash,\n          org.id,\n          otm.\"toMergeId\",\n          org.\"createdAt\",\n          otm.\"similarity\"\n        FROM organizations org\n        JOIN \"organizationToMerge\" otm ON org.id = otm.\"organizationId\"\n        JOIN \"organizationSegments\" os ON os.\"organizationId\" = org.id\n        JOIN \"organizationSegments\" to_merge_segments on to_merge_segments.\"organizationId\" = otm.\"toMergeId\"\n        LEFT JOIN \"mergeActions\" ma\n          ON ma.type = :mergeActionType\n          AND ma.\"tenantId\" = :tenantId\n          AND (\n            (ma.\"primaryId\" = org.id AND ma.\"secondaryId\" = otm.\"toMergeId\")\n            OR (ma.\"primaryId\" = otm.\"toMergeId\" AND ma.\"secondaryId\" = org.id)\n          )\n        WHERE org.\"tenantId\" = :tenantId\n          AND os.\"segmentId\" IN (:segmentIds)\n          AND to_merge_segments.\"segmentId\" IN (:segmentIds)\n          AND (ma.id IS NULL OR ma.state = :mergeActionStatus)\n      ),\n      \n      count_cte AS (\n        SELECT COUNT(DISTINCT hash) AS total_count\n        FROM cte\n      ),\n      \n      final_select AS (\n        SELECT DISTINCT ON (hash)\n          id,\n          \"toMergeId\",\n          \"createdAt\",\n          \"similarity\"\n        FROM cte\n        ORDER BY hash, id\n      )\n      \n      SELECT\n        \"organizationsToMerge\".id,\n        \"organizationsToMerge\".\"toMergeId\",\n        count_cte.\"total_count\",\n        \"organizationsToMerge\".\"similarity\"\n      FROM\n        final_select AS \"organizationsToMerge\",\n        count_cte\n      ORDER BY\n        \"organizationsToMerge\".\"similarity\" DESC, \"organizationsToMerge\".id\n      LIMIT :limit OFFSET :offset\n    ", {
                                replacements: {
                                    tenantId: currentTenant.id,
                                    segmentIds: segmentIds,
                                    limit: limit,
                                    offset: offset,
                                    mergeActionType: mergeActionsRepository_1.MergeActionType.ORG,
                                    mergeActionStatus: mergeActionsRepository_1.MergeActionState.ERROR
                                },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        orgs = _d.sent();
                        if (!(orgs.length > 0)) return [3 /*break*/, 4];
                        organizationPromises = [];
                        toMergePromises = [];
                        for (_i = 0, orgs_1 = orgs; _i < orgs_1.length; _i++) {
                            org = orgs_1[_i];
                            organizationPromises.push(OrganizationRepository.findById(org.id, options));
                            toMergePromises.push(OrganizationRepository.findById(org.toMergeId, options));
                        }
                        return [4 /*yield*/, Promise.all(organizationPromises)];
                    case 2:
                        organizationResults = _d.sent();
                        return [4 /*yield*/, Promise.all(toMergePromises)];
                    case 3:
                        organizationToMergeResults_1 = _d.sent();
                        result = organizationResults.map(function (i, idx) { return ({
                            organizations: [i, organizationToMergeResults_1[idx]],
                            similarity: orgs[idx].similarity
                        }); });
                        return [2 /*return*/, { rows: result, count: orgs[0].total_count, limit: limit, offset: offset }];
                    case 4: return [2 /*return*/, { rows: [{ organizations: [], similarity: 0 }], count: 0, limit: limit, offset: offset }];
                }
            });
        });
    };
    OrganizationRepository.moveMembersBetweenOrganizations = function (fromOrganizationId, toOrganizationId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, transaction, removeRoles, addRoles, memberRolesWithBothOrganizations, primaryOrganizationMemberRoles, secondaryOrganizationMemberRoles, _loop_5, this_1, _i, secondaryOrganizationMemberRoles_1, memberOrganization, remainingRoles, _a, remainingRoles_1, role;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        removeRoles = [];
                        addRoles = [];
                        return [4 /*yield*/, this.findMembersBelongToBothOrganizations(fromOrganizationId, toOrganizationId, options)];
                    case 1:
                        memberRolesWithBothOrganizations = _b.sent();
                        primaryOrganizationMemberRoles = memberRolesWithBothOrganizations.filter(function (m) { return m.organizationId === toOrganizationId; });
                        secondaryOrganizationMemberRoles = memberRolesWithBothOrganizations.filter(function (m) { return m.organizationId === fromOrganizationId; });
                        _loop_5 = function (memberOrganization) {
                            var currentRoles, currentRole, foundIntersectingRoles, startDates, endDates, _c, foundIntersectingRoles_1, r, _d, removeRoles_1, removeRole, _e, addRoles_1, addRole;
                            return __generator(this, function (_f) {
                                switch (_f.label) {
                                    case 0:
                                        // if dateEnd and dateStart isn't available, we don't need to move but delete it from org2
                                        if (memberOrganization.dateStart === null && memberOrganization.dateEnd === null) {
                                            removeRoles.push(memberOrganization);
                                        }
                                        // it's a current role, also check org1 to see which one starts earlier
                                        else if (memberOrganization.dateStart !== null && memberOrganization.dateEnd === null) {
                                            currentRoles = primaryOrganizationMemberRoles.filter(function (mo) {
                                                return mo.memberId === memberOrganization.memberId &&
                                                    mo.dateStart !== null &&
                                                    mo.dateEnd === null;
                                            });
                                            if (currentRoles.length === 0) {
                                                // no current role in org1, add the memberOrganization to org1
                                                addRoles.push(memberOrganization);
                                            }
                                            else if (currentRoles.length === 1) {
                                                currentRole = currentRoles[0];
                                                if (new Date(memberOrganization.dateStart) <= new Date(currentRoles[0].dateStart)) {
                                                    // add a new role with earlier dateStart
                                                    addRoles.push({
                                                        id: currentRole.id,
                                                        dateStart: memberOrganization.dateStart.toISOString(),
                                                        dateEnd: null,
                                                        memberId: currentRole.memberId,
                                                        organizationId: currentRole.organizationId,
                                                        title: currentRole.title,
                                                        source: currentRole.source
                                                    });
                                                    // remove current role
                                                    removeRoles.push(currentRole);
                                                }
                                                // delete role from org2
                                                removeRoles.push(memberOrganization);
                                            }
                                            else {
                                                throw new Error("Member ".concat(memberOrganization.memberId, " has more than one current roles."));
                                            }
                                        }
                                        else if (memberOrganization.dateStart === null && memberOrganization.dateEnd !== null) {
                                            throw new Error("Member organization with dateEnd and without dateStart!");
                                        }
                                        else {
                                            foundIntersectingRoles = primaryOrganizationMemberRoles.filter(function (mo) {
                                                var primaryStart = new Date(mo.dateStart);
                                                var primaryEnd = new Date(mo.dateEnd);
                                                var secondaryStart = new Date(memberOrganization.dateStart);
                                                var secondaryEnd = new Date(memberOrganization.dateEnd);
                                                return (mo.memberId === memberOrganization.memberId &&
                                                    mo.dateStart !== null &&
                                                    mo.dateEnd !== null &&
                                                    ((secondaryStart < primaryStart && secondaryEnd > primaryStart) ||
                                                        (primaryStart < secondaryStart && secondaryEnd < primaryEnd) ||
                                                        (secondaryStart < primaryStart && secondaryEnd > primaryEnd) ||
                                                        (primaryStart < secondaryStart && secondaryEnd > primaryEnd)));
                                            });
                                            startDates = __spreadArray(__spreadArray([], foundIntersectingRoles, true), [memberOrganization], false).map(function (org) {
                                                return new Date(org.dateStart).getTime();
                                            });
                                            endDates = __spreadArray(__spreadArray([], foundIntersectingRoles, true), [memberOrganization], false).map(function (org) {
                                                return new Date(org.dateEnd).getTime();
                                            });
                                            addRoles.push({
                                                dateStart: new Date(Math.min.apply(null, startDates)).toISOString(),
                                                dateEnd: new Date(Math.max.apply(null, endDates)).toISOString(),
                                                memberId: memberOrganization.memberId,
                                                organizationId: toOrganizationId,
                                                title: foundIntersectingRoles.length > 0
                                                    ? foundIntersectingRoles[0].title
                                                    : memberOrganization.title,
                                                source: foundIntersectingRoles.length > 0
                                                    ? foundIntersectingRoles[0].source
                                                    : memberOrganization.source
                                            });
                                            // we'll delete all roles that intersect with incoming org member roles and create a merged role
                                            for (_c = 0, foundIntersectingRoles_1 = foundIntersectingRoles; _c < foundIntersectingRoles_1.length; _c++) {
                                                r = foundIntersectingRoles_1[_c];
                                                removeRoles.push(r);
                                            }
                                        }
                                        _d = 0, removeRoles_1 = removeRoles;
                                        _f.label = 1;
                                    case 1:
                                        if (!(_d < removeRoles_1.length)) return [3 /*break*/, 4];
                                        removeRole = removeRoles_1[_d];
                                        return [4 /*yield*/, this_1.removeMemberRole(removeRole, options)];
                                    case 2:
                                        _f.sent();
                                        _f.label = 3;
                                    case 3:
                                        _d++;
                                        return [3 /*break*/, 1];
                                    case 4:
                                        _e = 0, addRoles_1 = addRoles;
                                        _f.label = 5;
                                    case 5:
                                        if (!(_e < addRoles_1.length)) return [3 /*break*/, 8];
                                        addRole = addRoles_1[_e];
                                        return [4 /*yield*/, this_1.addMemberRole(addRole, options)];
                                    case 6:
                                        _f.sent();
                                        _f.label = 7;
                                    case 7:
                                        _e++;
                                        return [3 /*break*/, 5];
                                    case 8:
                                        addRoles = [];
                                        removeRoles = [];
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, secondaryOrganizationMemberRoles_1 = secondaryOrganizationMemberRoles;
                        _b.label = 2;
                    case 2:
                        if (!(_i < secondaryOrganizationMemberRoles_1.length)) return [3 /*break*/, 5];
                        memberOrganization = secondaryOrganizationMemberRoles_1[_i];
                        return [5 /*yield**/, _loop_5(memberOrganization)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, seq.query("\n        SELECT *\n        FROM \"memberOrganizations\"\n        WHERE \"organizationId\" = :fromOrganizationId \n        AND \"deletedAt\" IS NULL\n        AND \"memberId\" NOT IN (\n            SELECT \"memberId\" \n            FROM \"memberOrganizations\" \n            WHERE \"organizationId\" = :toOrganizationId\n            AND \"deletedAt\" IS NULL\n        );\n      ", {
                            replacements: {
                                toOrganizationId: toOrganizationId,
                                fromOrganizationId: fromOrganizationId
                            },
                            type: sequelize_1.QueryTypes.SELECT,
                            transaction: transaction
                        })];
                    case 6:
                        remainingRoles = (_b.sent());
                        _a = 0, remainingRoles_1 = remainingRoles;
                        _b.label = 7;
                    case 7:
                        if (!(_a < remainingRoles_1.length)) return [3 /*break*/, 11];
                        role = remainingRoles_1[_a];
                        return [4 /*yield*/, this.removeMemberRole(role, options)];
                    case 8:
                        _b.sent();
                        return [4 /*yield*/, this.addMemberRole({
                                title: role.title,
                                dateStart: role.dateStart,
                                dateEnd: role.dateEnd,
                                memberId: role.memberId,
                                organizationId: toOrganizationId,
                                source: role.source,
                                deletedAt: role.deletedAt
                            }, options)];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10:
                        _a++;
                        return [3 /*break*/, 7];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    OrganizationRepository.getOrganizationSegments = function (organizationId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, seq, segmentRepository, query, data, segmentIds, segments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        segmentRepository = new segmentRepository_1["default"](options);
                        query = "\n        SELECT \"segmentId\"\n        FROM \"organizationSegments\"\n        WHERE \"organizationId\" = :organizationId\n        ORDER BY \"createdAt\";\n    ";
                        return [4 /*yield*/, seq.query(query, {
                                replacements: {
                                    organizationId: organizationId
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
    OrganizationRepository.findByIdentity = function (identity, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, sequelize, currentTenant, results, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        sequelize = sequelizeRepository_1["default"].getSequelize(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, sequelize.query("\n      with\n          \"organizationsWithIdentity\" as (\n              select oi.\"organizationId\"\n              from \"organizationIdentities\" oi\n              where \n                    oi.platform = :platform\n                    and oi.name = :name\n          )\n          select o.id,\n                  o.description,\n                  o.emails,\n                  o.logo,\n                  o.tags,\n                  o.github,\n                  o.twitter,\n                  o.linkedin,\n                  o.crunchbase,\n                  o.employees,\n                  o.location,\n                  o.website,\n                  o.type,\n                  o.size,\n                  o.headline,\n                  o.industry,\n                  o.founded,\n                  o.attributes\n          from organizations o\n          where o.\"tenantId\" = :tenantId\n          and o.id in (select \"organizationId\" from \"organizationsWithIdentity\");\n      ", {
                                replacements: {
                                    tenantId: currentTenant.id,
                                    name: identity.name,
                                    platform: identity.platform
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        results = _a.sent();
                        if (results.length === 0) {
                            return [2 /*return*/, null];
                        }
                        result = results[0];
                        return [2 /*return*/, result];
                }
            });
        });
    };
    OrganizationRepository.findByDomain = function (domain, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, sequelize, currentTenant, results, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        sequelize = sequelizeRepository_1["default"].getSequelize(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, sequelize.query("\n      SELECT\n      o.id,\n      o.description,\n      o.emails,\n      o.logo,\n      o.tags,\n      o.github,\n      o.twitter,\n      o.linkedin,\n      o.crunchbase,\n      o.employees,\n      o.location,\n      o.website,\n      o.type,\n      o.size,\n      o.headline,\n      o.industry,\n      o.founded,\n      o.attributes,\n      o.\"weakIdentities\"\n    FROM\n      organizations o\n    WHERE\n      o.\"tenantId\" = :tenantId AND \n      o.website = :domain\n      ", {
                                replacements: {
                                    tenantId: currentTenant.id,
                                    domain: domain
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        results = _a.sent();
                        if (results.length === 0) {
                            return [2 /*return*/, null];
                        }
                        result = results[0];
                        return [2 /*return*/, result];
                }
            });
        });
    };
    OrganizationRepository.findIdentities = function (identities, options, organizationId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, sequelize, currentTenant, params, condition, identityParams, results, resultMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        sequelize = sequelizeRepository_1["default"].getSequelize(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        params = {
                            tenantId: currentTenant.id
                        };
                        condition = organizationId ? 'and "organizationId" <> :organizationId' : '';
                        if (organizationId) {
                            params.organizationId = organizationId;
                        }
                        identityParams = identities
                            .map(function (identity, index) { return "(:platform".concat(index, ", :name").concat(index, ")"); })
                            .join(', ');
                        identities.forEach(function (identity, index) {
                            params["platform".concat(index)] = identity.platform;
                            params["name".concat(index)] = identity.name;
                        });
                        return [4 /*yield*/, sequelize.query("\n      with input_identities (platform, name) as (\n        values ".concat(identityParams, "\n      )\n      select \"organizationId\", i.platform, i.name\n      from \"organizationIdentities\" oi\n        inner join input_identities i on oi.platform = i.platform and oi.name = i.name\n      where oi.\"tenantId\" = :tenantId ").concat(condition, "\n    "), {
                                replacements: params,
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        results = (_a.sent());
                        resultMap = new Map();
                        results.forEach(function (row) {
                            resultMap.set("".concat(row.platform, ":").concat(row.name), row.organizationId);
                        });
                        return [2 /*return*/, resultMap];
                }
            });
        });
    };
    OrganizationRepository.findById = function (id, options, segmentId) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var transaction, sequelize, currentTenant, replacements, extraCTEs, query, results, result, manualSyncRemote, _i, manualSyncRemote_1, syncRemote;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        sequelize = sequelizeRepository_1["default"].getSequelize(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        replacements = {
                            id: id,
                            tenantId: currentTenant.id
                        };
                        extraCTEs = "\n      leaf_segment_ids AS (\n        select id\n        from segments\n        where \"tenantId\" = :tenantId and \"parentSlug\" is not null and \"grandparentSlug\" is not null\n      ),\n    ";
                        if (segmentId) {
                            // we load data for a specific segment (can be leaf, parent or grand parent id)
                            replacements.segmentId = segmentId;
                            extraCTEs = "\n        input_segment AS (\n          select\n            id,\n            slug,\n            \"parentSlug\",\n            \"grandparentSlug\"\n          from segments\n          where id = :segmentId\n            and \"tenantId\" = :tenantId\n        ),\n        segment_level AS (\n          select\n            case\n              when \"parentSlug\" is not null and \"grandparentSlug\" is not null\n                  then 'child'\n              when \"parentSlug\" is not null and \"grandparentSlug\" is null\n                  then 'parent'\n              when \"parentSlug\" is null and \"grandparentSlug\" is null\n                  then 'grandparent'\n              end as level,\n            id,\n            slug,\n            \"parentSlug\",\n            \"grandparentSlug\"\n          from input_segment\n        ),\n        leaf_segment_ids AS (\n          select s.id\n          from segments s\n          join segment_level sl on (sl.level = 'child' and s.id = sl.id)\n              or (sl.level = 'parent' and s.\"parentSlug\" = sl.slug and s.\"grandparentSlug\" is not null)\n              or (sl.level = 'grandparent' and s.\"grandparentSlug\" = sl.slug)\n        ),\n      ";
                        }
                        query = "\n      WITH\n        ".concat(extraCTEs, "\n        member_data AS (\n          select\n            a.\"organizationId\",\n            count(distinct a.\"memberId\")                                                        as \"memberCount\",\n            count(distinct a.id)                                                        as \"activityCount\",\n            case\n                when array_agg(distinct a.platform::TEXT) = array [null] then array []::text[]\n                else array_agg(distinct a.platform::TEXT) end                                 as \"activeOn\",\n            max(a.timestamp)                                                            as \"lastActive\",\n            min(a.timestamp) filter ( where a.timestamp <> '1970-01-01T00:00:00.000Z' ) as \"joinedAt\"\n          from leaf_segment_ids ls\n          join mv_activities_cube a on a.\"segmentId\" = ls.id and a.\"organizationId\" = :id\n          group by a.\"organizationId\"\n        ),\n        organization_segments as (\n          select \"organizationId\", array_agg(\"segmentId\") as \"segments\"\n          from \"organizationSegments\"\n          where \"organizationId\" = :id\n          group by \"organizationId\"\n        ),\n        identities as (\n          SELECT oi.\"organizationId\", jsonb_agg(oi) AS \"identities\"\n          FROM \"organizationIdentities\" oi\n          WHERE oi.\"organizationId\" = :id\n          GROUP BY \"organizationId\"\n        )\n        select\n          o.*,\n          coalesce(md.\"activityCount\", 0)::integer as \"activityCount\",\n          coalesce(md.\"memberCount\", 0)::integer   as \"memberCount\",\n          coalesce(md.\"activeOn\", '{}')            as \"activeOn\",\n          coalesce(i.identities, '{}')            as identities,\n          coalesce(os.segments, '{}')              as segments,\n          md.\"lastActive\",\n          md.\"joinedAt\"\n        from organizations o\n        left join member_data md on md.\"organizationId\" = o.id\n        left join organization_segments os on os.\"organizationId\" = o.id\n        left join identities i on i.\"organizationId\" = o.id\n        where o.id = :id\n        and o.\"tenantId\" = :tenantId;\n    ");
                        return [4 /*yield*/, sequelize.query(query, {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 1:
                        results = _c.sent();
                        if (results.length === 0) {
                            throw new common_1.Error404();
                        }
                        result = results[0];
                        return [4 /*yield*/, new organizationSyncRemoteRepository_1["default"](options).findOrganizationManualSync(result.id)];
                    case 2:
                        manualSyncRemote = _c.sent();
                        for (_i = 0, manualSyncRemote_1 = manualSyncRemote; _i < manualSyncRemote_1.length; _i++) {
                            syncRemote = manualSyncRemote_1[_i];
                            if ((_a = result.attributes) === null || _a === void 0 ? void 0 : _a.syncRemote) {
                                result.attributes.syncRemote[syncRemote.platform] = syncRemote.status === types_1.SyncStatus.ACTIVE;
                            }
                            else {
                                result.attributes.syncRemote = (_b = {},
                                    _b[syncRemote.platform] = syncRemote.status === types_1.SyncStatus.ACTIVE,
                                    _b);
                            }
                        }
                        // compatibility issue
                        delete result.searchSyncedAt;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    OrganizationRepository.findByName = function (name, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, include, currentTenant, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        include = [];
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.organization.findOne({
                                where: {
                                    name: name,
                                    tenantId: currentTenant.id
                                },
                                include: include,
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        if (!record) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, record.get({ plain: true })];
                }
            });
        });
    };
    OrganizationRepository.findByUrl = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, include, currentTenant, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        include = [];
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.organization.findOne({
                                where: {
                                    url: url,
                                    tenantId: currentTenant.id
                                },
                                include: include,
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        if (!record) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, record.get({ plain: true })];
                }
            });
        });
    };
    OrganizationRepository.findOrCreateByDomain = function (domain, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentTenant, organization, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.organization.findOne({
                                attributes: ['id'],
                                where: {
                                    website: domain,
                                    tenantId: currentTenant.id
                                },
                                transaction: transaction
                            })];
                    case 1:
                        organization = _a.sent();
                        if (!!organization) return [3 /*break*/, 3];
                        data = {
                            displayName: domain,
                            website: domain,
                            identities: [
                                {
                                    name: domain,
                                    platform: 'email'
                                },
                            ],
                            tenantId: currentTenant.id
                        };
                        return [4 /*yield*/, this.create(data, options)];
                    case 2:
                        organization = _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, organization.id];
                }
            });
        });
    };
    OrganizationRepository.filterIdInTenant = function (id, options) {
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
    OrganizationRepository.filterIdsInTenant = function (ids, options) {
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
                        return [4 /*yield*/, options.database.organization.findAll({
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
    OrganizationRepository.destroyBulk = function (ids, options, force) {
        if (force === void 0) { force = false; }
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentTenant;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, OrganizationRepository.excludeOrganizationsFromSegments(ids, __assign(__assign({}, options), { transaction: transaction }))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, options.database.organization.destroy({
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
    OrganizationRepository.count = function (filter, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, tenant;
            return __generator(this, function (_a) {
                transaction = sequelizeRepository_1["default"].getTransaction(options);
                tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                return [2 /*return*/, options.database.organization.count({
                        where: __assign(__assign({}, filter), { tenantId: tenant.id }),
                        transaction: transaction
                    })];
            });
        });
    };
    OrganizationRepository.findOrganizationActivities = function (organizationId, limit, offset, options) {
        return __awaiter(this, void 0, void 0, function () {
            var seq, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        return [4 /*yield*/, seq.query("select \"id\", \"organizationId\"\n        from \"activities\"\n        where \"organizationId\" = :organizationId\n        order by \"createdAt\"\n        limit :limit offset :offset", {
                                replacements: {
                                    organizationId: organizationId,
                                    limit: limit,
                                    offset: offset
                                },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    };
    OrganizationRepository.findAndCountAllOpensearch = function (_a, options) {
        var _b = _a.filter, filter = _b === void 0 ? {} : _b, _c = _a.limit, limit = _c === void 0 ? 20 : _c, _d = _a.offset, offset = _d === void 0 ? 0 : _d, _e = _a.orderBy, orderBy = _e === void 0 ? 'joinedAt_DESC' : _e, _f = _a.countOnly, countOnly = _f === void 0 ? false : _f, _g = _a.segments, segments = _g === void 0 ? [] : _g, _h = _a.customSortFunction, customSortFunction = _h === void 0 ? undefined : _h;
        return __awaiter(this, void 0, void 0, function () {
            var tenant, segmentsEnabled, segment, translator, parsed, countResponse, response, translatedRows;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (orderBy.length === 0) {
                            orderBy = 'joinedAt_DESC';
                        }
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, (0, isFeatureEnabled_1["default"])(types_1.FeatureFlag.SEGMENTS, options)];
                    case 1:
                        segmentsEnabled = _j.sent();
                        segment = segments[0];
                        translator = opensearch_1.FieldTranslatorFactory.getTranslator(types_1.OpenSearchIndex.ORGANIZATIONS);
                        if (filter.and) {
                            filter.and.push({
                                or: [
                                    {
                                        manuallyCreated: {
                                            eq: true
                                        }
                                    },
                                    {
                                        activityCount: {
                                            gt: 0
                                        }
                                    },
                                ]
                            });
                        }
                        parsed = opensearch_1.OpensearchQueryParser.parse({ filter: filter, limit: limit, offset: offset, orderBy: orderBy }, types_1.OpenSearchIndex.ORGANIZATIONS, translator);
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
                        // exclude empty filters if any
                        parsed.query.bool.must = parsed.query.bool.must.filter(function (obj) {
                            // Check if the object has a non-empty 'term' property
                            if (obj.term) {
                                return Object.keys(obj.term).length !== 0;
                            }
                            return true;
                        });
                        if (customSortFunction) {
                            parsed.sort = customSortFunction;
                        }
                        return [4 /*yield*/, options.opensearch.count({
                                index: types_1.OpenSearchIndex.ORGANIZATIONS,
                                body: { query: parsed.query }
                            })];
                    case 2:
                        countResponse = _j.sent();
                        if (countOnly) {
                            return [2 /*return*/, {
                                    rows: [],
                                    count: countResponse.body.count,
                                    limit: limit,
                                    offset: offset
                                }];
                        }
                        return [4 /*yield*/, options.opensearch.search({
                                index: types_1.OpenSearchIndex.ORGANIZATIONS,
                                body: parsed
                            })];
                    case 3:
                        response = _j.sent();
                        translatedRows = response.body.hits.hits.map(function (o) {
                            return translator.translateObjectToGitmesh(o._source);
                        });
                        return [2 /*return*/, { rows: translatedRows, count: countResponse.body.count, limit: limit, offset: offset }];
                }
            });
        });
    };
    OrganizationRepository.findAndCountAll = function (_a, options) {
        var _b = _a.filter, filter = _b === void 0 ? {} : _b, _c = _a.advancedFilter, advancedFilter = _c === void 0 ? null : _c, _d = _a.limit, limit = _d === void 0 ? 0 : _d, _e = _a.offset, offset = _e === void 0 ? 0 : _e, _f = _a.orderBy, orderBy = _f === void 0 ? '' : _f, _g = _a.includeOrganizationsWithoutMembers, includeOrganizationsWithoutMembers = _g === void 0 ? true : _g;
        return __awaiter(this, void 0, void 0, function () {
            var customOrderBy, include, activeOn, identities, lastActive, joinedAt, memberCount, activityCount, segments, _h, start, end, _j, start, end, parser, parsed, order, _k, rows, count;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        customOrderBy = [];
                        include = [
                            {
                                model: options.database.member,
                                as: 'members',
                                required: !includeOrganizationsWithoutMembers,
                                attributes: [],
                                through: {
                                    attributes: [],
                                    where: {
                                        deletedAt: null
                                    }
                                },
                                include: [
                                    {
                                        model: options.database.activity,
                                        as: 'activities',
                                        attributes: []
                                    },
                                    {
                                        model: options.database.memberIdentity,
                                        as: 'memberIdentities',
                                        attributes: []
                                    },
                                ]
                            },
                            {
                                model: options.database.segment,
                                as: 'segments',
                                attributes: [],
                                through: {
                                    attributes: []
                                }
                            },
                        ];
                        activeOn = sequelize_1["default"].literal("array_agg( distinct  (\"members->activities\".platform) )  filter (where \"members->activities\".platform is not null)");
                        identities = sequelize_1["default"].literal("array_agg( distinct \"members->memberIdentities\".platform)");
                        lastActive = sequelize_1["default"].literal("MAX(\"members->activities\".timestamp)");
                        joinedAt = sequelize_1["default"].literal("\n        MIN(\n          CASE\n            WHEN \"members->activities\".timestamp != '1970-01-01T00:00:00.000Z'\n            THEN \"members->activities\".timestamp\n          END\n        )\n      ");
                        memberCount = sequelize_1["default"].literal("COUNT(DISTINCT \"members\".id)::integer");
                        activityCount = sequelize_1["default"].literal("COUNT(\"members->activities\".id)::integer");
                        segments = sequelize_1["default"].literal("ARRAY_AGG(DISTINCT \"segments->organizationSegments\".\"segmentId\")");
                        // If the advanced filter is empty, we construct it from the query parameter filter
                        if (!advancedFilter) {
                            advancedFilter = { and: [] };
                            if (filter.id) {
                                advancedFilter.and.push({
                                    id: filter.id
                                });
                            }
                            if (filter.displayName) {
                                advancedFilter.and.push({
                                    displayName: {
                                        textContains: filter.displayName
                                    }
                                });
                            }
                            if (filter.description) {
                                advancedFilter.and.push({
                                    description: {
                                        textContains: filter.description
                                    }
                                });
                            }
                            if (filter.emails) {
                                if (typeof filter.emails === 'string') {
                                    filter.emails = filter.emails.split(',');
                                }
                                advancedFilter.and.push({
                                    emails: {
                                        overlap: filter.emails
                                    }
                                });
                            }
                            if (filter.phoneNumbers) {
                                if (typeof filter.phoneNumbers === 'string') {
                                    filter.phoneNumbers = filter.phoneNumbers.split(',');
                                }
                                advancedFilter.and.push({
                                    phoneNumbers: {
                                        overlap: filter.phoneNumbers
                                    }
                                });
                            }
                            if (filter.tags) {
                                if (typeof filter.tags === 'string') {
                                    filter.tags = filter.tags.split(',');
                                }
                                advancedFilter.and.push({
                                    tags: {
                                        overlap: filter.tags
                                    }
                                });
                            }
                            if (filter.twitter) {
                                advancedFilter.and.push({
                                    twitter: {
                                        textContains: filter.twitter
                                    }
                                });
                            }
                            if (filter.linkedin) {
                                advancedFilter.and.push({
                                    linkedin: {
                                        textContains: filter.linkedin
                                    }
                                });
                            }
                            if (filter.crunchbase) {
                                advancedFilter.and.push({
                                    crunchbase: {
                                        textContains: filter.crunchbase
                                    }
                                });
                            }
                            if (filter.employeesRange) {
                                _h = filter.employeesRange, start = _h[0], end = _h[1];
                                if (start !== undefined && start !== null && start !== '') {
                                    advancedFilter.and.push({
                                        employees: {
                                            gte: start
                                        }
                                    });
                                }
                                if (end !== undefined && end !== null && end !== '') {
                                    advancedFilter.and.push({
                                        employees: {
                                            lte: end
                                        }
                                    });
                                }
                            }
                            if (filter.revenueMin) {
                                advancedFilter.and.push({
                                    revenueMin: {
                                        gte: filter.revenueMin
                                    }
                                });
                            }
                            if (filter.revenueMax) {
                                advancedFilter.and.push({
                                    revenueMax: {
                                        lte: filter.revenueMax
                                    }
                                });
                            }
                            if (filter.members) {
                                advancedFilter.and.push({
                                    members: filter.members
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
                        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1["default"].customOrderByIfExists('lastActive', orderBy));
                        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1["default"].customOrderByIfExists('joinedAt', orderBy));
                        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1["default"].customOrderByIfExists('activityCount', orderBy));
                        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1["default"].customOrderByIfExists('memberCount', orderBy));
                        parser = new queryParser_1["default"]({
                            nestedFields: {
                                twitter: 'twitter.handle',
                                linkedin: 'linkedin.handle',
                                crunchbase: 'crunchbase.handle',
                                revenueMin: 'revenueRange.min',
                                revenueMax: 'revenueRange.max',
                                revenue: 'revenueRange.min'
                            },
                            aggregators: __assign(__assign({}, sequelizeFilterUtils_1["default"].getNativeTableFieldAggregations([
                                'id',
                                'displayName',
                                'description',
                                'emails',
                                'phoneNumbers',
                                'logo',
                                'tags',
                                'website',
                                'location',
                                'github',
                                'twitter',
                                'linkedin',
                                'crunchbase',
                                'employees',
                                'revenueRange',
                                'importHash',
                                'createdAt',
                                'updatedAt',
                                'deletedAt',
                                'tenantId',
                                'createdById',
                                'updatedById',
                                'isTeamOrganization',
                                'type',
                                'attributes',
                                'manuallyCreated',
                            ], 'organization')), { activeOn: activeOn, identities: identities, lastActive: lastActive, joinedAt: joinedAt, memberCount: memberCount, activityCount: activityCount, segments: segments }),
                            manyToMany: {
                                members: {
                                    table: 'organizations',
                                    model: 'organization',
                                    relationTable: {
                                        name: 'memberOrganizations',
                                        from: 'organizationId',
                                        to: 'memberId'
                                    }
                                },
                                segments: {
                                    table: 'organizations',
                                    model: 'organization',
                                    relationTable: {
                                        name: 'organizationSegments',
                                        from: 'organizationId',
                                        to: 'segmentId'
                                    }
                                }
                            }
                        }, options);
                        parsed = parser.parse({
                            filter: advancedFilter,
                            orderBy: orderBy || ['createdAt_DESC'],
                            limit: limit,
                            offset: offset
                        });
                        order = parsed.order;
                        if (customOrderBy.length > 0) {
                            order = [customOrderBy];
                        }
                        else if (orderBy) {
                            order = [orderBy.split('_')];
                        }
                        return [4 /*yield*/, options.database.organization.findAndCountAll(__assign(__assign(__assign({}, (parsed.where ? { where: parsed.where } : {})), (parsed.having ? { having: parsed.having } : {})), { attributes: __spreadArray(__spreadArray([], sequelizeFilterUtils_1["default"].getLiteralProjections([
                                    'id',
                                    'displayName',
                                    'description',
                                    'emails',
                                    'phoneNumbers',
                                    'logo',
                                    'tags',
                                    'website',
                                    'location',
                                    'github',
                                    'twitter',
                                    'linkedin',
                                    'crunchbase',
                                    'employees',
                                    'revenueRange',
                                    'importHash',
                                    'createdAt',
                                    'updatedAt',
                                    'deletedAt',
                                    'tenantId',
                                    'createdById',
                                    'updatedById',
                                    'isTeamOrganization',
                                    'type',
                                    'ticker',
                                    'size',
                                    'naics',
                                    'lastEnrichedAt',
                                    'industry',
                                    'headline',
                                    'geoLocation',
                                    'founded',
                                    'employeeCountByCountry',
                                    'address',
                                    'profiles',
                                    'attributes',
                                    'manuallyCreated',
                                    'affiliatedProfiles',
                                    'allSubsidiaries',
                                    'alternativeDomains',
                                    'alternativeNames',
                                    'averageEmployeeTenure',
                                    'averageTenureByLevel',
                                    'averageTenureByRole',
                                    'directSubsidiaries',
                                    'employeeChurnRate',
                                    'employeeCountByMonth',
                                    'employeeGrowthRate',
                                    'employeeCountByMonthByLevel',
                                    'employeeCountByMonthByRole',
                                    'gicsSector',
                                    'grossAdditionsByMonth',
                                    'grossDeparturesByMonth',
                                    'ultimateParent',
                                    'immediateParent',
                                ], 'organization'), true), [
                                    [activeOn, 'activeOn'],
                                    [identities, 'identities'],
                                    [lastActive, 'lastActive'],
                                    [joinedAt, 'joinedAt'],
                                    [memberCount, 'memberCount'],
                                    [activityCount, 'activityCount'],
                                    [segments, 'segmentIds'],
                                ], false), order: order, limit: parsed.limit, offset: parsed.offset, include: include, subQuery: false, group: ['organization.id'], transaction: sequelizeRepository_1["default"].getTransaction(options) }))];
                    case 1:
                        _k = _l.sent(), rows = _k.rows, count = _k.count;
                        return [4 /*yield*/, this._populateRelationsForRows(rows)];
                    case 2:
                        rows = _l.sent();
                        return [2 /*return*/, { rows: rows, count: count.length, limit: parsed.limit, offset: parsed.offset }];
                }
            });
        });
    };
    OrganizationRepository.findAllAutocomplete = function (query, limit, options) {
        return __awaiter(this, void 0, void 0, function () {
            var tenant, segmentIds, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        segmentIds = sequelizeRepository_1["default"].getSegmentIds(options);
                        return [4 /*yield*/, options.database.sequelize.query("\n        SELECT\n            DISTINCT\n            o.\"id\",\n            o.\"displayName\" AS label,\n            o.\"logo\",\n            o.\"displayName\" ILIKE :queryExact AS exact\n        FROM \"organizations\" AS o\n        JOIN \"organizationSegments\" os ON os.\"organizationId\" = o.id\n        WHERE o.\"deletedAt\" IS NULL\n          AND o.\"tenantId\" = :tenantId\n          AND (o.\"displayName\" ILIKE :queryLike OR o.id = :uuid)\n          AND os.\"segmentId\" IN (:segmentIds)\n          AND os.\"tenantId\" = :tenantId\n        ORDER BY o.\"displayName\" ILIKE :queryExact DESC, o.\"displayName\"\n        LIMIT :limit;\n      ", {
                                replacements: {
                                    limit: limit ? Number(limit) : 20,
                                    tenantId: tenant.id,
                                    segmentIds: segmentIds,
                                    queryLike: "%".concat(query, "%"),
                                    queryExact: query,
                                    uuid: validator_1["default"].isUUID(query) ? query : null
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                raw: true
                            })];
                    case 1:
                        records = _a.sent();
                        return [2 /*return*/, records];
                }
            });
        });
    };
    OrganizationRepository._createAuditLog = function (action, record, data, options) {
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
                                entityName: 'organization',
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
    OrganizationRepository._populateRelationsForRows = function (rows) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!rows) {
                    return [2 /*return*/, rows];
                }
                return [2 /*return*/, rows.map(function (record) {
                        var _a, _b;
                        var rec = record.get({ plain: true });
                        rec.activeOn = (_a = rec.activeOn) !== null && _a !== void 0 ? _a : [];
                        rec.segments = (_b = rec.segmentIds) !== null && _b !== void 0 ? _b : [];
                        delete rec.segmentIds;
                        return rec;
                    })];
            });
        });
    };
    return OrganizationRepository;
}());
exports["default"] = OrganizationRepository;
