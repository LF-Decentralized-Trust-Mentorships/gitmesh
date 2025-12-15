"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const permissions_1 = __importDefault(require("../../security/permissions"));
const automationService_1 = __importDefault(require("../../services/automationService"));
/**
 * GET /tenant/{tenantId}/automation/{automationId}
 * @summary Find an automation
 * @tag Automations
 * @security Bearer
 * @description Get an existing automation data in the tenant.
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @pathParam {string} automationId - Automation ID that you want to find
 * @response 200 - Ok
 * @responseContent {Automation} 200.application/json
 * @responseExample {Automation} 200.application/json.Automation
 * @response 401 - Unauthorized
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.automationRead);
    const payload = await new automationService_1.default(req).findById(req.params.automationId);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=automationFind.js.map