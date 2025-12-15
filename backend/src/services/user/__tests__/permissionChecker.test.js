"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@gitmesh/types");
const common_1 = require("@gitmesh/common");
const sequelizeTestUtils_1 = __importDefault(require("../../../database/utils/sequelizeTestUtils"));
const plans_1 = __importDefault(require("../../../security/plans"));
const permissionChecker_1 = __importDefault(require("../permissionChecker"));
const db = null;
describe('PermissionChecker tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll(async () => {
        // Closing the DB connection allows Jest to exit successfully.
        await sequelizeTestUtils_1.default.closeConnection(db);
    });
    describe('Integration protected fields', () => {
        it('Should throw an error when limitCount is passed', async () => {
            for (const plan of Object.values(plans_1.default.values)) {
                const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db, plan);
                const permissionChecker = new permissionChecker_1.default(mockIServiceOptions);
                const data = {
                    limitCount: 1,
                    status: 'in-progress',
                    platform: types_1.PlatformType.GITHUB,
                };
                expect(() => permissionChecker.validateIntegrationsProtectedFields(data)).toThrow(new common_1.Error403());
            }
        });
        it('Should throw an error when limitCount is passed as 0', async () => {
            for (const plan of Object.values(plans_1.default.values)) {
                const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db, plan);
                const permissionChecker = new permissionChecker_1.default(mockIServiceOptions);
                const data = {
                    limitCount: 0,
                    status: 'in-progress',
                    platform: types_1.PlatformType.GITHUB,
                };
                expect(() => permissionChecker.validateIntegrationsProtectedFields(data)).toThrow(new common_1.Error403());
            }
        });
    });
});
//# sourceMappingURL=permissionChecker.test.js.map