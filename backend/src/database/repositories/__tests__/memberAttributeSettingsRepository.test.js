"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const types_1 = require("@gitmesh/types");
const memberAttributeSettingsRepository_1 = __importDefault(require("../memberAttributeSettingsRepository"));
const sequelizeTestUtils_1 = __importDefault(require("../../utils/sequelizeTestUtils"));
const db = null;
describe('MemberAttributeSettings tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll((done) => {
        // Closing the DB connection allows Jest to exit successfully.
        sequelizeTestUtils_1.default.closeConnection(db);
        done();
    });
    describe('create method', () => {
        it('Should create settings for a member attribute succesfully with default values', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const attribute = {
                type: types_1.MemberAttributeType.BOOLEAN,
                label: 'attribute 1',
                name: 'attribute1',
            };
            const attributeCreated = await memberAttributeSettingsRepository_1.default.create(attribute, mockIRepositoryOptions);
            attributeCreated.createdAt = attributeCreated.createdAt.toISOString().split('T')[0];
            attributeCreated.updatedAt = attributeCreated.updatedAt.toISOString().split('T')[0];
            const attributeExpected = {
                id: attributeCreated.id,
                type: attribute.type,
                label: attribute.label,
                name: attribute.name,
                options: [],
                show: true,
                canDelete: true,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                tenantId: mockIRepositoryOptions.currentTenant.id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
            };
            expect(attributeCreated).toStrictEqual(attributeExpected);
        });
        it('Should create settings for a member attribute succesfully with given values', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const attribute = {
                type: types_1.MemberAttributeType.BOOLEAN,
                label: 'attribute 1',
                name: 'attribute1',
                canDelete: false,
                show: false,
            };
            const attributeCreated = await memberAttributeSettingsRepository_1.default.create(attribute, mockIRepositoryOptions);
            attributeCreated.createdAt = attributeCreated.createdAt.toISOString().split('T')[0];
            attributeCreated.updatedAt = attributeCreated.updatedAt.toISOString().split('T')[0];
            const attributeExpected = {
                id: attributeCreated.id,
                type: attribute.type,
                label: attribute.label,
                name: attribute.name,
                show: false,
                options: [],
                canDelete: false,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                tenantId: mockIRepositoryOptions.currentTenant.id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
            };
            expect(attributeCreated).toStrictEqual(attributeExpected);
        });
        it('Should throw unique constraint error for creation of already existing member attributes with same name in the same tenant', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const attribute = {
                type: types_1.MemberAttributeType.BOOLEAN,
                label: 'attribute 1',
                name: 'attribute1',
            };
            await memberAttributeSettingsRepository_1.default.create(attribute, mockIRepositoryOptions);
            await expect(() => memberAttributeSettingsRepository_1.default.create({ type: types_1.MemberAttributeType.STRING, label: 'some label', name: 'attribute1' }, mockIRepositoryOptions)).rejects.toThrow();
        });
        it('Should throw not null error if no name, label or type is given', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            // no type
            await expect(() => memberAttributeSettingsRepository_1.default.create({ type: undefined, label: 'attribute 1', name: 'attribute1' }, mockIRepositoryOptions)).rejects.toThrow();
            // no label
            await expect(() => memberAttributeSettingsRepository_1.default.create({ type: types_1.MemberAttributeType.BOOLEAN, name: 'attribute1', label: undefined }, mockIRepositoryOptions)).rejects.toThrow();
            // no name
            await expect(() => memberAttributeSettingsRepository_1.default.create({ type: types_1.MemberAttributeType.BOOLEAN, label: 'attribute 1' }, mockIRepositoryOptions)).rejects.toThrow();
        });
        it('Should throw 400 error if name exists in member fixed fields', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            // no type
            await expect(() => memberAttributeSettingsRepository_1.default.create({ type: types_1.MemberAttributeType.STRING, label: 'Some Email', name: 'emails' }, mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error400('en', 'settings.memberAttributes.errors.reservedField', 'emails'));
        });
    });
    describe('findById method', () => {
        it('Should successfully find created member attribute by id', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const attribute = {
                type: types_1.MemberAttributeType.BOOLEAN,
                label: 'attribute 1',
                name: 'attribute1',
            };
            const attributeCreated = await memberAttributeSettingsRepository_1.default.create(attribute, mockIRepositoryOptions);
            const attributeExpected = {
                id: attributeCreated.id,
                type: attribute.type,
                label: attribute.label,
                name: attribute.name,
                show: true,
                canDelete: true,
                options: [],
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                tenantId: mockIRepositoryOptions.currentTenant.id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
            };
            const attributeById = await memberAttributeSettingsRepository_1.default.findById(attributeCreated.id, mockIRepositoryOptions);
            attributeById.createdAt = attributeCreated.createdAt.toISOString().split('T')[0];
            attributeById.updatedAt = attributeCreated.updatedAt.toISOString().split('T')[0];
            expect(attributeById).toStrictEqual(attributeExpected);
        });
    });
    describe('findAndCountAll method', () => {
        it('Should find and count all member attributes, with various filters', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const attribute1 = await memberAttributeSettingsRepository_1.default.create({ type: types_1.MemberAttributeType.BOOLEAN, label: 'a label', name: 'attribute1' }, mockIRepositoryOptions);
            const attribute2 = await memberAttributeSettingsRepository_1.default.create({ type: types_1.MemberAttributeType.STRING, label: 'a label', name: 'attribute2', show: false }, mockIRepositoryOptions);
            const attribute3 = await memberAttributeSettingsRepository_1.default.create({
                type: types_1.MemberAttributeType.STRING,
                label: 'some other label',
                name: 'attribute3',
                show: false,
                canDelete: false,
            }, mockIRepositoryOptions);
            // filter by type
            let attributes = await memberAttributeSettingsRepository_1.default.findAndCountAll({ filter: { type: types_1.MemberAttributeType.BOOLEAN } }, mockIRepositoryOptions);
            expect(attributes.count).toEqual(1);
            expect(attributes.rows).toStrictEqual([attribute1]);
            // filter by id
            attributes = await memberAttributeSettingsRepository_1.default.findAndCountAll({ filter: { id: attribute2.id } }, mockIRepositoryOptions);
            expect(attributes.count).toEqual(1);
            expect(attributes.rows).toStrictEqual([attribute2]);
            // filter by label
            attributes = await memberAttributeSettingsRepository_1.default.findAndCountAll({ filter: { label: 'a label' } }, mockIRepositoryOptions);
            expect(attributes.count).toEqual(2);
            expect(attributes.rows).toStrictEqual([attribute2, attribute1]);
            // filter by name
            attributes = await memberAttributeSettingsRepository_1.default.findAndCountAll({ filter: { name: 'attribute3' } }, mockIRepositoryOptions);
            expect(attributes.count).toEqual(1);
            expect(attributes.rows).toStrictEqual([attribute3]);
            // filter by show
            attributes = await memberAttributeSettingsRepository_1.default.findAndCountAll({ filter: { show: false } }, mockIRepositoryOptions);
            expect(attributes.count).toEqual(2);
            expect(attributes.rows).toStrictEqual([attribute3, attribute2]);
            // filter by canDelete
            attributes = await memberAttributeSettingsRepository_1.default.findAndCountAll({ filter: { canDelete: true } }, mockIRepositoryOptions);
            expect(attributes.count).toEqual(2);
            expect(attributes.rows).toStrictEqual([attribute2, attribute1]);
            // filter by createdAt between createdAt a1 and a3
            attributes = await memberAttributeSettingsRepository_1.default.findAndCountAll({
                filter: {
                    createdAtRange: [attribute1.createdAt, attribute3.createdAt],
                },
            }, mockIRepositoryOptions);
            expect(attributes.count).toEqual(3);
            expect(attributes.rows).toStrictEqual([attribute3, attribute2, attribute1]);
            // filter by createdAt <= att2.createdAt
            attributes = await memberAttributeSettingsRepository_1.default.findAndCountAll({
                filter: {
                    createdAtRange: [null, attribute2.createdAt],
                },
            }, mockIRepositoryOptions);
            expect(attributes.count).toEqual(2);
            expect(attributes.rows).toStrictEqual([attribute2, attribute1]);
            // filter by createdAt <= att1.createdAt
            attributes = await memberAttributeSettingsRepository_1.default.findAndCountAll({
                filter: {
                    createdAtRange: [null, attribute1.createdAt],
                },
            }, mockIRepositoryOptions);
            expect(attributes.count).toEqual(1);
            expect(attributes.rows).toStrictEqual([attribute1]);
        });
    });
    describe('update method', () => {
        it('Should succesfully update previously created attribute', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const attribute = await memberAttributeSettingsRepository_1.default.create({ type: types_1.MemberAttributeType.BOOLEAN, label: 'attribute 1', name: 'attribute1' }, mockIRepositoryOptions);
            const attributeUpdated = await memberAttributeSettingsRepository_1.default.update(attribute.id, {
                type: types_1.MemberAttributeType.STRING,
                label: 'some other label',
                name: 'some name',
                show: false,
                canDelete: false,
            }, mockIRepositoryOptions);
            const attributeExpected = {
                id: attribute.id,
                type: attributeUpdated.type,
                label: attributeUpdated.label,
                name: attributeUpdated.name,
                show: attributeUpdated.show,
                canDelete: attributeUpdated.canDelete,
                options: [],
                createdAt: attribute.createdAt,
                updatedAt: attributeUpdated.updatedAt,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
            };
            expect(attributeUpdated).toStrictEqual(attributeExpected);
        });
        it('Should throw 404 error when trying to update non existent attribute', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => memberAttributeSettingsRepository_1.default.update(randomUUID(), { type: 'some-type' }, mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
    describe('destroy method', () => {
        it('Should succesfully destroy previously created attribute', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const attribute = await memberAttributeSettingsRepository_1.default.create({ type: types_1.MemberAttributeType.BOOLEAN, label: 'attribute 1', name: 'attribute1' }, mockIRepositoryOptions);
            await memberAttributeSettingsRepository_1.default.destroy(attribute.id, mockIRepositoryOptions);
            await expect(() => memberAttributeSettingsRepository_1.default.findById(attribute.id, mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
        it('Should throw 404 when trying to destroy a non existent microservice', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => memberAttributeSettingsRepository_1.default.destroy(randomUUID(), mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
});
//# sourceMappingURL=memberAttributeSettingsRepository.test.js.map