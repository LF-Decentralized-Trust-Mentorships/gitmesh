"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const taskService_1 = __importDefault(require("../../services/taskService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const track_1 = __importDefault(require("../../segment/track"));
/**
 * POST /tenant/{tenantId}/task
 * @summary Create a task
 * @tag Tasks
 * @security Bearer
 * @description Create a task
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @bodyContent {TaskInput} application/json
 * @response 200 - Ok
 * @responseContent {Task} 200.application/json
 * @responseExample {Task} 200.application/json.Task
 * @response 401 - Unauthorized
 * @response 404 - Not found
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.taskCreate);
    const payload = await new taskService_1.default(req).create(req.body);
    (0, track_1.default)('Task Created', { id: payload.id, dueDate: payload.dueDate, members: payload.members }, Object.assign({}, req));
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=taskCreate.js.map