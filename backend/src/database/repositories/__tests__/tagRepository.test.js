"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const tagRepository_1 = __importDefault(require("../tagRepository"));
const sequelizeTestUtils_1 = __importDefault(require("../../utils/sequelizeTestUtils"));
const db = null;
describe('TagRepository tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll((done) => {
        // Closing the DB connection allows Jest to exit successfully.
        sequelizeTestUtils_1.default.closeConnection(db);
        done();
    });
    describe('create method', () => {
        it('Should create the given tag succesfully', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const tag2add = { name: 'test-tag' };
            const tagCreated = await tagRepository_1.default.create(tag2add, mockIRepositoryOptions);
            tagCreated.createdAt = tagCreated.createdAt.toISOString().split('T')[0];
            tagCreated.updatedAt = tagCreated.updatedAt.toISOString().split('T')[0];
            const expectedTagCreated = {
                id: tagCreated.id,
                name: tag2add.name,
                members: [],
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
            };
            expect(tagCreated).toStrictEqual(expectedTagCreated);
        });
        it('Should throw sequelize not null error -- name field is required', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const tag2add = {};
            await expect(() => tagRepository_1.default.create(tag2add, mockIRepositoryOptions)).rejects.toThrow();
        });
    });
    describe('findById method', () => {
        it('Should successfully find created tag by id', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const tag2add = { name: 'test-tag' };
            const tagCreated = await tagRepository_1.default.create(tag2add, mockIRepositoryOptions);
            tagCreated.createdAt = tagCreated.createdAt.toISOString().split('T')[0];
            tagCreated.updatedAt = tagCreated.updatedAt.toISOString().split('T')[0];
            const expectedTagFound = {
                id: tagCreated.id,
                name: tag2add.name,
                members: [],
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
            };
            const tagById = await tagRepository_1.default.findById(tagCreated.id, mockIRepositoryOptions);
            tagById.createdAt = tagById.createdAt.toISOString().split('T')[0];
            tagById.updatedAt = tagById.updatedAt.toISOString().split('T')[0];
            expect(tagById).toStrictEqual(expectedTagFound);
        });
        it('Should throw 404 error when no tag found with given id', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => tagRepository_1.default.findById(randomUUID(), mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
    describe('filterIdsInTenant method', () => {
        it('Should return the given ids of previously created tag entities', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const tag1 = { name: 'test1' };
            const tag2 = { name: 'test2' };
            const tag1Created = await tagRepository_1.default.create(tag1, mockIRepositoryOptions);
            const tag2Created = await tagRepository_1.default.create(tag2, mockIRepositoryOptions);
            const filterIdsReturned = await tagRepository_1.default.filterIdsInTenant([tag1Created.id, tag2Created.id], mockIRepositoryOptions);
            expect(filterIdsReturned).toStrictEqual([tag1Created.id, tag2Created.id]);
        });
        it('Should only return the ids of previously created tags and filter random uuids out', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const tag = { name: 'test1' };
            const tagCreated = await tagRepository_1.default.create(tag, mockIRepositoryOptions);
            const { randomUUID } = require('crypto');
            const filterIdsReturned = await tagRepository_1.default.filterIdsInTenant([tagCreated.id, randomUUID(), randomUUID()], mockIRepositoryOptions);
            expect(filterIdsReturned).toStrictEqual([tagCreated.id]);
        });
        it('Should return an empty array for an irrelevant tenant', async () => {
            let mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const tag = { name: 'test' };
            const tagCreated = await tagRepository_1.default.create(tag, mockIRepositoryOptions);
            // create a new tenant and bind options to it
            mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const filterIdsReturned = await tagRepository_1.default.filterIdsInTenant([tagCreated.id], mockIRepositoryOptions);
            expect(filterIdsReturned).toStrictEqual([]);
        });
    });
    describe('findAndCountAll method', () => {
        it('Should find and count all tags, with various filters', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const tag1 = { name: 'test-tag' };
            const tag2 = { name: 'test-tag-2' };
            const tag3 = { name: 'another-tag' };
            const tag1Created = await tagRepository_1.default.create(tag1, mockIRepositoryOptions);
            await new Promise((resolve) => {
                setTimeout(resolve, 50);
            });
            const tag2Created = await tagRepository_1.default.create(tag2, mockIRepositoryOptions);
            await new Promise((resolve) => {
                setTimeout(resolve, 50);
            });
            const tag3Created = await tagRepository_1.default.create(tag3, mockIRepositoryOptions);
            // Test filter by name
            // Current findAndCountAll uses wildcarded like statement so it matches both tags
            let tags = await tagRepository_1.default.findAndCountAll({ filter: { name: 'test-tag' } }, mockIRepositoryOptions);
            expect(tags.count).toEqual(2);
            expect(tags.rows).toStrictEqual([tag2Created, tag1Created]);
            // Test filter by id
            tags = await tagRepository_1.default.findAndCountAll({ filter: { id: tag1Created.id } }, mockIRepositoryOptions);
            expect(tags.count).toEqual(1);
            expect(tags.rows).toStrictEqual([tag1Created]);
            // Test filter by createdAt - find all between tag1.createdAt and tag3.createdAt
            tags = await tagRepository_1.default.findAndCountAll({
                filter: {
                    createdAtRange: [tag1Created.createdAt, tag3Created.createdAt],
                },
            }, mockIRepositoryOptions);
            expect(tags.count).toEqual(3);
            expect(tags.rows).toStrictEqual([tag3Created, tag2Created, tag1Created]);
            // Test filter by createdAt - find all where createdAt < tag2.createdAt
            tags = await tagRepository_1.default.findAndCountAll({
                filter: {
                    createdAtRange: [null, tag2Created.createdAt],
                },
            }, mockIRepositoryOptions);
            expect(tags.count).toEqual(2);
            expect(tags.rows).toStrictEqual([tag2Created, tag1Created]);
            // Test filter by createdAt - find all where createdAt < tag1.createdAt
            tags = await tagRepository_1.default.findAndCountAll({
                filter: {
                    createdAtRange: [null, tag1Created.createdAt],
                },
            }, mockIRepositoryOptions);
            expect(tags.count).toEqual(1);
            expect(tags.rows).toStrictEqual([tag1Created]);
        });
    });
    describe('update method', () => {
        it('Should succesfully update previously created tag', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const tag1 = { name: 'test-tag' };
            const tagCreated = await tagRepository_1.default.create(tag1, mockIRepositoryOptions);
            const tagUpdated = await tagRepository_1.default.update(tagCreated.id, { name: 'updated-tag-name' }, mockIRepositoryOptions);
            expect(tagUpdated.updatedAt.getTime()).toBeGreaterThan(tagUpdated.createdAt.getTime());
            const tagExpected = {
                id: tagCreated.id,
                name: tagUpdated.name,
                importHash: null,
                createdAt: tagCreated.createdAt,
                updatedAt: tagUpdated.updatedAt,
                deletedAt: null,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
                members: [],
            };
            expect(tagUpdated).toStrictEqual(tagExpected);
        });
        it('Should throw 404 error when trying to update non existent tag', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => tagRepository_1.default.update(randomUUID(), { name: 'non-existent' }, mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
    describe('destroy method', () => {
        it('Should succesfully destroy previously created tag', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const tag = { name: 'test-tag' };
            const returnedTag = await tagRepository_1.default.create(tag, mockIRepositoryOptions);
            await tagRepository_1.default.destroy(returnedTag.id, mockIRepositoryOptions, true);
            // Try selecting it after destroy, should throw 404
            await expect(() => tagRepository_1.default.findById(returnedTag.id, mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
        it('Should throw 404 when trying to destroy a non existent tag', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => tagRepository_1.default.destroy(randomUUID(), mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
});
//# sourceMappingURL=tagRepository.test.js.map