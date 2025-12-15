"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const track_1 = __importDefault(require("../../segment/track"));
const sampleDataService_1 = __importDefault(require("../../services/sampleDataService"));
const permissions_1 = __importDefault(require("../../security/permissions"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
exports.default = async (req, res) => {
    if (!req.currentUser || !req.currentUser.id) {
        throw new common_1.Error403(req.language);
    }
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.memberDestroy);
    await new sampleDataService_1.default(req).deleteSampleData();
    (0, track_1.default)('Delete sample data', {}, Object.assign({}, req));
    req.responseHandler.success(req, res, {
        message: (0, common_1.i18n)(req.language, 'tenant.sampleDataDeletionCompleted'),
    });
};
//# sourceMappingURL=tenantDeleteSampleData.js.map