"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const track_1 = __importDefault(require("../../segment/track"));
const automationService_1 = __importDefault(require("../../services/automationService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
/**
 * PUT /tenant/{tenantId}/automation/{automationId}
 * @summary Update an automation
 * @tag Automations
 * @security Bearer
 * @description Updates an existing automation in the tenant.
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @pathParam {string} automationId - Automation ID that you want to update
 * @bodyContent {AutomationUpdateInput} application/json
 * @response 200 - Ok
 * @responseContent {Automation} 200.application/json
 * @responseExample {Automation} 200.application/json.Automation
 * @response 401 - Unauthorized
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.automationUpdate);
    const payload = await new automationService_1.default(req).update(req.params.automationId, req.body.data);
    (0, track_1.default)('Automation Updated', Object.assign({}, payload), Object.assign({}, req));
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=automationUpdate.js.map