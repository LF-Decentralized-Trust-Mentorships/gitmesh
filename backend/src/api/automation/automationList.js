"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const automationService_1 = __importDefault(require("../../services/automationService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
/**
 * GET /tenant/{tenantId}/automation
 * @summary List automations
 * @tag Automations
 * @security Bearer
 * @description Get all existing automation data for tenant.
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @queryParam {string} [filter[type]] - Filter by type of automation
 * @queryParam {string} [filter[trigger]] - Filter by trigger type of automation
 * @queryParam {string} [filter[state]] - Filter by state of automation
 * @queryParam {number} [offset] - Skip the first n results. Default 0.
 * @queryParam {number} [limit] - Limit the number of results. Default 50.
 * @response 200 - Ok
 * @responseContent {AutomationPage} 200.application/json
 * @responseExample {AutomationPage} 200.application/json.AutomationPage
 * @response 401 - Unauthorized
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    var _a, _b, _c, _d;
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.automationRead);
    let offset = 0;
    if (req.query.offset) {
        offset = parseInt(req.query.offset, 10);
    }
    let limit = 50;
    if (req.query.limit) {
        limit = parseInt(req.query.limit, 10);
    }
    const criteria = {
        type: ((_a = req.query.filter) === null || _a === void 0 ? void 0 : _a.type) ? req.query.filter.type : undefined,
        trigger: ((_b = req.query.filter) === null || _b === void 0 ? void 0 : _b.trigger)
            ? (_c = req.query.filter) === null || _c === void 0 ? void 0 : _c.trigger
            : undefined,
        state: ((_d = req.query.filter) === null || _d === void 0 ? void 0 : _d.state) ? req.query.filter.state : undefined,
        limit,
        offset,
    };
    const payload = await new automationService_1.default(req).findAndCountAll(criteria);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=automationList.js.map