"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const track_1 = __importDefault(require("../../segment/track"));
const noteService_1 = __importDefault(require("../../services/noteService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
/**
 * POST /tenant/{tenantId}/note/query
 * @summary Query notes
 * @tag Notes
 * @security Bearer
 * @description Query notes. It accepts filters, sorting options and pagination.
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @bodyContent {NoteQuery} application/json
 * @response 200 - Ok
 * @responseContent {NoteList} 200.application/json
 * @responseExample {NoteList} 200.application/json.Note
 * @response 401 - Unauthorized
 * @response 404 - Not found
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    var _a;
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.noteRead);
    const payload = await new noteService_1.default(req).query(req.body);
    if (((_a = req.body) === null || _a === void 0 ? void 0 : _a.filter) && Object.keys(req.body.filter).length > 0) {
        (0, track_1.default)('Notes Advanced Filter', Object.assign({}, payload), Object.assign({}, req));
    }
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=noteQuery.js.map