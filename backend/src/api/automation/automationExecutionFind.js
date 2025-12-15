"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const permissions_1 = __importDefault(require("../../security/permissions"));
const automationExecutionService_1 = __importDefault(require("../../services/automationExecutionService"));
/**
 * GET /tenant/{tenantId}/automation/{automationId}/executions
 * @summary Get automation history
 * @tag Automations
 * @security Bearer
 * @description Get all automation execution history for tenant and automation
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @pathParam {string} automationId - Your workspace/tenant ID
 * @queryParam {integer} [offset=0] - How many elements from the beginning would you like to skip
 * @queryParam {integer} [limit=10] - How many elements would you like to fetch
 * @response 200 - Ok
 * @responseContent {AutomationExecutionPage} 200.application/json
 * @responseExample {AutomationExecutionPage} 200.application/json.AutomationExecutionPage
 * @response 401 - Unauthorized
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.automationRead);
    let offset = 0;
    if (req.query.offset) {
        offset = parseInt(req.query.offset, 10);
    }
    let limit = 10;
    if (req.query.limit) {
        limit = parseInt(req.query.limit, 10);
    }
    const payload = await new automationExecutionService_1.default(req).findAndCountAll({
        automationId: req.params.automationId,
        offset,
        limit,
    });
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=automationExecutionFind.js.map