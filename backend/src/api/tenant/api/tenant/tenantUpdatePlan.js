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
var redis_1 = require("@gitmesh/redis");
var types_1 = require("@gitmesh/types");
var conf_1 = require("../../conf");
var tenantRepository_1 = __importDefault(require("../../database/repositories/tenantRepository"));
var sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
/**
 * PUT /tenant/:id/plan
 *
 * Admin-only endpoint to update a tenant's plan
 * This endpoint also emits a websocket notification to all connected users
 * so they get the updated features immediately without needing to log out
 */
exports["default"] = (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, plan, transaction, tenant, redis, apiPubSubEmitter, error_1, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                plan = req.body.plan;
                return [4 /*yield*/, sequelizeRepository_1["default"].createTransaction(req)];
            case 1:
                transaction = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 10, , 12]);
                return [4 /*yield*/, tenantRepository_1["default"].update(id, { plan: plan }, __assign(__assign({}, req), { transaction: transaction, currentTenant: { id: id }, bypassPermissionValidation: true }))];
            case 3:
                tenant = _a.sent();
                return [4 /*yield*/, sequelizeRepository_1["default"].commitTransaction(transaction)
                    // Emit websocket notification (same as Stripe webhook does)
                ];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, (0, redis_1.getRedisClient)(conf_1.REDIS_CONFIG, true)];
            case 6:
                redis = _a.sent();
                apiPubSubEmitter = new redis_1.RedisPubSubEmitter('api-pubsub', redis, function (err) {
                    req.log.error({ err: err }, 'Error in api-ws emitter!');
                }, req.log);
                apiPubSubEmitter.emit('user', new types_1.ApiWebsocketMessage('tenant-plan-upgraded', JSON.stringify({
                    plan: plan,
                    updatedBy: 'admin'
                }), undefined, id));
                req.log.info({ tenantId: id, plan: plan }, 'Sent tenant-plan-upgraded websocket notification');
                return [3 /*break*/, 8];
            case 7:
                error_1 = _a.sent();
                req.log.error({ error: error_1 }, 'Failed to send websocket notification');
                return [3 /*break*/, 8];
            case 8: return [4 /*yield*/, req.responseHandler.success(req, res, {
                    success: true,
                    tenant: tenant,
                    message: "Plan updated to ".concat(plan, ". Users will be notified automatically.")
                })];
            case 9:
                _a.sent();
                return [3 /*break*/, 12];
            case 10:
                error_2 = _a.sent();
                return [4 /*yield*/, sequelizeRepository_1["default"].rollbackTransaction(transaction)];
            case 11:
                _a.sent();
                throw error_2;
            case 12: return [2 /*return*/];
        }
    });
}); });
