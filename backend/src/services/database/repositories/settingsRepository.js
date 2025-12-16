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
var get_1 = __importDefault(require("lodash/get"));
var sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
var auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
var segmentService_1 = __importDefault(require("../../services/segmentService"));
var SettingsRepository = /** @class */ (function () {
    function SettingsRepository() {
    }
    SettingsRepository.findOrCreateDefault = function (defaults, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, tenant, settings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        return [4 /*yield*/, options.database.settings.findOrCreate({
                                where: { id: tenant.id, tenantId: tenant.id },
                                defaults: __assign(__assign({}, defaults), { id: tenant.id, tenantId: tenant.id, createdById: currentUser ? currentUser.id : null }),
                                transaction: sequelizeRepository_1["default"].getTransaction(options)
                            })];
                    case 1:
                        settings = (_a.sent())[0];
                        return [2 /*return*/, this._populateRelations(settings, options)];
                }
            });
        });
    };
    SettingsRepository.save = function (data, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var transaction, currentUser, tenant, settings;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        currentUser = sequelizeRepository_1["default"].getCurrentUser(options);
                        tenant = sequelizeRepository_1["default"].getCurrentTenant(options);
                        data.backgroundImageUrl = (0, get_1["default"])(data, 'backgroundImages[0].downloadUrl', null);
                        data.logoUrl = (0, get_1["default"])(data, 'logos[0].downloadUrl', null);
                        if (typeof data.slackWebHook !== 'string' ||
                            (typeof data.slackWebHook === 'string' && !((_a = data.slackWebHook) === null || _a === void 0 ? void 0 : _a.startsWith('https://')))) {
                            data.slackWebHook = undefined;
                        }
                        return [4 /*yield*/, options.database.settings.findOrCreate({
                                where: { id: tenant.id, tenantId: tenant.id },
                                defaults: __assign(__assign({}, data), { id: tenant.id, tenantId: tenant.id, createdById: currentUser ? currentUser.id : null }),
                                transaction: transaction
                            })];
                    case 1:
                        settings = (_b.sent())[0];
                        return [4 /*yield*/, settings.update(data, {
                                transaction: transaction
                            })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, auditLogRepository_1["default"].log({
                                entityName: 'settings',
                                entityId: settings.id,
                                action: auditLogRepository_1["default"].UPDATE,
                                values: data
                            }, options)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, this._populateRelations(settings, options)];
                }
            });
        });
    };
    SettingsRepository.getTenantSettings = function (tenantId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, settings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transaction = sequelizeRepository_1["default"].getTransaction(options);
                        return [4 /*yield*/, options.database.settings.findOne({
                                where: { tenantId: tenantId },
                                transaction: transaction
                            })];
                    case 1:
                        settings = _a.sent();
                        return [2 /*return*/, settings];
                }
            });
        });
    };
    SettingsRepository._populateRelations = function (record, options) {
        return __awaiter(this, void 0, void 0, function () {
            var activityTypes, settings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!record) {
                            return [2 /*return*/, record];
                        }
                        return [4 /*yield*/, segmentService_1["default"].getTenantActivityTypes(options.currentSegments)];
                    case 1:
                        activityTypes = _a.sent();
                        settings = record.get({ plain: true });
                        settings.activityTypes = activityTypes;
                        settings.slackWebHook = !!settings.slackWebHook;
                        return [2 /*return*/, settings];
                }
            });
        });
    };
    return SettingsRepository;
}());
exports["default"] = SettingsRepository;
