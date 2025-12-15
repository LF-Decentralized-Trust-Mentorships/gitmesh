"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchSyncWorkerQueueMessageType = void 0;
var SearchSyncWorkerQueueMessageType;
(function (SearchSyncWorkerQueueMessageType) {
    SearchSyncWorkerQueueMessageType["SYNC_MEMBER"] = "sync_member";
    SearchSyncWorkerQueueMessageType["SYNC_TENANT_MEMBERS"] = "sync_tenant_members";
    SearchSyncWorkerQueueMessageType["SYNC_ORGANIZATION_MEMBERS"] = "sync_organization_members";
    SearchSyncWorkerQueueMessageType["REMOVE_MEMBER"] = "remove_member";
    SearchSyncWorkerQueueMessageType["CLEANUP_TENANT_MEMBERS"] = "cleanup_tenant_members";
    SearchSyncWorkerQueueMessageType["SYNC_ACTIVITY"] = "sync_activity";
    SearchSyncWorkerQueueMessageType["SYNC_TENANT_ACTIVITIES"] = "sync_tenant_activities";
    SearchSyncWorkerQueueMessageType["SYNC_ORGANIZATION_ACTIVITIES"] = "sync_organization_activities";
    SearchSyncWorkerQueueMessageType["REMOVE_ACTIVITY"] = "remove_activity";
    SearchSyncWorkerQueueMessageType["CLEANUP_TENANT_ACTIVITIES"] = "cleanup_tenant_activities";
    SearchSyncWorkerQueueMessageType["SYNC_ORGANIZATION"] = "sync_organization";
    SearchSyncWorkerQueueMessageType["SYNC_TENANT_ORGANIZATIONS"] = "sync_tenant_organizations";
    SearchSyncWorkerQueueMessageType["REMOVE_ORGANIZATION"] = "remove_organization";
    SearchSyncWorkerQueueMessageType["CLEANUP_TENANT_ORGANIZATIONS"] = "cleanup_tenant_organizations";
})(SearchSyncWorkerQueueMessageType || (exports.SearchSyncWorkerQueueMessageType = SearchSyncWorkerQueueMessageType = {}));
//# sourceMappingURL=index.js.map