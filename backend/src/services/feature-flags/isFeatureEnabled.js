"use strict";
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
var _a, _b, _c, _d, _e;
exports.__esModule = true;
exports.PLAN_LIMITS = void 0;
var feature_flags_1 = require("@gitmesh/feature-flags");
var types_1 = require("@gitmesh/types");
var plans_1 = __importDefault(require("../security/plans"));
var getFeatureFlagTenantContext_1 = __importDefault(require("./getFeatureFlagTenantContext"));
exports.PLAN_LIMITS = (_a = {},
    _a[plans_1["default"].values.essential] = (_b = {},
        _b[types_1.FeatureFlag.AUTOMATIONS] = 2,
        _b[types_1.FeatureFlag.CSV_EXPORT] = 2,
        _b),
    _a[plans_1["default"].values.growth] = (_c = {},
        _c[types_1.FeatureFlag.AUTOMATIONS] = 10,
        _c[types_1.FeatureFlag.CSV_EXPORT] = 10,
        _c[types_1.FeatureFlag.MEMBER_ENRICHMENT] = 1000,
        _c[types_1.FeatureFlag.ORGANIZATION_ENRICHMENT] = 200,
        _c),
    _a[plans_1["default"].values.scale] = (_d = {},
        _d[types_1.FeatureFlag.AUTOMATIONS] = 20,
        _d[types_1.FeatureFlag.CSV_EXPORT] = 20,
        _d[types_1.FeatureFlag.MEMBER_ENRICHMENT] = Infinity,
        _d[types_1.FeatureFlag.ORGANIZATION_ENRICHMENT] = Infinity,
        _d),
    _a[plans_1["default"].values.enterprise] = (_e = {},
        _e[types_1.FeatureFlag.AUTOMATIONS] = Infinity,
        _e[types_1.FeatureFlag.CSV_EXPORT] = Infinity,
        _e[types_1.FeatureFlag.MEMBER_ENRICHMENT] = Infinity,
        _e[types_1.FeatureFlag.ORGANIZATION_ENRICHMENT] = Infinity,
        _e),
    _a);
exports["default"] = (function (featureFlag, req) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, feature_flags_1.isFeatureEnabled)(featureFlag, function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, (0, getFeatureFlagTenantContext_1["default"])(req.currentTenant, req.database, req.redis, req.log)];
            }); }); }, req.unleash)];
    });
}); });
