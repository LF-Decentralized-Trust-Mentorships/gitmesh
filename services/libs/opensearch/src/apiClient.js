"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchSyncApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
class SearchSyncApiClient {
    constructor(config) {
        this.searchSyncApi = axios_1.default.create({
            baseURL: config.baseUrl,
        });
    }
    async triggerMemberSync(memberId) {
        if (!memberId) {
            throw new Error('memberId is required!');
        }
        await this.searchSyncApi.post('/sync/members', {
            memberIds: [memberId],
        });
    }
    async triggerTenantMembersSync(tenantId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        await this.searchSyncApi.post('/sync/tenant/members', {
            tenantId,
        });
    }
    async triggerOrganizationMembersSync(organizationId) {
        if (!organizationId) {
            throw new Error('organizationId is required!');
        }
        await this.searchSyncApi.post('/sync/organization/members', {
            organizationId,
        });
    }
    async triggerRemoveMember(memberId) {
        if (!memberId) {
            throw new Error('memberId is required!');
        }
        await this.searchSyncApi.post('/cleanup/member', {
            memberId,
        });
    }
    async triggerMemberCleanup(tenantId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        await this.searchSyncApi.post('/cleanup/tenant/members', {
            tenantId,
        });
    }
    async triggerActivitySync(activityId) {
        if (!activityId) {
            throw new Error('activityId is required!');
        }
        await this.searchSyncApi.post('/sync/activities', {
            activityIds: [activityId],
        });
    }
    async triggerTenantActivitiesSync(tenantId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        await this.searchSyncApi.post('/sync/tenant/activities', {
            tenantId,
        });
    }
    async triggerOrganizationActivitiesSync(organizationId) {
        if (!organizationId) {
            throw new Error('organizationId is required!');
        }
        await this.searchSyncApi.post('/sync/organization/activities', {
            organizationId,
        });
    }
    async triggerRemoveActivity(activityId) {
        if (!activityId) {
            throw new Error('activityId is required!');
        }
        await this.searchSyncApi.post('/cleanup/activity', {
            activityId,
        });
    }
    async triggerActivityCleanup(tenantId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        await this.searchSyncApi.post('/cleanup/tenant/activities', {
            tenantId,
        });
    }
    async triggerOrganizationSync(organizationId) {
        if (!organizationId) {
            throw new Error('organizationId is required!');
        }
        await this.searchSyncApi.post('/sync/organizations', {
            organizationIds: [organizationId],
        });
    }
    async triggerTenantOrganizationSync(tenantId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        await this.searchSyncApi.post('/sync/tenant/organizations', {
            tenantId,
        });
    }
    async triggerRemoveOrganization(organizationId) {
        if (!organizationId) {
            throw new Error('organizationId is required!');
        }
        await this.searchSyncApi.post('/cleanup/organization', {
            organizationId,
        });
    }
    async triggerOrganizationCleanup(tenantId) {
        if (!tenantId) {
            throw new Error('tenantId is required!');
        }
        await this.searchSyncApi.post('/cleanup/tenant/organizations', {
            tenantId,
        });
    }
}
exports.SearchSyncApiClient = SearchSyncApiClient;
//# sourceMappingURL=apiClient.js.map