"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const sampleDataService_1 = __importDefault(require("../../services/sampleDataService"));
const track_1 = __importDefault(require("../../segment/track"));
const permissions_1 = __importDefault(require("../../security/permissions"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const fs = require('fs');
const path = require('path');
exports.default = async (req, res) => {
    if (!req.currentUser || !req.currentUser.id) {
        throw new common_1.Error403(req.language);
    }
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.memberCreate);
    const sampleMembersActivities = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../database/initializers/sample-data.json'), 'utf8'));
    (0, track_1.default)('Generate sample data', {}, Object.assign({}, req));
    await req.responseHandler.success(req, res, {
        message: (0, common_1.i18n)(req.language, 'tenant.sampleDataCreationStarted'),
    });
    await new sampleDataService_1.default(req).generateSampleData(sampleMembersActivities);
};
//# sourceMappingURL=tenantGenerateSampleData.js.map