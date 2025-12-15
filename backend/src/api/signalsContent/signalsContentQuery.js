"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const track_1 = __importDefault(require("../../segment/track"));
const signalsContentService_1 = __importDefault(require("../../services/signalsContentService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
// /**
//  * POST /tenant/{tenantId}/signalsContent
//  * @summary Create or update an signalsContent
//  * @tag Activities
//  * @security Bearer
//  * @description Create or update an signalsContent. Existence is checked by sourceId and tenantId.
//  * @pathParam {string} tenantId - Your workspace/tenant ID
//  * @bodyContent {SignalsContentUpsertInput} application/json
//  * @response 200 - Ok
//  * @responseContent {SignalsContent} 200.application/json
//  * @responseExample {SignalsContentUpsert} 200.application/json.SignalsContent
//  * @response 401 - Unauthorized
//  * @response 404 - Not found
//  * @response 429 - Too many requests
//  */
exports.default = async (req, res) => {
    var _a;
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.signalsContentRead);
    const payload = await new signalsContentService_1.default(req).query(req.body);
    if (((_a = req.body) === null || _a === void 0 ? void 0 : _a.filter) && Object.keys(req.body.filter).length > 0) {
        (0, track_1.default)('SignalsContent Advanced Filter', Object.assign({}, payload), Object.assign({}, req));
    }
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=signalsContentQuery.js.map