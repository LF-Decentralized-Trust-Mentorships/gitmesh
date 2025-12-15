"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelizeTestUtils_1 = __importDefault(require("../../utils/sequelizeTestUtils"));
const integrationRepository_1 = __importDefault(require("../integrationRepository"));
const types_1 = require("@gitmesh/types");
const db = null;
describe('Integration repository tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll((done) => {
        // Closing the DB connection allows Jest to exit successfully.
        sequelizeTestUtils_1.default.closeConnection(db);
        done();
    });
    describe('Find all active integrations', () => {
        it('Should find a single active integration', async () => {
            const int1 = {
                status: 'done',
                platform: types_1.PlatformType.TWITTER,
            };
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await integrationRepository_1.default.create(int1, mockIRepositoryOptions);
            const found = await integrationRepository_1.default.findAllActive(types_1.PlatformType.TWITTER, 1, 100);
            expect(found[0].tenantId).toBeDefined();
            expect(found.length).toBe(1);
        });
        it('Should find all active integrations for a platform', async () => {
            const int1 = {
                status: 'done',
                platform: types_1.PlatformType.TWITTER,
            };
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await integrationRepository_1.default.create(int1, mockIRepositoryOptions);
            const mockIRepositoryOptions2 = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await integrationRepository_1.default.create(int1, mockIRepositoryOptions2);
            const found = await integrationRepository_1.default.findAllActive(types_1.PlatformType.TWITTER, 1, 100);
            expect(found.length).toBe(2);
        });
        it('Should only find active integrations', async () => {
            const int1 = {
                status: 'done',
                platform: types_1.PlatformType.TWITTER,
            };
            const int2 = {
                status: 'todo',
                platform: types_1.PlatformType.TWITTER,
            };
            const int3 = {
                status: 'in-progress',
                platform: types_1.PlatformType.TWITTER,
            };
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await integrationRepository_1.default.create(int1, mockIRepositoryOptions);
            const mockIRepositoryOptions2 = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await integrationRepository_1.default.create(int1, mockIRepositoryOptions2);
            const mockIRepositoryOptions3 = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await integrationRepository_1.default.create(int2, mockIRepositoryOptions3);
            const mockIRepositoryOptions4 = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await integrationRepository_1.default.create(int3, mockIRepositoryOptions4);
            const found = await integrationRepository_1.default.findAllActive(types_1.PlatformType.TWITTER, 1, 100);
            expect(found.length).toBe(2);
        });
        it('Should only find integrations for the desired platform', async () => {
            const int1 = {
                status: 'done',
                platform: types_1.PlatformType.TWITTER,
            };
            const int2 = {
                status: 'active',
                platform: types_1.PlatformType.DISCORD,
            };
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await integrationRepository_1.default.create(int1, mockIRepositoryOptions);
            const mockIRepositoryOptions2 = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await integrationRepository_1.default.create(int1, mockIRepositoryOptions2);
            const mockIRepositoryOptions3 = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await integrationRepository_1.default.create(int2, mockIRepositoryOptions3);
            const found = await integrationRepository_1.default.findAllActive(types_1.PlatformType.TWITTER, 1, 100);
            expect(found.length).toBe(2);
        });
        it('Should return an empty list if no integrations are found', async () => {
            const found = await integrationRepository_1.default.findAllActive(types_1.PlatformType.TWITTER, 1, 100);
            expect(found.length).toBe(0);
        });
    });
});
//# sourceMappingURL=integrationRepository.test.js.map