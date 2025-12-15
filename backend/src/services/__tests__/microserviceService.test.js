"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const microserviceService_1 = __importDefault(require("../microserviceService"));
const sequelizeTestUtils_1 = __importDefault(require("../../database/utils/sequelizeTestUtils"));
const db = null;
describe('MicroService Service tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll((done) => {
        // Closing the DB connection allows Jest to exit successfully.
        sequelizeTestUtils_1.default.closeConnection(db);
        done();
    });
    describe('CreateIfNotExists method', () => {
        it('Should create a microservice succesfully with default values', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const microservice2Add = { type: 'members_score' };
            const microserviceCreated = await new microserviceService_1.default(mockIRepositoryOptions).createIfNotExists(microservice2Add);
            microserviceCreated.createdAt = microserviceCreated.createdAt.toISOString().split('T')[0];
            microserviceCreated.updatedAt = microserviceCreated.updatedAt.toISOString().split('T')[0];
            const microserviceExpected = {
                id: microserviceCreated.id,
                init: false,
                running: false,
                type: microservice2Add.type,
                variant: 'default',
                settings: {},
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                tenantId: mockIRepositoryOptions.currentTenant.id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
            };
            expect(microserviceCreated).toStrictEqual(microserviceExpected);
        });
        it('Should return the existing if it does not exist', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const microservice2Add = { type: 'members_score' };
            const microserviceCreated = await new microserviceService_1.default(mockIRepositoryOptions).create(microservice2Add);
            const secondCreated = await new microserviceService_1.default(mockIRepositoryOptions).createIfNotExists(microservice2Add);
            secondCreated.createdAt = secondCreated.createdAt.toISOString().split('T')[0];
            secondCreated.updatedAt = secondCreated.updatedAt.toISOString().split('T')[0];
            const microserviceExpected = {
                id: microserviceCreated.id,
                init: false,
                running: false,
                type: microservice2Add.type,
                variant: 'default',
                settings: {},
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                tenantId: mockIRepositoryOptions.currentTenant.id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
            };
            expect(secondCreated).toStrictEqual(microserviceExpected);
            const count = (await new microserviceService_1.default(mockIRepositoryOptions).findAndCountAll({}))
                .count;
            expect(count).toBe(1);
        });
    });
});
//# sourceMappingURL=microserviceService.test.js.map