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
var lodash_1 = __importDefault(require("lodash"));
var common_1 = require("@gitmesh/common");
var sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
var auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
var OrganizationCacheRepository = /** @class */ (function () {
    function OrganizationCacheRepository() {
    }
    OrganizationCacheRepository.create = function (data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.organizationCache.create(__assign({}, lodash_1["default"].pick(data, [
                                'name',
                                'url',
                                'description',
                                'emails',
                                'phoneNumbers',
                                'logo',
                                'tags',
                                'twitter',
                                'linkedin',
                                'crunchbase',
                                'employees',
                                'revenueRange',
                                'importHash',
                                'enriched',
                                'website',
                                'github',
                                'location',
                                'employeeCountByCountry',
                                'type',
                                'ticker',
                                'headline',
                                'profiles',
                                'naics',
                                'industry',
                                'founded',
                                'address',
                                'size',
                                'lastEnrichedAt',
                                'manuallyCreated',
                            ])), {
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
    OrganizationCacheRepository.update = function (id, data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.organizationCache.findOne({
                                where: {
                                    id: id
                                },
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        return [4 /*yield*/, record.update(__assign({}, lodash_1["default"].pick(data, [
                                'name',
                                'url',
                                'description',
                                'emails',
                                'phoneNumbers',
                                'logo',
                                'tags',
                                'twitter',
                                'linkedin',
                                'crunchbase',
                                'employees',
                                'revenueRange',
                                'importHash',
                                'enriched',
                                'website',
                                'github',
                                'location',
                                'geoLocation',
                                'employeeCountByCountry',
                                'geoLocation',
                                'address',
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
                            ])), {
                                transaction: transaction
                            })];
                    case 2:
                        record = _a.sent();
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        return [4 /*yield*/, this._createAuditLog(auditLogRepository_1["default"].UPDATE, record, data, options)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.findById(record.id, options)];
                }
            });
        });
    };
    OrganizationCacheRepository.bulkUpdate = function (data, options, isEnrichment) {
        if (isEnrichment === void 0) { isEnrichment = false; }
        return __awaiter(this, void 0, void 0, function () {
            var transaction, existingRecords_1, _i, data_1, org;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        if (!isEnrichment) return [3 /*break*/, 2];
                        return [4 /*yield*/, options.database.organizationCache.findAll({
                                where: {
                                    id: (_a = {},
                                        _a[options.database.Sequelize.Op["in"]] = data.map(function (x) { return x.id; }),
                                        _a)
                                },
                                transaction: transaction
                            })
                            // Merge existing tags with new tags instead of overwriting
                        ];
                    case 1:
                        existingRecords_1 = _b.sent();
                        // Merge existing tags with new tags instead of overwriting
                        data = data.map(function (org) {
                            var existingOrg = existingRecords_1.find(function (record) { return record.id === org.id; });
                            if (existingOrg && existingOrg.tags) {
                                // Merge existing and new tags without duplicates
                                org.tags = lodash_1["default"].uniq(__spreadArray(__spreadArray([], org.tags, true), existingOrg.tags, true));
                            }
                            return org;
                        });
                        _b.label = 2;
                    case 2:
                        for (_i = 0, data_1 = data; _i < data_1.length; _i++) {
                            org = data_1[_i];
                            this.update(org.id, org, options);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    OrganizationCacheRepository.destroy = function (id, options, force) {
        if (force === void 0) { force = false; }
        return __awaiter(this, void 0, void 0, function () {
            var transaction, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.organizationCache.findOne({
                                where: {
                                    id: id
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
    OrganizationCacheRepository.findById = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, include, record, output;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        include = [];
                        return [4 /*yield*/, options.database.organizationCache.findOne({
                                where: {
                                    id: id
                                },
                                include: include,
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        if (!record) {
                            throw new common_1.Error404();
                        }
                        output = record.get({ plain: true });
                        return [2 /*return*/, output];
                }
            });
        });
    };
    OrganizationCacheRepository.findByUrl = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, include, record, output;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        include = [];
                        return [4 /*yield*/, options.database.organizationCache.findOne({
                                where: {
                                    url: url
                                },
                                include: include,
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        if (!record) {
                            return [2 /*return*/, undefined];
                        }
                        output = record.get({ plain: true });
                        return [2 /*return*/, output];
                }
            });
        });
    };
    OrganizationCacheRepository.findByName = function (name, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, include, record, output;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        include = [];
                        return [4 /*yield*/, options.database.organizationCache.findOne({
                                where: {
                                    name: name
                                },
                                include: include,
                                transaction: transaction
                            })];
                    case 1:
                        record = _a.sent();
                        if (!record) {
                            return [2 /*return*/, undefined];
                        }
                        output = record.get({ plain: true });
                        return [2 /*return*/, output];
                }
            });
        });
    };
    OrganizationCacheRepository._createAuditLog = function (action, record, data, options) {
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
                                entityName: 'organizationCache',
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
    return OrganizationCacheRepository;
}());
exports["default"] = OrganizationCacheRepository;
