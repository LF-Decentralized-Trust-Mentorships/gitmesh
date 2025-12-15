"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const common_1 = require("@gitmesh/common");
const conversationRepository_1 = __importDefault(require("../conversationRepository"));
const activityRepository_1 = __importDefault(require("../activityRepository"));
const memberRepository_1 = __importDefault(require("../memberRepository"));
const sequelizeTestUtils_1 = __importDefault(require("../../utils/sequelizeTestUtils"));
const types_1 = require("@gitmesh/types");
const common_2 = require("@gitmesh/common");
const segmentTestUtils_1 = require("../../utils/segmentTestUtils");
const db = null;
describe('ConversationRepository tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll((done) => {
        // Closing the DB connection allows Jest to exit successfully.
        sequelizeTestUtils_1.default.closeConnection(db);
        done();
    });
    describe('create method', () => {
        it('Should create a conversation succesfully with default values', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const conversation2Add = { title: 'some-title', slug: 'some-slug' };
            const conversationCreated = await conversationRepository_1.default.create(conversation2Add, mockIRepositoryOptions);
            conversationCreated.createdAt = conversationCreated.createdAt.toISOString().split('T')[0];
            conversationCreated.updatedAt = conversationCreated.updatedAt.toISOString().split('T')[0];
            const conversationExpected = {
                id: conversationCreated.id,
                title: conversation2Add.title,
                slug: conversation2Add.slug,
                published: false,
                activities: [],
                activityCount: 0,
                channel: null,
                platform: null,
                lastActive: null,
                conversationStarter: null,
                memberCount: 0,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                tenantId: mockIRepositoryOptions.currentTenant.id,
                segmentId: mockIRepositoryOptions.currentSegments[0].id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
            };
            expect(conversationCreated).toStrictEqual(conversationExpected);
        });
        it('Should create a conversation succesfully with given values', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const conversation2Add = { title: 'some-title', slug: 'some-slug', published: true };
            const conversationCreated = await conversationRepository_1.default.create(conversation2Add, mockIRepositoryOptions);
            conversationCreated.createdAt = conversationCreated.createdAt.toISOString().split('T')[0];
            conversationCreated.updatedAt = conversationCreated.updatedAt.toISOString().split('T')[0];
            const conversationExpected = {
                id: conversationCreated.id,
                title: conversation2Add.title,
                slug: conversation2Add.slug,
                published: conversation2Add.published,
                activities: [],
                activityCount: 0,
                memberCount: 0,
                conversationStarter: null,
                platform: null,
                channel: null,
                lastActive: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                tenantId: mockIRepositoryOptions.currentTenant.id,
                segmentId: mockIRepositoryOptions.currentSegments[0].id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
            };
            expect(conversationCreated).toStrictEqual(conversationExpected);
        });
        it('Should throw not null constraint error if no slug is given', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await expect(() => conversationRepository_1.default.create({ title: 'some-title' }, mockIRepositoryOptions)).rejects.toThrow();
        });
        it('Should throw not null constraint error if no title is given', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await expect(() => conversationRepository_1.default.create({ slug: 'some-slug' }, mockIRepositoryOptions)).rejects.toThrow();
        });
        it('Should throw validation error if title is empty', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await expect(() => conversationRepository_1.default.create({ title: '' }, mockIRepositoryOptions)).rejects.toThrow();
        });
        it('Should throw validation error if slug is empty', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await expect(() => conversationRepository_1.default.create({ slug: '' }, mockIRepositoryOptions)).rejects.toThrow();
        });
    });
    describe('findById method', () => {
        it('Should successfully find created conversation by id', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const conversation2Add = { title: 'some-title', slug: 'some-slug' };
            const conversationCreated = await conversationRepository_1.default.create(conversation2Add, mockIRepositoryOptions);
            const conversationExpected = {
                id: conversationCreated.id,
                title: conversation2Add.title,
                slug: conversation2Add.slug,
                published: false,
                activities: [],
                activityCount: 0,
                memberCount: 0,
                conversationStarter: null,
                platform: null,
                channel: null,
                lastActive: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                tenantId: mockIRepositoryOptions.currentTenant.id,
                segmentId: mockIRepositoryOptions.currentSegments[0].id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
            };
            const conversationById = await conversationRepository_1.default.findById(conversationCreated.id, mockIRepositoryOptions);
            conversationById.createdAt = conversationById.createdAt.toISOString().split('T')[0];
            conversationById.updatedAt = conversationById.updatedAt.toISOString().split('T')[0];
            expect(conversationById).toStrictEqual(conversationExpected);
        });
        it('Should throw 404 error when no conversation found with given id', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => conversationRepository_1.default.findById(randomUUID(), mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
    describe('filterIdsInTenant method', () => {
        it('Should return the given ids of previously created conversation entities', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const conversation1Created = await conversationRepository_1.default.create({ title: 'some-title-1', slug: 'some-slug-1' }, mockIRepositoryOptions);
            const conversation2Created = await conversationRepository_1.default.create({ title: 'some-title-2', slug: 'some-slug-2' }, mockIRepositoryOptions);
            const filterIdsReturned = await conversationRepository_1.default.filterIdsInTenant([conversation1Created.id, conversation2Created.id], mockIRepositoryOptions);
            expect(filterIdsReturned).toStrictEqual([conversation1Created.id, conversation2Created.id]);
        });
        it('Should only return the ids of previously created conversations and filter random uuids out', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const conversationCreated = await conversationRepository_1.default.create({ title: 'some-title-1', slug: 'some-slug-1' }, mockIRepositoryOptions);
            const { randomUUID } = require('crypto');
            const filterIdsReturned = await conversationRepository_1.default.filterIdsInTenant([conversationCreated.id, randomUUID(), randomUUID()], mockIRepositoryOptions);
            expect(filterIdsReturned).toStrictEqual([conversationCreated.id]);
        });
        it('Should return an empty array for an irrelevant tenant', async () => {
            let mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const conversationCreated = await conversationRepository_1.default.create({ title: 'some-title-1', slug: 'some-slug-1' }, mockIRepositoryOptions);
            // create a new tenant and bind options to it
            mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const filterIdsReturned = await conversationRepository_1.default.filterIdsInTenant([conversationCreated.id], mockIRepositoryOptions);
            expect(filterIdsReturned).toStrictEqual([]);
        });
    });
    describe('findAndCountAll method', () => {
        it('Should find and count all conversations, with various filters', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await (0, segmentTestUtils_1.populateSegments)(mockIRepositoryOptions);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.SLACK]: {
                        username: 'test',
                        integrationId: (0, common_2.generateUUIDv1)(),
                    },
                },
                displayName: 'Member 1',
                platform: types_1.PlatformType.SLACK,
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            let conversation1Created = await conversationRepository_1.default.create({ title: 'a cool title', slug: 'a-cool-title' }, mockIRepositoryOptions);
            const activity1Created = await activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-27T14:13:30Z',
                platform: types_1.PlatformType.SLACK,
                attributes: {
                    replies: 12,
                },
                body: 'Some Parent Activity',
                channel: 'general',
                isContribution: true,
                member: memberCreated.id,
                username: 'test',
                conversationId: conversation1Created.id,
                score: 1,
                sourceId: '#sourceId1',
            }, mockIRepositoryOptions);
            const activity2Created = await activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-28T15:13:30Z',
                platform: types_1.PlatformType.SLACK,
                attributes: {
                    replies: 12,
                },
                body: 'Here',
                channel: 'general',
                isContribution: true,
                member: memberCreated.id,
                username: 'test',
                score: 1,
                parent: activity1Created.id,
                conversationId: conversation1Created.id,
                sourceId: '#sourceId2',
            }, mockIRepositoryOptions);
            const activity3Created = await activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-29T16:13:30Z',
                platform: types_1.PlatformType.SLACK,
                attributes: {
                    replies: 12,
                },
                body: 'Here',
                channel: 'general',
                isContribution: true,
                member: memberCreated.id,
                username: 'test',
                score: 1,
                parent: activity1Created.id,
                conversationId: conversation1Created.id,
                sourceId: '#sourceId3',
            }, mockIRepositoryOptions);
            let conversation2Created = await conversationRepository_1.default.create({ title: 'a cool title 2', slug: 'a-cool-title-2' }, mockIRepositoryOptions);
            const activity4Created = await activityRepository_1.default.create({
                type: 'message',
                timestamp: '2020-06-02T15:13:30Z',
                platform: types_1.PlatformType.DISCORD,
                url: 'https://parent-id-url.com',
                body: 'conversation activity 1',
                channel: 'Some-Channel',
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                conversationId: conversation2Created.id,
                sourceId: '#sourceId4',
            }, mockIRepositoryOptions);
            const activity5Created = await activityRepository_1.default.create({
                type: 'message',
                timestamp: '2020-06-03T15:13:30Z',
                platform: types_1.PlatformType.DISCORD,
                body: 'conversation activity 2',
                channel: 'Some-Channel',
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                conversationId: conversation2Created.id,
                sourceId: '#sourceId5',
            }, mockIRepositoryOptions);
            let conversation3Created = await conversationRepository_1.default.create({ title: 'some other title', slug: 'some-other-title', published: true }, mockIRepositoryOptions);
            const activity6Created = await activityRepository_1.default.create({
                type: 'message',
                timestamp: '2020-06-05T15:13:30Z',
                platform: types_1.PlatformType.SLACK,
                url: 'https://parent-id-url.com',
                body: 'conversation activity 1',
                channel: 'Some-Channel',
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                conversationId: conversation3Created.id,
                sourceId: '#sourceId6',
            }, mockIRepositoryOptions);
            const activity7Created = await activityRepository_1.default.create({
                type: 'message',
                timestamp: '2020-06-07T15:13:30Z',
                platform: types_1.PlatformType.SLACK,
                url: 'https://parent-id-url.com',
                body: 'conversation activity 7',
                channel: 'Some-Channel',
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                conversationId: conversation3Created.id,
                sourceId: '#sourceId7',
            }, mockIRepositoryOptions);
            // activities are not included in findandcountall
            conversation1Created = sequelizeTestUtils_1.default.objectWithoutKey(await conversationRepository_1.default.findById(conversation1Created.id, mockIRepositoryOptions), 'activities');
            conversation2Created = sequelizeTestUtils_1.default.objectWithoutKey(await conversationRepository_1.default.findById(conversation2Created.id, mockIRepositoryOptions), 'activities');
            conversation3Created = sequelizeTestUtils_1.default.objectWithoutKey(await conversationRepository_1.default.findById(conversation3Created.id, mockIRepositoryOptions), 'activities');
            // filter by id
            let conversations = await conversationRepository_1.default.findAndCountAll({ filter: { id: conversation1Created.id }, lazyLoad: ['activities'] }, mockIRepositoryOptions);
            expect(conversations.count).toEqual(1);
            const memberReturnedWithinConversations = sequelizeTestUtils_1.default.objectWithoutKey(memberCreated, [
                'activities',
                'activityCount',
                'averageSentiment',
                'lastActive',
                'lastActivity',
                'activityTypes',
                'noMerge',
                'notes',
                'organizations',
                'tags',
                'tasks',
                'toMerge',
                'activeOn',
                'identities',
                'activeDaysCount',
                'username',
                'numberOfOpenSourceContributions',
                'segments',
                'affiliations',
            ]);
            const conversation1Expected = Object.assign(Object.assign({}, conversation1Created), { conversationStarter: Object.assign(Object.assign({}, sequelizeTestUtils_1.default.objectWithoutKey(activity1Created, ['tasks'])), { member: memberReturnedWithinConversations }), lastReplies: [
                    Object.assign(Object.assign({}, sequelizeTestUtils_1.default.objectWithoutKey(activity2Created, ['tasks'])), { parent: sequelizeTestUtils_1.default.objectWithoutKey(activity2Created.parent, ['display']), member: memberReturnedWithinConversations }),
                    Object.assign(Object.assign({}, sequelizeTestUtils_1.default.objectWithoutKey(activity3Created, ['tasks'])), { parent: sequelizeTestUtils_1.default.objectWithoutKey(activity3Created.parent, ['display']), member: memberReturnedWithinConversations }),
                ] });
            const conversation2Expected = Object.assign(Object.assign({}, conversation2Created), { conversationStarter: Object.assign(Object.assign({}, sequelizeTestUtils_1.default.objectWithoutKey(activity4Created, ['tasks'])), { member: memberReturnedWithinConversations }), lastReplies: [
                    Object.assign(Object.assign({}, sequelizeTestUtils_1.default.objectWithoutKey(activity5Created, ['tasks'])), { member: memberReturnedWithinConversations }),
                ] });
            const conversation3Expected = Object.assign(Object.assign({}, conversation3Created), { conversationStarter: Object.assign(Object.assign({}, sequelizeTestUtils_1.default.objectWithoutKey(activity6Created, ['tasks'])), { member: memberReturnedWithinConversations }), lastReplies: [
                    Object.assign(Object.assign({}, sequelizeTestUtils_1.default.objectWithoutKey(activity7Created, ['tasks'])), { member: memberReturnedWithinConversations }),
                ] });
            expect(conversations.rows).toStrictEqual([conversation1Expected]);
            // filter by title
            conversations = await conversationRepository_1.default.findAndCountAll({ filter: { title: 'a cool title' }, lazyLoad: ['activities'] }, mockIRepositoryOptions);
            expect(conversations.count).toEqual(2);
            expect(conversations.rows).toStrictEqual([conversation2Expected, conversation1Expected]);
            // filter by slug
            conversations = await conversationRepository_1.default.findAndCountAll({ filter: { slug: 'a-cool-title-2' }, lazyLoad: ['activities'] }, mockIRepositoryOptions);
            expect(conversations.count).toEqual(1);
            expect(conversations.rows).toStrictEqual([conversation2Expected]);
            // filter by published
            conversations = await conversationRepository_1.default.findAndCountAll({ filter: { published: true }, lazyLoad: ['activities'] }, mockIRepositoryOptions);
            expect(conversations.count).toEqual(1);
            expect(conversations.rows).toStrictEqual([conversation3Expected]);
            // filter by activityCount only start input
            conversations = await conversationRepository_1.default.findAndCountAll({ filter: { activityCountRange: [2] }, lazyLoad: ['activities'] }, mockIRepositoryOptions);
            expect(conversations.count).toEqual(3);
            expect(conversations.rows).toStrictEqual([
                conversation3Expected,
                conversation2Expected,
                conversation1Expected,
            ]);
            // filter by activityCount start and end inputs
            conversations = await conversationRepository_1.default.findAndCountAll({ filter: { activityCountRange: [0, 1] }, lazyLoad: ['activities'] }, mockIRepositoryOptions);
            expect(conversations.count).toEqual(0);
            expect(conversations.rows).toStrictEqual([]);
            // filter by platform
            conversations = await conversationRepository_1.default.findAndCountAll({ filter: { platform: types_1.PlatformType.DISCORD }, lazyLoad: ['activities'] }, mockIRepositoryOptions);
            expect(conversations.count).toEqual(1);
            expect(conversations.rows).toStrictEqual([conversation2Expected]);
            // filter by channel (channel)
            conversations = await conversationRepository_1.default.findAndCountAll({ filter: { channel: 'Some-Channel' }, lazyLoad: ['activities'] }, mockIRepositoryOptions);
            expect(conversations.count).toEqual(2);
            expect(conversations.rows).toStrictEqual([conversation3Expected, conversation2Expected]);
            // filter by channel (repo)
            conversations = await conversationRepository_1.default.findAndCountAll({ filter: { channel: 'general' }, lazyLoad: ['activities'] }, mockIRepositoryOptions);
            expect(conversations.count).toEqual(1);
            expect(conversations.rows).toStrictEqual([conversation1Expected]);
            // filter by lastActive only start
            conversations = await conversationRepository_1.default.findAndCountAll({ filter: { lastActiveRange: ['2020-06-03T15:13:30Z'] }, lazyLoad: ['activities'] }, mockIRepositoryOptions);
            expect(conversations.count).toEqual(2);
            expect(conversations.rows).toStrictEqual([conversation3Expected, conversation2Expected]);
            // filter by lastActive start and end
            conversations = await conversationRepository_1.default.findAndCountAll({
                filter: { lastActiveRange: ['2020-06-03T15:13:30Z', '2020-06-04T15:13:30Z'] },
                lazyLoad: ['activities'],
            }, mockIRepositoryOptions);
            expect(conversations.count).toEqual(1);
            expect(conversations.rows).toStrictEqual([conversation2Expected]);
            // Test orderBy
            conversations = await conversationRepository_1.default.findAndCountAll({
                filter: {},
                orderBy: 'lastActive_DESC',
                lazyLoad: ['activities'],
            }, mockIRepositoryOptions);
            expect((0, moment_1.default)(conversations.rows[0].lastActive).unix()).toBeGreaterThan((0, moment_1.default)(conversations.rows[1].lastActive).unix());
            expect((0, moment_1.default)(conversations.rows[1].lastActive).unix()).toBeGreaterThan((0, moment_1.default)(conversations.rows[2].lastActive).unix());
            // Test pagination
            const conversationsP1 = await conversationRepository_1.default.findAndCountAll({
                filter: {},
                orderBy: 'lastActive_DESC',
                limit: 2,
                offset: 0,
            }, mockIRepositoryOptions);
            expect(conversationsP1.rows.length).toEqual(2);
            expect(conversationsP1.count).toEqual(3);
            const conversationsP2 = await conversationRepository_1.default.findAndCountAll({
                filter: {},
                orderBy: 'lastActive_DESC',
                limit: 2,
                offset: 2,
            }, mockIRepositoryOptions);
            expect(conversationsP2.rows.length).toEqual(1);
            expect(conversationsP2.count).toEqual(3);
            expect(conversationsP2.rows[0].id).not.toBe(conversationsP1.rows[0].id);
            expect(conversationsP2.rows[0].id).not.toBe(conversationsP1.rows[1].id);
        });
    });
    describe('update method', () => {
        it('Should succesfully update previously created conversation', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const conversationCreated = await conversationRepository_1.default.create({ title: 'a cool title', slug: 'a-cool-title' }, mockIRepositoryOptions);
            const conversationUpdated = await conversationRepository_1.default.update(conversationCreated.id, {
                published: true,
                slug: 'some-other-slug',
            }, mockIRepositoryOptions);
            expect(conversationUpdated.updatedAt.getTime()).toBeGreaterThan(conversationUpdated.createdAt.getTime());
            const conversationExpected = {
                id: conversationCreated.id,
                title: conversationCreated.title,
                slug: conversationUpdated.slug,
                published: conversationUpdated.published,
                activities: [],
                activityCount: 0,
                memberCount: 0,
                conversationStarter: null,
                channel: null,
                lastActive: null,
                platform: null,
                createdAt: conversationCreated.createdAt,
                updatedAt: conversationUpdated.updatedAt,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                segmentId: mockIRepositoryOptions.currentSegments[0].id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
            };
            expect(conversationUpdated).toStrictEqual(conversationExpected);
        });
        it('Should throw 404 error when trying to update non existent conversation', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => conversationRepository_1.default.update(randomUUID(), { slug: 'some-slug' }, mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
    describe('destroy method', () => {
        it('Should succesfully destroy previously created conversation', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const conversationCreated = await conversationRepository_1.default.create({ title: 'a cool title', slug: 'a-cool-title' }, mockIRepositoryOptions);
            await conversationRepository_1.default.destroy(conversationCreated.id, mockIRepositoryOptions);
            // Try selecting it after destroy, should throw 404
            await expect(() => conversationRepository_1.default.findById(conversationCreated.id, mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
});
//# sourceMappingURL=conversationRepository.test.js.map