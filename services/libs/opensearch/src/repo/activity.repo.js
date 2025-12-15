"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityRepository = void 0;
const database_1 = require("@gitmesh/database");
class ActivityRepository extends database_1.RepositoryBase {
    constructor(dbStore, parentLog) {
        super(dbStore, parentLog);
    }
    async getActivityData(activityIds) {
        const results = await this.db().any(`
      select id,
            "tenantId",
            "segmentId",
            type,
            timestamp,
            platform,
            "isContribution",
            score,
            "sourceId",
            "sourceParentId",
            attributes,
            channel,
            body,
            title,
            url,
            (sentiment -> 'sentiment')::int as sentiment,
            "importHash",
            "memberId",
            "conversationId",
            "parentId",
            username,
            "objectMemberId",
            "objectMemberUsername"
      from activities where id in ($(activityIds:csv)) and "deletedAt" is null
    `, {
            activityIds,
        });
        return results;
    }
    async checkActivitiesExist(tenantId, activityIds) {
        const results = await this.db().any(`
      select id from activities where "tenantId" = $(tenantId) and id in ($(activityIds:csv)) and "deletedAt" is null
    `, {
            tenantId,
            activityIds,
        });
        return results.map((r) => r.id);
    }
    async markSynced(activityIds) {
        await this.db().none(`update activities set "searchSyncedAt" = now() where id in ($(activityIds:csv))`, {
            activityIds,
        });
    }
    async getTenantActivitiesForSync(tenantId, perPage, lastId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let results;
        if (lastId) {
            results = await this.db().any(`
      select id from activities 
      where "tenantId" = $(tenantId) and "deletedAt" is null and id > $(lastId)
      order by id
      limit ${perPage};
      `, {
                tenantId,
                lastId,
            });
        }
        else {
            results = await this.db().any(`
      select id from activities 
      where "tenantId" = $(tenantId) and "deletedAt" is null
      order by id
      limit ${perPage};
      `, {
                tenantId,
            });
        }
        return results.map((r) => r.id);
    }
    async getOrganizationActivitiesForSync(organizationId, perPage, lastId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let results;
        if (lastId) {
            results = await this.db().any(`
      select id from activities 
      where "organizationId" = $(organizationId) and "deletedAt" is null and id > $(lastId)
      order by id
      limit ${perPage};
      `, {
                organizationId,
                lastId,
            });
        }
        else {
            results = await this.db().any(`
      select id from activities 
      where "organizationId" = $(organizationId) and "deletedAt" is null
      order by id
      limit ${perPage};
      `, {
                organizationId,
            });
        }
        return results.map((r) => r.id);
    }
    async getRemainingTenantActivitiesForSync(tenantId, page, perPage, cutoffDate) {
        const results = await this.db().any(`
      select id from activities 
      where "tenantId" = $(tenantId) and "deletedAt" is null
       and (
        "searchSyncedAt" is null or
        "searchSyncedAt" < $(cutoffDate)
       )
      limit ${perPage} offset ${(page - 1) * perPage};
      `, {
            tenantId,
            cutoffDate,
        });
        return results.map((r) => r.id);
    }
    async getTenantIds() {
        const results = await this.db().any(`select "tenantId" 
       from activities
        where "deletedAt" is null
       group by "tenantId"
       order by count(id) asc`);
        return results.map((r) => r.tenantId);
    }
}
exports.ActivityRepository = ActivityRepository;
//# sourceMappingURL=activity.repo.js.map