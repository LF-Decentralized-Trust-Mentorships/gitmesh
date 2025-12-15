"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const opensearch_1 = require("@gitmesh/opensearch");
const sqs_1 = require("@gitmesh/sqs");
const types_1 = require("@gitmesh/types");
const apiClients_1 = require("../utils/apiClients");
const serviceSQS_1 = require("@/serverless/utils/serviceSQS");
const isFeatureEnabled_1 = __importDefault(require("@/feature-flags/isFeatureEnabled"));
const conf_1 = require("@/conf");
class SearchSyncService extends logging_1.LoggerBase {
    constructor(options, mode = types_1.SyncMode.USE_FEATURE_FLAG) {
        super(options.log);
        this.options = options;
        this.mode = mode;
    }
    async getSearchSyncClient() {
        // tests can always use the async emitter
        if (conf_1.IS_TEST_ENV) {
            return (0, serviceSQS_1.getSearchSyncWorkerEmitter)();
        }
        if (this.mode === types_1.SyncMode.SYNCHRONOUS) {
            return (0, apiClients_1.getSearchSyncApiClient)();
        }
        if (this.mode === types_1.SyncMode.ASYNCHRONOUS) {
            return (0, serviceSQS_1.getSearchSyncWorkerEmitter)();
        }
        if (this.mode === types_1.SyncMode.USE_FEATURE_FLAG) {
            if (await (0, isFeatureEnabled_1.default)(types_1.FeatureFlag.SYNCHRONOUS_OPENSEARCH_UPDATES, this.options)) {
                return (0, apiClients_1.getSearchSyncApiClient)();
            }
            return (0, serviceSQS_1.getSearchSyncWorkerEmitter)();
        }
        throw new Error(`Unknown mode ${this.mode} !`);
    }
    async triggerMemberSync(tenantId, memberId) {
        const client = await this.getSearchSyncClient();
        if (client instanceof opensearch_1.SearchSyncApiClient) {
            await client.triggerMemberSync(memberId);
        }
        else if (client instanceof sqs_1.SearchSyncWorkerEmitter) {
            await client.triggerMemberSync(tenantId, memberId);
        }
        else {
            throw new Error('Unexpected search client type!');
        }
    }
    async triggerTenantMembersSync(tenantId) {
        const client = await this.getSearchSyncClient();
        if (client instanceof opensearch_1.SearchSyncApiClient || client instanceof sqs_1.SearchSyncWorkerEmitter) {
            await client.triggerTenantMembersSync(tenantId);
        }
        else {
            throw new Error('Unexpected search client type!');
        }
    }
    async triggerOrganizationMembersSync(organizationId) {
        const client = await this.getSearchSyncClient();
        if (client instanceof opensearch_1.SearchSyncApiClient || client instanceof sqs_1.SearchSyncWorkerEmitter) {
            await client.triggerOrganizationMembersSync(organizationId);
        }
        else {
            throw new Error('Unexpected search client type!');
        }
    }
    async triggerRemoveMember(tenantId, memberId) {
        const client = await this.getSearchSyncClient();
        if (client instanceof opensearch_1.SearchSyncApiClient) {
            await client.triggerRemoveMember(memberId);
        }
        else if (client instanceof sqs_1.SearchSyncWorkerEmitter) {
            await client.triggerRemoveMember(tenantId, memberId);
        }
        else {
            throw new Error('Unexpected search client type!');
        }
    }
    async triggerMemberCleanup(tenantId) {
        const client = await this.getSearchSyncClient();
        if (client instanceof opensearch_1.SearchSyncApiClient || client instanceof sqs_1.SearchSyncWorkerEmitter) {
            await client.triggerMemberCleanup(tenantId);
        }
        else {
            throw new Error('Unexpected search client type!');
        }
    }
    async triggerActivitySync(tenantId, activityId) {
        const client = await this.getSearchSyncClient();
        if (client instanceof opensearch_1.SearchSyncApiClient) {
            await client.triggerActivitySync(activityId);
        }
        else if (client instanceof sqs_1.SearchSyncWorkerEmitter) {
            await client.triggerActivitySync(tenantId, activityId);
        }
        else {
            throw new Error('Unexpected search client type!');
        }
    }
    async triggerTenantActivitiesSync(tenantId) {
        const client = await this.getSearchSyncClient();
        if (client instanceof opensearch_1.SearchSyncApiClient || client instanceof sqs_1.SearchSyncWorkerEmitter) {
            await client.triggerTenantActivitiesSync(tenantId);
        }
        else {
            throw new Error('Unexpected search client type!');
        }
    }
    async triggerOrganizationActivitiesSync(organizationId) {
        const client = await this.getSearchSyncClient();
        if (client instanceof opensearch_1.SearchSyncApiClient || client instanceof sqs_1.SearchSyncWorkerEmitter) {
            await client.triggerOrganizationActivitiesSync(organizationId);
        }
        else {
            throw new Error('Unexpected search client type!');
        }
    }
    async triggerRemoveActivity(tenantId, activityId) {
        const client = await this.getSearchSyncClient();
        if (client instanceof opensearch_1.SearchSyncApiClient) {
            await client.triggerRemoveActivity(activityId);
        }
        else if (client instanceof sqs_1.SearchSyncWorkerEmitter) {
            await client.triggerRemoveActivity(tenantId, activityId);
        }
        else {
            throw new Error('Unexpected search client type!');
        }
    }
    async triggerActivityCleanup(tenantId) {
        const client = await this.getSearchSyncClient();
        if (client instanceof opensearch_1.SearchSyncApiClient || client instanceof sqs_1.SearchSyncWorkerEmitter) {
            await client.triggerActivityCleanup(tenantId);
        }
        else {
            throw new Error('Unexpected search client type!');
        }
    }
    async triggerOrganizationSync(tenantId, organizationId) {
        const client = await this.getSearchSyncClient();
        if (client instanceof opensearch_1.SearchSyncApiClient) {
            await client.triggerOrganizationSync(organizationId);
        }
        else if (client instanceof sqs_1.SearchSyncWorkerEmitter) {
            await client.triggerOrganizationSync(tenantId, organizationId);
        }
        else {
            throw new Error('Unexpected search client type!');
        }
    }
    async triggerTenantOrganizationSync(tenantId) {
        const client = await this.getSearchSyncClient();
        if (client instanceof opensearch_1.SearchSyncApiClient || client instanceof sqs_1.SearchSyncWorkerEmitter) {
            await client.triggerTenantOrganizationSync(tenantId);
        }
        else {
            throw new Error('Unexpected search client type!');
        }
    }
    async triggerRemoveOrganization(tenantId, organizationId) {
        const client = await this.getSearchSyncClient();
        if (client instanceof opensearch_1.SearchSyncApiClient) {
            await client.triggerRemoveOrganization(organizationId);
        }
        else if (client instanceof sqs_1.SearchSyncWorkerEmitter) {
            await client.triggerRemoveOrganization(tenantId, organizationId);
        }
        else {
            throw new Error('Unexpected search client type!');
        }
    }
    async triggerOrganizationCleanup(tenantId) {
        const client = await this.getSearchSyncClient();
        if (client instanceof opensearch_1.SearchSyncApiClient || client instanceof sqs_1.SearchSyncWorkerEmitter) {
            await client.triggerOrganizationCleanup(tenantId);
        }
        else {
            throw new Error('Unexpected search client type!');
        }
    }
}
exports.default = SearchSyncService;
//# sourceMappingURL=searchSyncService.js.map