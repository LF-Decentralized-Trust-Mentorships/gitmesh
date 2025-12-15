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
 * PUT /tenant/{tenantId}/task/{id}
 * @summary Update an task
 * @tag Tasks
 * @security Bearer
 * @description Update a task
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @pathParam {string} id - The ID of the task
 * @bodyContent {TaskInput} application/json
 * @response 200 - Ok
 * @responseContent {Task} 200.application/json
 * @responseExample {Task} 200.application/json.Task
 * @response 401 - Unauthorized
 * @response 404 - Not found
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.taskEdit);
    const taskBeforeUpdate = await new taskService_1.default(req).findById(req.params.id);
    const payload = await new taskService_1.default(req).update(req.params.id, req.body);
    if (taskBeforeUpdate.type === 'suggested') {
        (0, track_1.default)('Task Created (from suggestion)', { id: payload.id, dueDate: payload.dueDate, members: payload.members }, Object.assign({}, req));
    }
    if (taskBeforeUpdate.status === 'in-progress' && payload.status === 'done') {
        (0, track_1.default)('Task Completed', {
            id: payload.id,
            dueDate: payload.dueDate,
            members: payload.members,
            status: payload.status,
        }, Object.assign({}, req));
    }
    else {
        (0, track_1.default)('Task Updated', {
            id: payload.id,
            dueDate: payload.dueDate,
            members: payload.members,
            status: payload.status,
        }, Object.assign({}, req));
    }
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=taskUpdate.js.map