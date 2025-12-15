"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const organizationCacheRepository_1 = __importDefault(require("../organizationCacheRepository"));
const sequelizeTestUtils_1 = __importDefault(require("../../utils/sequelizeTestUtils"));
const db = null;
const toCreate = {
    name: 'gitmesh.dev',
    url: 'https://gitmesh.dev',
    description: 'Community-led Growth for Developer-first Companies.\nJoin our private beta',
    emails: ['hello@gitmesh.dev', 'jonathan@gitmesh.dev'],
    phoneNumbers: ['+42 424242424'],
    logo: 'https://logo.clearbit.com/gitmesh.dev',
    tags: ['community', 'growth', 'developer-first'],
    website: 'https://gitmesh.dev',
    location: 'Berlin',
    github: {
        handle: 'AlveoliApp',
    },
    twitter: {
        handle: 'AlveoliApp',
        id: '1362101830923259908',
        bio: 'Community-led Growth for Developer-first Companies.\nJoin our private beta. 👇',
        followers: 107,
        following: 0,
        location: '🌍 remote',
        site: 'https://t.co/GRLDhqFWk4',
        avatar: 'https://pbs.twimg.com/profile_images/1419741008716251141/6exZe94-_normal.jpg',
    },
    linkedin: {
        handle: 'company/alveoliapp',
    },
    crunchbase: {
        handle: 'company/alveoliapp',
    },
    employees: 42,
    revenueRange: {
        min: 10,
        max: 50,
    },
    type: null,
    ticker: null,
    size: null,
    naics: null,
    lastEnrichedAt: null,
    industry: null,
    headline: null,
    geoLocation: null,
    founded: null,
    employeeCountByCountry: null,
    address: null,
    manuallyCreated: false,
};
describe('OrganizationCacheCacheRepository tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll((done) => {
        // Closing the DB connection allows Jest to exit successfully.
        sequelizeTestUtils_1.default.closeConnection(db);
        done();
    });
    describe('create method', () => {
        it('Should create the given organizationCache succesfully', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const organizationCacheCreated = await organizationCacheRepository_1.default.create(toCreate, mockIRepositoryOptions);
            organizationCacheCreated.createdAt = organizationCacheCreated.createdAt
                .toISOString()
                .split('T')[0];
            organizationCacheCreated.updatedAt = organizationCacheCreated.updatedAt
                .toISOString()
                .split('T')[0];
            const expectedorganizationCacheCreated = Object.assign(Object.assign({ id: organizationCacheCreated.id }, toCreate), { importHash: null, createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(), updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(), deletedAt: null });
            expect(organizationCacheCreated).toStrictEqual(expectedorganizationCacheCreated);
        });
        it('Should throw sequelize not null error -- name field is required', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const organizationCache2add = {};
            await expect(() => organizationCacheRepository_1.default.create(organizationCache2add, mockIRepositoryOptions)).rejects.toThrow();
        });
    });
    describe('findById method', () => {
        it('Should successfully find created organizationCache by id', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const organizationCacheCreated = await organizationCacheRepository_1.default.create(toCreate, mockIRepositoryOptions);
            organizationCacheCreated.createdAt = organizationCacheCreated.createdAt
                .toISOString()
                .split('T')[0];
            organizationCacheCreated.updatedAt = organizationCacheCreated.updatedAt
                .toISOString()
                .split('T')[0];
            const expectedorganizationCacheFound = Object.assign(Object.assign({ id: organizationCacheCreated.id }, toCreate), { importHash: null, createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(), updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(), deletedAt: null });
            const organizationCacheById = await organizationCacheRepository_1.default.findById(organizationCacheCreated.id, mockIRepositoryOptions);
            organizationCacheById.createdAt = organizationCacheById.createdAt.toISOString().split('T')[0];
            organizationCacheById.updatedAt = organizationCacheById.updatedAt.toISOString().split('T')[0];
            expect(organizationCacheById).toStrictEqual(expectedorganizationCacheFound);
        });
        it('Should throw 404 error when no organizationCache found with given id', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => organizationCacheRepository_1.default.findById(randomUUID(), mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
    describe('findByUrl method', () => {
        it('Should successfully find created organizationCache by URL', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const organizationCacheCreated = await organizationCacheRepository_1.default.create(toCreate, mockIRepositoryOptions);
            organizationCacheCreated.createdAt = organizationCacheCreated.createdAt
                .toISOString()
                .split('T')[0];
            organizationCacheCreated.updatedAt = organizationCacheCreated.updatedAt
                .toISOString()
                .split('T')[0];
            const expectedorganizationCacheFound = Object.assign(Object.assign({ id: organizationCacheCreated.id }, toCreate), { importHash: null, createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(), updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(), deletedAt: null });
            const organizationCacheById = await organizationCacheRepository_1.default.findByUrl(organizationCacheCreated.url, mockIRepositoryOptions);
            organizationCacheById.createdAt = organizationCacheById.createdAt.toISOString().split('T')[0];
            organizationCacheById.updatedAt = organizationCacheById.updatedAt.toISOString().split('T')[0];
            expect(organizationCacheById).toStrictEqual(expectedorganizationCacheFound);
        });
        it('Should be independend of tenant', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const mock2 = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const organizationCacheCreated = await organizationCacheRepository_1.default.create(toCreate, mockIRepositoryOptions);
            organizationCacheCreated.createdAt = organizationCacheCreated.createdAt
                .toISOString()
                .split('T')[0];
            organizationCacheCreated.updatedAt = organizationCacheCreated.updatedAt
                .toISOString()
                .split('T')[0];
            const expectedorganizationCacheFound = Object.assign(Object.assign({ id: organizationCacheCreated.id }, toCreate), { importHash: null, createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(), updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(), deletedAt: null });
            const organizationCacheById = await organizationCacheRepository_1.default.findByUrl(organizationCacheCreated.url, mock2);
            organizationCacheById.createdAt = organizationCacheById.createdAt.toISOString().split('T')[0];
            organizationCacheById.updatedAt = organizationCacheById.updatedAt.toISOString().split('T')[0];
            expect(organizationCacheById).toStrictEqual(expectedorganizationCacheFound);
        });
    });
    describe('update method', () => {
        it('Should succesfully update previously created organizationCache', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const organizationCacheCreated = await organizationCacheRepository_1.default.create(toCreate, mockIRepositoryOptions);
            const organizationCacheUpdated = await organizationCacheRepository_1.default.update(organizationCacheCreated.id, { name: 'updated-organizationCache-name' }, mockIRepositoryOptions);
            expect(organizationCacheUpdated.updatedAt.getTime()).toBeGreaterThan(organizationCacheUpdated.createdAt.getTime());
            const organizationCacheExpected = Object.assign(Object.assign({ id: organizationCacheCreated.id }, toCreate), { name: organizationCacheUpdated.name, importHash: null, createdAt: organizationCacheCreated.createdAt, updatedAt: organizationCacheUpdated.updatedAt, deletedAt: null });
            expect(organizationCacheUpdated).toStrictEqual(organizationCacheExpected);
        });
        it('Should throw 404 error when trying to update non existent organizationCache', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => organizationCacheRepository_1.default.update(randomUUID(), { name: 'non-existent' }, mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
    describe('destroy method', () => {
        it('Should succesfully destroy previously created organizationCache', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const organizationCache = { name: 'test-organizationCache' };
            const returnedorganizationCache = await organizationCacheRepository_1.default.create(organizationCache, mockIRepositoryOptions);
            await organizationCacheRepository_1.default.destroy(returnedorganizationCache.id, mockIRepositoryOptions, true);
            // Try selecting it after destroy, should throw 404
            await expect(() => organizationCacheRepository_1.default.findById(returnedorganizationCache.id, mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
        it('Should throw 404 when trying to destroy a non existent organizationCache', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => organizationCacheRepository_1.default.destroy(randomUUID(), mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
});
//# sourceMappingURL=organizationCacheRepository.test.js.map