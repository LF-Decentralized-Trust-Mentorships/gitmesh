"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const conversationService_1 = __importDefault(require("../../services/conversationService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
/**
 * PUT /tenant/{tenantId}/conversation/{id}
 * @summary Update an conversation
 * @tag Conversations
 * @security Bearer
 * @description Update a conversation given an ID.
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @pathParam {string} id - The ID of the conversation
 * @bodyContent {ConversationNoId} application/json
 * @response 200 - Ok
 * @responseContent {Conversation} 200.application/json
 * @responseExample {Conversation} 200.application/json.Conversation
 * @response 401 - Unauthorized
 * @response 404 - Not found
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.conversationEdit);
    const payload = await new conversationService_1.default(req).update(req.params.id, req.body);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=conversationUpdate.js.map