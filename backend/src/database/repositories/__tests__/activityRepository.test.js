"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const memberRepository_1 = __importDefault(require("../memberRepository"));
const sequelizeTestUtils_1 = __importDefault(require("../../utils/sequelizeTestUtils"));
const activityRepository_1 = __importDefault(require("../activityRepository"));
const types_1 = require("@gitmesh/types");
const taskRepository_1 = __importDefault(require("../taskRepository"));
const memberAttributeSettingsRepository_1 = __importDefault(require("../memberAttributeSettingsRepository"));
const memberAttributeSettingsService_1 = __importDefault(require("../../../services/memberAttributeSettingsService"));
const integrations_1 = require("@gitmesh/integrations");
const organizationRepository_1 = __importDefault(require("../organizationRepository"));
const db = null;
describe('ActivityRepository tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll((done) => {
        // Closing the DB connection allows Jest to exit successfully.
        sequelizeTestUtils_1.default.closeConnection(db);
        done();
    });
    describe('create method', () => {
        it('Should create the given activity succesfully', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activity = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                attributes: {
                    replies: 12,
                },
                title: 'Title',
                body: 'Here',
                url: 'https://github.com',
                channel: 'channel',
                sentiment: {
                    positive: 0.98,
                    negative: 0.0,
                    neutral: 0.02,
                    mixed: 0.0,
                    label: 'positive',
                    sentiment: 0.98,
                },
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                sourceId: '#sourceId1',
            };
            const activityCreated = await activityRepository_1.default.create(activity, mockIRepositoryOptions);
            // Trim the hour part from timestamp so we can atleast test if the day is correct for createdAt and joinedAt
            activityCreated.createdAt = activityCreated.createdAt.toISOString().split('T')[0];
            activityCreated.updatedAt = activityCreated.updatedAt.toISOString().split('T')[0];
            delete activityCreated.member;
            delete activityCreated.objectMember;
            const expectedActivityCreated = {
                id: activityCreated.id,
                attributes: activity.attributes,
                body: 'Here',
                type: 'activity',
                title: 'Title',
                url: 'https://github.com',
                channel: 'channel',
                sentiment: {
                    positive: 0.98,
                    negative: 0.0,
                    neutral: 0.02,
                    mixed: 0.0,
                    label: 'positive',
                    sentiment: 0.98,
                },
                timestamp: new Date('2020-05-27T15:13:30Z'),
                platform: types_1.PlatformType.GITHUB,
                isContribution: true,
                score: 1,
                username: 'test',
                objectMemberUsername: null,
                memberId: memberCreated.id,
                objectMemberId: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                segmentId: mockIRepositoryOptions.currentSegments[0].id,
                tasks: [],
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
                importHash: null,
                parent: null,
                parentId: null,
                sourceId: activity.sourceId,
                sourceParentId: null,
                conversationId: null,
                display: integrations_1.UNKNOWN_ACTIVITY_TYPE_DISPLAY,
                organizationId: null,
                organization: null,
            };
            expect(activityCreated).toStrictEqual(expectedActivityCreated);
        });
        it('Should create a bare-bones activity succesfully', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activity = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                member: memberCreated.id,
                username: 'test',
                sourceId: '#sourceId1',
            };
            const activityCreated = await activityRepository_1.default.create(activity, mockIRepositoryOptions);
            // Trim the hour part from timestamp so we can atleast test if the day is correct for createdAt and joinedAt
            activityCreated.createdAt = activityCreated.createdAt.toISOString().split('T')[0];
            activityCreated.updatedAt = activityCreated.updatedAt.toISOString().split('T')[0];
            delete activityCreated.member;
            delete activityCreated.objectMember;
            const expectedActivityCreated = {
                id: activityCreated.id,
                attributes: {},
                body: null,
                title: null,
                url: null,
                channel: null,
                sentiment: {},
                type: 'activity',
                timestamp: new Date('2020-05-27T15:13:30Z'),
                platform: types_1.PlatformType.GITHUB,
                isContribution: false,
                score: 2,
                username: 'test',
                objectMemberUsername: null,
                memberId: memberCreated.id,
                objectMemberId: null,
                tasks: [],
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                segmentId: mockIRepositoryOptions.currentSegments[0].id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
                importHash: null,
                parent: null,
                parentId: null,
                sourceId: activityCreated.sourceId,
                sourceParentId: null,
                conversationId: null,
                display: integrations_1.UNKNOWN_ACTIVITY_TYPE_DISPLAY,
                organizationId: null,
                organization: null,
            };
            expect(activityCreated).toStrictEqual(expectedActivityCreated);
        });
        it('Should throw error when no platform given', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activity = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                attributes: {
                    replies: 12,
                },
                body: 'Here',
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
            };
            await expect(() => activityRepository_1.default.create(activity, mockIRepositoryOptions)).rejects.toThrow();
        });
        it('Should throw error when no type given', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activity = {
                platform: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                attributes: {
                    replies: 12,
                },
                username: 'test',
                body: 'Here',
                isContribution: true,
                member: memberCreated.id,
                score: 1,
            };
            await expect(() => activityRepository_1.default.create(activity, mockIRepositoryOptions)).rejects.toThrow();
        });
        it('Should throw error when no timestamp given', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activity = {
                platform: types_1.PlatformType.GITHUB,
                type: 'activity',
                attributes: {
                    replies: 12,
                },
                username: 'test',
                body: 'Here',
                isContribution: true,
                member: memberCreated.id,
                score: 1,
            };
            await expect(() => activityRepository_1.default.create(activity, mockIRepositoryOptions)).rejects.toThrow();
        });
        it('Should throw error when sentiment is incorrect', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            // Incomplete Object
            await expect(() => activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                sentiment: {
                    positive: 1,
                    sentiment: 'positive',
                    score: 1,
                },
                username: 'test',
                member: memberCreated.id,
                sourceId: '#sourceId1',
            }, mockIRepositoryOptions)).rejects.toThrow();
            // No score
            await expect(() => activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                sentiment: {
                    positive: 0.8,
                    negative: 0.2,
                    mixed: 0,
                    neutral: 0,
                    sentiment: 'positive',
                },
                username: 'test',
                member: memberCreated.id,
                sourceId: '#sourceId1',
            }, mockIRepositoryOptions)).rejects.toThrow();
            // Wrong Sentiment field
            await expect(() => activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                sentiment: {
                    positive: 0.3,
                    negative: 0.2,
                    neutral: 0.5,
                    mixed: 0,
                    score: 0.1,
                    sentiment: 'smth',
                },
                username: 'test',
                member: memberCreated.id,
                sourceId: '#sourceId1',
            }, mockIRepositoryOptions)).rejects.toThrow();
            // Works with empty object
            const created = await activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                sentiment: {},
                username: 'test',
                member: memberCreated.id,
                sourceId: '#sourceId1',
            }, mockIRepositoryOptions);
            expect(created.sentiment).toStrictEqual({});
        });
        it('Should leave allowed HTML tags in body and title', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activity = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                body: '<p> This is some HTML </p>',
                title: '<h1> This is some Title HTML </h1>',
                url: 'https://github.com',
                channel: 'channel',
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                sourceId: '#sourceId1',
            };
            const activityCreated = await activityRepository_1.default.create(activity, mockIRepositoryOptions);
            // Trim the hour part from timestamp so we can atleast test if the day is correct for createdAt and joinedAt
            activityCreated.createdAt = activityCreated.createdAt.toISOString().split('T')[0];
            activityCreated.updatedAt = activityCreated.updatedAt.toISOString().split('T')[0];
            delete activityCreated.member;
            delete activityCreated.objectMember;
            const expectedActivityCreated = {
                id: activityCreated.id,
                attributes: {},
                body: '<p> This is some HTML </p>',
                type: 'activity',
                title: '<h1> This is some Title HTML </h1>',
                url: 'https://github.com',
                channel: 'channel',
                sentiment: {},
                timestamp: new Date('2020-05-27T15:13:30Z'),
                platform: types_1.PlatformType.GITHUB,
                isContribution: true,
                score: 1,
                tasks: [],
                username: 'test',
                objectMemberUsername: null,
                memberId: memberCreated.id,
                objectMemberId: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                segmentId: mockIRepositoryOptions.currentSegments[0].id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
                importHash: null,
                parent: null,
                parentId: null,
                sourceId: activity.sourceId,
                sourceParentId: null,
                conversationId: null,
                display: integrations_1.UNKNOWN_ACTIVITY_TYPE_DISPLAY,
                organizationId: null,
                organization: null,
            };
            expect(activityCreated).toStrictEqual(expectedActivityCreated);
        });
        it('Should remove script tags in body and title', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activity = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                body: "<script> console.log('gotcha')</script> <p> Malicious </p>",
                title: "<script> console.log('title gotcha')</script> <h1> Malicious title </h1>",
                url: 'https://github.com',
                channel: 'channel',
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                sourceId: '#sourceId1',
            };
            const activityCreated = await activityRepository_1.default.create(activity, mockIRepositoryOptions);
            // Trim the hour part from timestamp so we can atleast test if the day is correct for createdAt and joinedAt
            activityCreated.createdAt = activityCreated.createdAt.toISOString().split('T')[0];
            activityCreated.updatedAt = activityCreated.updatedAt.toISOString().split('T')[0];
            delete activityCreated.member;
            delete activityCreated.objectMember;
            const expectedActivityCreated = {
                id: activityCreated.id,
                attributes: {},
                body: '<p> Malicious </p>',
                type: 'activity',
                title: '<h1> Malicious title </h1>',
                url: 'https://github.com',
                channel: 'channel',
                sentiment: {},
                tasks: [],
                timestamp: new Date('2020-05-27T15:13:30Z'),
                platform: types_1.PlatformType.GITHUB,
                isContribution: true,
                score: 1,
                username: 'test',
                objectMemberUsername: null,
                memberId: memberCreated.id,
                objectMemberId: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                segmentId: mockIRepositoryOptions.currentSegments[0].id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
                importHash: null,
                parent: null,
                parentId: null,
                sourceId: activity.sourceId,
                sourceParentId: null,
                conversationId: null,
                display: integrations_1.UNKNOWN_ACTIVITY_TYPE_DISPLAY,
                organizationId: null,
                organization: null,
            };
            expect(activityCreated).toStrictEqual(expectedActivityCreated);
        });
        it('Should create an activity with tasks succesfully', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const tasks1 = await taskRepository_1.default.create({
                name: 'task1',
            }, mockIRepositoryOptions);
            const task2 = await taskRepository_1.default.create({
                name: 'task2',
            }, mockIRepositoryOptions);
            const activity = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                attributes: {
                    replies: 12,
                },
                title: 'Title',
                body: 'Here',
                url: 'https://github.com',
                channel: 'channel',
                sentiment: {
                    positive: 0.98,
                    negative: 0.0,
                    neutral: 0.02,
                    mixed: 0.0,
                    label: 'positive',
                    sentiment: 0.98,
                },
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                tasks: [tasks1.id, task2.id],
                sourceId: '#sourceId1',
            };
            const activityCreated = await activityRepository_1.default.create(activity, mockIRepositoryOptions);
            // Trim the hour part from timestamp so we can atleast test if the day is correct for createdAt and joinedAt
            expect(activityCreated.tasks.length).toBe(2);
        });
        it('Should create an activity with an organization succesfully', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const org1 = await organizationRepository_1.default.create({
                displayName: 'gitmesh.dev',
            }, mockIRepositoryOptions);
            const activity = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                attributes: {
                    replies: 12,
                },
                title: 'Title',
                body: 'Here',
                url: 'https://github.com',
                channel: 'channel',
                sentiment: {
                    positive: 0.98,
                    negative: 0.0,
                    neutral: 0.02,
                    mixed: 0.0,
                    label: 'positive',
                    sentiment: 0.98,
                },
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                organizationId: org1.id,
                sourceId: '#sourceId1',
            };
            const activityCreated = await activityRepository_1.default.create(activity, mockIRepositoryOptions);
            // Trim the hour part from timestamp so we can atleast test if the day is correct for createdAt and joinedAt
            expect(activityCreated.organizationId).toEqual(org1.id);
        });
    });
    describe('findById method', () => {
        it('Should successfully find created activity by id', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activity = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                sourceId: '#sourceId1',
            };
            const activityCreated = await activityRepository_1.default.create(activity, mockIRepositoryOptions);
            const expectedActivityFound = {
                id: activityCreated.id,
                attributes: {},
                body: null,
                title: null,
                url: null,
                channel: null,
                sentiment: {},
                type: 'activity',
                timestamp: new Date('2020-05-27T15:13:30Z'),
                platform: types_1.PlatformType.GITHUB,
                isContribution: true,
                score: 1,
                username: 'test',
                objectMemberUsername: null,
                memberId: memberCreated.id,
                objectMemberId: null,
                tasks: [],
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                segmentId: mockIRepositoryOptions.currentSegments[0].id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
                importHash: null,
                parent: null,
                parentId: null,
                sourceId: activity.sourceId,
                sourceParentId: null,
                conversationId: null,
                display: integrations_1.UNKNOWN_ACTIVITY_TYPE_DISPLAY,
                organizationId: null,
                organization: null,
            };
            const activityFound = await activityRepository_1.default.findById(activityCreated.id, mockIRepositoryOptions);
            // Trim the hour part from timestamp so we can atleast test if the day is correct for createdAt and joinedAt
            activityFound.createdAt = activityFound.createdAt.toISOString().split('T')[0];
            activityFound.updatedAt = activityFound.updatedAt.toISOString().split('T')[0];
            delete activityFound.member;
            delete activityFound.objectMember;
            expect(activityFound).toStrictEqual(expectedActivityFound);
        });
        it('Should throw 404 error when no user found with given id', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => activityRepository_1.default.findById(randomUUID(), mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
    describe('filterIdsInTenant method', () => {
        it('Should return the given ids of previously created activity entities', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activity1Returned = await activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                username: 'test',
                member: memberCreated.id,
                sourceId: '#sourceId1',
            }, mockIRepositoryOptions);
            const activity2Returned = await activityRepository_1.default.create({
                type: 'activity-2',
                timestamp: '2020-06-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                username: 'test',
                member: memberCreated.id,
                sourceId: '#sourceId2',
            }, mockIRepositoryOptions);
            const filterIdsReturned = await activityRepository_1.default.filterIdsInTenant([activity1Returned.id, activity2Returned.id], mockIRepositoryOptions);
            expect(filterIdsReturned).toStrictEqual([activity1Returned.id, activity2Returned.id]);
        });
        it('Should only return the ids of previously created activities and filter random uuids out', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activity3Returned = await activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                username: 'test',
                member: memberCreated.id,
                sourceId: '#sourceId1',
            }, mockIRepositoryOptions);
            const { randomUUID } = require('crypto');
            const filterIdsReturned = await activityRepository_1.default.filterIdsInTenant([activity3Returned.id, randomUUID(), randomUUID()], mockIRepositoryOptions);
            expect(filterIdsReturned).toStrictEqual([activity3Returned.id]);
        });
        it('Should return an empty array for an irrelevant tenant', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activity4Returned = await activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                username: 'test',
                member: memberCreated.id,
                sourceId: '#sourceId1',
            }, mockIRepositoryOptions);
            // create a new tenant and bind options to it
            const mockIRepositoryOptionsIr = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const filterIdsReturned = await activityRepository_1.default.filterIdsInTenant([activity4Returned.id], mockIRepositoryOptionsIr);
            expect(filterIdsReturned).toStrictEqual([]);
        });
    });
    describe('Activities findOne method', () => {
        it('Should return the created activity for a simple query', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activityReturned = await activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                sourceId: '#sourceId1',
            }, mockIRepositoryOptions);
            const found = await activityRepository_1.default.findOne({ type: 'activity' }, mockIRepositoryOptions);
            expect(found.id).toStrictEqual(activityReturned.id);
        });
        it('Should return the activity for a complex query', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activityReturned = await activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                attributes: {
                    thread: true,
                },
                body: 'Here',
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                sourceId: '#sourceId1',
            }, mockIRepositoryOptions);
            const found = await activityRepository_1.default.findOne({ 'attributes.thread': true }, mockIRepositoryOptions);
            expect(found.id).toStrictEqual(activityReturned.id);
        });
        it('Should return null when non-existent', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            await activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                attributes: {
                    replies: 12,
                },
                body: 'Here',
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                sourceId: '#sourceId1',
            }, mockIRepositoryOptions);
            expect(await activityRepository_1.default.findOne({ type: 'notype' }, mockIRepositoryOptions)).toBeNull();
        });
    });
    describe('update method', () => {
        it('Should succesfully update previously created activity - simple', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activityReturned = await activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                attributes: {
                    replies: 12,
                },
                body: 'Here',
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                sourceId: '#sourceId1',
            }, mockIRepositoryOptions);
            const updateFields = {
                type: 'activity-new',
                platform: types_1.PlatformType.GITHUB,
            };
            const updatedActivity = await activityRepository_1.default.update(activityReturned.id, updateFields, mockIRepositoryOptions);
            // check updatedAt field looks ok or not. Should be greater than createdAt
            expect(updatedActivity.updatedAt.getTime()).toBeGreaterThan(updatedActivity.createdAt.getTime());
            updatedActivity.createdAt = updatedActivity.createdAt.toISOString().split('T')[0];
            updatedActivity.updatedAt = updatedActivity.updatedAt.toISOString().split('T')[0];
            delete updatedActivity.member;
            delete updatedActivity.objectMember;
            const expectedActivityUpdated = {
                id: activityReturned.id,
                body: activityReturned.body,
                channel: null,
                title: null,
                sentiment: {},
                url: null,
                attributes: activityReturned.attributes,
                type: 'activity-new',
                timestamp: new Date('2020-05-27T15:13:30Z'),
                platform: types_1.PlatformType.GITHUB,
                isContribution: true,
                score: 1,
                username: 'test',
                objectMemberUsername: null,
                memberId: memberCreated.id,
                objectMemberId: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                segmentId: mockIRepositoryOptions.currentSegments[0].id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
                importHash: null,
                tasks: [],
                parent: null,
                parentId: null,
                sourceId: activityReturned.sourceId,
                sourceParentId: null,
                conversationId: null,
                display: integrations_1.UNKNOWN_ACTIVITY_TYPE_DISPLAY,
                organizationId: null,
                organization: null,
            };
            expect(updatedActivity).toStrictEqual(expectedActivityUpdated);
        });
        it('Should succesfully update previously created activity - with member relation', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const memberCreated2 = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test2',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activityReturned = await activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                attributes: {
                    replies: 12,
                },
                body: 'Here',
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                sourceId: '#sourceId1',
            }, mockIRepositoryOptions);
            const updateFields = {
                type: 'activity-new',
                platform: types_1.PlatformType.GITHUB,
                body: 'There',
                title: 'Title',
                channel: 'Channel',
                url: 'https://www.google.com',
                sentiment: {
                    positive: 0.98,
                    negative: 0.0,
                    neutral: 0.02,
                    mixed: 0.0,
                    label: 'positive',
                    sentiment: 0.98,
                },
                username: 'test2',
                member: memberCreated2.id,
            };
            const updatedActivity = await activityRepository_1.default.update(activityReturned.id, updateFields, mockIRepositoryOptions);
            // check updatedAt field looks ok or not. Should be greater than createdAt
            expect(updatedActivity.updatedAt.getTime()).toBeGreaterThan(updatedActivity.createdAt.getTime());
            updatedActivity.createdAt = updatedActivity.createdAt.toISOString().split('T')[0];
            updatedActivity.updatedAt = updatedActivity.updatedAt.toISOString().split('T')[0];
            delete updatedActivity.member;
            delete updatedActivity.objectMember;
            const expectedActivityUpdated = {
                id: activityReturned.id,
                attributes: activityReturned.attributes,
                body: updateFields.body,
                channel: updateFields.channel,
                title: updateFields.title,
                sentiment: updateFields.sentiment,
                url: updateFields.url,
                type: 'activity-new',
                timestamp: new Date('2020-05-27T15:13:30Z'),
                tasks: [],
                platform: types_1.PlatformType.GITHUB,
                isContribution: true,
                score: 1,
                username: 'test2',
                objectMemberUsername: null,
                memberId: memberCreated2.id,
                objectMemberId: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                segmentId: mockIRepositoryOptions.currentSegments[0].id,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
                importHash: null,
                parent: null,
                parentId: null,
                sourceId: activityReturned.sourceId,
                sourceParentId: null,
                conversationId: null,
                display: integrations_1.UNKNOWN_ACTIVITY_TYPE_DISPLAY,
                organizationId: null,
                organization: null,
            };
            expect(updatedActivity).toStrictEqual(expectedActivityUpdated);
        });
        it('Should succesfully update tasks of an activity', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activityReturned = await activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                attributes: {
                    replies: 12,
                },
                body: 'Here',
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                sourceId: '#sourceId1',
            }, mockIRepositoryOptions);
            const tasks1 = await taskRepository_1.default.create({
                name: 'task1',
            }, mockIRepositoryOptions);
            const task2 = await taskRepository_1.default.create({
                name: 'task2',
            }, mockIRepositoryOptions);
            const updateFields = {
                tasks: [tasks1.id, task2.id],
            };
            const updatedActivity = await activityRepository_1.default.update(activityReturned.id, updateFields, mockIRepositoryOptions);
            expect(updatedActivity.tasks).toHaveLength(2);
            expect(updatedActivity.tasks[0].id).toBe(tasks1.id);
            expect(updatedActivity.tasks[1].id).toBe(task2.id);
        });
        it('Should update body and title with allowed HTML tags', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activityReturned = await activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                attributes: {
                    replies: 12,
                },
                body: 'Here',
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                sourceId: '#sourceId1',
            }, mockIRepositoryOptions);
            const updateFields = {
                body: '<p> This is some HTML </p>',
                title: '<h1> This is some Title HTML </h1>',
            };
            const updatedActivity = await activityRepository_1.default.update(activityReturned.id, updateFields, mockIRepositoryOptions);
            expect(updatedActivity.body).toBe('<p> This is some HTML </p>');
            expect(updatedActivity.title).toBe('<h1> This is some Title HTML </h1>');
        });
        it('Should sanitize body and title from non-allowed HTML tags', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activityReturned = await activityRepository_1.default.create({
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                attributes: {
                    replies: 12,
                },
                body: 'Here',
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                sourceId: '#sourceId1',
            }, mockIRepositoryOptions);
            const updateFields = {
                body: "<script> console.log('gotcha')</script> <p> Malicious </p>",
                title: "<script> console.log('title gotcha')</script> <h1> Malicious title </h1>",
            };
            const updatedActivity = await activityRepository_1.default.update(activityReturned.id, updateFields, mockIRepositoryOptions);
            expect(updatedActivity.body).toBe('<p> Malicious </p>');
            expect(updatedActivity.title).toBe('<h1> Malicious title </h1>');
        });
        it('Should update an activity with an organization succesfully', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const org1 = await organizationRepository_1.default.create({
                displayName: 'gitmesh.dev',
            }, mockIRepositoryOptions);
            const org2 = await organizationRepository_1.default.create({
                displayName: 'tesla',
            }, mockIRepositoryOptions);
            const activity = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                attributes: {
                    replies: 12,
                },
                title: 'Title',
                body: 'Here',
                url: 'https://github.com',
                channel: 'channel',
                sentiment: {
                    positive: 0.98,
                    negative: 0.0,
                    neutral: 0.02,
                    mixed: 0.0,
                    label: 'positive',
                    sentiment: 0.98,
                },
                isContribution: true,
                username: 'test',
                member: memberCreated.id,
                score: 1,
                organizationId: org1.id,
                sourceId: '#sourceId1',
            };
            const activityCreated = await activityRepository_1.default.create(activity, mockIRepositoryOptions);
            const activityUpdated = await activityRepository_1.default.update(activityCreated.id, { organizationId: org2.id }, mockIRepositoryOptions);
            // Trim the hour part from timestamp so we can atleast test if the day is correct for createdAt and joinedAt
            expect(activityUpdated.organizationId).toEqual(org2.id);
        });
    });
    describe('filter tests', () => {
        it('Positive sentiment filter and sort', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activity1 = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                sentiment: {
                    positive: 0.98,
                    negative: 0.0,
                    neutral: 0.02,
                    mixed: 0.0,
                    label: 'positive',
                    sentiment: 0.98,
                },
                username: 'test',
                member: memberCreated.id,
                sourceId: '#sourceId1',
            };
            const activity2 = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                sentiment: {
                    positive: 0.55,
                    negative: 0.0,
                    neutral: 0.45,
                    mixed: 0.0,
                    label: 'neutral',
                    sentiment: 0.55,
                },
                username: 'test',
                member: memberCreated.id,
                sourceId: '#sourceId2',
            };
            const activityCreated1 = await activityRepository_1.default.create(activity1, mockIRepositoryOptions);
            await activityRepository_1.default.create(activity2, mockIRepositoryOptions);
            // Control
            expect((await activityRepository_1.default.findAndCountAll({ filter: {} }, mockIRepositoryOptions)).count).toBe(2);
            // Filter by how positive activities are
            const filteredActivities = await activityRepository_1.default.findAndCountAll({ filter: { positiveSentimentRange: [0.6, 1] } }, mockIRepositoryOptions);
            expect(filteredActivities.count).toBe(1);
            expect(filteredActivities.rows[0].id).toBe(activityCreated1.id);
            // Filter by whether activities are positive or not
            const filteredActivities2 = await activityRepository_1.default.findAndCountAll({ filter: { sentimentLabel: 'positive' } }, mockIRepositoryOptions);
            expect(filteredActivities2.count).toBe(1);
            expect(filteredActivities2.rows[0].id).toBe(activityCreated1.id);
            // No filter, but sorting
            const filteredActivities3 = await activityRepository_1.default.findAndCountAll({ filter: {}, orderBy: 'sentiment.positive_DESC' }, mockIRepositoryOptions);
            expect(filteredActivities3.count).toBe(2);
            expect(filteredActivities3.rows[0].sentiment.positive).toBeGreaterThan(filteredActivities3.rows[1].sentiment.positive);
        });
        it('Negative sentiment filter and sort', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activity1 = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                sentiment: {
                    positive: 0.98,
                    negative: 0.0,
                    neutral: 0.02,
                    mixed: 0.0,
                    label: 'positive',
                    sentiment: 0.98,
                },
                username: 'test',
                member: memberCreated.id,
                sourceId: '#sourceId1',
            };
            const activity2 = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                sentiment: {
                    positive: 0.01,
                    negative: 0.55,
                    neutral: 0.55,
                    mixed: 0.0,
                    label: 'negative',
                    sentiment: -0.54,
                },
                username: 'test',
                member: memberCreated.id,
                sourceId: '#sourceId2',
            };
            await activityRepository_1.default.create(activity1, mockIRepositoryOptions);
            const activityCreated2 = await activityRepository_1.default.create(activity2, mockIRepositoryOptions);
            // Control
            expect((await activityRepository_1.default.findAndCountAll({ filter: {} }, mockIRepositoryOptions)).count).toBe(2);
            // Filter by how positive activities are
            const filteredActivities = await activityRepository_1.default.findAndCountAll({ filter: { negativeSentimentRange: [0.5, 1] } }, mockIRepositoryOptions);
            expect(filteredActivities.count).toBe(1);
            expect(filteredActivities.rows[0].id).toBe(activityCreated2.id);
            // Filter by whether activities are positive or not
            const filteredActivities2 = await activityRepository_1.default.findAndCountAll({ filter: { sentimentLabel: 'negative' } }, mockIRepositoryOptions);
            expect(filteredActivities2.count).toBe(1);
            expect(filteredActivities2.rows[0].id).toBe(activityCreated2.id);
            // No filter, but sorting
            const filteredActivities3 = await activityRepository_1.default.findAndCountAll({ filter: {}, orderBy: 'sentiment.negative_DESC' }, mockIRepositoryOptions);
            expect(filteredActivities3.count).toBe(2);
            expect(filteredActivities3.rows[0].sentiment.negative).toBeGreaterThan(filteredActivities3.rows[1].sentiment.negative);
        });
        it('Overall sentiment filter and sort', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberCreated = await memberRepository_1.default.create({
                username: {
                    github: 'test',
                },
                displayName: 'Member 1',
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activity1 = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                sentiment: {
                    positive: 0.98,
                    negative: 0.0,
                    neutral: 0.02,
                    mixed: 0.0,
                    label: 'positive',
                    sentiment: 0.98,
                },
                username: 'test',
                member: memberCreated.id,
                sourceId: '#sourceId1',
            };
            const activity2 = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                sentiment: {
                    positive: 0.55,
                    negative: 0.0,
                    neutral: 0.45,
                    mixed: 0.0,
                    label: 'neutral',
                    sentiment: 0.55,
                },
                username: 'test',
                member: memberCreated.id,
                sourceId: '#sourceId2',
            };
            const activityCreated1 = await activityRepository_1.default.create(activity1, mockIRepositoryOptions);
            await activityRepository_1.default.create(activity2, mockIRepositoryOptions);
            // Control
            expect((await activityRepository_1.default.findAndCountAll({ filter: {} }, mockIRepositoryOptions)).count).toBe(2);
            // Filter by how positive activities are
            const filteredActivities = await activityRepository_1.default.findAndCountAll({ filter: { sentimentRange: [0.6, 1] } }, mockIRepositoryOptions);
            expect(filteredActivities.count).toBe(1);
            expect(filteredActivities.rows[0].id).toBe(activityCreated1.id);
            // No filter, but sorting
            const filteredActivities3 = await activityRepository_1.default.findAndCountAll({ filter: {}, orderBy: 'sentiment_DESC' }, mockIRepositoryOptions);
            expect(filteredActivities3.count).toBe(2);
            expect(filteredActivities3.rows[0].sentiment.positive).toBeGreaterThan(filteredActivities3.rows[1].sentiment.positive);
        });
        it('Member related attributes filters', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            await mas.createPredefined(integrations_1.DEFAULT_MEMBER_ATTRIBUTES);
            const memberAttributeSettings = (await memberAttributeSettingsRepository_1.default.findAndCountAll({}, mockIRepositoryOptions)).rows;
            const memberCreated1 = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'test',
                },
                displayName: 'Anil',
                attributes: {
                    [types_1.MemberAttributeName.IS_TEAM_MEMBER]: {
                        default: true,
                        [types_1.PlatformType.GITMESH]: true,
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        default: 'Berlin',
                        [types_1.PlatformType.GITHUB]: 'Berlin',
                        [types_1.PlatformType.SLACK]: 'Turkey',
                    },
                },
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const memberCreated2 = await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: 'Michael',
                },
                displayName: 'Michael',
                attributes: {
                    [types_1.MemberAttributeName.IS_TEAM_MEMBER]: {
                        default: false,
                        [types_1.PlatformType.GITMESH]: false,
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        default: 'Scranton',
                        [types_1.PlatformType.GITHUB]: 'Scranton',
                        [types_1.PlatformType.SLACK]: 'New York',
                    },
                },
                joinedAt: '2020-05-27T15:13:30Z',
            }, mockIRepositoryOptions);
            const activity1 = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                sentiment: {
                    positive: 0.98,
                    negative: 0.0,
                    neutral: 0.02,
                    mixed: 0.0,
                    label: 'positive',
                    sentiment: 0.98,
                },
                username: 'test',
                member: memberCreated1.id,
                sourceId: '#sourceId1',
            };
            const activity2 = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                sentiment: {
                    positive: 0.55,
                    negative: 0.0,
                    neutral: 0.45,
                    mixed: 0.0,
                    label: 'neutral',
                    sentiment: 0.55,
                },
                username: 'Michael',
                member: memberCreated2.id,
                sourceId: '#sourceId2',
            };
            const activityCreated1 = await activityRepository_1.default.create(activity1, mockIRepositoryOptions);
            const activityCreated2 = await activityRepository_1.default.create(activity2, mockIRepositoryOptions);
            // Control
            expect((await activityRepository_1.default.findAndCountAll({ filter: {} }, mockIRepositoryOptions)).count).toBe(2);
            // Filter by member.isTeamMember
            let filteredActivities = await activityRepository_1.default.findAndCountAll({
                advancedFilter: {
                    member: {
                        isTeamMember: {
                            not: false,
                        },
                    },
                },
                attributesSettings: memberAttributeSettings,
            }, mockIRepositoryOptions);
            expect(filteredActivities.count).toBe(1);
            expect(filteredActivities.rows[0].id).toBe(activityCreated1.id);
            filteredActivities = await activityRepository_1.default.findAndCountAll({
                advancedFilter: {
                    member: {
                        'attributes.location.slack': 'New York',
                    },
                },
                attributesSettings: memberAttributeSettings,
            }, mockIRepositoryOptions);
            expect(filteredActivities.count).toBe(1);
            expect(filteredActivities.rows[0].id).toBe(activityCreated2.id);
        });
    });
});
//# sourceMappingURL=activityRepository.test.js.map