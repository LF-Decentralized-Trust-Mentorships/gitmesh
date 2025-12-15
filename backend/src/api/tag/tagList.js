"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const tagService_1 = __importDefault(require("../../services/tagService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
/**
 * GET /tenant/{tenantId}/tag
 * @summary List tags
 * @tag Tags
 * @security Bearer
 * @description Get a list of tags with filtering, sorting and offsetting.
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @queryParam {string} [filter[name]] - Filter by the name of the tag.
 * @queryParam {string} [filter[createdAtRange]] - Created at lower bound. If you want a range, send this parameter twice with [min] and [max]. If you send it once it will be interpreted as a lower bound.
 * @queryParam {TagSort} [orderBy] - Sort the results. Default timestamp_DESC.
 * @queryParam {number} [offset] - Skip the first n results. Default 0.
 * @queryParam {number} [limit] - Limit the number of results. Default 50.
 * @response 200 - Ok
 * @responseContent {TagList} 200.application/json
 * @responseExample {TagList} 200.application/json.Tags
 * @response 401 - Unauthorized
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.tagRead);
    const payload = await new tagService_1.default(req).findAndCountAll(req.query);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=tagList.js.map