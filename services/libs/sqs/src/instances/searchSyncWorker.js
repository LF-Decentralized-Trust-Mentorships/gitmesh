"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchSyncWorkerEmitter = void 0;
const types_1 = require("@gitmesh/types");
const __1 = require("..");
class SearchSyncWorkerEmitter extends __1.SqsQueueEmitter {
    constructor(client, tracer, parentLog) {
        super(client, __1.SEARCH_SYNC_WORKER_QUEUE_SETTINGS, tracer, parentLog);
    }
    async triggerMemberSync(tenantId, memberId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        if (!memberId) {
            throw new Error('memberId is required!');
        }
        await this.sendMessage(memberId, {
            type: types_1.SearchSyncWorkerQueueMessageType.SYNC_MEMBER,
            memberId,
        }, memberId);
    }
    async triggerTenantMembersSync(tenantId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        await this.sendMessage(tenantId, {
            type: types_1.SearchSyncWorkerQueueMessageType.SYNC_TENANT_MEMBERS,
            tenantId,
        });
    }
    async triggerOrganizationMembersSync(organizationId) {
        if (!organizationId) {
            throw new Error('organizationId is required!');
        }
        await this.sendMessage(organizationId, {
            type: types_1.SearchSyncWorkerQueueMessageType.SYNC_ORGANIZATION_MEMBERS,
            organizationId,
        });
    }
    async triggerRemoveMember(tenantId, memberId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        if (!memberId) {
            throw new Error('memberId is required!');
        }
        await this.sendMessage(memberId, {
            type: types_1.SearchSyncWorkerQueueMessageType.REMOVE_MEMBER,
            memberId,
        });
    }
    async triggerMemberCleanup(tenantId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        await this.sendMessage(tenantId, {
            type: types_1.SearchSyncWorkerQueueMessageType.CLEANUP_TENANT_MEMBERS,
            tenantId,
        });
    }
    async triggerActivitySync(tenantId, activityId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        if (!activityId) {
            throw new Error('activityId is required!');
        }
        await this.sendMessage(activityId, {
            type: types_1.SearchSyncWorkerQueueMessageType.SYNC_ACTIVITY,
            activityId,
        }, activityId);
    }
    async triggerTenantActivitiesSync(tenantId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        await this.sendMessage(tenantId, {
            type: types_1.SearchSyncWorkerQueueMessageType.SYNC_TENANT_ACTIVITIES,
            tenantId,
        });
    }
    async triggerOrganizationActivitiesSync(organizationId) {
        if (!organizationId) {
            throw new Error('organizationId is required!');
        }
        await this.sendMessage(organizationId, {
            type: types_1.SearchSyncWorkerQueueMessageType.SYNC_ORGANIZATION_ACTIVITIES,
            organizationId,
        });
    }
    async triggerRemoveActivity(tenantId, activityId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        if (!activityId) {
            throw new Error('activityId is required!');
        }
        await this.sendMessage(activityId, {
            type: types_1.SearchSyncWorkerQueueMessageType.REMOVE_ACTIVITY,
            activityId,
        });
    }
    async triggerActivityCleanup(tenantId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        await this.sendMessage(tenantId, {
            type: types_1.SearchSyncWorkerQueueMessageType.CLEANUP_TENANT_ACTIVITIES,
            tenantId,
        });
    }
    async triggerOrganizationSync(tenantId, organizationId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        if (!organizationId) {
            throw new Error('organizationId is required!');
        }
        await this.sendMessage(organizationId, {
            type: types_1.SearchSyncWorkerQueueMessageType.SYNC_ORGANIZATION,
            organizationId,
        }, organizationId);
    }
    async triggerTenantOrganizationSync(tenantId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        await this.sendMessage(tenantId, {
            type: types_1.SearchSyncWorkerQueueMessageType.SYNC_TENANT_ORGANIZATIONS,
            tenantId,
        }, tenantId);
    }
    async triggerRemoveOrganization(tenantId, organizationId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        if (!organizationId) {
            throw new Error('organizationId is required!');
        }
        await this.sendMessage(organizationId, {
            type: types_1.SearchSyncWorkerQueueMessageType.REMOVE_ORGANIZATION,
            organizationId,
        });
    }
    async triggerOrganizationCleanup(tenantId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        await this.sendMessage(tenantId, {
            type: types_1.SearchSyncWorkerQueueMessageType.CLEANUP_TENANT_ORGANIZATIONS,
            tenantId,
        }, tenantId);
    }
}
exports.SearchSyncWorkerEmitter = SearchSyncWorkerEmitter;
//# sourceMappingURL=searchSyncWorker.js.map