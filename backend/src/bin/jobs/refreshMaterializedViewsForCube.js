"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const sequelize_1 = require("sequelize");
const databaseConnection_1 = require("../../database/databaseConnection");
function createRefreshQuery(view) {
    return `REFRESH MATERIALIZED VIEW CONCURRENTLY "${view}"`;
}
const job = {
    name: 'Refresh Materialized View For Cube',
    cronTime: '1,31 * * * *',
    onTrigger: async (log) => {
        try {
            // initialize database with 15 minutes query timeout
            const forceNewDbInstance = true;
            const database = await (0, databaseConnection_1.databaseInit)(1000 * 60 * 15, forceNewDbInstance);
            const materializedViews = [
                'mv_members_cube',
                'mv_activities_cube',
                'mv_organizations_cube',
                'mv_segments_cube',
            ];
            for (const view of materializedViews) {
                const refreshQuery = createRefreshQuery(view);
                const runningQuery = await database.sequelize.query(`
            SELECT 1
            FROM pg_stat_activity
            WHERE query = :refreshQuery
              AND state != 'idle'
              AND pid != pg_backend_pid()
          `, {
                    replacements: {
                        refreshQuery,
                    },
                    type: sequelize_1.QueryTypes.SELECT,
                    useMaster: true,
                });
                if (runningQuery.length > 0) {
                    log.warn(`Materialized views for cube will not be refreshed because there's already an ongoing refresh of ${view}!`);
                    return;
                }
            }
            for (const view of materializedViews) {
                const refreshQuery = createRefreshQuery(view);
                await (0, logging_1.logExecutionTimeV2)(() => database.sequelize.query(refreshQuery, {
                    useMaster: true,
                }), log, `Refresh Materialized View ${view}`);
            }
        }
        catch (e) {
            log.error({ error: e }, `Error while refreshing materialized views!`);
        }
    },
};
exports.default = job;
//# sourceMappingURL=refreshMaterializedViewsForCube.js.map