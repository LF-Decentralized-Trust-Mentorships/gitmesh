"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentRepository = void 0;
const database_1 = require("@gitmesh/database");
class SegmentRepository extends database_1.RepositoryBase {
    constructor(dbStore, parentLog) {
        super(dbStore, parentLog);
    }
    async getParentSegmentIds(childSegmentIds) {
        const results = await this.db().any(`
      select s.id, pd.id as "parentId", gpd.id as "grandParentId"
      from segments s
              inner join segments pd
                          on pd."tenantId" = s."tenantId" and pd.slug = s."parentSlug" and pd."grandparentSlug" is null and
                            pd."parentSlug" is not null
              inner join segments gpd on gpd."tenantId" = s."tenantId" and gpd.slug = s."grandparentSlug" and
                                          gpd."grandparentSlug" is null and gpd."parentSlug" is null
      where s.id in ($(childSegmentIds:csv));
      `, {
            childSegmentIds,
        });
        return results;
    }
}
exports.SegmentRepository = SegmentRepository;
//# sourceMappingURL=segment.repo.js.map