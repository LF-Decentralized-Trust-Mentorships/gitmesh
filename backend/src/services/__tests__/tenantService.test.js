"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelizeTestUtils_1 = __importDefault(require("../../database/utils/sequelizeTestUtils"));
const tenantService_1 = __importDefault(require("../tenantService"));
const memberService_1 = __importDefault(require("../memberService"));
const microserviceService_1 = __importDefault(require("../microserviceService"));
const types_1 = require("@gitmesh/types");
const memberAttributeSettingsService_1 = __importDefault(require("../memberAttributeSettingsService"));
const taskService_1 = __importDefault(require("../taskService"));
const plans_1 = __importDefault(require("../../security/plans"));
const common_1 = require("@gitmesh/common");
const redis_1 = require("@gitmesh/redis");
const conf_1 = require("../../conf");
const db = null;
describe('TenantService tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll(async () => {
        // Closing the DB connection allows Jest to exit successfully.
        await sequelizeTestUtils_1.default.closeConnection(db);
    });
    describe('findMembersToMerge', () => {
        it('Should show the same merge suggestion once, with reverse order', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const memberService = new memberService_1.default(mockIServiceOptions);
            const tenantService = new tenantService_1.default(mockIServiceOptions);
            const memberToCreate1 = {
                username: {
                    [types_1.PlatformType.SLACK]: {
                        username: 'member 1',
                        integrationId: (0, common_1.generateUUIDv1)(),
                    },
                },
                platform: types_1.PlatformType.SLACK,
                email: 'member.1@email.com',
                joinedAt: '2020-05-27T15:13:30Z',
            };
            const memberToCreate2 = {
                username: {
                    [types_1.PlatformType.DISCORD]: {
                        username: 'member 2',
                        integrationId: (0, common_1.generateUUIDv1)(),
                    },
                },
                platform: types_1.PlatformType.DISCORD,
                email: 'member.2@email.com',
                joinedAt: '2020-05-26T15:13:30Z',
            };
            const memberToCreate3 = {
                username: {
                    [types_1.PlatformType.GITHUB]: {
                        username: 'member 3',
                        integrationId: (0, common_1.generateUUIDv1)(),
                    },
                },
                platform: types_1.PlatformType.GITHUB,
                email: 'member.3@email.com',
                joinedAt: '2020-05-25T15:13:30Z',
            };
            const memberToCreate4 = {
                username: {
                    [types_1.PlatformType.TWITTER]: {
                        username: 'member 4',
                        integrationId: (0, common_1.generateUUIDv1)(),
                    },
                },
                platform: types_1.PlatformType.TWITTER,
                email: 'member.4@email.com',
                joinedAt: '2020-05-24T15:13:30Z',
            };
            const member1 = await memberService.upsert(memberToCreate1);
            let member2 = await memberService.upsert(memberToCreate2);
            const member3 = await memberService.upsert(memberToCreate3);
            let member4 = await memberService.upsert(memberToCreate4);
            await memberService.addToMerge([{ members: [member1.id, member2.id], similarity: 1 }]);
            await memberService.addToMerge([{ members: [member3.id, member4.id], similarity: 0.5 }]);
            member2 = await memberService.findById(member2.id);
            member4 = await memberService.findById(member4.id);
            const memberToMergeSuggestions = await tenantService.findMembersToMerge({});
            // In the DB there should be:
            // - Member 1 should have member 2 in toMerge
            // - Member 3 should have member 4 in toMerge
            // - Member 4 should have member 3 in toMerge
            // - We should get these 4 combinations
            // But this function should not return duplicates, so we should get
            // only two pairs: [m2, m1] and [m4, m3]
            expect(memberToMergeSuggestions.count).toEqual(1);
            expect(memberToMergeSuggestions.rows[0].members
                .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
                .map((m) => m.id)).toStrictEqual([member1.id, member2.id]);
            expect(memberToMergeSuggestions.rows[1].members
                .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
                .map((m) => m.id)).toStrictEqual([member3.id, member4.id]);
        });
    });
    describe('_findAndCountAllForEveryUser method', () => {
        it('Should succesfully find all tenants without filtering by currentUser', async () => {
            let tenants = await tenantService_1.default._findAndCountAllForEveryUser({ filter: {} });
            expect(tenants.count).toEqual(0);
            expect(tenants.rows).toEqual([]);
            // generate 3 tenants
            const mockIServiceOptions1 = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const mockIServiceOptions2 = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const mockIServiceOptions3 = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            tenants = await tenantService_1.default._findAndCountAllForEveryUser({ filter: {} });
            expect(tenants.count).toEqual(3);
            expect(tenants.rows.map((i) => i.id).sort()).toEqual([
                mockIServiceOptions1.currentTenant.id,
                mockIServiceOptions2.currentTenant.id,
                mockIServiceOptions3.currentTenant.id,
            ].sort());
        });
    });
    describe('create method', () => {
        it('Should succesfully create the tenant, related default microservices, settings and suggested tasks', async () => {
            const randomUser = await sequelizeTestUtils_1.default.getRandomUser();
            let db = null;
            db = await sequelizeTestUtils_1.default.getDatabase(db);
            const userModel = await db.user.create(randomUser);
            // Get options without currentTenant
            const options = {
                language: 'en',
                currentUser: userModel,
                database: db,
                redis: await (0, redis_1.getRedisClient)(conf_1.REDIS_CONFIG, true),
            };
            const tenantCreated = await new tenantService_1.default(options).create({
                name: 'testName',
                url: 'testUrl',
                integrationsRequired: ['github', 'discord'],
                communitySize: '>25000',
            });
            const tenantCreatedPlain = tenantCreated.get({ plain: true });
            tenantCreatedPlain.createdAt = tenantCreatedPlain.createdAt.toISOString().split('T')[0];
            tenantCreatedPlain.updatedAt = tenantCreatedPlain.updatedAt.toISOString().split('T')[0];
            const tenantExpected = {
                id: tenantCreatedPlain.id,
                name: 'testName',
                url: 'testUrl',
                plan: plans_1.default.values.essential,
                isTrialPlan: false,
                trialEndsAt: null,
                onboardedAt: null,
                integrationsRequired: ['github', 'discord'],
                hasSampleData: false,
                communitySize: '>25000',
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                createdById: options.currentUser.id,
                updatedById: options.currentUser.id,
                settings: [],
                conversationSettings: [],
                planSubscriptionEndsAt: null,
                stripeSubscriptionId: null,
                reasonForUsingGitmesh: null,
            };
            expect(tenantCreatedPlain).toStrictEqual(tenantExpected);
            // Check microservices (members_score should be created with tenantService.create)
            const ms = new microserviceService_1.default(Object.assign(Object.assign({}, options), { currentTenant: tenantCreated }));
            const microservicesOfTenant = await ms.findAndCountAll({});
            expect(microservicesOfTenant.count).toEqual(1);
            // findAndCountAll returns sorted by createdAt (desc) by default, so first one should be members_score
            expect(microservicesOfTenant.rows[0].type).toEqual('members_score');
            // Check default member attributes
            const mas = new memberAttributeSettingsService_1.default(Object.assign(Object.assign({}, options), { currentTenant: tenantCreated }));
            const defaultAttributes = await mas.findAndCountAll({ filter: {} });
            expect(defaultAttributes.rows.map((i) => i.name).sort()).toEqual([
                types_1.MemberAttributeName.BIO,
                types_1.MemberAttributeName.IS_BOT,
                types_1.MemberAttributeName.IS_ORGANIZATION,
                types_1.MemberAttributeName.IS_TEAM_MEMBER,
                types_1.MemberAttributeName.JOB_TITLE,
                types_1.MemberAttributeName.LOCATION,
                types_1.MemberAttributeName.URL,
            ]);
            const taskService = new taskService_1.default(Object.assign(Object.assign({}, options), { currentTenant: tenantCreated }));
            const suggestedTasks = await taskService.findAndCountAll({ filter: {} });
            expect(suggestedTasks.rows.map((i) => i.name).sort()).toStrictEqual([
                'Check for negative reactions',
                'Engage with relevant content',
                'Reach out to influential contacts',
                'Reach out to poorly engaged contacts',
                'Set up your team',
                'Set up your workspace integrations',
            ]);
        });
    });
});
//# sourceMappingURL=tenantService.test.js.map