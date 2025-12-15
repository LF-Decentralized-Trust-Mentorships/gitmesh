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
exports.ANALYTICS_PLATORM_NAME = void 0;
var axios_1 = __importDefault(require("axios"));
var logging_1 = require("@gitmesh/logging");
var conf_1 = require("../conf");
var userRepository_1 = __importDefault(require("../database/repositories/userRepository"));
var tenantRepository_1 = __importDefault(require("../database/repositories/tenantRepository"));
var sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
var IS_ANALYTICS_ENABLED = conf_1.ANALYTICS_CONFIG.isEnabled === 'true';
var ANALYTICS_TENANT_ID = conf_1.ANALYTICS_CONFIG.tenantId;
var ANALYTICS_BASE_URL = conf_1.ANALYTICS_CONFIG.baseUrl;
var ANALYTICS_TOKEN = conf_1.ANALYTICS_CONFIG.apiToken;
exports.ANALYTICS_PLATORM_NAME = 'gitmesh.dev-analytics';
var log = (0, logging_1.getServiceChildLogger)('segment');
var expandAttributes = function (attributes) {
    var obj = {};
    Object.keys(attributes).forEach(function (key) {
        var _a;
        obj[key.toLowerCase()] = (_a = {},
            _a[exports.ANALYTICS_PLATORM_NAME] = attributes[key],
            _a);
    });
    return obj;
};
function addProductData(data) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        var repositoryOptions, user, tenant, timestamp, obj, endpoint, error_1;
        var _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!IS_ANALYTICS_ENABLED) {
                        return [2 /*return*/];
                    }
                    if (!ANALYTICS_TENANT_ID) {
                        return [2 /*return*/];
                    }
                    if (!ANALYTICS_BASE_URL) {
                        return [2 /*return*/];
                    }
                    if (!ANALYTICS_TOKEN) {
                        return [2 /*return*/];
                    }
                    if (!(data === null || data === void 0 ? void 0 : data.userId)) {
                        // we can't send data without a user id
                        return [2 /*return*/];
                    }
                    if (!(data === null || data === void 0 ? void 0 : data.tenantId)) {
                        // we can't send data without a tenant id
                        return [2 /*return*/];
                    }
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, sequelizeRepository_1["default"].getDefaultIRepositoryOptions()];
                case 2:
                    repositoryOptions = _f.sent();
                    return [4 /*yield*/, userRepository_1["default"].findById(data.userId, repositoryOptions)
                        // this is an array of one tenant
                    ];
                case 3:
                    user = _f.sent();
                    return [4 /*yield*/, tenantRepository_1["default"].getTenantInfo(data.tenantId, repositoryOptions)];
                case 4:
                    tenant = _f.sent();
                    timestamp = data.timestamp || new Date().toISOString();
                    obj = {
                        member: {
                            username: (_e = {},
                                _e[exports.ANALYTICS_PLATORM_NAME] = user.email,
                                _e),
                            emails: [user.email],
                            displayName: user.fullName,
                            attributes: __assign({}, expandAttributes({
                                email: user.email,
                                createdAnAccount: true,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                plan: (_a = tenant[0]) === null || _a === void 0 ? void 0 : _a.plan,
                                isTrialPlan: (_b = tenant[0]) === null || _b === void 0 ? void 0 : _b.isTrialPlan,
                                trialEndsAt: (_c = tenant[0]) === null || _c === void 0 ? void 0 : _c.trialEndsAt
                            })),
                            organizations: [
                                {
                                    name: (_d = tenant[0]) === null || _d === void 0 ? void 0 : _d.name
                                },
                            ]
                        },
                        type: data.event,
                        timestamp: timestamp,
                        platform: exports.ANALYTICS_PLATORM_NAME,
                        sourceId: "".concat(data.userId, "-").concat(timestamp, "-").concat(data.event)
                    };
                    endpoint = "".concat(ANALYTICS_BASE_URL, "/tenant/").concat(ANALYTICS_TENANT_ID, "/activity/with-member");
                    return [4 /*yield*/, axios_1["default"].post(endpoint, obj, {
                            headers: {
                                Authorization: "Bearer ".concat(ANALYTICS_TOKEN)
                            }
                        })];
                case 5:
                    _f.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _f.sent();
                    log.error(error_1, { data: data }, 'ERROR: Could not send the following payload to Gitmesh Analytics');
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports["default"] = addProductData;
