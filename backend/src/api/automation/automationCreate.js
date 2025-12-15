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
 * POST /tenant/{tenantId}/automation
 * @summary Create an automation
 * @tag Automations
 * @security Bearer
 * @description Create a new automation for the tenant.
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @bodyContent {AutomationCreateInput} application/json
 * @response 200 - Ok
 * @responseContent {Automation} 200.application/json
 * @responseExample {Automation} 200.application/json.Automation
 * @response 401 - Unauthorized
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.automationCreate);
    const payload = await new automationService_1.default(req).create(req.body.data);
    (0, track_1.default)('Automation Created', Object.assign({}, payload), Object.assign({}, req));
    (0, identifyTenant_1.default)(req);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=automationCreate.js.map