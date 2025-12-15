"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getUserContext_1 = __importDefault(require("../getUserContext"));
const sequelizeTestUtils_1 = __importDefault(require("../sequelizeTestUtils"));
const db = null;
describe('Get user context tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll(async () => {
        // Closing the DB connection allows Jest to exit successfully.
        await sequelizeTestUtils_1.default.closeConnection(db);
    });
    describe('Get user context tests', () => {
        it('Should get the user context for an existing tenant', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const tenantId = mockIRepositoryOptions.currentTenant.dataValues.id;
            const userContext = await (0, getUserContext_1.default)(tenantId);
            expect(userContext.currentTenant.dataValues.id).toBe(tenantId);
            expect(userContext.currentUser).toBeDefined();
        });
    });
});
//# sourceMappingURL=getUserContext.test.js.map