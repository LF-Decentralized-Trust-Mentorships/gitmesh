"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const tagService_1 = __importDefault(require("../../services/tagService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
/**
 * POST /tenant/{tenantId}/tag
 * @summary Create a tag
 * @tag Tags
 * @security Bearer
 * @description Create a tag
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @bodyContent {TagNoId} application/json
 * @response 200 - Ok
 * @responseContent {Tag} 200.application/json
 * @responseExample {Tag} 200.application/json.Tag
 * @response 401 - Unauthorized
 * @response 404 - Not found
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.tagCreate);
    const payload = await new tagService_1.default(req).create(req.body);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=tagCreate.js.map