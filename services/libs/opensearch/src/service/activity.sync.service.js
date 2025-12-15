"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivitySyncService = void 0;
const activity_repo_1 = require("../repo/activity.repo");
const types_1 = require("../types");
const common_1 = require("@gitmesh/common");
const logging_1 = require("@gitmesh/logging");
class ActivitySyncService {
    constructor(store, openSearchService, parentLog) {
        this.openSearchService = openSearchService;
        this.log = (0, logging_1.getChildLogger)('activity-sync-service', parentLog);
        this.activityRepo = new activity_repo_1.ActivityRepository(store, this.log);
    }
    async getAllIndexedTenantIds(pageSize = 500, afterKey) {
        var _a;
        const include = ['uuid_tenantId'];
        const results = await this.openSearchService.search(types_1.OpenSearchIndex.ACTIVITIES, undefined, {
            uuid_tenantId_buckets: {
                composite: {
                    size: pageSize,
                    sources: [
                        {
                            uuid_tenantId: {
                                terms: {
                                    field: 'uuid_tenantId',
                                },
                            },
                        },
                    ],
                    after: afterKey
                        ? {
                            uuid_tenantId: afterKey,
                        }
                        : undefined,
                },
            },
        }, undefined, undefined, undefined, include);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = results.uuid_tenantId_buckets;
        const newAfterKey = (_a = data.after_key) === null || _a === void 0 ? void 0 : _a.uuid_tenantId;
        const ids = data.buckets.map((b) => b.key.uuid_tenantId);
        return {
            data: ids,
            afterKey: newAfterKey,
        };
    }
    async cleanupActivityIndex(tenantId) {
        this.log.warn({ tenantId }, 'Cleaning up activity index!');
        const query = {
            bool: {
                filter: {
                    term: {
                        uuid_tenantId: tenantId,
                    },
                },
            },
        };
        const sort = [{ date_timestamp: 'asc' }];
        const include = ['date_timestamp'];
        const pageSize = 500;
        let lastTimestamp;
        let results = (await this.openSearchService.search(types_1.OpenSearchIndex.ACTIVITIES, query, undefined, pageSize, sort, undefined, include));
        let processed = 0;
        while (results.length > 0) {
            // check every activity if they exists in the database and if not remove them from the index
            const ids = results.map((r) => r._id);
            const dbIds = await this.activityRepo.checkActivitiesExist(tenantId, ids);
            const toRemove = ids.filter((id) => !dbIds.includes(id));
            if (toRemove.length > 0) {
                this.log.warn({ tenantId, toRemove }, 'Removing activities from index!');
                for (const id of toRemove) {
                    await this.removeActivity(id);
                }
            }
            processed += results.length;
            this.log.warn({ tenantId }, `Processed ${processed} activities while cleaning up tenant!`);
            // use last joinedAt to get the next page
            lastTimestamp = results[results.length - 1]._source.date_timestamp;
            results = (await this.openSearchService.search(types_1.OpenSearchIndex.ACTIVITIES, query, undefined, pageSize, sort, lastTimestamp, include));
        }
        this.log.warn({ tenantId }, `Processed total of ${processed} members while cleaning up tenant!`);
    }
    async syncTenantActivities(tenantId, batchSize = 200) {
        this.log.debug({ tenantId }, 'Syncing all tenant activities!');
        let count = 0;
        const now = new Date();
        const cutoffDate = now.toISOString();
        await (0, logging_1.logExecutionTime)(async () => {
            let activityIds = await this.activityRepo.getTenantActivitiesForSync(tenantId, batchSize);
            while (activityIds.length > 0) {
                count += await this.syncActivities(activityIds);
                const diffInSeconds = (new Date().getTime() - now.getTime()) / 1000;
                this.log.info({ tenantId }, `Synced ${count} activities! Speed: ${Math.round(count / diffInSeconds)} activities/second!`);
                activityIds = await this.activityRepo.getTenantActivitiesForSync(tenantId, batchSize, activityIds[activityIds.length - 1]);
            }
            activityIds = await this.activityRepo.getRemainingTenantActivitiesForSync(tenantId, 1, batchSize, cutoffDate);
            while (activityIds.length > 0) {
                count += await this.syncActivities(activityIds);
                const diffInSeconds = (new Date().getTime() - now.getTime()) / 1000;
                this.log.info({ tenantId }, `Synced ${count} activities! Speed: ${Math.round(count / diffInSeconds)} activities/second!`);
                activityIds = await this.activityRepo.getRemainingTenantActivitiesForSync(tenantId, 1, batchSize, cutoffDate);
            }
        }, this.log, 'sync-tenant-activities');
        this.log.info({ tenantId }, `Synced total of ${count} activities!`);
    }
    async syncOrganizationActivities(organizationId, batchSize = 200) {
        this.log.debug({ organizationId }, 'Syncing all organization activities!');
        let count = 0;
        const now = new Date();
        await (0, logging_1.logExecutionTime)(async () => {
            let activityIds = await this.activityRepo.getOrganizationActivitiesForSync(organizationId, batchSize);
            while (activityIds.length > 0) {
                count += await this.syncActivities(activityIds);
                const diffInSeconds = (new Date().getTime() - now.getTime()) / 1000;
                this.log.info({ organizationId }, `Synced ${count} activities! Speed: ${Math.round(count / diffInSeconds)} activities/second!`);
                activityIds = await this.activityRepo.getOrganizationActivitiesForSync(organizationId, batchSize, activityIds[activityIds.length - 1]);
            }
        }, this.log, 'sync-organization-activities');
        this.log.info({ organizationId }, `Synced total of ${count} activities!`);
    }
    async removeActivity(activityId) {
        this.log.debug({ activityId }, 'Removing activity from index!');
        await this.openSearchService.removeFromIndex(activityId, types_1.OpenSearchIndex.ACTIVITIES);
    }
    async syncActivities(activityIds) {
        this.log.debug({ activityIds }, 'Syncing activities!');
        const activities = await this.activityRepo.getActivityData(activityIds);
        if (activities.length > 0) {
            await this.openSearchService.bulkIndex(types_1.OpenSearchIndex.ACTIVITIES, activities.map((m) => {
                return {
                    id: m.id,
                    body: ActivitySyncService.prefixData(m),
                };
            }));
            await this.activityRepo.markSynced(activities.map((m) => m.id));
        }
        return activities.length;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static prefixData(data) {
        var _a;
        const p = {};
        p.uuid_id = data.id;
        p.uuid_tenantId = data.tenantId;
        p.uuid_segmentId = data.segmentId;
        p.keyword_type = data.type;
        p.date_timestamp = new Date(data.timestamp).toISOString();
        p.keyword_platform = data.platform;
        p.bool_isContribution = data.isContribution;
        p.int_score = (_a = data.score) !== null && _a !== void 0 ? _a : 0;
        p.keyword_sourceId = data.sourceId;
        p.keyword_sourceParentId = data.sourceParentId;
        p.string_attributes = data.attributes ? JSON.stringify(data.attributes) : '{}';
        p.keyword_channel = data.channel;
        p.string_body = (0, common_1.trimUtf8ToMaxByteLength)(data.body, ActivitySyncService.MAX_BYTE_LENGTH);
        p.string_title = data.title;
        p.string_url = data.url;
        p.int_sentiment = data.sentiment;
        p.keyword_importHash = data.importHash;
        p.uuid_memberId = data.memberId;
        p.uuid_conversationId = data.conversationId;
        p.uuid_parentId = data.parentId;
        p.string_username = data.username;
        p.uuid_objectMemberId = data.objectMemberId;
        p.string_objectMemberUsername = data.objectMemberUsername;
        return p;
    }
}
exports.ActivitySyncService = ActivitySyncService;
ActivitySyncService.MAX_BYTE_LENGTH = 25000;
//# sourceMappingURL=activity.sync.service.js.map