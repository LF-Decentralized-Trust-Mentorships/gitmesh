"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const types_1 = require("@gitmesh/types");
const newActivityWorker_1 = require("../newActivityWorker");
function createAutomationData(settings) {
    return {
        id: (0, common_1.generateUUIDv4)(),
        name: 'Activity test',
        state: types_1.AutomationState.ACTIVE,
        trigger: types_1.AutomationTrigger.NEW_ACTIVITY,
        settings,
        type: types_1.AutomationType.WEBHOOK,
        createdAt: new Date().toISOString(),
        tenantId: '321',
        lastExecutionAt: null,
        lastExecutionError: null,
        lastExecutionState: null,
    };
}
describe('New Activity Automation Worker tests', () => {
    it('Should process an activity that matches settings', async () => {
        const automation = createAutomationData({
            platforms: [types_1.PlatformType.DEVTO],
            types: ['comment'],
            keywords: ['gitmesh.dev'],
            teamMemberActivities: false,
        });
        const activity = {
            id: '1234',
            type: 'comment',
            platform: types_1.PlatformType.DEVTO,
            body: 'gitmesh.dev is awesome!',
            member: {
                attributes: {},
            },
        };
        expect(await (0, newActivityWorker_1.shouldProcessActivity)(activity, automation)).toBeTruthy();
    });
    it("Shouldn't process an activity that belongs to a team member", async () => {
        const automation = createAutomationData({
            platforms: [types_1.PlatformType.DEVTO],
            types: ['comment'],
            keywords: ['gitmesh.dev'],
            teamMemberActivities: true,
        });
        const activity = {
            id: '1234',
            type: 'comment',
            platform: types_1.PlatformType.DEVTO,
            member: {
                attributes: {
                    isTeamMember: {
                        default: true,
                        custom: true,
                    },
                    isBot: {
                        default: false,
                    },
                },
            },
            body: 'gitmesh.dev all awesome!',
        };
        expect(await (0, newActivityWorker_1.shouldProcessActivity)(activity, automation)).toBeTruthy();
    });
    it("Shouldn't process an activity which platform does not match", async () => {
        const automation = createAutomationData({
            platforms: [types_1.PlatformType.DEVTO],
            types: ['comment'],
            keywords: ['gitmesh.dev'],
            teamMemberActivities: false,
        });
        const activity = {
            id: '1234',
            type: 'comment',
            platform: types_1.PlatformType.DISCORD,
            body: 'gitmesh.dev is awesome!',
        };
        expect(await (0, newActivityWorker_1.shouldProcessActivity)(activity, automation)).toBeFalsy();
    });
    it("Shouldn't process an activity which type does not match", async () => {
        const automation = createAutomationData({
            platforms: [types_1.PlatformType.DEVTO],
            types: ['comment'],
            keywords: ['gitmesh.dev'],
            teamMemberActivities: false,
        });
        const activity = {
            id: '1234',
            type: 'follow',
            platform: types_1.PlatformType.DEVTO,
            body: 'gitmesh.dev is awesome!',
        };
        expect(await (0, newActivityWorker_1.shouldProcessActivity)(activity, automation)).toBeFalsy();
    });
    it("Shouldn't process an activity which keyword does not match", async () => {
        const automation = createAutomationData({
            platforms: [types_1.PlatformType.DEVTO],
            types: ['comment'],
            keywords: ['gitmesh.dev'],
            teamMemberActivities: false,
        });
        const activity = {
            id: '1234',
            type: 'comment',
            platform: types_1.PlatformType.DEVTO,
            body: 'We are all awesome!',
        };
        expect(await (0, newActivityWorker_1.shouldProcessActivity)(activity, automation)).toBeFalsy();
    });
    it("Shouldn't process an activity that belongs to a bot", async () => {
        const automation = createAutomationData({
            platforms: [types_1.PlatformType.DEVTO],
            types: ['comment'],
            keywords: ['gitmesh.dev'],
            teamMemberActivities: false,
        });
        const activity = {
            id: '1234',
            type: 'comment',
            platform: types_1.PlatformType.DEVTO,
            member: {
                attributes: {
                    isTeamMember: {
                        default: false,
                        custom: true,
                    },
                    isBot: {
                        default: true,
                    },
                },
            },
            body: 'gitmesh.dev all awesome!',
        };
        expect(await (0, newActivityWorker_1.shouldProcessActivity)(activity, automation)).toBeFalsy();
    });
    it("Shouldn't process an activity that belongs to a team member", async () => {
        const automation = createAutomationData({
            platforms: [types_1.PlatformType.DEVTO],
            types: ['comment'],
            keywords: ['gitmesh.dev'],
            teamMemberActivities: false,
        });
        const activity = {
            id: '1234',
            type: 'comment',
            platform: types_1.PlatformType.DEVTO,
            member: {
                attributes: {
                    isTeamMember: {
                        default: true,
                        custom: true,
                    },
                    isBot: {
                        default: false,
                    },
                },
            },
            body: 'gitmesh.dev all awesome!',
        };
        expect(await (0, newActivityWorker_1.shouldProcessActivity)(activity, automation)).toBeFalsy();
    });
});
//# sourceMappingURL=newActivityWorker.test.js.map