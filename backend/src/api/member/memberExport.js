"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("@gitmesh/redis");
const types_1 = require("@gitmesh/types");
const timing_1 = require("../../utils/timing");
const permissions_1 = __importDefault(require("../../security/permissions"));
const identifyTenant_1 = __importDefault(require("../../segment/identifyTenant"));
const track_1 = __importDefault(require("../../segment/track"));
const memberService_1 = __importDefault(require("../../services/memberService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
/**
 * POST /tenant/{tenantId}/member/export
 * @summary Export members as CSV
 * @tag Members
 * @security Bearer
 * @description Export members. It accepts filters, sorting options and pagination.
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @bodyContent {MemberQuery} application/json
 * @response 200 - Ok
 * @response 401 - Unauthorized
 * @response 404 - Not found
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.memberRead);
    const payload = await new memberService_1.default(req).export(req.body);
    const csvCountCache = new redis_1.RedisCache(types_1.FeatureFlagRedisKey.CSV_EXPORT_COUNT, req.redis, req.log);
    const csvCount = await csvCountCache.get(req.currentTenant.id);
    const secondsRemainingUntilEndOfMonth = (0, timing_1.getSecondsTillEndOfMonth)();
    if (!csvCount) {
        await csvCountCache.set(req.currentTenant.id, '0', secondsRemainingUntilEndOfMonth);
    }
    else {
        await csvCountCache.set(req.currentTenant.id, (parseInt(csvCount, 10) + 1).toString(), secondsRemainingUntilEndOfMonth);
    }
    (0, identifyTenant_1.default)(req);
    (0, track_1.default)('Member CSV Export', {}, Object.assign({}, req), req.currentUser.id);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=memberExport.js.map