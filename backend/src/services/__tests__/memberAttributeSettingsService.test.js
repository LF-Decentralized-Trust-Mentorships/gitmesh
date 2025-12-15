"use strict";
/* eslint @typescript-eslint/no-unused-vars: 0 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const integrations_1 = require("@gitmesh/integrations");
const common_1 = require("@gitmesh/common");
const sequelizeTestUtils_1 = __importDefault(require("../../database/utils/sequelizeTestUtils"));
const memberAttributeSettingsService_1 = __importDefault(require("../memberAttributeSettingsService"));
const types_1 = require("@gitmesh/types");
const redis_1 = require("@gitmesh/redis");
const conf_1 = require("../../conf");
const logging_1 = require("@gitmesh/logging");
const log = (0, logging_1.getServiceLogger)();
let cache = undefined;
const clearRedisCache = async () => {
    if (!cache) {
        const redis = await (0, redis_1.getRedisClient)(conf_1.REDIS_CONFIG);
        cache = new redis_1.RedisCache('memberAttributes', redis, log);
    }
    await cache.deleteAll();
};
const db = null;
describe('MemberAttributeSettingService tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
        await clearRedisCache();
    });
    afterAll(async () => {
        // Closing the DB connection allows Jest to exit successfully.
        await sequelizeTestUtils_1.default.closeConnection(db);
    });
    describe('createPredefined tests', () => {
        it('Should create predefined github attributes', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const as = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            const attributes = (await as.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES)).map((attribute) => {
                attribute.createdAt = attribute.createdAt.toISOString().split('T')[0];
                attribute.updatedAt = attribute.updatedAt.toISOString().split('T')[0];
                return attribute;
            });
            const [isHireableCreated, urlCreated, websiteUrlCreated, bioCreated, companyCreated, locationCreated,] = attributes;
            const [isHireable, url, websiteUrl, bio, company, location] = integrations_1.GITHUB_MEMBER_ATTRIBUTES;
            const expected = [
                {
                    id: isHireableCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: isHireable.show,
                    type: isHireable.type,
                    canDelete: isHireable.canDelete,
                    name: isHireable.name,
                    label: isHireable.label,
                },
                {
                    id: urlCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: url.show,
                    type: url.type,
                    canDelete: url.canDelete,
                    name: url.name,
                    label: url.label,
                },
                {
                    id: websiteUrlCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: websiteUrl.show,
                    type: websiteUrl.type,
                    canDelete: websiteUrl.canDelete,
                    name: websiteUrl.name,
                    label: websiteUrl.label,
                },
                {
                    id: bioCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: bio.show,
                    type: bio.type,
                    canDelete: bio.canDelete,
                    name: bio.name,
                    label: bio.label,
                },
                {
                    id: companyCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: company.show,
                    type: company.type,
                    canDelete: company.canDelete,
                    name: company.name,
                    label: company.label,
                },
                {
                    id: locationCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: location.show,
                    type: location.type,
                    canDelete: location.canDelete,
                    name: location.name,
                    label: location.label,
                },
            ];
            expect(attributes).toEqual(expected);
        });
        it('Should create predefined discord attributes', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const as = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            const attributes = (await as.createPredefined(integrations_1.DISCORD_MEMBER_ATTRIBUTES)).map((attribute) => {
                attribute.createdAt = attribute.createdAt.toISOString().split('T')[0];
                attribute.updatedAt = attribute.updatedAt.toISOString().split('T')[0];
                return attribute;
            });
            const [idCreated, avatarUrlCreated] = attributes;
            const [id, avatarUrl] = integrations_1.DISCORD_MEMBER_ATTRIBUTES;
            const expected = [
                {
                    id: idCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: id.show,
                    type: id.type,
                    canDelete: id.canDelete,
                    name: id.name,
                    label: id.label,
                },
                {
                    id: avatarUrlCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: avatarUrl.show,
                    type: avatarUrl.type,
                    canDelete: avatarUrl.canDelete,
                    name: avatarUrl.name,
                    label: avatarUrl.label,
                },
            ];
            expect(attributes).toEqual(expected);
        });
        it('Should create predefined devto attributes', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const as = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            const attributes = (await as.createPredefined(integrations_1.DEVTO_MEMBER_ATTRIBUTES)).map((attribute) => {
                attribute.createdAt = attribute.createdAt.toISOString().split('T')[0];
                attribute.updatedAt = attribute.updatedAt.toISOString().split('T')[0];
                return attribute;
            });
            const [idCreated, urlCreated, nameCreated, bioCreated, locationCreated] = attributes;
            const [id, url, name, bio, location] = integrations_1.DEVTO_MEMBER_ATTRIBUTES;
            const expected = [
                {
                    id: idCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: id.show,
                    type: id.type,
                    canDelete: id.canDelete,
                    name: id.name,
                    label: id.label,
                },
                {
                    id: urlCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: url.show,
                    type: url.type,
                    canDelete: url.canDelete,
                    name: url.name,
                    label: url.label,
                },
                {
                    id: nameCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: name.show,
                    type: name.type,
                    canDelete: name.canDelete,
                    name: name.name,
                    label: name.label,
                },
                {
                    id: bioCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: bio.show,
                    type: bio.type,
                    canDelete: bio.canDelete,
                    name: bio.name,
                    label: bio.label,
                },
                {
                    id: locationCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: location.show,
                    type: location.type,
                    canDelete: location.canDelete,
                    name: location.name,
                    label: location.label,
                },
            ];
            expect(attributes).toEqual(expected);
        });
        it('Should create predefined twitter attributes', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const as = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            const attributes = (await as.createPredefined(integrations_1.TWITTER_MEMBER_ATTRIBUTES)).map((attribute) => {
                attribute.createdAt = attribute.createdAt.toISOString().split('T')[0];
                attribute.updatedAt = attribute.updatedAt.toISOString().split('T')[0];
                return attribute;
            });
            const [idCreated, avatarUrlCreated, urlCreated, bioCreated, locationCreated] = attributes;
            const [id, avatarUrl, url, bio, location] = integrations_1.TWITTER_MEMBER_ATTRIBUTES;
            const expected = [
                {
                    id: idCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: id.show,
                    type: id.type,
                    canDelete: id.canDelete,
                    name: id.name,
                    label: id.label,
                },
                {
                    id: avatarUrlCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: avatarUrl.show,
                    type: avatarUrl.type,
                    canDelete: avatarUrl.canDelete,
                    name: avatarUrl.name,
                    label: avatarUrl.label,
                },
                {
                    id: urlCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: url.show,
                    type: url.type,
                    canDelete: url.canDelete,
                    name: url.name,
                    label: url.label,
                },
                {
                    id: bioCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: bio.show,
                    type: bio.type,
                    canDelete: bio.canDelete,
                    name: bio.name,
                    label: bio.label,
                },
                {
                    id: locationCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: location.show,
                    type: location.type,
                    canDelete: location.canDelete,
                    name: location.name,
                    label: location.label,
                },
            ];
            expect(attributes).toEqual(expected);
        });
        it('Should create predefined slack attributes', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const as = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            const attributes = (await as.createPredefined(integrations_1.SLACK_MEMBER_ATTRIBUTES)).map((attribute) => {
                attribute.createdAt = attribute.createdAt.toISOString().split('T')[0];
                attribute.updatedAt = attribute.updatedAt.toISOString().split('T')[0];
                return attribute;
            });
            const [idCreated, avatarUrlCreated, jobTitleCreated, timezoneCreated] = attributes;
            const [id, avatarUrl, jobTitle, timezone] = integrations_1.SLACK_MEMBER_ATTRIBUTES;
            const expected = [
                {
                    id: idCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: id.show,
                    type: id.type,
                    canDelete: id.canDelete,
                    name: id.name,
                    label: id.label,
                },
                {
                    id: avatarUrlCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: avatarUrl.show,
                    type: avatarUrl.type,
                    canDelete: avatarUrl.canDelete,
                    name: avatarUrl.name,
                    label: avatarUrl.label,
                },
                {
                    id: jobTitleCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: jobTitle.show,
                    type: jobTitle.type,
                    canDelete: jobTitle.canDelete,
                    name: jobTitle.name,
                    label: jobTitle.label,
                },
                {
                    id: timezoneCreated.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: timezone.show,
                    type: timezone.type,
                    canDelete: timezone.canDelete,
                    name: timezone.name,
                    label: timezone.label,
                },
            ];
            expect(attributes).toEqual(expected);
        });
        it('Should accept duplicate attributes from different platforms without an exception', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const as = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            const attributes = await as.createPredefined(integrations_1.TWITTER_MEMBER_ATTRIBUTES);
            const attributes2 = (await as.createPredefined(integrations_1.DEVTO_MEMBER_ATTRIBUTES)).map((attribute) => {
                attribute.createdAt = attribute.createdAt.toISOString().split('T')[0];
                attribute.updatedAt = attribute.updatedAt.toISOString().split('T')[0];
                return attribute;
            });
            // create predefined method should still return shared attributes `url` and `id`
            const [idCreatedTwitter, _avatarUrlCreated, urlCreatedTwitter, bioCreatedTwitter, locationCreatedTwitter,] = attributes;
            const [_idCreatedDevTo, _urlCreatedDevTo, nameCreatedDevTo, _bioCreatedDevTo, _locationCreatedDevTo,] = attributes2;
            const [id, url, name, bio, location] = integrations_1.DEVTO_MEMBER_ATTRIBUTES;
            console.log('urlCreatedTwitter', urlCreatedTwitter.id);
            console.log('urlCreatedDevTo', _urlCreatedDevTo.id);
            console.log('bioCreatedTwitter', bioCreatedTwitter.id);
            console.log('bioCreatedDevTo', _bioCreatedDevTo.id);
            console.log('locationCreatedTwitter', locationCreatedTwitter.id);
            console.log('locationCreatedDevTo', _locationCreatedDevTo.id);
            const expected = [
                {
                    id: idCreatedTwitter.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: id.show,
                    type: id.type,
                    canDelete: id.canDelete,
                    name: id.name,
                    label: id.label,
                },
                {
                    id: _urlCreatedDevTo.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: url.show,
                    type: url.type,
                    canDelete: url.canDelete,
                    name: url.name,
                    label: url.label,
                },
                {
                    id: nameCreatedDevTo.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: name.show,
                    type: name.type,
                    canDelete: name.canDelete,
                    name: name.name,
                    label: name.label,
                },
                {
                    id: _bioCreatedDevTo.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: bio.show,
                    type: bio.type,
                    canDelete: bio.canDelete,
                    name: bio.name,
                    label: bio.label,
                },
                {
                    id: _locationCreatedDevTo.id,
                    createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                    createdById: mockIRepositoryOptions.currentUser.id,
                    updatedById: mockIRepositoryOptions.currentUser.id,
                    tenantId: mockIRepositoryOptions.currentTenant.id,
                    options: [],
                    show: location.show,
                    type: location.type,
                    canDelete: location.canDelete,
                    name: location.name,
                    label: location.label,
                },
            ];
            expect(attributes2).toEqual(expected);
            // find all attributes: url, name, id, imgUrl should be present
            const allAttributes = await as.findAndCountAll({});
            expect(allAttributes.count).toBe(6);
            const allAttributeNames = allAttributes.rows.map((attribute) => attribute.name);
            expect(allAttributeNames).toEqual(['name', 'url', 'bio', 'location', 'avatarUrl', 'sourceId']);
        });
    });
    describe('create tests', () => {
        it('Should add single attribute to member attributes - all fields', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const as = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            const attribute1 = {
                name: 'att1',
                label: 'attribute 1',
                type: types_1.MemberAttributeType.BOOLEAN,
                canDelete: true,
                show: true,
            };
            const attributeCreated = await as.create(attribute1);
            const attributeExpected = Object.assign(Object.assign({}, attributeCreated), { options: [], name: attribute1.name, label: attribute1.label, type: attribute1.type, canDelete: attribute1.canDelete, show: attribute1.show });
            expect(attributeCreated).toStrictEqual(attributeExpected);
        });
        it('Should create a multi-select field with options', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const as = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            const attribute1 = {
                name: 'att1',
                label: 'attribute 1',
                type: types_1.MemberAttributeType.MULTI_SELECT,
                options: ['option1', 'option2'],
                canDelete: true,
                show: true,
            };
            const attributeCreated = await as.create(attribute1);
            const attributeExpected = Object.assign(Object.assign({}, attributeCreated), { options: ['option1', 'option2'], name: attribute1.name, label: attribute1.label, type: attribute1.type, canDelete: attribute1.canDelete, show: attribute1.show });
            expect(attributeCreated).toStrictEqual(attributeExpected);
        });
        it('Should add single attribute to member attributes - without default fields', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const as = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            const attribute1 = {
                name: 'att1',
                label: 'attribute 1',
                type: types_1.MemberAttributeType.BOOLEAN,
            };
            const attributeCreated = await as.create(attribute1);
            // canDelete and show should be true by default
            const attributeExpected = Object.assign(Object.assign({}, attributeCreated), { options: [], name: attribute1.name, label: attribute1.label, type: attribute1.type, canDelete: true, show: true });
            expect(attributeCreated).toStrictEqual(attributeExpected);
        });
        it('Should add single attribute to member attributes - without default fields and name', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const as = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            const attribute1 = {
                label: 'an attribute with multiple words',
                type: types_1.MemberAttributeType.BOOLEAN,
            };
            const attributeCreated = await as.create(attribute1);
            // name should be generated from the label
            const attributeExpected = Object.assign(Object.assign({}, attributeCreated), { options: [], name: 'anAttributeWithMultipleWords', label: attribute1.label, type: attribute1.type, canDelete: true, show: true });
            expect(attributeCreated).toStrictEqual(attributeExpected);
        });
    });
    describe('destroyAll tests', () => {
        it('Should remove a single attribute succesfully', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const as = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            const attribute = await as.create({
                name: 'att1',
                label: 'attribute 1',
                type: types_1.MemberAttributeType.BOOLEAN,
                canDelete: true,
                show: true,
            });
            await as.destroyAll([attribute.id]);
            const allAttributes = await as.findAndCountAll({});
            expect(allAttributes.count).toBe(0);
            expect(allAttributes.rows).toStrictEqual([]);
        });
        it('Should remove multiple existing attributes successfully, and should silently accept non existing names and keep the canDelete=false attributes intact', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const as = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            const attribute1 = await as.create({
                name: 'att1',
                label: 'attribute 1',
                type: types_1.MemberAttributeType.BOOLEAN,
                canDelete: true,
                show: true,
            });
            const attribute2 = await as.create({
                name: 'att2',
                label: 'attribute 2',
                type: types_1.MemberAttributeType.STRING,
                canDelete: false,
                show: true,
            });
            const attribute3 = await as.create({
                name: 'att3',
                label: 'attribute 3',
                type: types_1.MemberAttributeType.EMAIL,
                canDelete: true,
                show: false,
            });
            await as.destroyAll([attribute1.id, attribute2.id, attribute3.id]);
            const allAttributes = await as.findAndCountAll({});
            expect(allAttributes.count).toBe(1);
            expect(allAttributes.rows).toStrictEqual([attribute2]);
        });
    });
    describe('update tests', () => {
        it(`Should throw typesNotMatching 400 error when updating an existing attribute's type to another value`, async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const as = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            const attribute = await as.create({
                name: 'attribute 1',
                label: 'attribute 1',
                type: types_1.MemberAttributeType.BOOLEAN,
                canDelete: true,
                show: true,
            });
            await expect(() => as.update(attribute.id, {
                name: attribute.name,
                label: 'some other label',
                type: types_1.MemberAttributeType.STRING,
            })).rejects.toThrowError(new common_1.Error400('en', 'settings.memberAttributes.errors.typesNotMatching', attribute.name));
        });
        it(`Should throw canDeleteReadonly 400 error when updating an existing attribute's canDelete field to another value`, async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const as = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            const attribute = await as.create({
                name: 'attribute 1',
                label: 'attribute 1',
                type: types_1.MemberAttributeType.BOOLEAN,
                canDelete: true,
                show: true,
            });
            await expect(() => as.update(attribute.id, {
                canDelete: false,
                show: true,
            })).rejects.toThrowError(new common_1.Error400('en', 'settings.memberAttributes.errors.canDeleteReadonly', attribute.name));
        });
        it(`Should should update other cases successfully`, async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const as = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            const attribute = await as.create({
                name: 'attribute 1',
                label: 'attribute 1',
                type: types_1.MemberAttributeType.BOOLEAN,
                canDelete: true,
                show: true,
            });
            const attribute1Update = {
                name: attribute.name,
                label: 'some other label',
                type: attribute.type,
                canDelete: true,
                show: false,
            };
            const updatedAttribute = await as.update(attribute.id, attribute1Update);
            const expectedAttribute = Object.assign(Object.assign({}, updatedAttribute), { name: attribute.name, label: attribute1Update.label, type: attribute.type, canDelete: attribute.canDelete, show: attribute1Update.show });
            expect(updatedAttribute).toStrictEqual(expectedAttribute);
        });
    });
    describe('isCorrectType tests', () => {
        it(`Should check various types and values successfully`, async () => {
            const isCorrectType = memberAttributeSettingsService_1.default.isCorrectType;
            // boolean
            expect(isCorrectType(true, types_1.MemberAttributeType.BOOLEAN)).toBeTruthy();
            expect(isCorrectType(false, types_1.MemberAttributeType.BOOLEAN)).toBeTruthy();
            expect(isCorrectType('true', types_1.MemberAttributeType.BOOLEAN)).toBeTruthy();
            expect(isCorrectType('false', types_1.MemberAttributeType.BOOLEAN)).toBeTruthy();
            expect(isCorrectType(5, types_1.MemberAttributeType.BOOLEAN)).toBeFalsy();
            expect(isCorrectType('someString', types_1.MemberAttributeType.BOOLEAN)).toBeFalsy();
            expect(isCorrectType({}, types_1.MemberAttributeType.BOOLEAN)).toBeFalsy();
            expect(isCorrectType([], types_1.MemberAttributeType.BOOLEAN)).toBeFalsy();
            // string
            expect(isCorrectType('', types_1.MemberAttributeType.STRING)).toBeTruthy();
            expect(isCorrectType('someString', types_1.MemberAttributeType.STRING)).toBeTruthy();
            expect(isCorrectType(5, types_1.MemberAttributeType.STRING)).toBeFalsy();
            expect(isCorrectType(true, types_1.MemberAttributeType.STRING)).toBeFalsy();
            expect(isCorrectType({}, types_1.MemberAttributeType.STRING)).toBeFalsy();
            // date
            expect(isCorrectType('2022-05-10', types_1.MemberAttributeType.DATE)).toBeTruthy();
            expect(isCorrectType('2022-06-15T00:00:00', types_1.MemberAttributeType.DATE)).toBeTruthy();
            expect(isCorrectType('2022-07-14T00:00:00Z', types_1.MemberAttributeType.DATE)).toBeTruthy();
            expect(isCorrectType(5, types_1.MemberAttributeType.DATE)).toBeFalsy();
            expect(isCorrectType('someString', types_1.MemberAttributeType.DATE)).toBeFalsy();
            expect(isCorrectType('', types_1.MemberAttributeType.DATE)).toBeFalsy();
            expect(isCorrectType(true, types_1.MemberAttributeType.DATE)).toBeFalsy();
            expect(isCorrectType({}, types_1.MemberAttributeType.DATE)).toBeFalsy();
            expect(isCorrectType([], types_1.MemberAttributeType.DATE)).toBeFalsy();
            // email
            expect(isCorrectType('anil@gitmesh.dev', types_1.MemberAttributeType.EMAIL)).toBeTruthy();
            expect(isCorrectType('anil+123@gitmesh.dev', types_1.MemberAttributeType.EMAIL)).toBeTruthy();
            expect(isCorrectType(15, types_1.MemberAttributeType.EMAIL)).toBeFalsy();
            expect(isCorrectType('', types_1.MemberAttributeType.EMAIL)).toBeFalsy();
            expect(isCorrectType('someString', types_1.MemberAttributeType.EMAIL)).toBeFalsy();
            expect(isCorrectType(true, types_1.MemberAttributeType.EMAIL)).toBeFalsy();
            expect(isCorrectType({}, types_1.MemberAttributeType.EMAIL)).toBeFalsy();
            expect(isCorrectType([], types_1.MemberAttributeType.EMAIL)).toBeFalsy();
            // number
            expect(isCorrectType(100, types_1.MemberAttributeType.NUMBER)).toBeTruthy();
            expect(isCorrectType(5.123, types_1.MemberAttributeType.NUMBER)).toBeTruthy();
            expect(isCorrectType(0.000001, types_1.MemberAttributeType.NUMBER)).toBeTruthy();
            expect(isCorrectType(0, types_1.MemberAttributeType.NUMBER)).toBeTruthy();
            expect(isCorrectType('125', types_1.MemberAttributeType.NUMBER)).toBeTruthy();
            expect(isCorrectType('', types_1.MemberAttributeType.NUMBER)).toBeFalsy();
            expect(isCorrectType('someString', types_1.MemberAttributeType.NUMBER)).toBeFalsy();
            expect(isCorrectType(true, types_1.MemberAttributeType.NUMBER)).toBeFalsy();
            expect(isCorrectType({}, types_1.MemberAttributeType.NUMBER)).toBeFalsy();
            expect(isCorrectType([], types_1.MemberAttributeType.NUMBER)).toBeFalsy();
            // multiselect
            expect(isCorrectType(['a', 'b', 'c'], types_1.MemberAttributeType.MULTI_SELECT, {
                options: ['a', 'b', 'c', 'd'],
            })).toBeTruthy();
            expect(isCorrectType([], types_1.MemberAttributeType.MULTI_SELECT, { options: ['a', 'b', 'c', 'd'] })).toBeTruthy();
            expect(isCorrectType(['a'], types_1.MemberAttributeType.MULTI_SELECT, { options: ['a', 'b', 'c', 'd'] })).toBeTruthy();
            expect(isCorrectType(['a', '42'], types_1.MemberAttributeType.MULTI_SELECT, {
                options: ['a', 'b', 'c', 'd'],
            })).toBeFalsy();
            expect(isCorrectType('a', types_1.MemberAttributeType.MULTI_SELECT, { options: ['a', 'b', 'c'] })).toBeFalsy();
            expect(isCorrectType(5, types_1.MemberAttributeType.MULTI_SELECT, { options: ['a', 'b', 'c'] })).toBeFalsy();
        });
    });
});
//# sourceMappingURL=memberAttributeSettingsService.test.js.map