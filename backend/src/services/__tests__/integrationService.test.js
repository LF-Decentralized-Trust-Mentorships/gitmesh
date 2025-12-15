"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelizeTestUtils_1 = __importDefault(require("../../database/utils/sequelizeTestUtils"));
const integrationService_1 = __importDefault(require("../integrationService"));
const types_1 = require("@gitmesh/types");
const db = null;
describe('IntegrationService tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll(async () => {
        // Closing the DB connection allows Jest to exit successfully.
        await sequelizeTestUtils_1.default.closeConnection(db);
    });
    describe('createOrUpdate', () => {
        it('Should create a new integration because platform does not exist yet', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const integrationService = new integrationService_1.default(mockIServiceOptions);
            const integrationToCreate = {
                platform: types_1.PlatformType.GITHUB,
                token: '1234',
                integrationIdentifier: '1234',
                status: 'in-progress',
            };
            let integrations = await integrationService.findAndCountAll({});
            expect(integrations.count).toEqual(0);
            await integrationService.createOrUpdate(integrationToCreate);
            integrations = await integrationService.findAndCountAll({});
            expect(integrations.count).toEqual(1);
        });
        it('Should update existing integration if platform already exists', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const integrationService = new integrationService_1.default(mockIServiceOptions);
            const integrationToCreate = {
                platform: types_1.PlatformType.GITHUB,
                token: '1234',
                integrationIdentifier: '1234',
                status: 'in-progress',
            };
            await integrationService.createOrUpdate(integrationToCreate);
            let integrations = await integrationService.findAndCountAll({});
            expect(integrations.count).toEqual(1);
            expect(integrations.rows[0].status).toEqual('in-progress');
            const integrationToUpdate = {
                platform: types_1.PlatformType.GITHUB,
                token: '1234',
                integrationIdentifier: '1234',
                status: 'done',
            };
            await integrationService.createOrUpdate(integrationToUpdate);
            integrations = await integrationService.findAndCountAll({});
            expect(integrations.count).toEqual(1);
            expect(integrations.rows[0].status).toEqual('done');
        });
    });
    describe('Find all active integrations tests', () => {
        it('Should find an empty list when there are no integrations', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            expect((await new integrationService_1.default(mockIServiceOptions).getAllActiveIntegrations()).count).toBe(0);
        });
        it('Should return n for n active integrations', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            await new integrationService_1.default(mockIServiceOptions).createOrUpdate({
                platform: types_1.PlatformType.SLACK,
                status: 'done',
            });
            expect((await new integrationService_1.default(mockIServiceOptions).getAllActiveIntegrations()).count).toBe(1);
            await new integrationService_1.default(mockIServiceOptions).createOrUpdate({
                platform: types_1.PlatformType.GITHUB,
                status: 'done',
            });
            expect((await new integrationService_1.default(mockIServiceOptions).getAllActiveIntegrations()).count).toBe(2);
        });
        it('Should return n for n active integrations when there are other integrations', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            await new integrationService_1.default(mockIServiceOptions).createOrUpdate({
                platform: types_1.PlatformType.SLACK,
                status: 'done',
            });
            await new integrationService_1.default(mockIServiceOptions).createOrUpdate({
                platform: types_1.PlatformType.DISCORD,
                status: 'in-progress',
            });
            expect((await new integrationService_1.default(mockIServiceOptions).getAllActiveIntegrations()).count).toBe(1);
            await new integrationService_1.default(mockIServiceOptions).createOrUpdate({
                platform: types_1.PlatformType.GITHUB,
                status: 'done',
            });
            expect((await new integrationService_1.default(mockIServiceOptions).getAllActiveIntegrations()).count).toBe(2);
        });
    });
});
//# sourceMappingURL=integrationService.test.js.map