"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const common_1 = require("@gitmesh/common");
const types_1 = require("@gitmesh/types");
const organizationRepository_1 = __importDefault(require("../organizationRepository"));
const sequelizeTestUtils_1 = __importDefault(require("../../utils/sequelizeTestUtils"));
const memberRepository_1 = __importDefault(require("../memberRepository"));
const activityRepository_1 = __importDefault(require("../activityRepository"));
const db = null;
const toCreate = {
    identities: [
        {
            name: 'gitmesh.dev',
            platform: 'gitmesh',
            url: 'https://gitmesh.dev',
        },
    ],
    displayName: 'gitmesh.dev',
    description: 'Community-led Growth for Developer-first Companies.\nJoin our private beta',
    emails: ['hello@gitmesh.dev', 'jonathan@crow.dev'],
    phoneNumbers: ['+42 424242424'],
    logo: 'https://logo.clearbit.com/gitmesh.dev',
    tags: ['community', 'growth', 'developer-first'],
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
    profiles: null,
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
};
async function createMembers(options) {
    return await [
        (await memberRepository_1.default.create({
            username: {
                [types_1.PlatformType.GITHUB]: {
                    username: 'gilfoyle',
                    integrationId: (0, common_1.generateUUIDv1)(),
                },
            },
            displayName: 'Member 1',
            joinedAt: '2020-05-27T15:13:30Z',
        }, options)).id,
        (await memberRepository_1.default.create({
            username: {
                [types_1.PlatformType.GITHUB]: {
                    username: 'dinesh',
                    integrationId: (0, common_1.generateUUIDv1)(),
                },
            },
            displayName: 'Member 2',
            joinedAt: '2020-06-27T15:13:30Z',
        }, options)).id,
    ];
}
async function createActivitiesForMembers(memberIds, organizationId, options) {
    for (const memberId of memberIds) {
        await activityRepository_1.default.create({
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
                sentiment: 98,
            },
            isContribution: true,
            username: 'test',
            member: memberId,
            organizationId,
            score: 1,
            sourceId: '#sourceId:' + memberId,
        }, options);
    }
}
async function createOrganization(organization, options, members = []) {
    const memberIds = [];
    for (const member of members) {
        const memberCreated = await memberRepository_1.default.create(sequelizeTestUtils_1.default.objectWithoutKey(member, 'activities'), options);
        if (member.activities) {
            for (const activity of member.activities) {
                await activityRepository_1.default.create(Object.assign(Object.assign({}, activity), { member: memberCreated.id }), options);
            }
        }
        memberIds.push(memberCreated.id);
    }
    organization.members = memberIds;
    const organizationCreated = await organizationRepository_1.default.create(organization, options);
    return Object.assign(Object.assign({}, organizationCreated), { members: memberIds });
}
describe('OrganizationRepository tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll((done) => {
        // Closing the DB connection allows Jest to exit successfully.
        sequelizeTestUtils_1.default.closeConnection(db);
        done();
    });
    describe('create method', () => {
        it('Should create the given organization succesfully', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const organizationCreated = await organizationRepository_1.default.create(toCreate, mockIRepositoryOptions);
            organizationCreated.createdAt = organizationCreated.createdAt.toISOString().split('T')[0];
            organizationCreated.updatedAt = organizationCreated.updatedAt.toISOString().split('T')[0];
            delete organizationCreated.identities[0].createdAt;
            delete organizationCreated.identities[0].updatedAt;
            const primaryIdentity = toCreate.identities[0];
            const expectedOrganizationCreated = Object.assign(Object.assign({ id: organizationCreated.id }, toCreate), { github: null, location: null, website: null, memberCount: 0, activityCount: 0, activeOn: [], identities: [
                    {
                        integrationId: null,
                        name: primaryIdentity.name,
                        organizationId: organizationCreated.id,
                        platform: primaryIdentity.platform,
                        url: primaryIdentity.url,
                        sourceId: null,
                        tenantId: mockIRepositoryOptions.currentTenant.id,
                    },
                ], importHash: null, lastActive: null, joinedAt: null, createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(), updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(), deletedAt: null, tenantId: mockIRepositoryOptions.currentTenant.id, segments: mockIRepositoryOptions.currentSegments.map((s) => s.id), createdById: mockIRepositoryOptions.currentUser.id, updatedById: mockIRepositoryOptions.currentUser.id, isTeamOrganization: false, attributes: {}, weakIdentities: [] });
            expect(organizationCreated).toStrictEqual(expectedOrganizationCreated);
        });
        it('Should throw sequelize not null error -- name field is required', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const organization2add = {};
            await expect(() => organizationRepository_1.default.create(organization2add, mockIRepositoryOptions)).rejects.toThrow();
        });
        it('Should create an organization with members succesfully', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const memberIds = await createMembers(mockIRepositoryOptions);
            const toCreateWithMember = Object.assign(Object.assign({}, toCreate), { members: memberIds });
            let organizationCreated = await organizationRepository_1.default.create(toCreateWithMember, mockIRepositoryOptions);
            await createActivitiesForMembers(memberIds, organizationCreated.id, mockIRepositoryOptions);
            await mockIRepositoryOptions.database.sequelize.query('REFRESH MATERIALIZED VIEW mv_activities_cube');
            organizationCreated = await organizationRepository_1.default.findById(organizationCreated.id, mockIRepositoryOptions);
            organizationCreated.createdAt = organizationCreated.createdAt.toISOString().split('T')[0];
            organizationCreated.updatedAt = organizationCreated.updatedAt.toISOString().split('T')[0];
            organizationCreated.lastActive = organizationCreated.lastActive.toISOString().split('T')[0];
            organizationCreated.joinedAt = organizationCreated.joinedAt.toISOString().split('T')[0];
            delete organizationCreated.identities[0].createdAt;
            delete organizationCreated.identities[0].updatedAt;
            const primaryIdentity = toCreate.identities[0];
            const expectedOrganizationCreated = Object.assign(Object.assign({ id: organizationCreated.id }, toCreate), { memberCount: 2, identities: [
                    {
                        integrationId: null,
                        name: primaryIdentity.name,
                        organizationId: organizationCreated.id,
                        platform: primaryIdentity.platform,
                        url: primaryIdentity.url,
                        sourceId: null,
                        tenantId: mockIRepositoryOptions.currentTenant.id,
                    },
                ], activityCount: 2, github: null, location: null, website: null, lastActive: '2020-05-27', joinedAt: '2020-05-27', activeOn: ['github'], importHash: null, createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(), updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(), deletedAt: null, tenantId: mockIRepositoryOptions.currentTenant.id, segments: mockIRepositoryOptions.currentSegments.map((s) => s.id), createdById: mockIRepositoryOptions.currentUser.id, updatedById: mockIRepositoryOptions.currentUser.id, isTeamOrganization: false, attributes: {}, weakIdentities: [] });
            expect(organizationCreated).toStrictEqual(expectedOrganizationCreated);
            const member1 = await memberRepository_1.default.findById(memberIds[0], mockIRepositoryOptions);
            const member2 = await memberRepository_1.default.findById(memberIds[1], mockIRepositoryOptions);
            expect(member1.organizations.length).toEqual(1);
            expect(member2.organizations.length).toEqual(1);
        });
    });
    describe('findById method', () => {
        it('Should successfully find created organization by id', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const organizationCreated = await organizationRepository_1.default.create(toCreate, mockIRepositoryOptions);
            organizationCreated.createdAt = organizationCreated.createdAt.toISOString().split('T')[0];
            organizationCreated.updatedAt = organizationCreated.updatedAt.toISOString().split('T')[0];
            const primaryIdentity = toCreate.identities[0];
            const expectedOrganizationFound = Object.assign(Object.assign({ id: organizationCreated.id }, toCreate), { identities: [
                    {
                        integrationId: null,
                        name: primaryIdentity.name,
                        organizationId: organizationCreated.id,
                        platform: primaryIdentity.platform,
                        url: primaryIdentity.url,
                        sourceId: null,
                        tenantId: mockIRepositoryOptions.currentTenant.id,
                    },
                ], github: null, location: null, website: null, memberCount: 0, activityCount: 0, activeOn: [], lastActive: null, joinedAt: null, importHash: null, createdAt: sequelizeTestUtils_1.default.getNowWithoutTime(), updatedAt: sequelizeTestUtils_1.default.getNowWithoutTime(), deletedAt: null, tenantId: mockIRepositoryOptions.currentTenant.id, segments: mockIRepositoryOptions.currentSegments.map((s) => s.id), createdById: mockIRepositoryOptions.currentUser.id, updatedById: mockIRepositoryOptions.currentUser.id, isTeamOrganization: false, attributes: {}, weakIdentities: [] });
            const organizationById = await organizationRepository_1.default.findById(organizationCreated.id, mockIRepositoryOptions);
            organizationById.createdAt = organizationById.createdAt.toISOString().split('T')[0];
            organizationById.updatedAt = organizationById.updatedAt.toISOString().split('T')[0];
            delete organizationById.identities[0].createdAt;
            delete organizationById.identities[0].updatedAt;
            expect(organizationById).toStrictEqual(expectedOrganizationFound);
        });
        it('Should throw 404 error when no organization found with given id', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => organizationRepository_1.default.findById(randomUUID(), mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
    describe('filterIdsInTenant method', () => {
        it('Should return the given ids of previously created organization entities', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const organization1 = {
                identities: [{ name: 'test1', platform: 'gitmesh' }],
                displayName: 'test1',
            };
            const organization2 = {
                identities: [{ name: 'test2', platform: 'gitmesh' }],
                displayName: 'test2',
            };
            const organization1Created = await organizationRepository_1.default.create(organization1, mockIRepositoryOptions);
            const organization2Created = await organizationRepository_1.default.create(organization2, mockIRepositoryOptions);
            const filterIdsReturned = await organizationRepository_1.default.filterIdsInTenant([organization1Created.id, organization2Created.id], mockIRepositoryOptions);
            expect(filterIdsReturned).toStrictEqual([organization1Created.id, organization2Created.id]);
        });
        it('Should only return the ids of previously created organizations and filter random uuids out', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const organization = {
                identities: [{ name: 'test1', platform: 'gitmesh' }],
                displayName: 'test1',
            };
            const organizationCreated = await organizationRepository_1.default.create(organization, mockIRepositoryOptions);
            const { randomUUID } = require('crypto');
            const filterIdsReturned = await organizationRepository_1.default.filterIdsInTenant([organizationCreated.id, randomUUID(), randomUUID()], mockIRepositoryOptions);
            expect(filterIdsReturned).toStrictEqual([organizationCreated.id]);
        });
        it('Should return an empty array for an irrelevant tenant', async () => {
            let mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const organization = {
                identities: [{ name: 'test1', platform: 'gitmesh' }],
                displayName: 'test1',
            };
            const organizationCreated = await organizationRepository_1.default.create(organization, mockIRepositoryOptions);
            // create a new tenant and bind options to it
            mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const filterIdsReturned = await organizationRepository_1.default.filterIdsInTenant([organizationCreated.id], mockIRepositoryOptions);
            expect(filterIdsReturned).toStrictEqual([]);
        });
    });
    describe('findAndCountAll method', () => {
        // we can skip this test - findAndCount is not used anymore - we use opensearch method findAndCountAllOpensearch instead
        it.skip('Should find and count all organizations, with simple filters', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const organization1 = { name: 'test-organization' };
            const organization2 = { name: 'test-organization-2' };
            const organization3 = { name: 'another-organization' };
            const organization1Created = await organizationRepository_1.default.create(organization1, mockIRepositoryOptions);
            await new Promise((resolve) => {
                setTimeout(resolve, 50);
            });
            const organization2Created = await organizationRepository_1.default.create(organization2, mockIRepositoryOptions);
            await new Promise((resolve) => {
                setTimeout(resolve, 50);
            });
            const organization3Created = await organizationRepository_1.default.create(organization3, mockIRepositoryOptions);
            await memberRepository_1.default.create({
                username: {
                    [types_1.PlatformType.GITHUB]: {
                        username: 'test-member',
                        integrationId: (0, common_1.generateUUIDv1)(),
                    },
                },
                displayName: 'Member 1',
                joinedAt: (0, moment_1.default)().toDate(),
                organizations: [
                    organization1Created.id,
                    organization2Created.id,
                    organization3Created.id,
                ],
            }, mockIRepositoryOptions);
            const foundOrganization1 = await organizationRepository_1.default.findById(organization1Created.id, mockIRepositoryOptions);
            const foundOrganization2 = await organizationRepository_1.default.findById(organization2Created.id, mockIRepositoryOptions);
            const foundOrganization3 = await organizationRepository_1.default.findById(organization3Created.id, mockIRepositoryOptions);
            // Test filter by name
            // Current findAndCountAll uses wildcarded like statement so it matches both organizations
            let organizations;
            try {
                organizations = await organizationRepository_1.default.findAndCountAll({ filter: { name: 'test-organization' } }, mockIRepositoryOptions);
            }
            catch (err) {
                console.error(err);
                throw err;
            }
            expect(organizations.count).toEqual(2);
            expect(organizations.rows).toEqual([foundOrganization2, foundOrganization1]);
            // Test filter by id
            organizations = await organizationRepository_1.default.findAndCountAll({ filter: { id: organization1Created.id } }, mockIRepositoryOptions);
            expect(organizations.count).toEqual(1);
            expect(organizations.rows).toStrictEqual([foundOrganization1]);
            // Test filter by createdAt - find all between organization1.createdAt and organization3.createdAt
            organizations = await organizationRepository_1.default.findAndCountAll({
                filter: {
                    createdAtRange: [organization1Created.createdAt, organization3Created.createdAt],
                },
            }, mockIRepositoryOptions);
            expect(organizations.count).toEqual(3);
            expect(organizations.rows).toStrictEqual([
                foundOrganization3,
                foundOrganization2,
                foundOrganization1,
            ]);
            // Test filter by createdAt - find all where createdAt < organization2.createdAt
            organizations = await organizationRepository_1.default.findAndCountAll({
                filter: {
                    createdAtRange: [null, organization2Created.createdAt],
                },
            }, mockIRepositoryOptions);
            expect(organizations.count).toEqual(2);
            expect(organizations.rows).toStrictEqual([foundOrganization2, foundOrganization1]);
            // Test filter by createdAt - find all where createdAt < organization1.createdAt
            organizations = await organizationRepository_1.default.findAndCountAll({
                filter: {
                    createdAtRange: [null, organization1Created.createdAt],
                },
            }, mockIRepositoryOptions);
            expect(organizations.count).toEqual(1);
            expect(organizations.rows).toStrictEqual([foundOrganization1]);
        });
    });
    // we can skip these tests as well - we use opensearch method findAndCountAllOpensearch instead
    describe.skip('filter method', () => {
        const alveoliapp = {
            identities: [
                {
                    name: 'gitmesh.dev',
                    platform: 'gitmesh',
                    url: 'https://gitmesh.dev',
                },
            ],
            description: 'Community-led Growth for Developer-first Companies.\nJoin our private beta',
            emails: ['hello@gitmesh.dev', 'jonathan@gitmesh.dev'],
            phoneNumbers: ['+42 424242424'],
            logo: 'https://logo.clearbit.com/gitmesh.dev',
            tags: ['community', 'growth', 'developer-first'],
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
        };
        const piedpiper = {
            identities: [
                {
                    name: 'Pied Piper',
                    platform: 'gitmesh',
                    url: 'https://piedpiper.io',
                },
            ],
            description: 'Pied Piper is a fictional technology company in the HBO television series',
            emails: ['richard@piedpiper.io', 'jarded@pipedpiper.io'],
            phoneNumbers: ['+42 54545454'],
            logo: 'https://logo.clearbit.com/piedpiper',
            tags: ['new-internet', 'compression'],
            twitter: {
                handle: 'piedPiper',
                id: '1362101830923259908',
                bio: 'Pied Piper is a making the new, decentralized internet',
                followers: 1024,
                following: 0,
                location: 'silicon valley',
                site: 'https://t.co/GRLDhqFWk4',
                avatar: 'https://pbs.twimg.com/profile_images/1419741008716251141/6exZe94-_normal.jpg',
            },
            linkedin: {
                handle: 'company/piedpiper',
            },
            crunchbase: {
                handle: 'company/piedpiper',
            },
            employees: 100,
            revenueRange: {
                min: 0,
                max: 1,
            },
        };
        const hooli = {
            identities: [
                {
                    name: 'Hooli',
                    platform: 'gitmesh',
                    url: 'https://hooli.com',
                },
            ],
            description: 'Hooli is a fictional technology company in the HBO television series',
            emails: ['gavin@hooli.com'],
            phoneNumbers: ['+42 12121212'],
            logo: 'https://logo.clearbit.com/hooli',
            tags: ['not-google', 'elephant'],
            twitter: {
                handle: 'hooli',
                id: '1362101830923259908',
                bio: 'Hooli is making the world a better place',
                followers: 1000000,
                following: 0,
                location: 'silicon valley',
                site: 'https://t.co/GRLDhqFWk4',
                avatar: 'https://pbs.twimg.com/profile_images/1419741008716251141/6exZe94-_normal.jpg',
            },
            linkedin: {
                handle: 'company/hooli',
            },
            crunchbase: {
                handle: 'company/hooli',
            },
            employees: 10000,
            revenueRange: {
                min: 200,
                max: 500,
            },
        };
        it('Should filter by name', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await createOrganization(alveoliapp, mockIRepositoryOptions);
            await createOrganization(piedpiper, mockIRepositoryOptions);
            await createOrganization(hooli, mockIRepositoryOptions);
            const found = await organizationRepository_1.default.findAndCountAll({
                filter: {
                    name: 'Pied Piper',
                },
                includeOrganizationsWithoutMembers: true,
            }, mockIRepositoryOptions);
            expect(found.count).toEqual(1);
            expect(found.rows[0].name).toEqual('Pied Piper');
        });
        it('Should filter by url', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await createOrganization(alveoliapp, mockIRepositoryOptions);
            await createOrganization(piedpiper, mockIRepositoryOptions);
            await createOrganization(hooli, mockIRepositoryOptions);
            const found = await organizationRepository_1.default.findAndCountAll({
                filter: {
                    url: 'gitmesh.dev',
                },
                includeOrganizationsWithoutMembers: true,
            }, mockIRepositoryOptions);
            expect(found.count).toEqual(1);
            expect(found.rows[0].name).toBe('gitmesh.dev');
        });
        it('Should filter by description', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await createOrganization(alveoliapp, mockIRepositoryOptions);
            await createOrganization(piedpiper, mockIRepositoryOptions);
            await createOrganization(hooli, mockIRepositoryOptions);
            const found = await organizationRepository_1.default.findAndCountAll({
                filter: {
                    description: 'community',
                },
                includeOrganizationsWithoutMembers: true,
            }, mockIRepositoryOptions);
            expect(found.count).toEqual(1);
            expect(found.rows[0].name).toBe('gitmesh.dev');
        });
        it('Should filter by emails', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await createOrganization(alveoliapp, mockIRepositoryOptions);
            await createOrganization(piedpiper, mockIRepositoryOptions);
            await createOrganization(hooli, mockIRepositoryOptions);
            const found = await organizationRepository_1.default.findAndCountAll({
                filter: {
                    emails: 'richard@piedpiper.io,jonathan@gitmesh.dev',
                },
                includeOrganizationsWithoutMembers: true,
            }, mockIRepositoryOptions);
            expect(found.count).toEqual(2);
            const found2 = await organizationRepository_1.default.findAndCountAll({
                filter: {
                    emails: ['richard@piedpiper.io', 'jonathan@gitmesh.dev'],
                },
                includeOrganizationsWithoutMembers: true,
            }, mockIRepositoryOptions);
            expect(found2.count).toEqual(2);
        });
        it('Should filter by tags', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await createOrganization(alveoliapp, mockIRepositoryOptions);
            await createOrganization(piedpiper, mockIRepositoryOptions);
            await createOrganization(hooli, mockIRepositoryOptions);
            const found = await organizationRepository_1.default.findAndCountAll({
                filter: {
                    tags: 'new-internet,not-google,new',
                },
                includeOrganizationsWithoutMembers: true,
            }, mockIRepositoryOptions);
            expect(found.count).toEqual(2);
            const found2 = await organizationRepository_1.default.findAndCountAll({
                filter: {
                    tags: ['new-internet', 'not-google', 'new'],
                },
                includeOrganizationsWithoutMembers: true,
            }, mockIRepositoryOptions);
            expect(found2.count).toEqual(2);
        });
        it('Should filter by twitter handle', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await createOrganization(alveoliapp, mockIRepositoryOptions);
            await createOrganization(piedpiper, mockIRepositoryOptions);
            await createOrganization(hooli, mockIRepositoryOptions);
            const found = await organizationRepository_1.default.findAndCountAll({
                filter: {
                    twitter: 'alveoliApp',
                },
                includeOrganizationsWithoutMembers: true,
            }, mockIRepositoryOptions);
            expect(found.count).toEqual(1);
            expect(found.rows[0].name).toBe('gitmesh.dev');
        });
        it('Should filter by linkedin handle', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await createOrganization(alveoliapp, mockIRepositoryOptions);
            await createOrganization(piedpiper, mockIRepositoryOptions);
            await createOrganization(hooli, mockIRepositoryOptions);
            const found = await organizationRepository_1.default.findAndCountAll({
                filter: {
                    linkedin: 'alveoliapp',
                },
                includeOrganizationsWithoutMembers: true,
            }, mockIRepositoryOptions);
            expect(found.count).toEqual(1);
            expect(found.rows[0].name).toBe('gitmesh.dev');
        });
        it('Should filter by employee range', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await createOrganization(alveoliapp, mockIRepositoryOptions);
            await createOrganization(piedpiper, mockIRepositoryOptions);
            await createOrganization(hooli, mockIRepositoryOptions);
            const found = await organizationRepository_1.default.findAndCountAll({
                filter: {
                    employeesRange: [90, 120],
                },
                includeOrganizationsWithoutMembers: true,
            }, mockIRepositoryOptions);
            expect(found.count).toEqual(1);
            expect(found.rows[0].name).toBe('Pied Piper');
        });
        it('Should filter by revenue range', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await createOrganization(alveoliapp, mockIRepositoryOptions);
            await createOrganization(piedpiper, mockIRepositoryOptions);
            await createOrganization(hooli, mockIRepositoryOptions);
            const found = await organizationRepository_1.default.findAndCountAll({
                filter: {
                    revenueMin: 0,
                    revenueMax: 1,
                },
                includeOrganizationsWithoutMembers: true,
            }, mockIRepositoryOptions);
            expect(found.count).toEqual(1);
            expect(found.rows[0].name).toBe('Pied Piper');
            const found2 = await organizationRepository_1.default.findAndCountAll({
                filter: {
                    revenueMin: 9,
                },
                includeOrganizationsWithoutMembers: true,
            }, mockIRepositoryOptions);
            expect(found2.count).toEqual(2);
        });
        it('Should filter by members', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await createOrganization(alveoliapp, mockIRepositoryOptions, [
                {
                    username: {
                        github: {
                            username: 'joan',
                            integrationId: (0, common_1.generateUUIDv1)(),
                        },
                    },
                    displayName: 'Joan',
                    joinedAt: (0, moment_1.default)().toDate(),
                    activities: [
                        {
                            username: 'joan',
                            type: 'activity',
                            timestamp: '2020-05-27T15:13:30Z',
                            platform: types_1.PlatformType.GITHUB,
                            sourceId: '#sourceId1',
                        },
                    ],
                },
            ]);
            await createOrganization(piedpiper, mockIRepositoryOptions);
            await createOrganization(hooli, mockIRepositoryOptions);
            await sequelizeTestUtils_1.default.refreshMaterializedViews(db);
            const memberId = await (await memberRepository_1.default.findAndCountAll({}, mockIRepositoryOptions)).rows[0].id;
            const found = await organizationRepository_1.default.findAndCountAll({
                filter: {
                    members: [memberId],
                },
            }, mockIRepositoryOptions);
            expect(found.count).toEqual(1);
            expect(found.rows[0].name).toBe('gitmesh.dev');
        });
        // we can skip this test - findAndCount is not used anymore - we use opensearch method findAndCountAllOpensearch instead
        it.skip('Should filter by memberCount', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const org1 = await createOrganization(alveoliapp, mockIRepositoryOptions, [
                {
                    username: {
                        github: {
                            username: 'joan',
                            integrationId: (0, common_1.generateUUIDv1)(),
                        },
                    },
                    displayName: 'Joan',
                    joinedAt: (0, moment_1.default)().toDate(),
                },
                {
                    username: {
                        github: {
                            username: 'anil',
                            integrationId: (0, common_1.generateUUIDv1)(),
                        },
                    },
                    displayName: 'anil',
                    joinedAt: (0, moment_1.default)().toDate(),
                },
                {
                    username: {
                        github: {
                            username: 'uros',
                            integrationId: (0, common_1.generateUUIDv1)(),
                        },
                    },
                    displayName: 'uros',
                    joinedAt: (0, moment_1.default)().toDate(),
                },
            ]);
            const org2 = await createOrganization(piedpiper, mockIRepositoryOptions, [
                {
                    username: {
                        github: {
                            username: 'mario',
                            integrationId: (0, common_1.generateUUIDv1)(),
                        },
                    },
                    displayName: 'mario',
                    joinedAt: (0, moment_1.default)().toDate(),
                },
                {
                    username: {
                        github: {
                            username: 'igor',
                            integrationId: (0, common_1.generateUUIDv1)(),
                        },
                    },
                    displayName: 'igor',
                    joinedAt: (0, moment_1.default)().toDate(),
                },
            ]);
            await createOrganization(hooli, mockIRepositoryOptions);
            const found = await organizationRepository_1.default.findAndCountAll({
                advancedFilter: {
                    memberCount: {
                        gte: 2,
                    },
                },
            }, mockIRepositoryOptions);
            delete org1.members;
            delete org2.members;
            expect(found.count).toBe(2);
            expect(found.rows.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))).toStrictEqual([
                org1,
                org2,
            ]);
        });
        it('Should work with advanced filters', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await createOrganization(alveoliapp, mockIRepositoryOptions, [
                {
                    username: {
                        github: {
                            username: 'joan',
                            integrationId: (0, common_1.generateUUIDv1)(),
                        },
                    },
                    displayName: 'Joan',
                    joinedAt: (0, moment_1.default)().toDate(),
                },
            ]);
            await createOrganization(piedpiper, mockIRepositoryOptions);
            await createOrganization(hooli, mockIRepositoryOptions);
            await sequelizeTestUtils_1.default.refreshMaterializedViews(db);
            const memberId = await (await memberRepository_1.default.findAndCountAll({}, mockIRepositoryOptions)).rows[0].id;
            // Revenue nested field
            expect((await organizationRepository_1.default.findAndCountAll({
                advancedFilter: {
                    revenue: {
                        gte: 9,
                    },
                },
                includeOrganizationsWithoutMembers: true,
            }, mockIRepositoryOptions)).count).toEqual(2);
            // Twitter bio
            expect((await organizationRepository_1.default.findAndCountAll({
                advancedFilter: {
                    'twitter.bio': {
                        textContains: 'world a better place',
                    },
                },
                includeOrganizationsWithoutMembers: true,
            }, mockIRepositoryOptions)).count).toEqual(1);
            expect((await organizationRepository_1.default.findAndCountAll({
                advancedFilter: {
                    or: [
                        {
                            and: [
                                {
                                    revenue: {
                                        gte: 9,
                                    },
                                },
                                {
                                    revenue: {
                                        lte: 100,
                                    },
                                },
                            ],
                        },
                        {
                            'twitter.bio': {
                                textContains: 'world a better place',
                            },
                        },
                    ],
                },
                includeOrganizationsWithoutMembers: true,
            }, mockIRepositoryOptions)).count).toEqual(2);
            expect((await organizationRepository_1.default.findAndCountAll({
                advancedFilter: {
                    or: [
                        {
                            and: [
                                {
                                    tags: {
                                        overlap: ['not-google'],
                                    },
                                },
                                {
                                    'twitter.location': {
                                        textContains: 'silicon valley',
                                    },
                                },
                            ],
                        },
                        {
                            members: [memberId],
                        },
                    ],
                },
                includeOrganizationsWithoutMembers: true,
            }, mockIRepositoryOptions)).count).toEqual(2);
        });
    });
    describe('update method', () => {
        it('Should succesfully update previously created organization', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const organizationCreated = await organizationRepository_1.default.create(toCreate, mockIRepositoryOptions);
            const organizationUpdated = await organizationRepository_1.default.update(organizationCreated.id, { displayName: 'updated-organization-name' }, mockIRepositoryOptions);
            expect(organizationUpdated.updatedAt.getTime()).toBeGreaterThan(organizationUpdated.createdAt.getTime());
            const primaryIdentity = organizationCreated.identities[0];
            delete organizationUpdated.identities[0].createdAt;
            delete organizationUpdated.identities[0].updatedAt;
            const organizationExpected = Object.assign(Object.assign({ id: organizationCreated.id }, toCreate), { github: null, location: null, website: null, memberCount: 0, activityCount: 0, activeOn: [], identities: [
                    {
                        integrationId: null,
                        name: primaryIdentity.name,
                        organizationId: organizationCreated.id,
                        platform: primaryIdentity.platform,
                        url: primaryIdentity.url,
                        sourceId: null,
                        tenantId: mockIRepositoryOptions.currentTenant.id,
                    },
                ], lastActive: null, joinedAt: null, displayName: organizationUpdated.displayName, importHash: null, createdAt: organizationCreated.createdAt, updatedAt: organizationUpdated.updatedAt, deletedAt: null, tenantId: mockIRepositoryOptions.currentTenant.id, segments: mockIRepositoryOptions.currentSegments.map((s) => s.id), createdById: mockIRepositoryOptions.currentUser.id, updatedById: mockIRepositoryOptions.currentUser.id, isTeamOrganization: false, attributes: {}, weakIdentities: [] });
            expect(organizationUpdated).toStrictEqual(organizationExpected);
        });
        it('Should throw 404 error when trying to update non existent organization', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => organizationRepository_1.default.update(randomUUID(), { name: 'non-existent' }, mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
    describe('setOrganizationIsTeam method', () => {
        const member1 = {
            username: {
                devto: {
                    username: 'iambarker',
                    integrationId: (0, common_1.generateUUIDv1)(),
                },
                github: {
                    username: 'barker',
                    integrationId: (0, common_1.generateUUIDv1)(),
                },
            },
            displayName: 'Jack Barker',
            attributes: {
                bio: {
                    github: 'Head of development at Hooli',
                    twitter: 'Head of development at Hooli | ex CEO at Pied Piper',
                },
                sample: { gitmesh: true, default: true },
                jobTitle: { custom: 'Head of development', default: 'Head of development' },
                location: { github: 'Silicon Valley', default: 'Silicon Valley' },
                avatarUrl: {
                    custom: 'https://s3.eu-central-1.amazonaws.com/gitmesh.dev-sample-data/jack-barker-best.jpg',
                    default: 'https://s3.eu-central-1.amazonaws.com/gitmesh.dev-sample-data/jack-barker-best.jpg',
                },
            },
            joinedAt: (0, moment_1.default)().toDate(),
            activities: [
                {
                    type: 'star',
                    timestamp: '2020-05-27T15:13:30Z',
                    platform: types_1.PlatformType.GITHUB,
                    username: 'barker',
                    sourceId: '#sourceId1',
                },
            ],
        };
        const member2 = {
            username: {
                devto: {
                    username: 'thebelson',
                    integrationId: (0, common_1.generateUUIDv1)(),
                },
                github: {
                    username: 'gavinbelson',
                    integrationId: (0, common_1.generateUUIDv1)(),
                },
                discord: {
                    username: 'gavinbelson',
                    integrationId: (0, common_1.generateUUIDv1)(),
                },
                twitter: {
                    username: 'gavin',
                    integrationId: (0, common_1.generateUUIDv1)(),
                },
                linkedin: {
                    username: 'gavinbelson',
                    integrationId: (0, common_1.generateUUIDv1)(),
                },
            },
            displayName: 'Gavin Belson',
            attributes: {
                bio: {
                    custom: 'CEO at Hooli',
                    github: 'CEO at Hooli',
                    default: 'CEO at Hooli',
                    twitter: 'CEO at Hooli',
                },
                sample: { gitmesh: true, default: true },
                jobTitle: { custom: 'CEO', default: 'CEO' },
                location: { github: 'Silicon Valley', default: 'Silicon Valley' },
                avatarUrl: {
                    custom: 'https://s3.eu-central-1.amazonaws.com/gitmesh.dev-sample-data/gavin.jpg',
                    default: 'https://s3.eu-central-1.amazonaws.com/gitmesh.dev-sample-data/gavin.jpg',
                },
            },
            joinedAt: (0, moment_1.default)().toDate(),
            activities: [
                {
                    type: 'star',
                    timestamp: '2020-05-28T15:13:30Z',
                    username: 'gavinbelson',
                    platform: types_1.PlatformType.GITHUB,
                    sourceId: '#sourceId2',
                },
            ],
        };
        const member3 = {
            username: {
                devto: {
                    username: 'bigheader',
                    integrationId: (0, common_1.generateUUIDv1)(),
                },
                github: {
                    username: 'bighead',
                    integrationId: (0, common_1.generateUUIDv1)(),
                },
            },
            displayName: 'Big Head',
            attributes: {
                bio: {
                    custom: 'Executive at the Hooli XYZ project',
                    github: 'Co-head Dreamer of the Hooli XYZ project',
                    default: 'Executive at the Hooli XYZ project',
                    twitter: 'Co-head Dreamer of the Hooli XYZ project',
                },
                sample: { gitmesh: true, default: true },
                jobTitle: { custom: 'Co-head Dreamer', default: 'Co-head Dreamer' },
                location: { github: 'Silicon Valley', default: 'Silicon Valley' },
                avatarUrl: {
                    custom: 'https://s3.eu-central-1.amazonaws.com/gitmesh.dev-sample-data/big-head-small.jpg',
                    default: 'https://s3.eu-central-1.amazonaws.com/gitmesh.dev-sample-data/big-head-small.jpg',
                },
            },
            joinedAt: (0, moment_1.default)().toDate(),
            activities: [
                {
                    type: 'star',
                    timestamp: '2020-05-29T15:13:30Z',
                    platform: types_1.PlatformType.GITHUB,
                    username: 'bighead',
                    sourceId: '#sourceId3',
                },
            ],
        };
        it('Should succesfully set/unset organization members as team members', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const org = await createOrganization(toCreate, mockIRepositoryOptions, [
                member1,
                member2,
                member3,
            ]);
            // mark organization members as team members
            await organizationRepository_1.default.setOrganizationIsTeam(org.id, true, mockIRepositoryOptions);
            let m1 = await memberRepository_1.default.findById(org.members[0], mockIRepositoryOptions);
            let m2 = await memberRepository_1.default.findById(org.members[1], mockIRepositoryOptions);
            let m3 = await memberRepository_1.default.findById(org.members[2], mockIRepositoryOptions);
            expect(m1.attributes.isTeamMember.default).toEqual(true);
            expect(m2.attributes.isTeamMember.default).toEqual(true);
            expect(m3.attributes.isTeamMember.default).toEqual(true);
            // expect other attributes intact
            delete m1.attributes.isTeamMember;
            expect(m1.attributes).toStrictEqual(member1.attributes);
            delete m2.attributes.isTeamMember;
            expect(m2.attributes).toStrictEqual(member2.attributes);
            delete m3.attributes.isTeamMember;
            expect(m3.attributes).toStrictEqual(member3.attributes);
            // now unmark
            await organizationRepository_1.default.setOrganizationIsTeam(org.id, false, mockIRepositoryOptions);
            m1 = await memberRepository_1.default.findById(org.members[0], mockIRepositoryOptions);
            m2 = await memberRepository_1.default.findById(org.members[1], mockIRepositoryOptions);
            m3 = await memberRepository_1.default.findById(org.members[2], mockIRepositoryOptions);
            expect(m1.attributes.isTeamMember.default).toEqual(false);
            expect(m2.attributes.isTeamMember.default).toEqual(false);
            expect(m3.attributes.isTeamMember.default).toEqual(false);
            // expect other attributes intact
            delete m1.attributes.isTeamMember;
            expect(m1.attributes).toStrictEqual(member1.attributes);
            delete m2.attributes.isTeamMember;
            expect(m2.attributes).toStrictEqual(member2.attributes);
            delete m3.attributes.isTeamMember;
            expect(m3.attributes).toStrictEqual(member3.attributes);
        });
    });
    describe('destroy method', () => {
        it('Should succesfully destroy previously created organization', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const organization = { displayName: 'test-organization' };
            const returnedOrganization = await organizationRepository_1.default.create(organization, mockIRepositoryOptions);
            await organizationRepository_1.default.destroy(returnedOrganization.id, mockIRepositoryOptions, true);
            // Try selecting it after destroy, should throw 404
            await expect(() => organizationRepository_1.default.findById(returnedOrganization.id, mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
        it('Should throw 404 when trying to destroy a non existent organization', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const { randomUUID } = require('crypto');
            await expect(() => organizationRepository_1.default.destroy(randomUUID(), mockIRepositoryOptions)).rejects.toThrowError(new common_1.Error404());
        });
    });
});
//# sourceMappingURL=organizationRepository.test.js.map