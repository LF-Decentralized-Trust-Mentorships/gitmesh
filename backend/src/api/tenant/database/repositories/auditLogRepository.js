"use strict";
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
var sequelize_1 = __importStar(require("sequelize"));
var sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
var sequelizeFilterUtils_1 = __importDefault(require("../utils/sequelizeFilterUtils"));
var Op = sequelize_1["default"].Op;
var AuditLogRepository = /** @class */ (function () {
    function AuditLogRepository() {
    }
    Object.defineProperty(AuditLogRepository, "CREATE", {
        get: function () {
            return 'create';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AuditLogRepository, "UPDATE", {
        get: function () {
            return 'update';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AuditLogRepository, "DELETE", {
        get: function () {
            return 'delete';
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Saves an Audit Log to the database.
     *
     * @param  {Object} log - The log being saved.
     * @param  {string} log.entityName - The name of the entity. Ex.: customer
     * @param  {string} log.entityId - The id of the entity.
     * @param  {string} log.action - The action [create, update or delete].
     * @param  {Object} log.values - The JSON log value with data of the entity.
     *
     * @param  {Object} options
     * @param  {Object} options.transaction - The current database transaction.
     * @param  {Object} options.currentUser - The current logged user.
     * @param  {Object} options.currentTenant - The current currentTenant.
     */
    AuditLogRepository.log = function (_a, options) {
        var entityName = _a.entityName, entityId = _a.entityId, action = _a.action, values = _a.values;
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentTenant, log;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentTenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.auditLog.create({
                                entityName: entityName,
                                tenantId: currentTenant.id,
                                entityId: entityId,
                                action: action,
                                values: values,
                                timestamp: new Date(),
                                createdById: options && options.currentUser ? options.currentUser.id : null,
                                createdByEmail: options && options.currentUser ? options.currentUser.email : null
                            }, { transaction: transaction })];
                    case 1:
                        log = _b.sent();
                        return [2 /*return*/, log];
                }
            });
        });
    };
    AuditLogRepository.cleanUpOldAuditLogs = function (maxMonthsToKeep, options) {
        return __awaiter(this, void 0, void 0, function () {
            var seq;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seq = sequelizeRepository_1["default"].getSequelize(options);
                        return [4 /*yield*/, seq.query("\n      delete from \"auditLogs\" where timestamp < now() - interval '".concat(maxMonthsToKeep, " months'\n      "), {
                                type: sequelize_1.QueryTypes.DELETE
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AuditLogRepository.findAndCountAll = function (_a, options) {
        var filter = _a.filter, _b = _a.limit, limit = _b === void 0 ? 0 : _b, _c = _a.offset, offset = _c === void 0 ? 0 : _c, _d = _a.orderBy, orderBy = _d === void 0 ? '' : _d;
        return __awaiter(this, void 0, void 0, function () {
            var tenant, whereAnd, include, _e, start, end, where;
            var _f, _g, _h, _j, _k;
            return __generator(this, function (_l) {
                tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                whereAnd = [];
                include = [];
                whereAnd.push({
                    tenantId: tenant.id
                });
                if (filter) {
                    if (filter.timestampRange) {
                        _e = filter.timestampRange, start = _e[0], end = _e[1];
                        if (start !== undefined && start !== null && start !== '') {
                            whereAnd.push({
                                timestamp: (_f = {},
                                    _f[Op.gte] = start,
                                    _f)
                            });
                        }
                        if (end !== undefined && end !== null && end !== '') {
                            whereAnd.push({
                                timestamp: (_g = {},
                                    _g[Op.lte] = end,
                                    _g)
                            });
                        }
                    }
                    if (filter.action) {
                        whereAnd.push({
                            action: filter.action
                        });
                    }
                    if (filter.entityId) {
                        whereAnd.push({
                            entityId: filter.entityId
                        });
                    }
                    if (filter.createdByEmail) {
                        whereAnd.push((_h = {},
                            _h[Op.and] = sequelizeFilterUtils_1["default"].ilikeIncludes('auditLog', 'createdByEmail', filter.createdByEmail),
                            _h));
                    }
                    if (filter.entityNames && filter.entityNames.length) {
                        whereAnd.push({
                            entityName: (_j = {},
                                _j[Op["in"]] = filter.entityNames,
                                _j)
                        });
                    }
                }
                where = (_k = {}, _k[Op.and] = whereAnd, _k);
                return [2 /*return*/, options.database.auditLog.findAndCountAll({
                        where: where,
                        include: include,
                        limit: limit ? Number(limit) : undefined,
                        offset: offset ? Number(offset) : undefined,
                        order: orderBy ? [orderBy.split('_')] : [['timestamp', 'DESC']]
                    })];
            });
        });
    };
    return AuditLogRepository;
}());
exports["default"] = AuditLogRepository;
