"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const sequelizeTestUtils_1 = __importDefault(require("../../database/utils/sequelizeTestUtils"));
const memberService_1 = __importDefault(require("../memberService"));
const memberRepository_1 = __importDefault(require("../../database/repositories/memberRepository"));
const activityRepository_1 = __importDefault(require("../../database/repositories/activityRepository"));
const tagRepository_1 = __importDefault(require("../../database/repositories/tagRepository"));
const types_1 = require("@gitmesh/types");
const organizationRepository_1 = __importDefault(require("../../database/repositories/organizationRepository"));
const taskRepository_1 = __importDefault(require("../../database/repositories/taskRepository"));
const noteRepository_1 = __importDefault(require("../../database/repositories/noteRepository"));
const memberAttributeSettingsService_1 = __importDefault(require("../memberAttributeSettingsService"));
const settingsRepository_1 = __importDefault(require("../../database/repositories/settingsRepository"));
const organizationService_1 = __importDefault(require("../organizationService"));
const lodash_1 = __importDefault(require("lodash"));
const integrations_1 = require("@gitmesh/integrations");
const db = null;
describe('MemberService tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll(async () => {
        // Closing the DB connection allows Jest to exit successfully.
        await sequelizeTestUtils_1.default.closeConnection(db);
    });
    describe('upsert method', () => {
        it('Should throw 400 error when platform does not exist in member data', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIServiceOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            const member1 = {
                username: {
                    [types_1.PlatformType.GITHUB]: {
                        username: 'anil',
                        integrationId: (0, common_1.generateUUIDv1)(),
                    },
                },
                emails: ['lala@l.com'],
                score: 10,
                attributes: {
                    [types_1.MemberAttributeName.IS_HIREABLE]: {
                        [types_1.PlatformType.GITHUB]: true,
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://github.com/imcvampire',
                    },
                    [types_1.MemberAttributeName.WEBSITE_URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://imcvampire.js.org/',
                    },
                    [types_1.MemberAttributeName.BIO]: {
                        [types_1.PlatformType.GITHUB]: 'Lazy geek',
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: 'Helsinki, Finland',
                    },
                },
                joinedAt: '2020-05-28T15:13:30Z',
            };
            await expect(() => new memberService_1.default(mockIServiceOptions).upsert(member1)).rejects.toThrowError(new common_1.Error400());
        });
        it('Should create non existent member - attributes with matching platform', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIServiceOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            await mas.createPredefined(integrations_1.TWITTER_MEMBER_ATTRIBUTES);
            await mas.createPredefined(integrations_1.DISCORD_MEMBER_ATTRIBUTES);
            const member1 = {
                username: 'anil',
                platform: types_1.PlatformType.GITHUB,
                emails: ['lala@l.com'],
                score: 10,
                attributes: {
                    [types_1.MemberAttributeName.IS_HIREABLE]: {
                        [types_1.PlatformType.GITHUB]: true,
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://github.com/imcvampire',
                        [types_1.PlatformType.TWITTER]: 'https://some-twitter-url',
                    },
                    [types_1.MemberAttributeName.WEBSITE_URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://imcvampire.js.org/',
                    },
                    [types_1.MemberAttributeName.BIO]: {
                        [types_1.PlatformType.GITHUB]: 'Lazy geek',
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: 'Helsinki, Finland',
                    },
                    [types_1.MemberAttributeName.SOURCE_ID]: {
                        [types_1.PlatformType.TWITTER]: '#twitterId',
                        [types_1.PlatformType.DISCORD]: '#discordId',
                    },
                    [types_1.MemberAttributeName.AVATAR_URL]: {
                        [types_1.PlatformType.TWITTER]: 'https://some-image-url',
                    },
                },
                joinedAt: '2020-05-28T15:13:30Z',
            };
            // Save some attributes since they get modified in the upsert function
            const { platform, username, attributes } = member1;
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            memberCreated.createdAt = memberCreated.createdAt.toISOString().split('T')[0];
            memberCreated.updatedAt = memberCreated.updatedAt.toISOString().split('T')[0];
            const memberExpected = {
                id: memberCreated.id,
                username: {
                    [platform]: [username],
                },
                displayName: username,
                attributes: {
                    [types_1.MemberAttributeName.SOURCE_ID]: {
                        [types_1.PlatformType.DISCORD]: attributes[types_1.MemberAttributeName.SOURCE_ID][types_1.PlatformType.DISCORD],
                        [types_1.PlatformType.TWITTER]: attributes[types_1.MemberAttributeName.SOURCE_ID][types_1.PlatformType.TWITTER],
                        default: attributes[types_1.MemberAttributeName.SOURCE_ID][types_1.PlatformType.TWITTER],
                    },
                    [types_1.MemberAttributeName.AVATAR_URL]: {
                        [types_1.PlatformType.TWITTER]: attributes[types_1.MemberAttributeName.AVATAR_URL][types_1.PlatformType.TWITTER],
                        default: attributes[types_1.MemberAttributeName.AVATAR_URL][types_1.PlatformType.TWITTER],
                    },
                    [types_1.MemberAttributeName.IS_HIREABLE]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.IS_HIREABLE][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.IS_HIREABLE][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.URL][types_1.PlatformType.GITHUB],
                        [types_1.PlatformType.TWITTER]: attributes[types_1.MemberAttributeName.URL][types_1.PlatformType.TWITTER],
                        default: attributes[types_1.MemberAttributeName.URL][types_1.PlatformType.TWITTER],
                    },
                    [types_1.MemberAttributeName.WEBSITE_URL]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.WEBSITE_URL][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.WEBSITE_URL][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.BIO]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.BIO][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.BIO][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.LOCATION][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.LOCATION][types_1.PlatformType.GITHUB],
                    },
                },
                emails: member1.emails,
                score: member1.score,
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                organizations: [
                    {
                        displayName: 'l.com',
                        id: memberCreated.organizations[0].id,
                        memberOrganizations: {
                            memberId: memberCreated.id,
                            organizationId: memberCreated.organizations[0].id,
                            dateEnd: null,
                            dateStart: null,
                            title: null,
                            source: null,
                        },
                    },
                ],
                tenantId: mockIServiceOptions.currentTenant.id,
                segments: mockIServiceOptions.currentSegments,
                createdById: mockIServiceOptions.currentUser.id,
                updatedById: mockIServiceOptions.currentUser.id,
                reach: { total: -1 },
                joinedAt: new Date('2020-05-28T15:13:30Z'),
                lastEnriched: null,
                enrichedBy: [],
                contributions: null,
                affiliations: [],
                manuallyCreated: false,
            };
            expect(memberCreated).toStrictEqual(memberExpected);
        });
        it('Should create non existent member - object type username', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIServiceOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            const member1 = {
                username: {
                    [types_1.PlatformType.GITHUB]: 'anil',
                    [types_1.PlatformType.TWITTER]: 'anil_twitter',
                },
                platform: types_1.PlatformType.GITHUB,
                emails: ['lala@l.com'],
                score: 10,
                attributes: {
                    [types_1.MemberAttributeName.IS_HIREABLE]: {
                        [types_1.PlatformType.GITHUB]: true,
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://github.com/imcvampire',
                    },
                    [types_1.MemberAttributeName.WEBSITE_URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://imcvampire.js.org/',
                    },
                    [types_1.MemberAttributeName.BIO]: {
                        [types_1.PlatformType.GITHUB]: 'Lazy geek',
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: 'Helsinki, Finland',
                    },
                },
                joinedAt: '2020-05-28T15:13:30Z',
            };
            // Save some attributes since they get modified in the upsert function
            const { username, attributes } = member1;
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            memberCreated.createdAt = memberCreated.createdAt.toISOString().split('T')[0];
            memberCreated.updatedAt = memberCreated.updatedAt.toISOString().split('T')[0];
            const memberExpected = {
                id: memberCreated.id,
                username: {
                    [types_1.PlatformType.GITHUB]: ['anil'],
                    [types_1.PlatformType.TWITTER]: ['anil_twitter'],
                },
                displayName: 'anil',
                attributes: {
                    [types_1.MemberAttributeName.IS_HIREABLE]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.IS_HIREABLE][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.IS_HIREABLE][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.URL][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.URL][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.WEBSITE_URL]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.WEBSITE_URL][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.WEBSITE_URL][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.BIO]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.BIO][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.BIO][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.LOCATION][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.LOCATION][types_1.PlatformType.GITHUB],
                    },
                },
                emails: member1.emails,
                score: member1.score,
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIServiceOptions.currentTenant.id,
                segments: mockIServiceOptions.currentSegments,
                createdById: mockIServiceOptions.currentUser.id,
                updatedById: mockIServiceOptions.currentUser.id,
                lastEnriched: null,
                organizations: [
                    {
                        displayName: 'l.com',
                        id: memberCreated.organizations[0].id,
                        memberOrganizations: {
                            memberId: memberCreated.id,
                            organizationId: memberCreated.organizations[0].id,
                            dateEnd: null,
                            dateStart: null,
                            title: null,
                            source: null,
                        },
                    },
                ],
                enrichedBy: [],
                contributions: null,
                reach: { total: -1 },
                joinedAt: new Date('2020-05-28T15:13:30Z'),
                affiliations: [],
                manuallyCreated: false,
            };
            expect(memberCreated).toStrictEqual(memberExpected);
        });
        it('Should create non existent member - reach as number', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const member1 = {
                username: 'anil',
                platform: types_1.PlatformType.GITHUB,
                emails: ['lala@l.com'],
                score: 10,
                attributes: {},
                reach: 10,
                bio: 'Computer Science',
                joinedAt: '2020-05-28T15:13:30Z',
                location: 'Istanbul',
            };
            // Save some attributes since they get modified in the upsert function
            const { platform, username } = member1;
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            memberCreated.createdAt = memberCreated.createdAt.toISOString().split('T')[0];
            memberCreated.updatedAt = memberCreated.updatedAt.toISOString().split('T')[0];
            const memberExpected = {
                id: memberCreated.id,
                username: {
                    [platform]: [username],
                },
                displayName: username,
                attributes: {},
                emails: member1.emails,
                lastEnriched: null,
                organizations: [
                    {
                        displayName: 'l.com',
                        id: memberCreated.organizations[0].id,
                        memberOrganizations: {
                            memberId: memberCreated.id,
                            organizationId: memberCreated.organizations[0].id,
                            dateEnd: null,
                            dateStart: null,
                            title: null,
                            source: null,
                        },
                    },
                ],
                enrichedBy: [],
                contributions: null,
                score: member1.score,
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIServiceOptions.currentTenant.id,
                segments: mockIServiceOptions.currentSegments,
                createdById: mockIServiceOptions.currentUser.id,
                updatedById: mockIServiceOptions.currentUser.id,
                reach: { total: 10, [types_1.PlatformType.GITHUB]: 10 },
                joinedAt: new Date('2020-05-28T15:13:30Z'),
                affiliations: [],
                manuallyCreated: false,
            };
            expect(memberCreated).toStrictEqual(memberExpected);
        });
        it('Should create non existent member - reach as object, platform in object', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const member1 = {
                username: 'anil',
                platform: types_1.PlatformType.GITHUB,
                emails: ['lala@l.com'],
                score: 10,
                reach: { [types_1.PlatformType.GITHUB]: 10, [types_1.PlatformType.TWITTER]: 10 },
                bio: 'Computer Science',
                joinedAt: '2020-05-28T15:13:30Z',
                location: 'Istanbul',
            };
            // Save some attributes since they get modified in the upsert function
            const { platform, username } = member1;
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            memberCreated.createdAt = memberCreated.createdAt.toISOString().split('T')[0];
            memberCreated.updatedAt = memberCreated.updatedAt.toISOString().split('T')[0];
            const memberExpected = {
                id: memberCreated.id,
                username: {
                    [platform]: [username],
                },
                displayName: username,
                attributes: {},
                lastEnriched: null,
                organizations: [
                    {
                        displayName: 'l.com',
                        id: memberCreated.organizations[0].id,
                        memberOrganizations: {
                            memberId: memberCreated.id,
                            organizationId: memberCreated.organizations[0].id,
                            dateEnd: null,
                            dateStart: null,
                            title: null,
                            source: null,
                        },
                    },
                ],
                enrichedBy: [],
                contributions: null,
                emails: member1.emails,
                score: member1.score,
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIServiceOptions.currentTenant.id,
                segments: mockIServiceOptions.currentSegments,
                createdById: mockIServiceOptions.currentUser.id,
                updatedById: mockIServiceOptions.currentUser.id,
                reach: { total: 20, [types_1.PlatformType.GITHUB]: 10, [types_1.PlatformType.TWITTER]: 10 },
                joinedAt: new Date('2020-05-28T15:13:30Z'),
                affiliations: [],
                manuallyCreated: false,
            };
            expect(memberCreated).toStrictEqual(memberExpected);
        });
        it('Should create non existent member - reach as object, platform not in object', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const member1 = {
                username: 'anil',
                platform: types_1.PlatformType.GITHUB,
                emails: ['lala@l.com'],
                score: 10,
                reach: { [types_1.PlatformType.DISCORD]: 10, [types_1.PlatformType.TWITTER]: 10 },
                bio: 'Computer Science',
                joinedAt: '2020-05-28T15:13:30Z',
                location: 'Istanbul',
            };
            // Save some attributes since they get modified in the upsert function
            const { platform, username } = member1;
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            memberCreated.createdAt = memberCreated.createdAt.toISOString().split('T')[0];
            memberCreated.updatedAt = memberCreated.updatedAt.toISOString().split('T')[0];
            const memberExpected = {
                id: memberCreated.id,
                username: {
                    [platform]: [username],
                },
                displayName: username,
                attributes: {},
                emails: member1.emails,
                score: member1.score,
                lastEnriched: null,
                organizations: [
                    {
                        displayName: 'l.com',
                        id: memberCreated.organizations[0].id,
                        memberOrganizations: {
                            memberId: memberCreated.id,
                            organizationId: memberCreated.organizations[0].id,
                            dateEnd: null,
                            dateStart: null,
                            title: null,
                            source: null,
                        },
                    },
                ],
                enrichedBy: [],
                contributions: null,
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIServiceOptions.currentTenant.id,
                segments: mockIServiceOptions.currentSegments,
                createdById: mockIServiceOptions.currentUser.id,
                updatedById: mockIServiceOptions.currentUser.id,
                reach: { total: 20, [types_1.PlatformType.DISCORD]: 10, [types_1.PlatformType.TWITTER]: 10 },
                joinedAt: new Date('2020-05-28T15:13:30Z'),
                affiliations: [],
                manuallyCreated: false,
            };
            expect(memberCreated).toStrictEqual(memberExpected);
        });
        it('Should create non existent member - organization as name, no enrichment', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const member1 = {
                username: 'anil',
                platform: types_1.PlatformType.GITHUB,
                emails: ['lala@gmail.com'],
                score: 10,
                attributes: {},
                reach: 10,
                bio: 'Computer Science',
                organizations: ['gitmesh.dev'],
                joinedAt: '2020-05-28T15:13:30Z',
                location: 'Istanbul',
            };
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            memberCreated.createdAt = memberCreated.createdAt.toISOString().split('T')[0];
            memberCreated.updatedAt = memberCreated.updatedAt.toISOString().split('T')[0];
            const organization = (await organizationRepository_1.default.findAndCountAll({}, mockIServiceOptions))
                .rows[0];
            const foundMember = await memberRepository_1.default.findById(memberCreated.id, mockIServiceOptions);
            const o1 = foundMember.organizations[0].get({ plain: true });
            delete o1.createdAt;
            delete o1.updatedAt;
            expect(o1).toStrictEqual({
                id: organization.id,
                displayName: 'gitmesh.dev',
                github: null,
                location: null,
                website: null,
                description: null,
                emails: null,
                phoneNumbers: null,
                logo: null,
                memberOrganizations: {
                    dateEnd: null,
                    dateStart: null,
                    title: null,
                    source: null,
                },
                tags: null,
                twitter: null,
                linkedin: null,
                crunchbase: null,
                employees: null,
                revenueRange: null,
                importHash: null,
                deletedAt: null,
                tenantId: mockIServiceOptions.currentTenant.id,
                createdById: mockIServiceOptions.currentUser.id,
                updatedById: mockIServiceOptions.currentUser.id,
                isTeamOrganization: false,
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
                profiles: null,
                attributes: {},
                manuallyCreated: false,
                affiliatedProfiles: null,
                allSubsidiaries: null,
                alternativeDomains: null,
                alternativeNames: null,
                averageEmployeeTenure: null,
                averageTenureByLevel: null,
                averageTenureByRole: null,
                directSubsidiaries: null,
                employeeChurnRate: null,
                employeeCountByMonth: null,
                employeeGrowthRate: null,
                employeeCountByMonthByLevel: null,
                employeeCountByMonthByRole: null,
                gicsSector: null,
                grossAdditionsByMonth: null,
                grossDeparturesByMonth: null,
                ultimateParent: null,
                immediateParent: null,
            });
        });
        it('Should create non existent member - organization as object, no enrichment', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const member1 = {
                username: 'anil',
                platform: types_1.PlatformType.GITHUB,
                emails: ['lala@gmail.com'],
                score: 10,
                attributes: {},
                reach: 10,
                bio: 'Computer Science',
                organizations: [{ name: 'gitmesh.dev', url: 'https://gitmesh.dev', description: 'Here' }],
                joinedAt: '2020-05-28T15:13:30Z',
                location: 'Istanbul',
            };
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            memberCreated.createdAt = memberCreated.createdAt.toISOString().split('T')[0];
            memberCreated.updatedAt = memberCreated.updatedAt.toISOString().split('T')[0];
            const organization = (await organizationRepository_1.default.findAndCountAll({}, mockIServiceOptions))
                .rows[0];
            const foundMember = await memberRepository_1.default.findById(memberCreated.id, mockIServiceOptions);
            const o1 = foundMember.organizations[0].get({ plain: true });
            delete o1.createdAt;
            delete o1.updatedAt;
            expect(o1).toStrictEqual({
                id: organization.id,
                displayName: 'gitmesh.dev',
                github: null,
                location: null,
                website: null,
                description: 'Here',
                emails: null,
                phoneNumbers: null,
                logo: null,
                memberOrganizations: {
                    dateEnd: null,
                    dateStart: null,
                    title: null,
                    source: null,
                },
                tags: null,
                twitter: null,
                linkedin: null,
                crunchbase: null,
                employees: null,
                revenueRange: null,
                importHash: null,
                deletedAt: null,
                tenantId: mockIServiceOptions.currentTenant.id,
                createdById: mockIServiceOptions.currentUser.id,
                updatedById: mockIServiceOptions.currentUser.id,
                isTeamOrganization: false,
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
                profiles: null,
                attributes: {},
                manuallyCreated: false,
                affiliatedProfiles: null,
                allSubsidiaries: null,
                alternativeDomains: null,
                alternativeNames: null,
                averageEmployeeTenure: null,
                averageTenureByLevel: null,
                averageTenureByRole: null,
                directSubsidiaries: null,
                employeeChurnRate: null,
                employeeCountByMonth: null,
                employeeGrowthRate: null,
                employeeCountByMonthByLevel: null,
                employeeCountByMonthByRole: null,
                gicsSector: null,
                grossAdditionsByMonth: null,
                grossDeparturesByMonth: null,
                ultimateParent: null,
                immediateParent: null,
            });
        });
        it('Should create non existent member - organization as id', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const oCreated = await new organizationService_1.default(mockIServiceOptions).createOrUpdate({
                identities: [
                    {
                        name: 'gitmesh.dev',
                        platform: 'gitmesh',
                    },
                ],
            });
            const member1 = {
                username: 'anil',
                platform: types_1.PlatformType.GITHUB,
                emails: ['lala@gmail.com'],
                score: 10,
                attributes: {},
                reach: 10,
                bio: 'Computer Science',
                organizations: [oCreated.id],
                joinedAt: '2020-05-28T15:13:30Z',
                location: 'Istanbul',
            };
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            memberCreated.createdAt = memberCreated.createdAt.toISOString().split('T')[0];
            memberCreated.updatedAt = memberCreated.updatedAt.toISOString().split('T')[0];
            const organization = (await organizationRepository_1.default.findAndCountAll({}, mockIServiceOptions))
                .rows[0];
            const foundMember = await memberRepository_1.default.findById(memberCreated.id, mockIServiceOptions);
            const o1 = foundMember.organizations[0].get({ plain: true });
            delete o1.createdAt;
            delete o1.updatedAt;
            expect(o1).toStrictEqual({
                id: organization.id,
                displayName: 'gitmesh.dev',
                github: null,
                location: null,
                website: null,
                description: null,
                emails: null,
                phoneNumbers: null,
                logo: null,
                memberOrganizations: {
                    dateEnd: null,
                    dateStart: null,
                    title: null,
                    source: null,
                },
                tags: null,
                twitter: null,
                linkedin: null,
                crunchbase: null,
                employees: null,
                revenueRange: null,
                importHash: null,
                deletedAt: null,
                tenantId: mockIServiceOptions.currentTenant.id,
                createdById: mockIServiceOptions.currentUser.id,
                updatedById: mockIServiceOptions.currentUser.id,
                isTeamOrganization: false,
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
                profiles: null,
                attributes: {},
                manuallyCreated: false,
                affiliatedProfiles: null,
                allSubsidiaries: null,
                alternativeDomains: null,
                alternativeNames: null,
                averageEmployeeTenure: null,
                averageTenureByLevel: null,
                averageTenureByRole: null,
                directSubsidiaries: null,
                employeeChurnRate: null,
                employeeCountByMonth: null,
                employeeGrowthRate: null,
                employeeCountByMonthByLevel: null,
                employeeCountByMonthByRole: null,
                gicsSector: null,
                grossAdditionsByMonth: null,
                grossDeparturesByMonth: null,
                ultimateParent: null,
                immediateParent: null,
            });
        });
        it('Should update existent member succesfully - simple', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIServiceOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            const member1 = {
                username: 'anil',
                emails: ['lala@l.com'],
                platform: types_1.PlatformType.GITHUB,
                score: 10,
                attributes: {
                    [types_1.MemberAttributeName.IS_HIREABLE]: {
                        [types_1.PlatformType.GITHUB]: true,
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://github.com/imcvampire',
                    },
                    [types_1.MemberAttributeName.WEBSITE_URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://imcvampire.js.org/',
                    },
                    [types_1.MemberAttributeName.BIO]: {
                        [types_1.PlatformType.GITHUB]: 'Lazy geek',
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: 'Helsinki, Finland',
                    },
                },
                joinedAt: '2020-05-28T15:13:30Z',
            };
            const member1Username = member1.username;
            const attributes = member1.attributes;
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            memberCreated.createdAt = memberCreated.createdAt.toISOString().split('T')[0];
            memberCreated.updatedAt = memberCreated.updatedAt.toISOString().split('T')[0];
            const member2 = {
                username: 'anil',
                emails: ['test@gmail.com', 'test2@yahoo.com'],
                platform: types_1.PlatformType.GITHUB,
                location: 'Ankara',
            };
            const memberUpdated = await new memberService_1.default(mockIServiceOptions).upsert(member2);
            memberUpdated.createdAt = memberUpdated.createdAt.toISOString().split('T')[0];
            memberUpdated.updatedAt = memberUpdated.updatedAt.toISOString().split('T')[0];
            const memberExpected = {
                id: memberCreated.id,
                username: {
                    [types_1.PlatformType.GITHUB]: [member1Username],
                },
                displayName: member1Username,
                attributes: {
                    [types_1.MemberAttributeName.IS_HIREABLE]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.IS_HIREABLE][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.IS_HIREABLE][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.URL][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.URL][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.WEBSITE_URL]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.WEBSITE_URL][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.WEBSITE_URL][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.BIO]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.BIO][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.BIO][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.LOCATION][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.LOCATION][types_1.PlatformType.GITHUB],
                    },
                },
                lastEnriched: null,
                organizations: [
                    {
                        displayName: 'l.com',
                        id: memberCreated.organizations[0].id,
                        memberOrganizations: {
                            memberId: memberCreated.id,
                            organizationId: memberCreated.organizations[0].id,
                            dateEnd: null,
                            dateStart: null,
                            title: null,
                            source: null,
                        },
                    },
                ],
                enrichedBy: [],
                contributions: null,
                emails: ['lala@l.com', 'test@gmail.com', 'test2@yahoo.com'],
                score: member1.score,
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIServiceOptions.currentTenant.id,
                segments: mockIServiceOptions.currentSegments,
                createdById: mockIServiceOptions.currentUser.id,
                updatedById: mockIServiceOptions.currentUser.id,
                joinedAt: new Date('2020-05-28T15:13:30Z'),
                reach: { total: -1 },
                affiliations: [],
                manuallyCreated: false,
            };
            expect(memberUpdated).toStrictEqual(memberExpected);
        });
        it('Should update existent member successfully - attributes with matching platform', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIServiceOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            await mas.createPredefined(integrations_1.TWITTER_MEMBER_ATTRIBUTES);
            const member1 = {
                username: 'anil',
                emails: ['lala@l.com'],
                platform: types_1.PlatformType.GITHUB,
                score: 10,
                attributes: {
                    [types_1.MemberAttributeName.IS_HIREABLE]: {
                        [types_1.PlatformType.GITHUB]: true,
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://github.com/imcvampire',
                    },
                },
                joinedAt: '2020-05-28T15:13:30Z',
            };
            const member1Username = member1.username;
            const attributes1 = member1.attributes;
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            memberCreated.createdAt = memberCreated.createdAt.toISOString().split('T')[0];
            memberCreated.updatedAt = memberCreated.updatedAt.toISOString().split('T')[0];
            const member2 = {
                username: 'anil',
                platform: types_1.PlatformType.GITHUB,
                attributes: {
                    [types_1.MemberAttributeName.WEBSITE_URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://imcvampire.js.org/',
                    },
                    [types_1.MemberAttributeName.BIO]: {
                        [types_1.PlatformType.GITHUB]: 'Lazy geek',
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: 'Helsinki, Finland',
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.TWITTER]: 'https://twitter-url',
                    },
                },
            };
            const attributes2 = member2.attributes;
            const memberUpdated = await new memberService_1.default(mockIServiceOptions).upsert(member2);
            memberUpdated.createdAt = memberUpdated.createdAt.toISOString().split('T')[0];
            memberUpdated.updatedAt = memberUpdated.updatedAt.toISOString().split('T')[0];
            const memberExpected = {
                id: memberCreated.id,
                username: {
                    [types_1.PlatformType.GITHUB]: [member1Username],
                },
                displayName: member1Username,
                attributes: {
                    [types_1.MemberAttributeName.IS_HIREABLE]: {
                        [types_1.PlatformType.GITHUB]: attributes1[types_1.MemberAttributeName.IS_HIREABLE][types_1.PlatformType.GITHUB],
                        default: attributes1[types_1.MemberAttributeName.IS_HIREABLE][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.GITHUB]: attributes1[types_1.MemberAttributeName.URL][types_1.PlatformType.GITHUB],
                        [types_1.PlatformType.TWITTER]: attributes2[types_1.MemberAttributeName.URL][types_1.PlatformType.TWITTER],
                        default: attributes2[types_1.MemberAttributeName.URL][types_1.PlatformType.TWITTER],
                    },
                    [types_1.MemberAttributeName.WEBSITE_URL]: {
                        [types_1.PlatformType.GITHUB]: attributes2[types_1.MemberAttributeName.WEBSITE_URL][types_1.PlatformType.GITHUB],
                        default: attributes2[types_1.MemberAttributeName.WEBSITE_URL][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.BIO]: {
                        [types_1.PlatformType.GITHUB]: attributes2[types_1.MemberAttributeName.BIO][types_1.PlatformType.GITHUB],
                        default: attributes2[types_1.MemberAttributeName.BIO][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: attributes2[types_1.MemberAttributeName.LOCATION][types_1.PlatformType.GITHUB],
                        default: attributes2[types_1.MemberAttributeName.LOCATION][types_1.PlatformType.GITHUB],
                    },
                },
                lastEnriched: null,
                organizations: [
                    {
                        displayName: 'l.com',
                        id: memberCreated.organizations[0].id,
                        memberOrganizations: {
                            memberId: memberCreated.id,
                            organizationId: memberCreated.organizations[0].id,
                            dateEnd: null,
                            dateStart: null,
                            title: null,
                            source: null,
                        },
                    },
                ],
                enrichedBy: [],
                contributions: null,
                emails: member1.emails,
                score: member1.score,
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIServiceOptions.currentTenant.id,
                segments: mockIServiceOptions.currentSegments,
                createdById: mockIServiceOptions.currentUser.id,
                updatedById: mockIServiceOptions.currentUser.id,
                joinedAt: new Date('2020-05-28T15:13:30Z'),
                reach: { total: -1 },
                affiliations: [],
                manuallyCreated: false,
            };
            expect(memberUpdated).toStrictEqual(memberExpected);
        });
        it('Should update existent member succesfully - object type username', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIServiceOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            const member1 = {
                username: 'anil',
                emails: ['lala@l.com'],
                platform: types_1.PlatformType.GITHUB,
                score: 10,
                attributes: {
                    [types_1.MemberAttributeName.IS_HIREABLE]: {
                        [types_1.PlatformType.GITHUB]: true,
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://github.com/imcvampire',
                    },
                    [types_1.MemberAttributeName.WEBSITE_URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://imcvampire.js.org/',
                    },
                    [types_1.MemberAttributeName.BIO]: {
                        [types_1.PlatformType.GITHUB]: 'Lazy geek',
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: 'Helsinki, Finland',
                    },
                },
                joinedAt: '2020-05-28T15:13:30Z',
            };
            const member1Username = member1.username;
            const attributes = member1.attributes;
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            memberCreated.createdAt = memberCreated.createdAt.toISOString().split('T')[0];
            memberCreated.updatedAt = memberCreated.updatedAt.toISOString().split('T')[0];
            const member2 = {
                username: {
                    [types_1.PlatformType.GITHUB]: 'anil',
                    [types_1.PlatformType.TWITTER]: 'anil_twitter',
                    [types_1.PlatformType.DISCORD]: 'anil_discord',
                },
                platform: types_1.PlatformType.GITHUB,
            };
            const memberUpdated = await new memberService_1.default(mockIServiceOptions).upsert(member2);
            memberUpdated.createdAt = memberUpdated.createdAt.toISOString().split('T')[0];
            memberUpdated.updatedAt = memberUpdated.updatedAt.toISOString().split('T')[0];
            const memberExpected = {
                id: memberCreated.id,
                username: {
                    [types_1.PlatformType.GITHUB]: ['anil'],
                    [types_1.PlatformType.TWITTER]: ['anil_twitter'],
                    [types_1.PlatformType.DISCORD]: ['anil_discord'],
                },
                displayName: 'anil',
                attributes: {
                    [types_1.MemberAttributeName.IS_HIREABLE]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.IS_HIREABLE][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.IS_HIREABLE][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.URL][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.URL][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.WEBSITE_URL]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.WEBSITE_URL][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.WEBSITE_URL][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.BIO]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.BIO][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.BIO][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.LOCATION][types_1.PlatformType.GITHUB],
                        default: attributes[types_1.MemberAttributeName.LOCATION][types_1.PlatformType.GITHUB],
                    },
                },
                emails: member1.emails,
                lastEnriched: null,
                organizations: [
                    {
                        displayName: 'l.com',
                        id: memberCreated.organizations[0].id,
                        memberOrganizations: {
                            memberId: memberCreated.id,
                            organizationId: memberCreated.organizations[0].id,
                            dateEnd: null,
                            dateStart: null,
                            title: null,
                            source: null,
                        },
                    },
                ],
                enrichedBy: [],
                contributions: null,
                score: member1.score,
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIServiceOptions.currentTenant.id,
                segments: mockIServiceOptions.currentSegments,
                createdById: mockIServiceOptions.currentUser.id,
                updatedById: mockIServiceOptions.currentUser.id,
                joinedAt: new Date('2020-05-28T15:13:30Z'),
                reach: { total: -1 },
                affiliations: [],
                manuallyCreated: false,
            };
            expect(memberUpdated).toStrictEqual(memberExpected);
        });
        it('Should throw 400 error when given platform does not match with username object ', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIServiceOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            const member1 = {
                username: 'anil',
                emails: ['lala@l.com'],
                platform: types_1.PlatformType.GITHUB,
                score: 10,
                attributes: {
                    [types_1.MemberAttributeName.IS_HIREABLE]: {
                        [types_1.PlatformType.GITHUB]: true,
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://github.com/imcvampire',
                    },
                    [types_1.MemberAttributeName.WEBSITE_URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://imcvampire.js.org/',
                    },
                    [types_1.MemberAttributeName.BIO]: {
                        [types_1.PlatformType.GITHUB]: 'Lazy geek',
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: 'Helsinki, Finland',
                    },
                },
                joinedAt: '2020-05-28T15:13:30Z',
            };
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            memberCreated.createdAt = memberCreated.createdAt.toISOString().split('T')[0];
            memberCreated.updatedAt = memberCreated.updatedAt.toISOString().split('T')[0];
            const member2 = {
                username: {
                    [types_1.PlatformType.GITHUB]: 'anil',
                    [types_1.PlatformType.TWITTER]: 'anil_twitter',
                    [types_1.PlatformType.DISCORD]: 'anil_discord',
                },
                platform: types_1.PlatformType.SLACK,
            };
            await expect(() => new memberService_1.default(mockIServiceOptions).upsert(member2)).rejects.toThrowError(new common_1.Error400());
        });
        it('Should update existent member succesfully - JSON fields', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIServiceOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            await mas.createPredefined(integrations_1.DEVTO_MEMBER_ATTRIBUTES);
            const member1 = {
                username: 'anil',
                platform: types_1.PlatformType.TWITTER,
                emails: ['lala@l.com'],
                score: 10,
                attributes: {
                    [types_1.MemberAttributeName.IS_HIREABLE]: {
                        [types_1.PlatformType.GITHUB]: true,
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://github.com/imcvampire',
                    },
                    [types_1.MemberAttributeName.WEBSITE_URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://imcvampire.js.org/',
                    },
                    [types_1.MemberAttributeName.BIO]: {
                        [types_1.PlatformType.GITHUB]: 'Lazy geek',
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: 'Helsinki, Finland',
                    },
                },
                joinedAt: '2020-05-28T15:13:30Z',
            };
            const member1Username = member1.username;
            const attributes1 = member1.attributes;
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            memberCreated.createdAt = memberCreated.createdAt.toISOString().split('T')[0];
            memberCreated.updatedAt = memberCreated.updatedAt.toISOString().split('T')[0];
            const member2 = {
                username: 'anil',
                platform: types_1.PlatformType.TWITTER,
                joinedAt: '2020-05-28T15:13:30Z',
                location: 'Ankara',
                attributes: {
                    [types_1.MemberAttributeName.SOURCE_ID]: {
                        [types_1.PlatformType.DEVTO]: '#someDevtoId',
                        [types_1.PlatformType.SLACK]: '#someSlackId',
                    },
                    [types_1.MemberAttributeName.NAME]: {
                        [types_1.PlatformType.DEVTO]: 'Michael Scott',
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.DEVTO]: 'https://some-devto-url',
                    },
                },
            };
            const attributes2 = member2.attributes;
            const memberUpdated = await new memberService_1.default(mockIServiceOptions).upsert(member2);
            memberUpdated.createdAt = memberUpdated.createdAt.toISOString().split('T')[0];
            memberUpdated.updatedAt = memberUpdated.updatedAt.toISOString().split('T')[0];
            const memberExpected = {
                id: memberCreated.id,
                joinedAt: new Date('2020-05-28T15:13:30Z'),
                username: {
                    [types_1.PlatformType.TWITTER]: [member1Username],
                },
                displayName: member1Username,
                attributes: {
                    [types_1.MemberAttributeName.SOURCE_ID]: {
                        [types_1.PlatformType.DEVTO]: attributes2[types_1.MemberAttributeName.SOURCE_ID][types_1.PlatformType.DEVTO],
                        [types_1.PlatformType.SLACK]: attributes2[types_1.MemberAttributeName.SOURCE_ID][types_1.PlatformType.SLACK],
                        default: attributes2[types_1.MemberAttributeName.SOURCE_ID][types_1.PlatformType.DEVTO],
                    },
                    [types_1.MemberAttributeName.NAME]: {
                        [types_1.PlatformType.DEVTO]: attributes2[types_1.MemberAttributeName.NAME][types_1.PlatformType.DEVTO],
                        default: attributes2[types_1.MemberAttributeName.NAME][types_1.PlatformType.DEVTO],
                    },
                    [types_1.MemberAttributeName.IS_HIREABLE]: {
                        [types_1.PlatformType.GITHUB]: attributes1[types_1.MemberAttributeName.IS_HIREABLE][types_1.PlatformType.GITHUB],
                        default: attributes1[types_1.MemberAttributeName.IS_HIREABLE][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.GITHUB]: attributes1[types_1.MemberAttributeName.URL][types_1.PlatformType.GITHUB],
                        [types_1.PlatformType.DEVTO]: attributes2[types_1.MemberAttributeName.URL][types_1.PlatformType.DEVTO],
                        default: attributes1[types_1.MemberAttributeName.URL][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.WEBSITE_URL]: {
                        [types_1.PlatformType.GITHUB]: attributes1[types_1.MemberAttributeName.WEBSITE_URL][types_1.PlatformType.GITHUB],
                        default: attributes1[types_1.MemberAttributeName.WEBSITE_URL][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.BIO]: {
                        [types_1.PlatformType.GITHUB]: attributes1[types_1.MemberAttributeName.BIO][types_1.PlatformType.GITHUB],
                        default: attributes1[types_1.MemberAttributeName.BIO][types_1.PlatformType.GITHUB],
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: attributes1[types_1.MemberAttributeName.LOCATION][types_1.PlatformType.GITHUB],
                        default: attributes1[types_1.MemberAttributeName.LOCATION][types_1.PlatformType.GITHUB],
                    },
                },
                emails: member1.emails,
                lastEnriched: null,
                organizations: [
                    {
                        displayName: 'l.com',
                        id: memberCreated.organizations[0].id,
                        memberOrganizations: {
                            memberId: memberCreated.id,
                            organizationId: memberCreated.organizations[0].id,
                            dateEnd: null,
                            dateStart: null,
                            title: null,
                            source: null,
                        },
                    },
                ],
                enrichedBy: [],
                contributions: null,
                score: member1.score,
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIServiceOptions.currentTenant.id,
                segments: mockIServiceOptions.currentSegments,
                createdById: mockIServiceOptions.currentUser.id,
                updatedById: mockIServiceOptions.currentUser.id,
                reach: { total: -1 },
                affiliations: [],
                manuallyCreated: false,
            };
            expect(memberUpdated).toStrictEqual(memberExpected);
        });
        it('Should update existent member succesfully - reach from default to complete - sending number', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const member1 = {
                username: 'anil',
                platform: types_1.PlatformType.GITHUB,
                joinedAt: '2020-05-28T15:13:30Z',
            };
            const member1Username = member1.username;
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            memberCreated.createdAt = memberCreated.createdAt.toISOString().split('T')[0];
            memberCreated.updatedAt = memberCreated.updatedAt.toISOString().split('T')[0];
            const member2 = {
                username: 'anil',
                platform: types_1.PlatformType.GITHUB,
                reach: 10,
            };
            const memberUpdated = await new memberService_1.default(mockIServiceOptions).upsert(member2);
            memberUpdated.createdAt = memberUpdated.createdAt.toISOString().split('T')[0];
            memberUpdated.updatedAt = memberUpdated.updatedAt.toISOString().split('T')[0];
            const memberExpected = {
                id: memberCreated.id,
                joinedAt: new Date('2020-05-28T15:13:30Z'),
                username: {
                    [types_1.PlatformType.GITHUB]: [member1Username],
                },
                displayName: member1Username,
                lastEnriched: null,
                organizations: [],
                enrichedBy: [],
                contributions: null,
                reach: { total: 10, [types_1.PlatformType.GITHUB]: 10 },
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIServiceOptions.currentTenant.id,
                segments: mockIServiceOptions.currentSegments,
                createdById: mockIServiceOptions.currentUser.id,
                updatedById: mockIServiceOptions.currentUser.id,
                score: -1,
                emails: [],
                attributes: {},
                affiliations: [],
                manuallyCreated: false,
            };
            expect(memberUpdated).toStrictEqual(memberExpected);
        });
        it('Should update existent member succesfully - reach from default to complete - sending platform', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const member1 = {
                username: 'anil',
                type: 'member',
                platform: types_1.PlatformType.GITHUB,
                joinedAt: '2020-05-28T15:13:30Z',
            };
            const member1Username = member1.username;
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            memberCreated.createdAt = memberCreated.createdAt.toISOString().split('T')[0];
            memberCreated.updatedAt = memberCreated.updatedAt.toISOString().split('T')[0];
            const member2 = {
                username: 'anil',
                platform: types_1.PlatformType.GITHUB,
                reach: { [types_1.PlatformType.GITHUB]: 10 },
            };
            const memberUpdated = await new memberService_1.default(mockIServiceOptions).upsert(member2);
            memberUpdated.createdAt = memberUpdated.createdAt.toISOString().split('T')[0];
            memberUpdated.updatedAt = memberUpdated.updatedAt.toISOString().split('T')[0];
            const memberExpected = {
                id: memberCreated.id,
                joinedAt: new Date('2020-05-28T15:13:30Z'),
                username: {
                    [types_1.PlatformType.GITHUB]: [member1Username],
                },
                lastEnriched: null,
                organizations: [],
                enrichedBy: [],
                contributions: null,
                displayName: member1Username,
                reach: { total: 10, [types_1.PlatformType.GITHUB]: 10 },
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIServiceOptions.currentTenant.id,
                segments: mockIServiceOptions.currentSegments,
                createdById: mockIServiceOptions.currentUser.id,
                updatedById: mockIServiceOptions.currentUser.id,
                score: -1,
                emails: [],
                attributes: {},
                affiliations: [],
                manuallyCreated: false,
            };
            expect(memberUpdated).toStrictEqual(memberExpected);
        });
        it('Should update existent member succesfully - complex reach update from object', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const member1 = {
                username: 'anil',
                type: 'member',
                platform: types_1.PlatformType.GITHUB,
                joinedAt: '2020-05-28T15:13:30Z',
                reach: { [types_1.PlatformType.TWITTER]: 10, linkedin: 10, total: 20 },
            };
            const member1Username = member1.username;
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            memberCreated.createdAt = memberCreated.createdAt.toISOString().split('T')[0];
            memberCreated.updatedAt = memberCreated.updatedAt.toISOString().split('T')[0];
            const member2 = {
                username: 'anil',
                platform: types_1.PlatformType.GITHUB,
                reach: { [types_1.PlatformType.GITHUB]: 15, linkedin: 11 },
            };
            const memberUpdated = await new memberService_1.default(mockIServiceOptions).upsert(member2);
            memberUpdated.createdAt = memberUpdated.createdAt.toISOString().split('T')[0];
            memberUpdated.updatedAt = memberUpdated.updatedAt.toISOString().split('T')[0];
            const memberExpected = {
                id: memberCreated.id,
                joinedAt: new Date('2020-05-28T15:13:30Z'),
                username: {
                    [types_1.PlatformType.GITHUB]: [member1Username],
                },
                lastEnriched: null,
                organizations: [],
                enrichedBy: [],
                contributions: null,
                displayName: member1Username,
                reach: { total: 36, [types_1.PlatformType.GITHUB]: 15, linkedin: 11, [types_1.PlatformType.TWITTER]: 10 },
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIServiceOptions.currentTenant.id,
                segments: mockIServiceOptions.currentSegments,
                createdById: mockIServiceOptions.currentUser.id,
                updatedById: mockIServiceOptions.currentUser.id,
                score: -1,
                emails: [],
                attributes: {},
                affiliations: [],
                manuallyCreated: false,
            };
            expect(memberUpdated).toStrictEqual(memberExpected);
        });
        it('Should update existent member succesfully - complex reach update from number', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const member1 = {
                username: 'anil',
                type: 'member',
                platform: types_1.PlatformType.GITHUB,
                joinedAt: '2020-05-28T15:13:30Z',
                reach: { [types_1.PlatformType.TWITTER]: 10, linkedin: 10, total: 20 },
            };
            const member1Username = member1.username;
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            memberCreated.createdAt = memberCreated.createdAt.toISOString().split('T')[0];
            memberCreated.updatedAt = memberCreated.updatedAt.toISOString().split('T')[0];
            const member2 = {
                username: 'anil',
                platform: types_1.PlatformType.GITHUB,
                reach: 30,
            };
            const memberUpdated = await new memberService_1.default(mockIServiceOptions).upsert(member2);
            memberUpdated.createdAt = memberUpdated.createdAt.toISOString().split('T')[0];
            memberUpdated.updatedAt = memberUpdated.updatedAt.toISOString().split('T')[0];
            const memberExpected = {
                id: memberCreated.id,
                joinedAt: new Date('2020-05-28T15:13:30Z'),
                username: {
                    [types_1.PlatformType.GITHUB]: [member1Username],
                },
                displayName: member1Username,
                lastEnriched: null,
                organizations: [],
                enrichedBy: [],
                contributions: null,
                reach: { total: 50, [types_1.PlatformType.GITHUB]: 30, linkedin: 10, [types_1.PlatformType.TWITTER]: 10 },
                importHash: null,
                createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIServiceOptions.currentTenant.id,
                segments: mockIServiceOptions.currentSegments,
                createdById: mockIServiceOptions.currentUser.id,
                updatedById: mockIServiceOptions.currentUser.id,
                score: -1,
                emails: [],
                attributes: {},
                affiliations: [],
                manuallyCreated: false,
            };
            expect(memberUpdated).toStrictEqual(memberExpected);
        });
    });
    describe('update method', () => {
        it('Should update existent member succesfully - removing identities with simple string format', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const member1 = {
                username: 'anil',
                type: 'member',
                platform: types_1.PlatformType.GITHUB,
                joinedAt: '2020-05-28T15:13:30Z',
            };
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            const toUpdate = {
                username: 'anil_new',
                platform: types_1.PlatformType.GITHUB,
            };
            const memberUpdated = await new memberService_1.default(mockIServiceOptions).update(memberCreated.id, toUpdate);
            expect(memberUpdated.username[types_1.PlatformType.GITHUB]).toStrictEqual(['anil_new']);
        });
        it('Should update existent member succesfully - removing identities with simple identity format', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const member1 = {
                username: {
                    [types_1.PlatformType.GITHUB]: {
                        username: 'anil',
                    },
                },
                platform: types_1.PlatformType.GITHUB,
                type: 'member',
                joinedAt: '2020-05-28T15:13:30Z',
            };
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            const toUpdate = {
                username: {
                    [types_1.PlatformType.GITHUB]: {
                        username: 'anil_new',
                    },
                },
                platform: types_1.PlatformType.GITHUB,
            };
            const memberUpdated = await new memberService_1.default(mockIServiceOptions).update(memberCreated.id, toUpdate);
            expect(memberUpdated.username[types_1.PlatformType.GITHUB]).toStrictEqual(['anil_new']);
        });
        it('Should update existent member succesfully - removing identities with array identity format', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const member1 = {
                username: {
                    [types_1.PlatformType.GITHUB]: [
                        {
                            username: 'anil',
                        },
                    ],
                },
                platform: types_1.PlatformType.GITHUB,
                type: 'member',
                joinedAt: '2020-05-28T15:13:30Z',
            };
            const memberCreated = await new memberService_1.default(mockIServiceOptions).upsert(member1);
            const toUpdate = {
                username: {
                    [types_1.PlatformType.GITHUB]: [
                        {
                            username: 'anil_new',
                        },
                        {
                            username: 'anil_new2',
                        },
                    ],
                },
                platform: types_1.PlatformType.GITHUB,
            };
            const memberUpdated = await new memberService_1.default(mockIServiceOptions).update(memberCreated.id, toUpdate);
            expect(memberUpdated.username[types_1.PlatformType.GITHUB]).toStrictEqual(['anil_new', 'anil_new2']);
        });
    });
    describe('merge method', () => {
        it('Should merge', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            await mas.createPredefined(integrations_1.DISCORD_MEMBER_ATTRIBUTES);
            await mas.createPredefined(integrations_1.TWITTER_MEMBER_ATTRIBUTES);
            await mas.createPredefined(integrations_1.SLACK_MEMBER_ATTRIBUTES);
            const memberService = new memberService_1.default(mockIRepositoryOptions);
            let t1 = await tagRepository_1.default.create({ name: 'tag1' }, mockIRepositoryOptions);
            let t2 = await tagRepository_1.default.create({ name: 'tag2' }, mockIRepositoryOptions);
            let t3 = await tagRepository_1.default.create({ name: 'tag3' }, mockIRepositoryOptions);
            let o1 = await organizationRepository_1.default.create({ displayName: 'org1' }, mockIRepositoryOptions);
            let o2 = await organizationRepository_1.default.create({ displayName: 'org2' }, mockIRepositoryOptions);
            let o3 = await organizationRepository_1.default.create({ displayName: 'org3' }, mockIRepositoryOptions);
            let task1 = await taskRepository_1.default.create({ name: 'task1' }, mockIRepositoryOptions);
            let task2 = await taskRepository_1.default.create({ name: 'task2' }, mockIRepositoryOptions);
            let task3 = await taskRepository_1.default.create({ name: 'task3' }, mockIRepositoryOptions);
            let note1 = await noteRepository_1.default.create({ body: 'note1' }, mockIRepositoryOptions);
            let note2 = await noteRepository_1.default.create({ body: 'note2' }, mockIRepositoryOptions);
            let note3 = await noteRepository_1.default.create({ body: 'note3' }, mockIRepositoryOptions);
            const member1 = {
                username: {
                    [types_1.PlatformType.GITHUB]: 'anil',
                },
                displayName: 'Anil',
                emails: ['anil+1@gitmesh.dev', 'anil+2@gitmesh.dev'],
                joinedAt: '2021-05-27T15:14:30Z',
                attributes: {},
                tags: [t1.id, t2.id],
                organizations: [o1.id, o2.id],
                tasks: [task1.id, task2.id],
                notes: [note1.id, note2.id],
            };
            const member2 = {
                username: {
                    [types_1.PlatformType.DISCORD]: 'anil',
                },
                emails: ['anil+1@gitmesh.dev', 'anil+3@gitmesh.dev'],
                displayName: 'Anil',
                joinedAt: '2021-05-30T15:14:30Z',
                attributes: {
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: 'gitmesh.dev',
                        default: 'gitmesh.dev',
                    },
                    [types_1.MemberAttributeName.SOURCE_ID]: {
                        [types_1.PlatformType.DISCORD]: '#discordId',
                        default: '#discordId',
                    },
                },
                tags: [t2.id, t3.id],
                organizations: [o2.id, o3.id],
                tasks: [task2.id, task3.id],
                notes: [note2.id, note3.id],
            };
            const member3 = {
                username: {
                    [types_1.PlatformType.TWITTER]: 'anil',
                },
                displayName: 'Anil',
                joinedAt: '2021-05-30T15:14:30Z',
                attributes: {
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.TWITTER]: 'https://a-twitter-url',
                        default: 'https://a-twitter-url',
                    },
                },
            };
            const member4 = {
                username: {
                    [types_1.PlatformType.SLACK]: 'testt',
                },
                displayName: 'Member 4',
                joinedAt: '2021-05-30T15:14:30Z',
                attributes: {
                    [types_1.MemberAttributeName.SOURCE_ID]: {
                        [types_1.PlatformType.SLACK]: '#slackId',
                        default: '#slackId',
                    },
                },
            };
            const returnedMember1 = await memberRepository_1.default.create(member1, mockIRepositoryOptions);
            const returnedMember2 = await memberRepository_1.default.create(member2, mockIRepositoryOptions);
            const returnedMember3 = await memberRepository_1.default.create(member3, mockIRepositoryOptions);
            const returnedMember4 = await memberRepository_1.default.create(member4, mockIRepositoryOptions);
            const activity = {
                type: 'activity',
                timestamp: '2020-05-27T15:13:30Z',
                platform: types_1.PlatformType.GITHUB,
                attributes: {
                    replies: 12,
                    body: 'Here',
                },
                sentiment: {
                    positive: 0.98,
                    negative: 0.0,
                    neutral: 0.02,
                    mixed: 0.0,
                    label: 'positive',
                    sentiment: 0.98,
                },
                isContribution: true,
                username: 'anil',
                member: returnedMember2.id,
                score: 1,
                sourceId: '#sourceId1',
            };
            let activityCreated = await activityRepository_1.default.create(activity, mockIRepositoryOptions);
            // toMerge[1] = [(1,2),(1,4)] toMerge[2] = [(2,1)] toMerge[4] = [(4,1)]
            // noMerge[2] = [3]
            await memberRepository_1.default.addToMerge([{ members: [returnedMember1.id, returnedMember2.id], similarity: null }], mockIRepositoryOptions);
            await memberRepository_1.default.addToMerge([{ members: [returnedMember1.id, returnedMember4.id], similarity: null }], mockIRepositoryOptions);
            await memberRepository_1.default.addToMerge([{ members: [returnedMember2.id, returnedMember1.id], similarity: null }], mockIRepositoryOptions);
            await memberRepository_1.default.addToMerge([{ members: [returnedMember4.id, returnedMember1.id], similarity: null }], mockIRepositoryOptions);
            await memberRepository_1.default.addNoMerge(returnedMember2.id, returnedMember3.id, mockIRepositoryOptions);
            const response = await memberService.merge(returnedMember1.id, returnedMember2.id);
            const mergedMember = await memberRepository_1.default.findById(response.mergedId, mockIRepositoryOptions);
            // Sequelize returns associations as array of models, we need to get plain objects
            mergedMember.tags = mergedMember.tags.map((i) => i.get({ plain: true }));
            mergedMember.organizations = mergedMember.organizations.map((i) => sequelizeTestUtils_1.default.objectWithoutKey(i.get({ plain: true }), ['memberOrganizations']));
            mergedMember.tasks = mergedMember.tasks.map((i) => i.get({ plain: true }));
            mergedMember.notes = mergedMember.notes.map((i) => i.get({ plain: true }));
            // get the created activity again, it's member should be updated after merge
            activityCreated = await activityRepository_1.default.findById(activityCreated.id, mockIRepositoryOptions);
            // we don't need activity.member because we're already expecting member->activities
            activityCreated = sequelizeTestUtils_1.default.objectWithoutKey(activityCreated, [
                'member',
                'objectMember',
                'parent',
                'tasks',
                'display',
                'organization',
            ]);
            // get previously created tags
            t1 = await tagRepository_1.default.findById(t1.id, mockIRepositoryOptions);
            t2 = await tagRepository_1.default.findById(t2.id, mockIRepositoryOptions);
            t3 = await tagRepository_1.default.findById(t3.id, mockIRepositoryOptions);
            // get previously created organizations
            o1 = await organizationRepository_1.default.findById(o1.id, mockIRepositoryOptions);
            o2 = await organizationRepository_1.default.findById(o2.id, mockIRepositoryOptions);
            o3 = await organizationRepository_1.default.findById(o3.id, mockIRepositoryOptions);
            // get previously created tasks
            task1 = await taskRepository_1.default.findById(task1.id, mockIRepositoryOptions);
            task2 = await taskRepository_1.default.findById(task2.id, mockIRepositoryOptions);
            task3 = await taskRepository_1.default.findById(task3.id, mockIRepositoryOptions);
            // get previously created notes
            note1 = await noteRepository_1.default.findById(note1.id, mockIRepositoryOptions);
            note2 = await noteRepository_1.default.findById(note2.id, mockIRepositoryOptions);
            note3 = await noteRepository_1.default.findById(note3.id, mockIRepositoryOptions);
            // remove tags->member relations as well (we should be only checking 1-deep relations)
            t1 = sequelizeTestUtils_1.default.objectWithoutKey(t1, 'members');
            t2 = sequelizeTestUtils_1.default.objectWithoutKey(t2, 'members');
            t3 = sequelizeTestUtils_1.default.objectWithoutKey(t3, 'members');
            // remove organizations->member relations as well (we should be only checking 1-deep relations)
            o1 = sequelizeTestUtils_1.default.objectWithoutKey(o1, [
                'memberCount',
                'joinedAt',
                'activityCount',
                'memberOrganizations',
            ]);
            o2 = sequelizeTestUtils_1.default.objectWithoutKey(o2, [
                'memberCount',
                'joinedAt',
                'activityCount',
                'memberOrganizations',
            ]);
            o3 = sequelizeTestUtils_1.default.objectWithoutKey(o3, [
                'memberCount',
                'joinedAt',
                'activityCount',
                'memberOrganizations',
            ]);
            // remove tasks->member and tasks->activity tasks->assignees relations as well (we should be only checking 1-deep relations)
            task1 = sequelizeTestUtils_1.default.objectWithoutKey(task1, ['members', 'activities', 'assignees']);
            task2 = sequelizeTestUtils_1.default.objectWithoutKey(task2, ['members', 'activities', 'assignees']);
            task3 = sequelizeTestUtils_1.default.objectWithoutKey(task3, ['members', 'activities', 'assignees']);
            // remove notes->member relations as well (we should be only checking 1-deep relations)
            note1 = sequelizeTestUtils_1.default.objectWithoutKey(note1, ['members', 'createdBy']);
            note2 = sequelizeTestUtils_1.default.objectWithoutKey(note2, ['members', 'createdBy']);
            note3 = sequelizeTestUtils_1.default.objectWithoutKey(note3, ['members', 'createdBy']);
            mergedMember.updatedAt = mergedMember.updatedAt.toISOString().split('T')[0];
            const expectedMember = {
                id: returnedMember1.id,
                username: {
                    [types_1.PlatformType.GITHUB]: ['anil'],
                    [types_1.PlatformType.DISCORD]: ['anil'],
                },
                lastEnriched: null,
                enrichedBy: [],
                contributions: null,
                displayName: 'Anil',
                identities: [types_1.PlatformType.GITHUB, types_1.PlatformType.DISCORD],
                attributes: Object.assign(Object.assign({}, member1.attributes), member2.attributes),
                activeOn: [activityCreated.platform],
                activityTypes: [`${activityCreated.platform}:${activityCreated.type}`],
                emails: ['anil+1@gitmesh.dev', 'anil+2@gitmesh.dev', 'anil+3@gitmesh.dev'],
                score: -1,
                importHash: null,
                createdAt: returnedMember1.createdAt,
                updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(),
                deletedAt: null,
                tenantId: mockIRepositoryOptions.currentTenant.id,
                segments: mockIRepositoryOptions.currentSegments,
                createdById: mockIRepositoryOptions.currentUser.id,
                updatedById: mockIRepositoryOptions.currentUser.id,
                joinedAt: new Date(member1.joinedAt),
                reach: { total: -1 },
                tags: [t1, t2, t3],
                tasks: [task1, task2, task3],
                notes: [note1, note2, note3],
                organizations: [
                    sequelizeTestUtils_1.default.objectWithoutKey(o1, [
                        'activeOn',
                        'identities',
                        'lastActive',
                        'segments',
                        'weakIdentities',
                    ]),
                    sequelizeTestUtils_1.default.objectWithoutKey(o2, [
                        'activeOn',
                        'identities',
                        'lastActive',
                        'segments',
                        'weakIdentities',
                    ]),
                    sequelizeTestUtils_1.default.objectWithoutKey(o3, [
                        'activeOn',
                        'identities',
                        'lastActive',
                        'segments',
                        'weakIdentities',
                    ]),
                ],
                noMerge: [returnedMember3.id],
                toMerge: [returnedMember4.id],
                activityCount: 1,
                activeDaysCount: 1,
                averageSentiment: activityCreated.sentiment.sentiment,
                lastActive: activityCreated.timestamp,
                lastActivity: activityCreated,
                numberOfOpenSourceContributions: 0,
                affiliations: [],
                manuallyCreated: false,
            };
            expect(mergedMember.tasks.sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            })).toEqual(expectedMember.tasks.sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            }));
            expect(mergedMember.organizations.sort((a, b) => {
                const nameA = a.displayName.toLowerCase();
                const nameB = b.displayName.toLowerCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            })).toEqual(expectedMember.organizations.sort((a, b) => {
                const nameA = a.displayName.toLowerCase();
                const nameB = b.displayName.toLowerCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            }));
            delete mergedMember.tasks;
            delete expectedMember.tasks;
            delete mergedMember.organizations;
            delete expectedMember.organizations;
            expect(mergedMember).toStrictEqual(expectedMember);
        });
        it('Should catch when two members are the same', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            const memberService = new memberService_1.default(mockIRepositoryOptions);
            const member1 = {
                username: {
                    [types_1.PlatformType.GITHUB]: 'anil',
                },
                displayName: 'Anil',
                joinedAt: '2021-05-27T15:14:30Z',
                attributes: {},
            };
            const memberCreated = await memberRepository_1.default.create(member1, mockIRepositoryOptions);
            const mergeOutput = await memberService.merge(memberCreated.id, memberCreated.id);
            expect(mergeOutput).toStrictEqual({ status: 203, mergedId: memberCreated.id });
            const found = await memberService.findById(memberCreated.id);
            expect(found).toStrictEqual(memberCreated);
        });
    });
    describe('addToNoMerge method', () => {
        it('Should add two members to their respective noMerges, these members should be excluded from toMerges respectively', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            await mas.createPredefined(integrations_1.TWITTER_MEMBER_ATTRIBUTES);
            await mas.createPredefined(integrations_1.DISCORD_MEMBER_ATTRIBUTES);
            const memberService = new memberService_1.default(mockIRepositoryOptions);
            const member1 = {
                username: {
                    [types_1.PlatformType.GITHUB]: 'anil',
                },
                displayName: 'Anil',
                joinedAt: '2021-05-27T15:14:30Z',
                attributes: {},
            };
            const member2 = {
                username: {
                    [types_1.PlatformType.DISCORD]: 'anil',
                },
                displayName: 'Anil',
                joinedAt: '2021-05-30T15:14:30Z',
                attributes: {
                    [types_1.MemberAttributeName.SOURCE_ID]: {
                        [types_1.PlatformType.DISCORD]: '#discordId',
                        default: '#discordId',
                    },
                },
            };
            const member3 = {
                username: {
                    [types_1.PlatformType.TWITTER]: 'anil',
                },
                displayName: 'Anil',
                joinedAt: '2021-05-30T15:14:30Z',
                attributes: {
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.TWITTER]: 'https://a-twitter-url',
                        default: 'https://a-twitter-url',
                    },
                },
            };
            let returnedMember1 = await memberRepository_1.default.create(member1, mockIRepositoryOptions);
            let returnedMember2 = await memberRepository_1.default.create(member2, mockIRepositoryOptions);
            let returnedMember3 = await memberRepository_1.default.create(member3, mockIRepositoryOptions);
            // toMerge[1] = [(1,2),(1,3)] toMerge[2] = [(2,1),(2,3)] toMerge[3] = [(3,1),(3,2)]
            await memberRepository_1.default.addToMerge([{ members: [returnedMember1.id, returnedMember2.id], similarity: null }], mockIRepositoryOptions);
            await memberRepository_1.default.addToMerge([{ members: [returnedMember2.id, returnedMember1.id], similarity: null }], mockIRepositoryOptions);
            await memberRepository_1.default.addToMerge([{ members: [returnedMember1.id, returnedMember3.id], similarity: null }], mockIRepositoryOptions);
            await memberRepository_1.default.addToMerge([{ members: [returnedMember3.id, returnedMember1.id], similarity: null }], mockIRepositoryOptions);
            await memberRepository_1.default.addToMerge([{ members: [returnedMember2.id, returnedMember3.id], similarity: null }], mockIRepositoryOptions);
            await memberRepository_1.default.addToMerge([{ members: [returnedMember3.id, returnedMember2.id], similarity: null }], mockIRepositoryOptions);
            await memberService.addToNoMerge(returnedMember1.id, returnedMember2.id);
            returnedMember1 = await memberRepository_1.default.findById(returnedMember1.id, mockIRepositoryOptions);
            expect(returnedMember1.toMerge).toStrictEqual([returnedMember3.id]);
            expect(returnedMember1.noMerge).toStrictEqual([returnedMember2.id]);
            returnedMember2 = await memberRepository_1.default.findById(returnedMember2.id, mockIRepositoryOptions);
            expect(returnedMember2.toMerge).toStrictEqual([returnedMember3.id]);
            expect(returnedMember2.noMerge).toStrictEqual([returnedMember1.id]);
            // call addToNoMerge once more, between member1 and member3
            await memberService.addToNoMerge(returnedMember1.id, returnedMember3.id);
            returnedMember1 = await memberRepository_1.default.findById(returnedMember1.id, mockIRepositoryOptions);
            expect(returnedMember1.toMerge).toStrictEqual([]);
            expect(returnedMember1.noMerge).toStrictEqual([returnedMember2.id, returnedMember3.id]);
            returnedMember3 = await memberRepository_1.default.findById(returnedMember3.id, mockIRepositoryOptions);
            expect(returnedMember3.toMerge).toStrictEqual([returnedMember2.id]);
            expect(returnedMember3.noMerge).toStrictEqual([returnedMember1.id]);
            // only toMerge relation (2,3) left. Testing addToNoMerge(2,3)
            await memberService.addToNoMerge(returnedMember3.id, returnedMember2.id);
            returnedMember2 = await memberRepository_1.default.findById(returnedMember2.id, mockIRepositoryOptions);
            expect(returnedMember2.toMerge).toStrictEqual([]);
            expect(returnedMember2.noMerge).toStrictEqual([returnedMember1.id, returnedMember3.id]);
            returnedMember3 = await memberRepository_1.default.findById(returnedMember3.id, mockIRepositoryOptions);
            expect(returnedMember3.toMerge).toStrictEqual([]);
            expect(returnedMember3.noMerge).toStrictEqual([returnedMember1.id, returnedMember2.id]);
        });
        it('Should throw 404 not found when trying to add non existent members to noMerge', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            const memberService = new memberService_1.default(mockIRepositoryOptions);
            const member1 = {
                username: {
                    [types_1.PlatformType.GITHUB]: 'anil',
                },
                displayName: 'Anil',
                joinedAt: '2021-05-27T15:14:30Z',
                attributes: {},
            };
            const returnedMember1 = await memberRepository_1.default.create(member1, mockIRepositoryOptions);
            const { randomUUID } = require('crypto');
            await expect(() => memberService.addToNoMerge(returnedMember1.id, randomUUID())).rejects.toThrowError(new common_1.Error404());
        });
    });
    describe('memberExists method', () => {
        it('Should find existing member with string username and default platform', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            const memberService = new memberService_1.default(mockIRepositoryOptions);
            const member1 = {
                username: {
                    [types_1.PlatformType.GITHUB]: 'anil',
                },
                displayName: 'Anil',
                joinedAt: '2021-05-27T15:14:30Z',
                attributes: {},
            };
            const cloned = lodash_1.default.cloneDeep(member1);
            const returnedMember1 = await memberRepository_1.default.create(cloned, mockIRepositoryOptions);
            delete returnedMember1.toMerge;
            delete returnedMember1.noMerge;
            delete returnedMember1.tags;
            delete returnedMember1.activities;
            delete returnedMember1.tasks;
            delete returnedMember1.notes;
            delete returnedMember1.activityCount;
            delete returnedMember1.averageSentiment;
            delete returnedMember1.lastActive;
            delete returnedMember1.lastActivity;
            delete returnedMember1.activeOn;
            delete returnedMember1.identities;
            delete returnedMember1.activityTypes;
            delete returnedMember1.activeDaysCount;
            delete returnedMember1.numberOfOpenSourceContributions;
            delete returnedMember1.affiliations;
            delete returnedMember1.manuallyCreated;
            returnedMember1.segments = returnedMember1.segments.map((s) => s.id);
            const existing = await memberService.memberExists(member1.username[types_1.PlatformType.GITHUB], types_1.PlatformType.GITHUB);
            expect(existing).toStrictEqual(returnedMember1);
        });
        it('Should return null if member is not found - string type', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            const memberService = new memberService_1.default(mockIRepositoryOptions);
            const member1 = {
                username: {
                    [types_1.PlatformType.GITHUB]: 'anil',
                },
                displayName: 'Anil',
                joinedAt: '2021-05-27T15:14:30Z',
                attributes: {},
            };
            await memberRepository_1.default.create(member1, mockIRepositoryOptions);
            const existing = await memberService.memberExists('some-random-username', types_1.PlatformType.GITHUB);
            expect(existing).toBeNull();
        });
        it('Should return null if member is not found - object type', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            const memberService = new memberService_1.default(mockIRepositoryOptions);
            const member1 = {
                username: {
                    [types_1.PlatformType.GITHUB]: 'anil',
                },
                displayName: 'Anil',
                joinedAt: '2021-05-27T15:14:30Z',
                attributes: {},
            };
            await memberRepository_1.default.create(member1, mockIRepositoryOptions);
            const existing = await memberService.memberExists(Object.assign(Object.assign({}, member1.username), { [types_1.PlatformType.SLACK]: 'some-slack-username' }), types_1.PlatformType.SLACK);
            expect(existing).toBeNull();
        });
        it('Should find existing member with object username and given platform', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            const memberService = new memberService_1.default(mockIRepositoryOptions);
            const member1 = {
                username: {
                    [types_1.PlatformType.GITHUB]: 'anil',
                    [types_1.PlatformType.DISCORD]: 'some-other-username',
                },
                displayName: 'Anil',
                joinedAt: '2021-05-27T15:14:30Z',
                attributes: {},
            };
            const returnedMember1 = await memberRepository_1.default.create(member1, mockIRepositoryOptions);
            delete returnedMember1.toMerge;
            delete returnedMember1.noMerge;
            delete returnedMember1.tags;
            delete returnedMember1.activities;
            delete returnedMember1.tasks;
            delete returnedMember1.notes;
            delete returnedMember1.activityCount;
            delete returnedMember1.averageSentiment;
            delete returnedMember1.lastActive;
            delete returnedMember1.lastActivity;
            delete returnedMember1.activeOn;
            delete returnedMember1.identities;
            delete returnedMember1.activityTypes;
            delete returnedMember1.activeDaysCount;
            delete returnedMember1.numberOfOpenSourceContributions;
            delete returnedMember1.affiliations;
            delete returnedMember1.manuallyCreated;
            returnedMember1.segments = returnedMember1.segments.map((s) => s.id);
            const existing = await memberService.memberExists({ [types_1.PlatformType.DISCORD]: 'some-other-username' }, types_1.PlatformType.DISCORD);
            expect(returnedMember1).toStrictEqual(existing);
        });
        it('Should throw 400 error when username is type of object and username[platform] is not present ', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const mas = new memberAttributeSettingsService_1.default(mockIRepositoryOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            const memberService = new memberService_1.default(mockIRepositoryOptions);
            const member1 = {
                username: {
                    [types_1.PlatformType.GITHUB]: 'anil',
                    [types_1.PlatformType.DISCORD]: 'some-other-username',
                },
                displayName: 'Anil',
                joinedAt: '2021-05-27T15:14:30Z',
                attributes: {},
            };
            await memberRepository_1.default.create(member1, mockIRepositoryOptions);
            await expect(() => memberService.memberExists({ [types_1.PlatformType.DISCORD]: 'some-other-username' }, types_1.PlatformType.SLACK)).rejects.toThrowError(new common_1.Error400());
        });
    });
    describe('Update Reach method', () => {
        it('Should keep as total: -1 for an empty new reach and a default old reach', async () => {
            const oldReach = { total: -1 };
            const updatedReach = memberService_1.default.calculateReach({}, oldReach);
            expect(updatedReach).toStrictEqual({
                total: -1,
            });
        });
        it('Should keep as total: -1 for a default new reach and a default old reach', async () => {
            const oldReach = { total: -1 };
            const updatedReach = memberService_1.default.calculateReach({ total: -1 }, oldReach);
            expect(updatedReach).toStrictEqual({
                total: -1,
            });
        });
        it('Should update for a new reach and a default old reach', async () => {
            const oldReach = { total: -1 };
            const newReach = { [types_1.PlatformType.TWITTER]: 10 };
            const updatedReach = memberService_1.default.calculateReach(oldReach, newReach);
            expect(updatedReach).toStrictEqual({
                total: 10,
                [types_1.PlatformType.TWITTER]: 10,
            });
        });
        it('Should update for a new reach and old reach in the same platform', async () => {
            const oldReach = { [types_1.PlatformType.TWITTER]: 5, total: 5 };
            const newReach = { [types_1.PlatformType.TWITTER]: 10 };
            const updatedReach = memberService_1.default.calculateReach(oldReach, newReach);
            expect(updatedReach).toStrictEqual({
                total: 10,
                [types_1.PlatformType.TWITTER]: 10,
            });
        });
        it('Should update for a complex reach with different platforms', async () => {
            const oldReach = {
                [types_1.PlatformType.TWITTER]: 10,
                [types_1.PlatformType.GITHUB]: 20,
                [types_1.PlatformType.DISCORD]: 50,
                total: 10 + 20 + 50,
            };
            const newReach = {
                [types_1.PlatformType.TWITTER]: 20,
                [types_1.PlatformType.GITHUB]: 2,
                linkedin: 10,
                total: 20 + 2 + 10,
            };
            const updatedReach = memberService_1.default.calculateReach(oldReach, newReach);
            expect(updatedReach).toStrictEqual({
                total: 10 + 20 + 2 + 50,
                [types_1.PlatformType.TWITTER]: 20,
                [types_1.PlatformType.GITHUB]: 2,
                linkedin: 10,
                [types_1.PlatformType.DISCORD]: 50,
            });
        });
        it('Should work with reach 0', async () => {
            const oldReach = { total: -1 };
            const newReach = { [types_1.PlatformType.TWITTER]: 0 };
            const updatedReach = memberService_1.default.calculateReach(oldReach, newReach);
            expect(updatedReach).toStrictEqual({
                total: 0,
                [types_1.PlatformType.TWITTER]: 0,
            });
        });
    });
    describe('getHighestPriorityPlatformForAttributes method', () => {
        it('Should return the highest priority platform from a priority array, handling the exceptions', async () => {
            const priorityArray = [
                types_1.PlatformType.TWITTER,
                types_1.PlatformType.GITMESH,
                types_1.PlatformType.SLACK,
                types_1.PlatformType.DEVTO,
                types_1.PlatformType.DISCORD,
                types_1.PlatformType.GITHUB,
            ];
            let inputPlatforms = [types_1.PlatformType.GITHUB, types_1.PlatformType.DEVTO];
            let highestPriorityPlatform = memberService_1.default.getHighestPriorityPlatformForAttributes(inputPlatforms, priorityArray);
            expect(highestPriorityPlatform).toBe(types_1.PlatformType.DEVTO);
            inputPlatforms = [types_1.PlatformType.GITHUB, 'someOtherPlatform'];
            highestPriorityPlatform = memberService_1.default.getHighestPriorityPlatformForAttributes(inputPlatforms, priorityArray);
            expect(highestPriorityPlatform).toBe(types_1.PlatformType.GITHUB);
            inputPlatforms = ['somePlatform1', 'somePlatform2'];
            // if no match in the priority array, it should return the first platform it finds
            highestPriorityPlatform = memberService_1.default.getHighestPriorityPlatformForAttributes(inputPlatforms, priorityArray);
            expect(highestPriorityPlatform).toBe('somePlatform1');
            inputPlatforms = [];
            // if no platforms are sent to choose from, it should return undefined
            highestPriorityPlatform = memberService_1.default.getHighestPriorityPlatformForAttributes(inputPlatforms, priorityArray);
            expect(highestPriorityPlatform).not.toBeDefined();
        });
    });
    describe('validateAttributes method', () => {
        it('Should validate attributes object succesfully', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const memberService = new memberService_1.default(mockIServiceOptions);
            const memberAttributeSettingsService = new memberAttributeSettingsService_1.default(mockIServiceOptions);
            await memberAttributeSettingsService.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            await memberAttributeSettingsService.createPredefined(integrations_1.TWITTER_MEMBER_ATTRIBUTES);
            await memberAttributeSettingsService.createPredefined(integrations_1.DEVTO_MEMBER_ATTRIBUTES);
            const attributes = {
                [types_1.MemberAttributeName.NAME]: {
                    [types_1.PlatformType.DEVTO]: 'Dweet Srute',
                },
                [types_1.MemberAttributeName.URL]: {
                    [types_1.PlatformType.GITHUB]: 'https://some-github-url',
                    [types_1.PlatformType.TWITTER]: 'https://some-twitter-url',
                    [types_1.PlatformType.DEVTO]: 'https://some-devto-url',
                },
                [types_1.MemberAttributeName.LOCATION]: {
                    [types_1.PlatformType.GITHUB]: 'Berlin',
                    [types_1.PlatformType.DEVTO]: 'Istanbul',
                },
                [types_1.MemberAttributeName.BIO]: {
                    [types_1.PlatformType.GITHUB]: 'Assistant to the Regional Manager',
                    [types_1.PlatformType.DEVTO]: 'Assistant Regional Manager',
                },
                [types_1.MemberAttributeName.AVATAR_URL]: {
                    [types_1.PlatformType.TWITTER]: 'https://some-image-url',
                },
            };
            const validateAttributes = await memberService.validateAttributes(attributes);
            expect(validateAttributes).toEqual(attributes);
        });
        it(`Should accept custom attributes without 'custom' platform key`, async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const memberService = new memberService_1.default(mockIServiceOptions);
            const memberAttributeSettingsService = new memberAttributeSettingsService_1.default(mockIServiceOptions);
            await memberAttributeSettingsService.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            const attributes = {
                [types_1.MemberAttributeName.BIO]: 'Assistant to the Regional Manager',
            };
            const validateAttributes = await memberService.validateAttributes(attributes);
            const expectedValidatedAttributes = {
                [types_1.MemberAttributeName.BIO]: {
                    custom: 'Assistant to the Regional Manager',
                },
            };
            expect(validateAttributes).toEqual(expectedValidatedAttributes);
        });
        it(`Should accept custom attributes both without and with 'custom' platform key`, async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const memberService = new memberService_1.default(mockIServiceOptions);
            const memberAttributeSettingsService = new memberAttributeSettingsService_1.default(mockIServiceOptions);
            await memberAttributeSettingsService.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            await memberAttributeSettingsService.createPredefined(integrations_1.TWITTER_MEMBER_ATTRIBUTES);
            await memberAttributeSettingsService.createPredefined(integrations_1.DEVTO_MEMBER_ATTRIBUTES);
            const attributes = {
                [types_1.MemberAttributeName.NAME]: 'Dwight Schrute',
                [types_1.MemberAttributeName.URL]: 'https://some-url',
                [types_1.MemberAttributeName.LOCATION]: {
                    [types_1.PlatformType.GITHUB]: 'Berlin',
                    [types_1.PlatformType.DEVTO]: 'Istanbul',
                    custom: 'a custom location',
                },
                [types_1.MemberAttributeName.BIO]: {
                    [types_1.PlatformType.GITHUB]: 'Assistant to the Regional Manager',
                    [types_1.PlatformType.DEVTO]: 'Assistant Regional Manager',
                    custom: 'a custom bio',
                },
                [types_1.MemberAttributeName.AVATAR_URL]: {
                    [types_1.PlatformType.TWITTER]: 'https://some-image-url',
                    custom: 'a custom image url',
                },
            };
            const validateAttributes = await memberService.validateAttributes(attributes);
            const expectedValidatedAttributes = {
                [types_1.MemberAttributeName.NAME]: {
                    custom: 'Dwight Schrute',
                },
                [types_1.MemberAttributeName.URL]: {
                    custom: 'https://some-url',
                },
                [types_1.MemberAttributeName.LOCATION]: {
                    [types_1.PlatformType.GITHUB]: 'Berlin',
                    [types_1.PlatformType.DEVTO]: 'Istanbul',
                    custom: 'a custom location',
                },
                [types_1.MemberAttributeName.BIO]: {
                    [types_1.PlatformType.GITHUB]: 'Assistant to the Regional Manager',
                    [types_1.PlatformType.DEVTO]: 'Assistant Regional Manager',
                    custom: 'a custom bio',
                },
                [types_1.MemberAttributeName.AVATAR_URL]: {
                    [types_1.PlatformType.TWITTER]: 'https://some-image-url',
                    custom: 'a custom image url',
                },
            };
            expect(validateAttributes).toEqual(expectedValidatedAttributes);
        });
        it('Should throw a 400 Error when an attribute does not exist in member attribute settings', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const memberService = new memberService_1.default(mockIServiceOptions);
            const memberAttributeSettingsService = new memberAttributeSettingsService_1.default(mockIServiceOptions);
            await memberAttributeSettingsService.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            await memberAttributeSettingsService.createPredefined(integrations_1.TWITTER_MEMBER_ATTRIBUTES);
            // in settings name has a string type, inserting an integer should throw an error
            const attributes = {
                [types_1.MemberAttributeName.URL]: {
                    [types_1.PlatformType.GITHUB]: 'https://some-github-url',
                },
                [types_1.MemberAttributeName.AVATAR_URL]: {
                    [types_1.PlatformType.TWITTER]: 'https://some-image-url',
                },
                'non-existing-attribute': {
                    [types_1.PlatformType.TWITTER]: 'some value',
                },
            };
            const validateAttributes = await memberService.validateAttributes(attributes);
            // member attribute that is non existing in settings, should be omitted after validate
            const expectedValidatedAttributes = {
                [types_1.MemberAttributeName.URL]: {
                    [types_1.PlatformType.GITHUB]: 'https://some-github-url',
                },
                [types_1.MemberAttributeName.AVATAR_URL]: {
                    [types_1.PlatformType.TWITTER]: 'https://some-image-url',
                },
            };
            expect(validateAttributes).toEqual(expectedValidatedAttributes);
        });
        it('Should throw a 400 Error when the type of an attribute does not match the type in member attribute settings', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const memberService = new memberService_1.default(mockIServiceOptions);
            const memberAttributeSettingsService = new memberAttributeSettingsService_1.default(mockIServiceOptions);
            await memberAttributeSettingsService.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            await memberAttributeSettingsService.createPredefined(integrations_1.TWITTER_MEMBER_ATTRIBUTES);
            // in settings website_url has a url type, inserting an integer should throw an error
            const attributes = {
                [types_1.MemberAttributeName.WEBSITE_URL]: {
                    [types_1.PlatformType.GITHUB]: 55,
                },
                [types_1.MemberAttributeName.URL]: {
                    [types_1.PlatformType.GITHUB]: 'https://some-github-url',
                    [types_1.PlatformType.TWITTER]: 'https://some-twitter-url',
                },
                [types_1.MemberAttributeName.AVATAR_URL]: {
                    [types_1.PlatformType.TWITTER]: 'https://some-image-url',
                },
            };
            await expect(() => memberService.validateAttributes(attributes)).rejects.toThrowError(new common_1.Error400('en', 'settings.memberAttributes.wrongType'));
        });
    });
    describe('setAttributesDefaultValues method', () => {
        it('Should return the structured attributes object with default values succesfully', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const memberService = new memberService_1.default(mockIServiceOptions);
            const memberAttributeSettingsService = new memberAttributeSettingsService_1.default(mockIServiceOptions);
            await memberAttributeSettingsService.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            await memberAttributeSettingsService.createPredefined(integrations_1.TWITTER_MEMBER_ATTRIBUTES);
            await memberAttributeSettingsService.createPredefined(integrations_1.DEVTO_MEMBER_ATTRIBUTES);
            const attributes = {
                [types_1.MemberAttributeName.NAME]: {
                    [types_1.PlatformType.DEVTO]: 'Dweet Srute',
                },
                [types_1.MemberAttributeName.URL]: {
                    [types_1.PlatformType.GITHUB]: 'https://some-github-url',
                    [types_1.PlatformType.TWITTER]: 'https://some-twitter-url',
                    [types_1.PlatformType.DEVTO]: 'https://some-devto-url',
                },
                [types_1.MemberAttributeName.LOCATION]: {
                    [types_1.PlatformType.GITHUB]: 'Berlin',
                    [types_1.PlatformType.DEVTO]: 'Istanbul',
                },
                [types_1.MemberAttributeName.BIO]: {
                    [types_1.PlatformType.GITHUB]: 'Assistant to the Regional Manager',
                    [types_1.PlatformType.DEVTO]: 'Assistant Regional Manager',
                },
                [types_1.MemberAttributeName.AVATAR_URL]: {
                    [types_1.PlatformType.TWITTER]: 'https://some-image-url',
                },
            };
            const attributesWithDefaultValues = await memberService.setAttributesDefaultValues(attributes);
            // Default platform priority is: custom, twitter, github, devto, slack, discord, gitmesh
            const expectedAttributesWithDefaultValues = {
                [types_1.MemberAttributeName.URL]: {
                    [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.URL][types_1.PlatformType.GITHUB],
                    [types_1.PlatformType.TWITTER]: attributes[types_1.MemberAttributeName.URL][types_1.PlatformType.TWITTER],
                    [types_1.PlatformType.DEVTO]: attributes[types_1.MemberAttributeName.URL][types_1.PlatformType.DEVTO],
                    default: attributes[types_1.MemberAttributeName.URL][types_1.PlatformType.TWITTER],
                },
                [types_1.MemberAttributeName.NAME]: {
                    [types_1.PlatformType.DEVTO]: attributes[types_1.MemberAttributeName.NAME][types_1.PlatformType.DEVTO],
                    default: attributes[types_1.MemberAttributeName.NAME][types_1.PlatformType.DEVTO],
                },
                [types_1.MemberAttributeName.AVATAR_URL]: {
                    [types_1.PlatformType.TWITTER]: attributes[types_1.MemberAttributeName.AVATAR_URL][types_1.PlatformType.TWITTER],
                    default: attributes[types_1.MemberAttributeName.AVATAR_URL][types_1.PlatformType.TWITTER],
                },
                [types_1.MemberAttributeName.BIO]: {
                    [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.BIO][types_1.PlatformType.GITHUB],
                    [types_1.PlatformType.DEVTO]: attributes[types_1.MemberAttributeName.BIO][types_1.PlatformType.DEVTO],
                    default: attributes[types_1.MemberAttributeName.BIO][types_1.PlatformType.GITHUB],
                },
                [types_1.MemberAttributeName.LOCATION]: {
                    [types_1.PlatformType.GITHUB]: attributes[types_1.MemberAttributeName.LOCATION][types_1.PlatformType.GITHUB],
                    [types_1.PlatformType.DEVTO]: attributes[types_1.MemberAttributeName.LOCATION][types_1.PlatformType.DEVTO],
                    default: attributes[types_1.MemberAttributeName.LOCATION][types_1.PlatformType.GITHUB],
                },
            };
            expect(attributesWithDefaultValues).toEqual(expectedAttributesWithDefaultValues);
        });
        it('Should throw a 400 Error when priority array does not exist', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const memberService = new memberService_1.default(mockIServiceOptions);
            const memberAttributeSettingsService = new memberAttributeSettingsService_1.default(mockIServiceOptions);
            await memberAttributeSettingsService.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            await memberAttributeSettingsService.createPredefined(integrations_1.TWITTER_MEMBER_ATTRIBUTES);
            await memberAttributeSettingsService.createPredefined(integrations_1.DEVTO_MEMBER_ATTRIBUTES);
            // Empty default priority array
            const settings = await settingsRepository_1.default.findOrCreateDefault({}, mockIServiceOptions);
            await settingsRepository_1.default.save(Object.assign(Object.assign({}, settings), { attributeSettings: { priorities: [] } }), mockIServiceOptions);
            const attributes = {
                [types_1.MemberAttributeName.NAME]: {
                    [types_1.PlatformType.DEVTO]: 'Dweet Srute',
                },
                [types_1.MemberAttributeName.URL]: {
                    [types_1.PlatformType.GITHUB]: 'https://some-github-url',
                    [types_1.PlatformType.TWITTER]: 'https://some-twitter-url',
                    [types_1.PlatformType.DEVTO]: 'https://some-devto-url',
                },
                [types_1.MemberAttributeName.LOCATION]: {
                    [types_1.PlatformType.GITHUB]: 'Berlin',
                    [types_1.PlatformType.DEVTO]: 'Istanbul',
                },
                [types_1.MemberAttributeName.BIO]: {
                    [types_1.PlatformType.GITHUB]: 'Assistant to the Regional Manager',
                    [types_1.PlatformType.DEVTO]: 'Assistant Regional Manager',
                },
                [types_1.MemberAttributeName.AVATAR_URL]: {
                    [types_1.PlatformType.TWITTER]: 'https://some-image-url',
                },
            };
            await expect(() => memberService.setAttributesDefaultValues(attributes)).rejects.toThrowError(new common_1.Error400('en', 'settings.memberAttributes.priorityArrayNotFound'));
        });
    });
    describe('findAndCountAll method', () => {
        it('Should filter and sort by dynamic attributes using advanced filters successfully', async () => {
            const mockIServiceOptions = await sequelizeTestUtils_1.default.getTestIServiceOptions(db);
            const ms = new memberService_1.default(mockIServiceOptions);
            const mas = new memberAttributeSettingsService_1.default(mockIServiceOptions);
            await mas.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
            await mas.createPredefined(integrations_1.TWITTER_MEMBER_ATTRIBUTES);
            await mas.createPredefined(integrations_1.DISCORD_MEMBER_ATTRIBUTES);
            const attribute1 = {
                name: 'aNumberAttribute',
                label: 'A number Attribute',
                type: types_1.MemberAttributeType.NUMBER,
                canDelete: true,
                show: true,
            };
            const attribute2 = {
                name: 'aDateAttribute',
                label: 'A date Attribute',
                type: types_1.MemberAttributeType.DATE,
                canDelete: true,
                show: true,
            };
            const attribute3 = {
                name: 'aMultiSelectAttribute',
                label: 'A multi select Attribute',
                options: ['a', 'b', 'c'],
                type: types_1.MemberAttributeType.MULTI_SELECT,
                canDelete: true,
                show: true,
            };
            await mas.create(attribute1);
            await mas.create(attribute2);
            await mas.create(attribute3);
            const member1 = {
                username: {
                    [types_1.PlatformType.GITHUB]: 'anil',
                    [types_1.PlatformType.DISCORD]: 'anil',
                    [types_1.PlatformType.TWITTER]: 'anil',
                },
                platform: types_1.PlatformType.GITHUB,
                emails: ['lala@l.com'],
                score: 10,
                attributes: {
                    aDateAttribute: {
                        custom: '2022-08-01T00:00:00',
                    },
                    aMultiSelectAttribute: {
                        custom: ['a', 'b'],
                        github: ['a'],
                    },
                    [types_1.MemberAttributeName.IS_HIREABLE]: {
                        [types_1.PlatformType.GITHUB]: false,
                        [types_1.PlatformType.DISCORD]: true,
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://github.com/anil',
                        [types_1.PlatformType.TWITTER]: 'https://twitter.com/anil',
                    },
                    [types_1.MemberAttributeName.WEBSITE_URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://imcvampire.js.org/',
                    },
                    [types_1.MemberAttributeName.BIO]: {
                        [types_1.PlatformType.GITHUB]: 'Lazy geek',
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: 'Helsinki, Finland',
                    },
                    [types_1.MemberAttributeName.SOURCE_ID]: {
                        [types_1.PlatformType.TWITTER]: '#twitterId2',
                        [types_1.PlatformType.DISCORD]: '#discordId1',
                    },
                    [types_1.MemberAttributeName.AVATAR_URL]: {
                        [types_1.PlatformType.TWITTER]: 'https://twitter.com/anil/image',
                    },
                    aNumberAttribute: {
                        [types_1.PlatformType.GITHUB]: 1,
                        [types_1.PlatformType.TWITTER]: 2,
                        [types_1.PlatformType.DISCORD]: 300000,
                    },
                },
                contributions: [
                    {
                        id: 112529473,
                        url: 'https://github.com/bighead/silicon-valley',
                        topics: ['TV Shows', 'Comedy', 'Startups'],
                        summary: 'Silicon Valley: 50 commits in 2 weeks',
                        numberCommits: 50,
                        lastCommitDate: '02/01/2023',
                        firstCommitDate: '01/17/2023',
                    },
                    {
                        id: 112529474,
                        url: 'https://github.com/bighead/startup-ideas',
                        topics: ['Ideas', 'Startups'],
                        summary: 'Startup Ideas: 20 commits in 1 week',
                        numberCommits: 20,
                        lastCommitDate: '03/01/2023',
                        firstCommitDate: '02/22/2023',
                    },
                ],
                joinedAt: '2022-05-28T15:13:30',
            };
            const member2 = {
                username: {
                    [types_1.PlatformType.GITHUB]: 'michaelScott',
                    [types_1.PlatformType.DISCORD]: 'michaelScott',
                    [types_1.PlatformType.TWITTER]: 'michaelScott',
                },
                platform: types_1.PlatformType.GITHUB,
                emails: ['michael@mifflin.com'],
                score: 10,
                attributes: {
                    aDateAttribute: {
                        custom: '2022-08-06T00:00:00',
                    },
                    aMultiSelectAttribute: {
                        custom: ['b', 'c'],
                        github: ['b'],
                    },
                    [types_1.MemberAttributeName.IS_HIREABLE]: {
                        [types_1.PlatformType.GITHUB]: true,
                        [types_1.PlatformType.DISCORD]: true,
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://github.com/michael-scott',
                        [types_1.PlatformType.TWITTER]: 'https://twitter.com/michael',
                    },
                    [types_1.MemberAttributeName.WEBSITE_URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://website/michael',
                    },
                    [types_1.MemberAttributeName.BIO]: {
                        [types_1.PlatformType.GITHUB]: 'Dunder & Mifflin Regional Manager',
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: 'Berlin',
                    },
                    [types_1.MemberAttributeName.SOURCE_ID]: {
                        [types_1.PlatformType.TWITTER]: '#twitterId2',
                        [types_1.PlatformType.DISCORD]: '#discordId2',
                    },
                    [types_1.MemberAttributeName.AVATAR_URL]: {
                        [types_1.PlatformType.TWITTER]: 'https://twitter.com/michael/image',
                    },
                    aNumberAttribute: {
                        [types_1.PlatformType.GITHUB]: 1500,
                        [types_1.PlatformType.TWITTER]: 2500,
                        [types_1.PlatformType.DISCORD]: 2,
                    },
                },
                contributions: [
                    {
                        id: 112529472,
                        url: 'https://github.com/bachman/pied-piper',
                        topics: ['compression', 'data', 'middle-out', 'Java'],
                        summary: 'Pied Piper: 10 commits in 1 day',
                        numberCommits: 10,
                        lastCommitDate: '2023-03-10',
                        firstCommitDate: '2023-03-01',
                    },
                    {
                        id: 112529473,
                        url: 'https://github.com/bachman/aviato',
                        topics: ['Python', 'Django'],
                        summary: 'Aviato: 5 commits in 1 day',
                        numberCommits: 5,
                        lastCommitDate: '2023-02-25',
                        firstCommitDate: '2023-02-20',
                    },
                    {
                        id: 112529476,
                        url: 'https://github.com/bachman/erlichbot',
                        topics: ['Python', 'Slack API'],
                        summary: 'ErlichBot: 2 commits in 1 day',
                        numberCommits: 2,
                        lastCommitDate: '2023-01-25',
                        firstCommitDate: '2023-01-24',
                    },
                ],
                joinedAt: '2022-09-15T15:13:30',
            };
            const member3 = {
                username: {
                    [types_1.PlatformType.GITHUB]: 'jimHalpert',
                    [types_1.PlatformType.DISCORD]: 'jimHalpert',
                    [types_1.PlatformType.TWITTER]: 'jimHalpert',
                },
                platform: types_1.PlatformType.GITHUB,
                emails: ['jim@mifflin.com'],
                score: 10,
                attributes: {
                    aDateAttribute: {
                        custom: '2022-08-15T00:00:00',
                    },
                    aMultiSelectAttribute: {
                        custom: ['a', 'c'],
                        github: ['c'],
                    },
                    [types_1.MemberAttributeName.IS_HIREABLE]: {
                        [types_1.PlatformType.GITHUB]: false,
                        [types_1.PlatformType.DISCORD]: true,
                    },
                    [types_1.MemberAttributeName.URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://github.com/jim-halpert',
                        [types_1.PlatformType.TWITTER]: 'https://twitter.com/jim',
                    },
                    [types_1.MemberAttributeName.WEBSITE_URL]: {
                        [types_1.PlatformType.GITHUB]: 'https://website/jim',
                    },
                    [types_1.MemberAttributeName.BIO]: {
                        [types_1.PlatformType.GITHUB]: 'Sales guy',
                    },
                    [types_1.MemberAttributeName.LOCATION]: {
                        [types_1.PlatformType.GITHUB]: 'Scranton',
                    },
                    [types_1.MemberAttributeName.SOURCE_ID]: {
                        [types_1.PlatformType.TWITTER]: '#twitterId3',
                        [types_1.PlatformType.DISCORD]: '#discordId3',
                    },
                    [types_1.MemberAttributeName.AVATAR_URL]: {
                        [types_1.PlatformType.TWITTER]: 'https://twitter.com/jim/image',
                    },
                    aNumberAttribute: {
                        [types_1.PlatformType.GITHUB]: 15500,
                        [types_1.PlatformType.TWITTER]: 25500,
                        [types_1.PlatformType.DISCORD]: 200000,
                    },
                },
                joinedAt: '2022-09-16T15:13:30Z',
            };
            const member1Created = await ms.upsert(member1);
            const member2Created = await ms.upsert(member2);
            const member3Created = await ms.upsert(member3);
            await sequelizeTestUtils_1.default.refreshMaterializedViews(db);
            // filter and sort by aNumberAttribute default values
            let members = await ms.findAndCountAll({
                advancedFilter: {
                    aNumberAttribute: {
                        gte: 1000,
                    },
                },
                orderBy: 'aNumberAttribute_DESC',
            });
            expect(members.count).toBe(2);
            expect(members.rows.map((i) => i.id)).toStrictEqual([member3Created.id, member2Created.id]);
            // filter and sort by aNumberAttribute platform specific values
            members = await ms.findAndCountAll({
                advancedFilter: {
                    'attributes.aNumberAttribute.discord': {
                        gte: 100000,
                    },
                },
                orderBy: 'attributes.aNumberAttribute.discord_DESC',
            });
            expect(members.count).toBe(2);
            expect(members.rows.map((i) => i.id)).toStrictEqual([member1Created.id, member3Created.id]);
            // filter by isHireable default values
            members = await ms.findAndCountAll({
                advancedFilter: {
                    isHireable: true,
                },
            });
            expect(members.count).toBe(1);
            expect(members.rows.map((i) => i.id)).toStrictEqual([member2Created.id]);
            // filter by isHireable platform specific values
            members = await ms.findAndCountAll({
                advancedFilter: {
                    'attributes.isHireable.discord': true,
                },
            });
            expect(members.count).toBe(3);
            expect(members.rows.map((i) => i.id)).toStrictEqual([
                member3Created.id,
                member2Created.id,
                member1Created.id,
            ]);
            // filter and sort by url default values
            members = await ms.findAndCountAll({
                advancedFilter: {
                    url: {
                        textContains: 'jim',
                    },
                },
                orderBy: 'url_DESC',
            });
            expect(members.count).toBe(1);
            expect(members.rows.map((i) => i.id)).toStrictEqual([member3Created.id]);
            // filter and sort by url platform specific values
            members = await ms.findAndCountAll({
                advancedFilter: {
                    'attributes.url.github': {
                        textContains: 'github',
                    },
                },
                orderBy: 'attributes.url.github_ASC',
            });
            expect(members.count).toBe(3);
            // results will be sorted by github.url anil -> jim -> michael
            expect(members.rows.map((i) => i.id)).toStrictEqual([
                member1Created.id,
                member3Created.id,
                member2Created.id,
            ]);
            // filter and sort by custom aDateAttribute
            members = await ms.findAndCountAll({
                advancedFilter: {
                    aDateAttribute: {
                        lte: '2022-08-06T00:00:00',
                    },
                },
                orderBy: 'aDateAttribute_DESC',
            });
            expect(members.count).toBe(2);
            expect(members.rows.map((i) => i.id)).toStrictEqual([member2Created.id, member1Created.id]);
            // filter by custom aMultiSelectAttribute
            members = await ms.findAndCountAll({
                advancedFilter: {
                    aMultiSelectAttribute: {
                        overlap: ['a'],
                    },
                },
                orderBy: 'createdAt_DESC',
            });
            expect(members.count).toBe(2);
            expect(members.rows.map((i) => i.id)).toStrictEqual([member3Created.id, member1Created.id]);
            // filter by numberOfOpenSourceContributions
            members = await ms.findAndCountAll({
                filter: {
                    numberOfOpenSourceContributionsRange: [2, 6],
                },
            });
            expect(members.count).toBe(2);
            expect(members.rows.map((i) => i.id)).toEqual([member2Created.id, member1Created.id]);
            // filter by numberOfOpenSourceContributions only start
            members = await ms.findAndCountAll({
                filter: {
                    numberOfOpenSourceContributionsRange: [3],
                },
            });
            expect(members.count).toBe(1);
            expect(members.rows.map((i) => i.id)).toStrictEqual([member2Created.id]);
            // filter and sort by numberOfOpenSourceContributions
            members = await ms.findAndCountAll({
                filter: {
                    numberOfOpenSourceContributionsRange: [2, 6],
                },
                orderBy: 'numberOfOpenSourceContributions_ASC',
            });
            expect(members.count).toBe(2);
            expect(members.rows.map((i) => i.id)).toStrictEqual([member1Created.id, member2Created.id]);
            // sort by numberOfOpenSourceContributions
            members = await ms.findAndCountAll({
                orderBy: 'numberOfOpenSourceContributions_ASC',
            });
            expect(members.count).toBe(3);
            expect(members.rows.map((i) => i.id)).toStrictEqual([
                member3Created.id,
                member1Created.id,
                member2Created.id,
            ]);
        });
    });
});
//# sourceMappingURL=memberService.test.js.map