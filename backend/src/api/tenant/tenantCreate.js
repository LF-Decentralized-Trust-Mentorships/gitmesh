"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const identifyTenant_1 = __importDefault(require("../../segment/identifyTenant"));
const telemetryTrack_1 = __importDefault(require("../../segment/telemetryTrack"));
const track_1 = __importDefault(require("../../segment/track"));
const tenantService_1 = __importDefault(require("../../services/tenantService"));
exports.default = async (req, res) => {
    if (!req.currentUser || !req.currentUser.id) {
        throw new common_1.Error403(req.language);
    }
    const payload = await new tenantService_1.default(req).create(req.body);
    (0, track_1.default)('Tenant Created', {
        id: payload.id,
        name: payload.name,
        onboard: !!payload.onboard,
    }, Object.assign({}, req));
    (0, identifyTenant_1.default)(Object.assign(Object.assign({}, req), { currentTenant: payload }));
    (0, telemetryTrack_1.default)('Tenant created', {}, Object.assign({}, req));
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=tenantCreate.js.map