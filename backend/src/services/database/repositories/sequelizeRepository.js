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
var lodash_1 = __importDefault(require("lodash"));
var sequelize_1 = require("sequelize");
var logging_1 = require("@gitmesh/logging");
var redis_1 = require("@gitmesh/redis");
var feature_flags_1 = require("@gitmesh/feature-flags");
var types_1 = require("@gitmesh/types");
var common_1 = require("@gitmesh/common");
var temporal_1 = require("@gitmesh/temporal");
var conf_1 = require("../../conf");
var databaseConnection_1 = require("../databaseConnection");
/**
 * Abstracts some basic Sequelize operations.
 * See https://sequelize.org/v5/index.html to learn how to customize it.
 */
var SequelizeRepository = /** @class */ (function () {
    function SequelizeRepository() {
    }
    /**
     * Cleans the database.
     */
    SequelizeRepository.cleanDatabase = function (database) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!conf_1.IS_TEST_ENV) {
                            throw new Error('Clean database only allowed for test!');
                        }
                        return [4 /*yield*/, database.sequelize.sync({ force: true })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SequelizeRepository.getDefaultIRepositoryOptions = function (user, tenant, segments) {
        return __awaiter(this, void 0, void 0, function () {
            var unleash, temporal;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(conf_1.UNLEASH_CONFIG.url && conf_1.API_CONFIG.edition === types_1.Edition.HOSTED)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, feature_flags_1.getUnleashClient)({
                                url: conf_1.UNLEASH_CONFIG.url,
                                apiKey: conf_1.UNLEASH_CONFIG.backendApiKey,
                                appName: common_1.SERVICE
                            })];
                    case 1:
                        unleash = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!conf_1.TEMPORAL_CONFIG.serverUrl) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, temporal_1.getTemporalClient)(conf_1.TEMPORAL_CONFIG)];
                    case 3:
                        temporal = _b.sent();
                        _b.label = 4;
                    case 4:
                        _a = {
                            log: (0, logging_1.getServiceLogger)()
                        };
                        return [4 /*yield*/, (0, databaseConnection_1.databaseInit)()];
                    case 5:
                        _a.database = _b.sent(),
                            _a.currentTenant = tenant,
                            _a.currentUser = user,
                            _a.currentSegments = segments,
                            _a.bypassPermissionValidation = true,
                            _a.language = 'en';
                        return [4 /*yield*/, (0, redis_1.getRedisClient)(conf_1.REDIS_CONFIG, true)];
                    case 6: return [2 /*return*/, (_a.redis = _b.sent(),
                            _a.unleash = unleash,
                            _a.temporal = temporal,
                            _a)];
                }
            });
        });
    };
    /**
     * Returns the currentUser if it exists on the options.
     */
    SequelizeRepository.getCurrentUser = function (options) {
        return (options && options.currentUser) || { id: null };
    };
    /**
     * Returns the tenant if it exists on the options.
     */
    SequelizeRepository.getCurrentTenant = function (options) {
        return (options && options.currentTenant) || { id: null };
    };
    SequelizeRepository.getCurrentSegments = function (options) {
        return (options && options.currentSegments) || [];
    };
    SequelizeRepository.getStrictlySingleActiveSegment = function (options) {
        if (options.currentSegments.length !== 1) {
            throw new common_1.Error400("This operation can have exactly one segment. Found ".concat(options.currentSegments.length, " segments."));
        }
        return options.currentSegments[0];
    };
    /**
     * Returns the transaction if it exists on the options.
     */
    SequelizeRepository.getTransaction = function (options) {
        return (options && options.transaction) || undefined;
    };
    /**
     * Creates a database transaction.
     */
    SequelizeRepository.createTransaction = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (options.transaction) {
                    if (options.transaction.gitmeshNestedTransactions !== undefined) {
                        options.transaction.gitmeshNestedTransactions++;
                    }
                    else {
                        options.transaction.gitmeshNestedTransactions = 1;
                    }
                    return [2 /*return*/, options.transaction];
                }
                return [2 /*return*/, options.database.sequelize.transaction()];
            });
        });
    };
    /**
     * Creates a transactional repository options instance
     */
    SequelizeRepository.createTransactionalRepositoryOptions = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createTransaction(options)];
                    case 1:
                        transaction = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, options), { transaction: transaction })];
                }
            });
        });
    };
    /**
     * Commits a database transaction.
     */
    SequelizeRepository.commitTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (transaction.gitmeshNestedTransactions !== undefined &&
                    transaction.gitmeshNestedTransactions > 0) {
                    transaction.gitmeshNestedTransactions--;
                    return [2 /*return*/, Promise.resolve()];
                }
                return [2 /*return*/, transaction.commit()];
            });
        });
    };
    /**
     * Rolls back a database transaction.
     */
    SequelizeRepository.rollbackTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (transaction.gitmeshNestedTransactions !== undefined &&
                    transaction.gitmeshNestedTransactions > 0) {
                    transaction.gitmeshNestedTransactions--;
                    return [2 /*return*/, Promise.resolve()];
                }
                return [2 /*return*/, transaction.rollback()];
            });
        });
    };
    SequelizeRepository.handleUniqueFieldError = function (error, language, entityName) {
        if (!(error instanceof sequelize_1.UniqueConstraintError)) {
            return;
        }
        var fieldName = lodash_1["default"].get(error, 'errors[0].path');
        throw new common_1.Error400(language, "entities.".concat(entityName, ".errors.unique.").concat(fieldName));
    };
    SequelizeRepository.getSequelize = function (options) {
        return options.database.sequelize;
    };
    SequelizeRepository.getSegmentIds = function (options) {
        return options.currentSegments.map(function (s) { return s.id; });
    };
    return SequelizeRepository;
}());
exports["default"] = SequelizeRepository;
