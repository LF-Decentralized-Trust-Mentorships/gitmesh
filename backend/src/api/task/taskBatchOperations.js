"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const permissions_1 = __importDefault(require("../../security/permissions"));
const taskService_1 = __importDefault(require("../../services/taskService"));
/**
 * POST /tenant/{tenantId}/task/batch
 * @summary Make batch operations on tasks
 * @tag Tasks
 * @security Bearer
 * @description Make batch operations on tasks
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @bodyContent {TaskBatchInput} application/json
 * @response 200 - Ok
 * @responseContent {TaskFindAndUpdateAll} 200.application/json
 * @responseExample {TaskFindAndUpdateAll} 200.application/json.Task
 * @response 401 - Unauthorized
 * @response 404 - Not found
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.taskBatch);
    let payload;
    switch (req.body.operation) {
        case 'findAndUpdateAll':
            payload = await new taskService_1.default(req).findAndUpdateAll(req.body.payload);
            break;
        case 'findAndDeleteAll':
            payload = await new taskService_1.default(req).findAndDeleteAll(req.body.payload);
            break;
        default:
            throw new common_1.Error400('en', 'tasks.errors.unknownBatchOperation', req.body.operation);
    }
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=taskBatchOperations.js.map