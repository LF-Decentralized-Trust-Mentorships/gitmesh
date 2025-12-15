"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const memberRepository_1 = __importDefault(require("../memberRepository"));
const sequelizeTestUtils_1 = __importDefault(require("../../utils/sequelizeTestUtils"));
const types_1 = require("@gitmesh/types");
const memberEnrichmentCacheRepository_1 = __importDefault(require("../memberEnrichmentCacheRepository"));
const db = null;
describe('MemberEnrichmentCacheRepository tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll((done) => {
        // Closing the DB connection allows Jest to exit successfully.
        sequelizeTestUtils_1.default.closeConnection(db);
        done();
    });
    describe('upsert method', () => {
        it('Should create non existing item successfully', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const member2add = {
                username: {
                    [types_1.PlatformType.GITHUB]: {
                        username: 'michael_scott',
                    },
                },
                displayName: 'Member 1',
                email: 'michael@dd.com',
                score: 10,
                attributes: {},
                joinedAt: '2020-05-27T15:13:30Z',
            };
            const member = await memberRepository_1.default.create(member2add, mockIRepositoryOptions);
            const enrichmentData = {
                enrichmentField1: 'string',
                enrichmentField2: 24,
                arrayEnrichmentField: [1, 2, 3],
            };
            const cache = await memberEnrichmentCacheRepository_1.default.upsert(member.id, enrichmentData, mockIRepositoryOptions);
            expect(cache.memberId).toEqual(member.id);
            expect(cache.data).toStrictEqual(enrichmentData);
        });
        it('Should update the data of existing cache item with incoming data', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const member2add = {
                username: {
                    [types_1.PlatformType.GITHUB]: {
                        username: 'michael_scott',
                    },
                },
                displayName: 'Member 1',
                email: 'michael@dd.com',
                score: 10,
                attributes: {},
                joinedAt: '2020-05-27T15:13:30Z',
            };
            const member = await memberRepository_1.default.create(member2add, mockIRepositoryOptions);
            const enrichmentData = {
                enrichmentField1: 'string',
                enrichmentField2: 24,
                arrayEnrichmentField: [1, 2, 3],
            };
            let cache = await memberEnrichmentCacheRepository_1.default.upsert(member.id, enrichmentData, mockIRepositoryOptions);
            const newerEnrichmentData = {
                enrichmentField1: 'anotherString',
                enrichmentField2: 99,
                arrayEnrichmentField: ['a', 'b', 'c'],
            };
            // should overwrite with new cache data
            cache = await memberEnrichmentCacheRepository_1.default.upsert(member.id, newerEnrichmentData, mockIRepositoryOptions);
            expect(cache.memberId).toEqual(member.id);
            expect(cache.data).toStrictEqual(newerEnrichmentData);
            // when we send an empty object, it shouldn't overwrite
            cache = await memberEnrichmentCacheRepository_1.default.upsert(member.id, {}, mockIRepositoryOptions);
            expect(cache.memberId).toEqual(member.id);
            expect(cache.data).toStrictEqual(newerEnrichmentData);
        });
    });
    describe('findByMemberId method', () => {
        it('Should find enrichment cache by memberId', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const member2add = {
                username: {
                    [types_1.PlatformType.GITHUB]: {
                        username: 'michael_scott',
                    },
                },
                displayName: 'Member 1',
                email: 'michael@dd.com',
                score: 10,
                attributes: {},
                joinedAt: '2020-05-27T15:13:30Z',
            };
            const member = await memberRepository_1.default.create(member2add, mockIRepositoryOptions);
            const enrichmentData = {
                enrichmentField1: 'string',
                enrichmentField2: 24,
                arrayEnrichmentField: [1, 2, 3],
            };
            await memberEnrichmentCacheRepository_1.default.upsert(member.id, enrichmentData, mockIRepositoryOptions);
            const cache = await memberEnrichmentCacheRepository_1.default.findByMemberId(member.id, mockIRepositoryOptions);
            expect(cache.memberId).toEqual(member.id);
            expect(cache.data).toEqual(enrichmentData);
        });
        it('Should return null for non-existing cache entry', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const cache = await memberEnrichmentCacheRepository_1.default.findByMemberId((0, crypto_1.randomUUID)(), mockIRepositoryOptions);
            expect(cache).toBeNull();
        });
    });
});
//# sourceMappingURL=memberEnrichmentCacheRepository.test.js.map