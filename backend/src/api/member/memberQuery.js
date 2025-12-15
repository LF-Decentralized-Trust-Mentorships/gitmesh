"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const track_1 = __importDefault(require("../../segment/track"));
const memberService_1 = __importDefault(require("../../services/memberService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
/**
 * POST /tenant/{tenantId}/member/query
 * @summary Query members
 * @tag Members
 * @security Bearer
 * @description Query members. It accepts filters, sorting options and pagination.
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @bodyContent {MemberQuery} application/json
 * @response 200 - Ok
 * @responseContent {MemberList} 200.application/json
 * @responseExample {MemberList} 200.application/json.Member
 * @response 401 - Unauthorized
 * @response 404 - Not found
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.memberRead);
    let payload;
    const newVersion = req.headers['x-gitmesh-api-version'] === '1';
    const memberService = new memberService_1.default(req);
    if (newVersion) {
        payload = await memberService.queryV2(req.body);
    }
    else {
        payload = await memberService.query(req.body);
    }
    if (req.body.filter && Object.keys(req.body.filter).length > 0) {
        (0, track_1.default)('Member Advanced Filter', Object.assign({}, req.body), Object.assign({}, req));
    }
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=memberQuery.js.map