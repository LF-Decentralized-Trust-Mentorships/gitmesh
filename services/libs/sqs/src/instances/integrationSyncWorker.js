"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationSyncWorkerEmitter = void 0;
const types_1 = require("@gitmesh/types");
const __1 = require("..");
class IntegrationSyncWorkerEmitter extends __1.SqsQueueEmitter {
    constructor(client, tracer, parentLog) {
        super(client, __1.INTEGRATION_SYNC_WORKER_QUEUE_SETTINGS, tracer, parentLog);
    }
    async triggerSyncMarkedMembers(tenantId, integrationId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        if (!integrationId) {
            throw new Error('integrationId is required!');
        }
        await this.sendMessage(integrationId, {
            type: types_1.IntegrationSyncWorkerQueueMessageType.SYNC_ALL_MARKED_MEMBERS,
            tenantId,
            integrationId,
        }, integrationId);
    }
    async triggerSyncMember(tenantId, integrationId, memberId, syncRemoteId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        if (!integrationId) {
            throw new Error('integrationId is required!');
        }
        if (!memberId) {
            throw new Error('memberId is required!');
        }
        if (!syncRemoteId) {
            throw new Error('syncRemoteId is required!');
        }
        await this.sendMessage(memberId, {
            type: types_1.IntegrationSyncWorkerQueueMessageType.SYNC_MEMBER,
            tenantId,
            integrationId,
            memberId,
            syncRemoteId,
        }, memberId);
    }
    async triggerOnboardAutomation(tenantId, integrationId, automationId, automationTrigger) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        if (!automationId) {
            throw new Error('automationId is required!');
        }
        if (!integrationId) {
            throw new Error('integrationId is required!');
        }
        await this.sendMessage(automationId, {
            type: types_1.IntegrationSyncWorkerQueueMessageType.ONBOARD_AUTOMATION,
            tenantId,
            integrationId,
            automationId,
            automationTrigger,
        }, automationId);
    }
    async triggerSyncMarkedOrganizations(tenantId, integrationId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        if (!integrationId) {
            throw new Error('integrationId is required!');
        }
        await this.sendMessage(integrationId, {
            type: types_1.IntegrationSyncWorkerQueueMessageType.SYNC_ALL_MARKED_ORGANIZATIONS,
            tenantId,
            integrationId,
        }, integrationId);
    }
    async triggerSyncOrganization(tenantId, integrationId, organizationId, syncRemoteId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        if (!integrationId) {
            throw new Error('integrationId is required!');
        }
        if (!syncRemoteId) {
            throw new Error('syncRemoteId is required!');
        }
        await this.sendMessage(organizationId, {
            type: types_1.IntegrationSyncWorkerQueueMessageType.SYNC_ORGANIZATION,
            tenantId,
            integrationId,
            organizationId,
            syncRemoteId,
        }, organizationId);
    }
}
exports.IntegrationSyncWorkerEmitter = IntegrationSyncWorkerEmitter;
//# sourceMappingURL=integrationSyncWorker.js.map