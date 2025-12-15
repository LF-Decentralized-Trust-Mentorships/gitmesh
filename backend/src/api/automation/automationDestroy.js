"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const permissions_1 = __importDefault(require("../../security/permissions"));
const automationService_1 = __importDefault(require("../../services/automationService"));
const track_1 = __importDefault(require("../../segment/track"));
const identifyTenant_1 = __importDefault(require("../../segment/identifyTenant"));
/**
 * DELETE /tenant/{tenantId}/automation/{automationId}
 * @summary Destroy an automation
 * @tag Automations
 * @security Bearer
 * @description Destroys an existing automation in the tenant.
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @pathParam {string} automationId - Automation ID that you want to update
 * @response 204 - Ok - No content
 * @response 401 - Unauthorized
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.automationDestroy);
    await new automationService_1.default(req).destroy(req.params.automationId);
    (0, track_1.default)('Automation Destroyed', { id: req.params.automationId }, Object.assign({}, req));
    (0, identifyTenant_1.default)(req);
    await req.responseHandler.success(req, res, true, 204);
};
//# sourceMappingURL=automationDestroy.js.map