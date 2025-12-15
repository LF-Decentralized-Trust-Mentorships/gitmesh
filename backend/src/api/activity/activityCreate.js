"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const permissions_1 = __importDefault(require("../../security/permissions"));
const activityService_1 = __importDefault(require("../../services/activityService"));
const track_1 = __importDefault(require("../../segment/track"));
/**
 * POST /tenant/{tenantId}/activity
 * @summary Create or update an activity
 * @tag Activities
 * @security Bearer
 * @description Create or update an activity. Existence is checked by sourceId and tenantId
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @bodyContent {ActivityUpsertInput} application/json
 * @response 200 - Ok
 * @responseContent {Activity} 200.application/json
 * @responseExample {ActivityUpsert} 200.application/json.Activity
 * @response 401 - Unauthorized
 * @response 404 - Not found
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.activityCreate);
    const payload = await new activityService_1.default(req).upsert(req.body);
    (0, track_1.default)('Activity Manually Created', Object.assign({}, payload), Object.assign({}, req));
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=activityCreate.js.map