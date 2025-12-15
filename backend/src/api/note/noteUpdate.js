"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../../security/permissions"));
const noteService_1 = __importDefault(require("../../services/noteService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const track_1 = __importDefault(require("../../segment/track"));
/**
 * PUT /tenant/{tenantId}/note/{id}
 * @summary Update a note
 * @tag Notes
 * @security Bearer
 * @description Update a note
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @pathParam {string} id - The ID of the note
 * @bodyContent {NoteInput} application/json
 * @response 200 - Ok
 * @responseContent {Note} 200.application/json
 * @responseExample {Note} 200.application/json.Note
 * @response 401 - Unauthorized
 * @response 404 - Not found
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.noteEdit);
    const payload = await new noteService_1.default(req).update(req.params.id, req.body);
    (0, track_1.default)('Note Updated', { id: payload.id }, Object.assign({}, req));
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=noteUpdate.js.map