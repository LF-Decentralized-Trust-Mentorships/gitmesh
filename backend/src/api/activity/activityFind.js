"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const permissions_1 = __importDefault(require("../../security/permissions"));
const activityService_1 = __importDefault(require("../../services/activityService"));
/**
 * GET /tenant/{tenantId}/activity/{id}
 * @summary Find an activity
 * @tag Activities
 * @security Bearer
 * @description Find a single activity by ID
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @pathParam {string} id - The ID of the activity
 * @response 200 - Ok
 * @responseContent {ActivityResponse} 200.application/json
 * @responseExample {ActivityFind} 200.application/json.Activity
 * @response 401 - Unauthorized
 * @response 404 - Not found
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.activityRead);
    const payload = await new activityService_1.default(req).findById(req.params.id);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=activityFind.js.map