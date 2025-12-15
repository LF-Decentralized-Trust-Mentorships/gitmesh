"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const microserviceRepository_1 = __importDefault(require("../microserviceRepository"));
const sequelizeTestUtils_1 = __importDefault(require("../../utils/sequelizeTestUtils"));
const db = null;
describe('MicroserviceRepository tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll((done) => {
        // Closing the DB connection allows Jest to exit successfully.
        sequelizeTestUtils_1.default.closeConnection(db);
        done();
    });
    describe('create method', () => {
        it('Should create a microservice succesfully with default values', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const microservice2Add = { type: 'members_score' };
            const microserviceCreated = await microserviceRepository_1.default.create(microservice2Add, mockIRepositoryOptions);
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
        it('Should create a microservice succesfully with given values', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const microservice2Add = {
                init: true,
                running: true,
                type: 'members_score',
                variant: 'premium',
                settings: { testSettingsField: 'test' },
            };
            const microserviceCreated = await microserviceRepository_1.default.create(microservice2Add, mockIRepositoryOptions);
            microserviceCreated.createdAt = microserviceCreated.createdAt.toISOString().split('T')[0];
            microserviceCreated.updatedAt = microserviceCreated.updatedAt.toISOString().split('T')[0];
            const microserviceExpected = {
                id: microserviceCreated.id,
                init: microservice2Add.init,
                running: microservice2Add.running,
                type: microservice2Add.type,
                variant: microservice2Add.variant,
                settings: microservice2Add.settings,
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                tenantId: mockIRepositoryOptions.currentTenant.id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
            };
            expect(microserviceCreated).toStrictEqual(microserviceExpected);
        });
        it('Should throw unique constraint error for creation of already existing type microservice in the same tenant', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const microservice1 = {
                init: true,
                running: true,
                type: 'members_score',
                variant: 'premium',
                settings: { testSettingsField: 'test' },
            };
            await microserviceRepository_1.default.create(microservice1, mockIRepositoryOptions);
            await expect(() => microserviceRepository_1.default.create({ type: 'members_score' }, mockIRepositoryOptions)).rejects.toThrow();
        });
        it('Should throw not null error if no type is given', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const microservice2Add = {
                init: true,
                running: true,
                variant: 'premium',
                settings: { testSettingsField: 'test' },
            };
            await expect(() => microserviceRepository_1.default.create(microservice2Add, mockIRepositoryOptions)).rejects.toThrow();
        });
    });
    describe('findById method', () => {
        it('Should successfully find created microservice by id', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const microservice2Add = { type: 'members_score' };
            const microserviceCreated = await microserviceRepository_1.default.create(microservice2Add, mockIRepositoryOptions);
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
            const microserviceById = await microserviceRepository_1.default.findById(microserviceCreated.id, mockIRepositoryOptions);
            microserviceById.createdAt = microserviceById.createdAt.toISOString().split('T')[0];
            microserviceById.updatedAt = microserviceById.updatedAt.toISOString().split('T')[0];
            expect(microserviceById).toStrictEqual(microserviceExpected);
        });
        it('Should throw 404 error when no microservice found with given id', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => microserviceRepository_1.default.findById(randomUUID(), mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
    describe('filterIdsInTenant method', () => {
        it('Should return the given ids of previously created microservice entities', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const microservice1Created = await microserviceRepository_1.default.create({ type: 'members_score' }, mockIRepositoryOptions);
            const microservice2Created = await microserviceRepository_1.default.create({ type: 'second' }, mockIRepositoryOptions);
            const filterIdsReturned = await microserviceRepository_1.default.filterIdsInTenant([microservice1Created.id, microservice2Created.id], mockIRepositoryOptions);
            expect(filterIdsReturned).toStrictEqual([microservice1Created.id, microservice2Created.id]);
        });
        it('Should only return the ids of previously created microservices and filter random uuids out', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const microserviceCreated = await microserviceRepository_1.default.create({ type: 'members_score' }, mockIRepositoryOptions);
            const { randomUUID } = require('crypto');
            const filterIdsReturned = await microserviceRepository_1.default.filterIdsInTenant([microserviceCreated.id, randomUUID(), randomUUID()], mockIRepositoryOptions);
            expect(filterIdsReturned).toStrictEqual([microserviceCreated.id]);
        });
        it('Should return an empty array for an irrelevant tenant', async () => {
            let mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const microserviceCreated = await microserviceRepository_1.default.create({ type: 'members_score' }, mockIRepositoryOptions);
            // create a new tenant and bind options to it
            mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const filterIdsReturned = await microserviceRepository_1.default.filterIdsInTenant([microserviceCreated.id], mockIRepositoryOptions);
            expect(filterIdsReturned).toStrictEqual([]);
        });
    });
    describe('findAndCountAll method', () => {
        it('Should find and count all microservices, with various filters', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const microservice1Created = await microserviceRepository_1.default.create({ type: 'members_score', variant: 'premium' }, mockIRepositoryOptions);
            const microservice2Created = await microserviceRepository_1.default.create({ type: 'second', variant: 'premium' }, mockIRepositoryOptions);
            // Filter by type
            let microservices = await microserviceRepository_1.default.findAndCountAll({ filter: { type: 'members_score' } }, mockIRepositoryOptions);
            expect(microservices.count).toEqual(1);
            expect(microservices.rows).toStrictEqual([microservice1Created]);
            // Filter by id
            microservices = await microserviceRepository_1.default.findAndCountAll({ filter: { id: microservice1Created.id } }, mockIRepositoryOptions);
            expect(microservices.count).toEqual(1);
            expect(microservices.rows).toStrictEqual([microservice1Created]);
            // Filter by variant
            microservices = await microserviceRepository_1.default.findAndCountAll({ filter: { variant: 'premium' } }, mockIRepositoryOptions);
            expect(microservices.count).toEqual(2);
            expect(microservices.rows).toStrictEqual([microservice2Created, microservice1Created]);
        });
    });
    describe('update method', () => {
        it('Should succesfully update previously created microservice', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const microserviceCreated = await microserviceRepository_1.default.create({ type: 'twitter_followers' }, mockIRepositoryOptions);
            const microserviceUpdated = await microserviceRepository_1.default.update(microserviceCreated.id, {
                init: true,
                running: true,
                variant: 'premium',
                settings: {
                    testSettingAttribute: {
                        someAtt: 'test',
                        someOtherAtt: true,
                    },
                },
            }, mockIRepositoryOptions);
            expect(microserviceUpdated.updatedAt.getTime()).toBeGreaterThan(microserviceUpdated.createdAt.getTime());
            const microserviceExpected = {
                id: microserviceCreated.id,
                init: microserviceUpdated.init,
                running: microserviceUpdated.running,
                type: microserviceCreated.type,
                variant: microserviceUpdated.variant,
                settings: microserviceUpdated.settings,
                importHash: null,
                createdAt: microserviceCreated.createdAt,
                updatedAt: microserviceUpdated.updatedAt,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
            };
            expect(microserviceUpdated).toStrictEqual(microserviceExpected);
        });
        it('Should throw 404 error when trying to update non existent microservice', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => microserviceRepository_1.default.update(randomUUID(), { type: 'some-type' }, mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
    describe('destroy method', () => {
        it('Should succesfully destroy previously created microservice', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const microserviceCreated = await microserviceRepository_1.default.create({ type: 'members_score', variant: 'premium' }, mockIRepositoryOptions);
            await microserviceRepository_1.default.destroy(microserviceCreated.id, mockIRepositoryOptions);
            // Try selecting it after destroy, should throw 404
            await expect(() => microserviceRepository_1.default.findById(microserviceCreated.id, mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
        it('Should throw 404 when trying to destroy a non existent microservice', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => microserviceRepository_1.default.destroy(randomUUID(), mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
    describe('Find all available microservices', () => {
        it('Should find a single available microservices for a type', async () => {
            const ms1 = {
                type: 'twitter-followers',
                running: false,
                init: false,
                variant: 'default',
                settings: {},
            };
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await microserviceRepository_1.default.create(ms1, mockIRepositoryOptions);
            const found = await microserviceRepository_1.default.findAllByType('twitter-followers', 1, 100);
            expect(found[0].tenantId).toBeDefined();
            expect(found.length).toBe(1);
        });
        it('Should find all available microservices for a type, multiple available', async () => {
            const ms1 = {
                type: 'twitter-followers',
                running: false,
                init: false,
                variant: 'default',
                settings: {},
            };
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await microserviceRepository_1.default.create(ms1, mockIRepositoryOptions);
            const mockIRepositoryOptions2 = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await microserviceRepository_1.default.create(ms1, mockIRepositoryOptions2);
            const found = await microserviceRepository_1.default.findAllByType('twitter-followers', 1, 100);
            expect(found.length).toBe(2);
        });
        it('Should only find non-running microservices', async () => {
            const ms1 = {
                type: 'twitter-followers',
                running: false,
                init: false,
                variant: 'default',
                settings: {},
            };
            const ms2 = {
                type: 'twitter-followers',
                running: true,
                init: false,
                variant: 'default',
                settings: {},
            };
            const ms3 = {
                type: 'twitter-followers',
                running: false,
                init: false,
                variant: 'default',
                settings: {},
            };
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await microserviceRepository_1.default.create(ms1, mockIRepositoryOptions);
            const mockIRepositoryOptions2 = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await microserviceRepository_1.default.create(ms2, mockIRepositoryOptions2);
            const mockIRepositoryOptions3 = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await microserviceRepository_1.default.create(ms3, mockIRepositoryOptions3);
            const found = await microserviceRepository_1.default.findAllByType('twitter-followers', 1, 100);
            expect(found.length).toBe(2);
        });
        it('Should only find microservices for the desired type', async () => {
            const ms1 = {
                type: 'twitter-followers',
                running: false,
                init: false,
                variant: 'default',
                settings: {},
            };
            const ms2 = {
                type: 'members_score',
                running: false,
                init: false,
                variant: 'default',
                settings: {},
            };
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await microserviceRepository_1.default.create(ms1, mockIRepositoryOptions);
            const mockIRepositoryOptions2 = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await microserviceRepository_1.default.create(ms1, mockIRepositoryOptions2);
            const mockIRepositoryOptions3 = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await microserviceRepository_1.default.create(ms2, mockIRepositoryOptions3);
            const found = await microserviceRepository_1.default.findAllByType('twitter-followers', 1, 100);
            expect(found.length).toBe(2);
        });
        it('Should return an empty list if no integrations are found', async () => {
            const found = await microserviceRepository_1.default.findAllByType('twitter-followers', 1, 100);
            expect(found.length).toBe(0);
        });
    });
});
//# sourceMappingURL=microserviceRepository.test.js.map