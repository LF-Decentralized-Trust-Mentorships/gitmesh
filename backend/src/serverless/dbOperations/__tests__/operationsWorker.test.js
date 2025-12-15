"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const sequelizeTestUtils_1 = __importDefault(require("../../../database/utils/sequelizeTestUtils"));
const activityService_1 = __importDefault(require("../../../services/activityService"));
const memberService_1 = __importDefault(require("../../../services/memberService"));
const integrationService_1 = __importDefault(require("../../../services/integrationService"));
const microserviceService_1 = __importDefault(require("../../../services/microserviceService"));
const operationsWorker_1 = __importDefault(require("../operationsWorker"));
const types_1 = require("@gitmesh/types");
const common_1 = require("@gitmesh/common");
const segmentTestUtils_1 = require("../../../database/utils/segmentTestUtils");
const db = null;
describe('Serverless database operations worker tests', () => {
    beforeEach(async () => {
        await sequelizeTestUtils_1.default.wipeDatabase(db);
    });
    afterAll(async () => {
        // Closing the DB connection allows Jest to exit successfully.
        await sequelizeTestUtils_1.default.closeConnection(db);
    });
    describe('Bulk upsert method for members', () => {
        it('Should add a single simple member', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const member = {
                username: {
                    [types_1.PlatformType.GITHUB]: {
                        username: 'member1',
                        integrationId: (0, common_1.generateUUIDv1)(),
                    },
                },
                platform: types_1.PlatformType.GITHUB,
            };
            await (0, operationsWorker_1.default)('upsert_members', [member], mockIRepositoryOptions);
            await sequelizeTestUtils_1.default.refreshMaterializedViews(db);
            const dbMembers = (await new memberService_1.default(mockIRepositoryOptions).findAndCountAll({})).rows;
            expect(dbMembers.length).toBe(1);
            expect(dbMembers[0].username[types_1.PlatformType.GITHUB]).toEqual(['member1']);
        });
        it('Should add a list of members', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const members = [
                {
                    username: {
                        [types_1.PlatformType.GITHUB]: {
                            username: 'member1',
                            integrationId: (0, common_1.generateUUIDv1)(),
                        },
                    },
                    platform: types_1.PlatformType.GITHUB,
                },
                {
                    username: {
                        [types_1.PlatformType.SLACK]: {
                            username: 'member2',
                            integrationId: (0, common_1.generateUUIDv1)(),
                        },
                    },
                    platform: types_1.PlatformType.SLACK,
                },
            ];
            await (0, operationsWorker_1.default)('upsert_members', members, mockIRepositoryOptions);
            await sequelizeTestUtils_1.default.refreshMaterializedViews(db);
            const dbMembers = (await new memberService_1.default(mockIRepositoryOptions).findAndCountAll({})).rows;
            expect(dbMembers.length).toBe(2);
        });
        it('Should work for an empty list', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await (0, operationsWorker_1.default)('upsert_members', [], mockIRepositoryOptions);
            const dbMembers = (await new memberService_1.default(mockIRepositoryOptions).findAndCountAll({})).rows;
            expect(dbMembers.length).toBe(0);
        });
    });
    describe('Bulk upsert method for activities with members', () => {
        it('Should add a single simple activity with members', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await (0, segmentTestUtils_1.populateSegments)(mockIRepositoryOptions);
            const ts = (0, moment_1.default)().toDate();
            const activity = {
                timestamp: ts,
                type: 'message',
                platform: 'api',
                username: 'member1',
                member: {
                    username: {
                        api: {
                            username: 'member1',
                            integrationId: (0, common_1.generateUUIDv1)(),
                        },
                    },
                },
                sourceId: '#sourceId1',
            };
            await (0, operationsWorker_1.default)('upsert_activities_with_members', [activity], mockIRepositoryOptions);
            const dbActivities = (await new activityService_1.default(mockIRepositoryOptions).findAndCountAll({}))
                .rows;
            expect(dbActivities.length).toBe(1);
            expect((0, moment_1.default)(dbActivities[0].timestamp).unix()).toBe((0, moment_1.default)(ts).unix());
        });
        it('Should add a list of activities with members', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await (0, segmentTestUtils_1.populateSegments)(mockIRepositoryOptions);
            const ts = (0, moment_1.default)().toDate();
            const ts2 = (0, moment_1.default)().subtract(2, 'days').toDate();
            const activities = [
                {
                    timestamp: ts,
                    type: 'message',
                    platform: 'api',
                    username: 'member1',
                    member: {
                        username: {
                            api: {
                                username: 'member1',
                                integrationId: (0, common_1.generateUUIDv1)(),
                            },
                        },
                    },
                    sourceId: '#sourceId1',
                },
                {
                    timestamp: ts2,
                    type: 'message',
                    platform: 'api',
                    username: 'member2',
                    member: {
                        username: {
                            api: {
                                username: 'member2',
                                integrationId: (0, common_1.generateUUIDv1)(),
                            },
                        },
                    },
                    sourceId: '#sourceId2',
                },
            ];
            await (0, operationsWorker_1.default)('upsert_activities_with_members', activities, mockIRepositoryOptions);
            const dbActivities = (await new activityService_1.default(mockIRepositoryOptions).findAndCountAll({}))
                .rows;
            expect(dbActivities.length).toBe(2);
        });
        it('Should work for an empty list', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await (0, operationsWorker_1.default)('upsert_activities_with_members', [], mockIRepositoryOptions);
            const dbActivities = (await new activityService_1.default(mockIRepositoryOptions).findAndCountAll({}))
                .rows;
            expect(dbActivities.length).toBe(0);
        });
    });
    describe('Bulk update method for members', () => {
        it('Should update a single member', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const member = {
                username: {
                    [types_1.PlatformType.GITHUB]: {
                        username: 'member1',
                        integrationId: (0, common_1.generateUUIDv1)(),
                    },
                },
                platform: types_1.PlatformType.GITHUB,
                score: 1,
            };
            const dbMember = await new memberService_1.default(mockIRepositoryOptions).upsert(member);
            const memberId = dbMember.id;
            await (0, operationsWorker_1.default)('update_members', [{ id: memberId, update: { score: 10 } }], mockIRepositoryOptions);
            await sequelizeTestUtils_1.default.refreshMaterializedViews(db);
            const dbMembers = (await new memberService_1.default(mockIRepositoryOptions).findAndCountAll({})).rows;
            expect(dbMembers.length).toBe(1);
            expect(dbMembers[0].username[types_1.PlatformType.GITHUB]).toEqual(['member1']);
            expect(dbMembers[0].score).toBe(10);
        });
        it('Should update a list of members', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const members = [
                {
                    username: {
                        [types_1.PlatformType.GITHUB]: {
                            username: 'member1',
                            integrationId: (0, common_1.generateUUIDv1)(),
                        },
                    },
                    platform: types_1.PlatformType.GITHUB,
                    score: 1,
                },
                {
                    username: {
                        [types_1.PlatformType.DISCORD]: {
                            username: 'member2',
                            integrationId: (0, common_1.generateUUIDv1)(),
                        },
                    },
                    platform: types_1.PlatformType.DISCORD,
                    score: 2,
                },
            ];
            const memberIds = [];
            for (const member of members) {
                const { id } = await new memberService_1.default(mockIRepositoryOptions).upsert(member);
                memberIds.push(id);
            }
            await (0, operationsWorker_1.default)('update_members', [
                { id: memberIds[0], update: { score: 10 } },
                { id: memberIds[1], update: { score: 3 } },
            ], mockIRepositoryOptions);
            await sequelizeTestUtils_1.default.refreshMaterializedViews(db);
            const dbMembers = (await new memberService_1.default(mockIRepositoryOptions).findAndCountAll({})).rows;
            expect(dbMembers.length).toBe(2);
            expect(dbMembers[1].score).toBe(10);
            expect(dbMembers[0].score).toBe(3);
        });
        it('Should work for an empty list', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await (0, operationsWorker_1.default)('update_members', [], mockIRepositoryOptions);
            const dbMembers = (await new memberService_1.default(mockIRepositoryOptions).findAndCountAll({})).rows;
            expect(dbMembers.length).toBe(0);
        });
    });
    describe('Bulk update method for integrations', () => {
        it('Should update a single integration', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const integration = {
                platform: types_1.PlatformType.SLACK,
                integrationIdentifier: 'integration1',
                status: 'todo',
            };
            const dbIntegration = await new integrationService_1.default(mockIRepositoryOptions).create(integration);
            await (0, operationsWorker_1.default)('update_integrations', [
                {
                    id: dbIntegration.id,
                    update: { status: 'done' },
                },
            ], mockIRepositoryOptions);
            const dbIntegrations = (await new integrationService_1.default(mockIRepositoryOptions).findAndCountAll({})).rows;
            expect(dbIntegrations.length).toBe(1);
            expect(dbIntegrations[0].status).toBe('done');
        });
        it('Should update a list of integrations', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const integrations = [
                {
                    platform: types_1.PlatformType.SLACK,
                    integrationIdentifier: 'integration1',
                    status: 'todo',
                },
                {
                    platform: types_1.PlatformType.SLACK,
                    integrationIdentifier: 'integration2',
                    status: 'todo',
                },
            ];
            const integrationIds = [];
            for (const integration of integrations) {
                const { id } = await new integrationService_1.default(mockIRepositoryOptions).create(integration);
                integrationIds.push(id);
            }
            await (0, operationsWorker_1.default)('update_integrations', [
                {
                    id: integrationIds[0],
                    update: { status: 'done' },
                },
            ], mockIRepositoryOptions);
            const dbIntegrations = (await new integrationService_1.default(mockIRepositoryOptions).findAndCountAll({})).rows;
            expect(dbIntegrations.length).toBe(2);
            expect(dbIntegrations[1].status).toBe('done');
            expect(dbIntegrations[0].status).toBe('todo');
        });
        it('Should work with an empty list', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await (0, operationsWorker_1.default)('update_integrations', [], mockIRepositoryOptions);
            const dbIntegrations = (await new integrationService_1.default(mockIRepositoryOptions).findAndCountAll({})).rows;
            expect(dbIntegrations.length).toBe(0);
        });
    });
    describe('Bulk update method for microservice', () => {
        it('Should update a single microservice', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const microservice = {
                type: 'other',
                running: false,
                init: true,
                variant: 'default',
            };
            const dbMs = await new microserviceService_1.default(mockIRepositoryOptions).create(microservice);
            await (0, operationsWorker_1.default)('update_microservices', [
                {
                    id: dbMs.id,
                    update: { running: true },
                },
            ], mockIRepositoryOptions);
            const dbIntegrations = (await new microserviceService_1.default(mockIRepositoryOptions).findAndCountAll({})).rows;
            expect(dbIntegrations.length).toBe(1);
            expect(dbIntegrations[0].running).toBe(true);
        });
        it('Should update a list of microservices', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            const microservices = [
                {
                    type: 'other',
                    running: false,
                    init: true,
                    variant: 'default',
                },
                {
                    type: 'member_score',
                    running: false,
                    init: true,
                    variant: 'default',
                },
            ];
            const dbMs = await new microserviceService_1.default(mockIRepositoryOptions).create(microservices[0]);
            const dbMs2 = await new microserviceService_1.default(mockIRepositoryOptions).create(microservices[1]);
            await (0, operationsWorker_1.default)('update_microservices', [
                {
                    id: dbMs.id,
                    update: { running: true },
                },
                {
                    id: dbMs2.id,
                    update: { running: true },
                },
            ], mockIRepositoryOptions);
            const dbIntegrations = (await new microserviceService_1.default(mockIRepositoryOptions).findAndCountAll({})).rows;
            expect(dbIntegrations.length).toBe(2);
            expect(dbIntegrations[0].running).toBe(true);
            expect(dbIntegrations[1].running).toBe(true);
        });
        it('Should work with an empty list', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await (0, operationsWorker_1.default)('update_microservices', [], mockIRepositoryOptions);
            const dbIntegrations = (await new microserviceService_1.default(mockIRepositoryOptions).findAndCountAll({})).rows;
            expect(dbIntegrations.length).toBe(0);
        });
    });
    describe('Unknown operation', () => {
        it('Should throw an error', async () => {
            const mockIRepositoryOptions = await sequelizeTestUtils_1.default.getTestIRepositoryOptions(db);
            await expect((0, operationsWorker_1.default)('unknownOperation', [], mockIRepositoryOptions)).rejects.toThrow('Operation unknownOperation not found');
        });
    });
});
//# sourceMappingURL=operationsWorker.test.js.map