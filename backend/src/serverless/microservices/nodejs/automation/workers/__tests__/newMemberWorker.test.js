"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const types_1 = require("@gitmesh/types");
const newMemberWorker_1 = require("../newMemberWorker");
function createAutomationData(settings) {
    return {
        id: (0, common_1.generateUUIDv4)(),
        name: 'Member test',
        state: types_1.AutomationState.ACTIVE,
        trigger: types_1.AutomationTrigger.NEW_MEMBER,
        settings,
        type: types_1.AutomationType.WEBHOOK,
        createdAt: new Date().toISOString(),
        tenantId: '321',
        lastExecutionAt: null,
        lastExecutionError: null,
        lastExecutionState: null,
    };
}
describe('New Member Automation Worker tests', () => {
    it('Should process a worker that matches settings', async () => {
        const automation = createAutomationData({
            platforms: [types_1.PlatformType.DISCORD],
        });
        const member = {
            id: '1234',
            username: {
                [types_1.PlatformType.DISCORD]: 'discordUsername',
            },
        };
        expect(await (0, newMemberWorker_1.shouldProcessMember)(member, automation)).toBeTruthy();
    });
    it("Shouldn't process a worker that does not match settings", async () => {
        const automation = createAutomationData({
            platforms: [types_1.PlatformType.DEVTO],
        });
        const member = {
            id: '1234',
            username: {
                [types_1.PlatformType.DISCORD]: 'discordUsername',
            },
        };
        expect(await (0, newMemberWorker_1.shouldProcessMember)(member, automation)).toBeFalsy();
    });
});
//# sourceMappingURL=newMemberWorker.test.js.map