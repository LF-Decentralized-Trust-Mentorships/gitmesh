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
exports.RepositoryBase = void 0;
var auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
var sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
var RepositoryBase = /** @class */ (function () {
    function RepositoryBase(options, log) {
        if (log === void 0) { log = false; }
        this.options = options;
        this.log = log;
    }
    Object.defineProperty(RepositoryBase.prototype, "currentUser", {
        get: function () {
            return sequelizeRepository_1["default"].getCurrentUser(this.options);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RepositoryBase.prototype, "currentTenant", {
        get: function () {
            return sequelizeRepository_1["default"].getCurrentTenant(this.options);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RepositoryBase.prototype, "transaction", {
        get: function () {
            return sequelizeRepository_1["default"].getTransaction(this.options);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RepositoryBase.prototype, "seq", {
        get: function () {
            return sequelizeRepository_1["default"].getSequelize(this.options);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RepositoryBase.prototype, "database", {
        get: function () {
            return this.options.database;
        },
        enumerable: false,
        configurable: true
    });
    RepositoryBase.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Method not implemented.');
            });
        });
    };
    RepositoryBase.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Method not implemented.');
            });
        });
    };
    RepositoryBase.prototype.destroy = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.destroyAll([id])];
            });
        });
    };
    RepositoryBase.prototype.destroyAll = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Method not implemented.');
            });
        });
    };
    RepositoryBase.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Method not implemented.');
            });
        });
    };
    RepositoryBase.prototype.findAndCountAll = function (criteria) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Method not implemented.');
            });
        });
    };
    RepositoryBase.prototype.findAll = function (criteria) {
        return __awaiter(this, void 0, void 0, function () {
            var copy, page;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        copy = __assign({}, criteria);
                        // let's initially load just the first row in the db to see how many elements there are in total
                        copy.offset = undefined;
                        copy.limit = undefined;
                        return [4 /*yield*/, this.findAndCountAll(criteria)];
                    case 1:
                        page = _a.sent();
                        return [2 /*return*/, page.rows];
                }
            });
        });
    };
    RepositoryBase.prototype.createAuditLog = function (entity, action, record, data) {
        return __awaiter(this, void 0, void 0, function () {
            var values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.log) return [3 /*break*/, 2];
                        values = {};
                        if (data) {
                            values = __assign({}, record.get({ plain: true }));
                        }
                        return [4 /*yield*/, auditLogRepository_1["default"].log({
                                entityName: entity,
                                entityId: record.id,
                                action: action,
                                values: values
                            }, this.options)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    RepositoryBase.prototype.populateRelationsForRows = function (rows) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all(rows.map(function (r) { return _this.populateRelations(r); }))];
            });
        });
    };
    RepositoryBase.prototype.populateRelations = function (record) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!record)
                    return [2 /*return*/, record];
                return [2 /*return*/, record.get({ plain: true })];
            });
        });
    };
    RepositoryBase.prototype.isPaginationValid = function (criteria) {
        if (criteria.limit !== undefined && criteria.offset !== undefined) {
            return criteria.limit > 0 && criteria.offset >= 0;
        }
        return false;
    };
    RepositoryBase.prototype.getPaginationString = function (criteria) {
        if (this.isPaginationValid(criteria)) {
            return "limit ".concat(criteria.limit, " offset ").concat(criteria.offset);
        }
        return '';
    };
    return RepositoryBase;
}());
exports.RepositoryBase = RepositoryBase;
