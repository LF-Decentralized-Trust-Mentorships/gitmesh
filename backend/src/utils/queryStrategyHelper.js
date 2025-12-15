"use strict";
/**
 * Query Strategy Helper - Permanent solution for manual item visibility
 *
 * This utility provides consistent query strategy logic across all services.
 * It ensures manually created items are always visible by forcing database queries
 * when manual items exist, preventing OpenSearch sync delay issues.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedQueryStrategy = exports.normalizeQueryResult = exports.shouldUseDatabaseQuery = void 0;
/**
 * Determines if database query should be used instead of OpenSearch
 * Returns true if manual items exist, forcing database query for instant visibility
 */
async function shouldUseDatabaseQuery(options) {
    var _a;
    const { tableName, tenantId, database, logger } = options;
    try {
        const manualItemsCheck = await database.sequelize.query(`SELECT COUNT(*) as count FROM ${tableName} 
       WHERE "tenantId" = :tenantId 
       AND "deletedAt" IS NULL 
       AND "manuallyCreated" = true`, {
            replacements: { tenantId },
            type: database.Sequelize.QueryTypes.SELECT,
        });
        const manualCount = parseInt(((_a = manualItemsCheck[0]) === null || _a === void 0 ? void 0 : _a.count) || '0', 10);
        const useDatabase = manualCount > 0;
        if (useDatabase) {
            logger.info({
                tableName,
                manualItemsCount: manualCount
            }, 'Manual items detected - using database query for guaranteed visibility');
        }
        return { useDatabase, manualCount };
    }
    catch (error) {
        logger.error({ error, tableName }, 'Failed to check for manual items, defaulting to database query');
        return { useDatabase: true, manualCount: 0 };
    }
}
exports.shouldUseDatabaseQuery = shouldUseDatabaseQuery;
/**
 * Ensures query result count matches actual rows returned
 * Fixes common count mismatch issues in database queries
 */
function normalizeQueryResult(result, logger, context = 'query') {
    var _a;
    if (!result || typeof result !== 'object') {
        logger.warn({ result }, 'Invalid query result structure');
        return { count: 0, rows: [] };
    }
    const actualRows = Array.isArray(result.rows) ? result.rows : [];
    const reportedCount = parseInt(((_a = result.count) === null || _a === void 0 ? void 0 : _a.toString()) || '0', 10);
    if (reportedCount !== actualRows.length) {
        logger.warn({
            context,
            originalCount: reportedCount,
            actualRows: actualRows.length
        }, 'Count mismatch detected - correcting to match actual data');
        return {
            count: actualRows.length,
            rows: actualRows
        };
    }
    logger.info({
        context,
        count: actualRows.length,
        rowsLength: actualRows.length
    }, 'Query result validated');
    return result;
}
exports.normalizeQueryResult = normalizeQueryResult;
/**
 * Creates a unified query strategy that handles OpenSearch/Database fallback
 * with permanent manual item visibility and count normalization
 */
class UnifiedQueryStrategy {
    constructor(options, tableName, logger) {
        this.options = options;
        this.tableName = tableName;
        this.logger = logger;
    }
    async executeQuery(opensearchQuery, databaseQuery, context = 'query') {
        // Check if we should use database query for manual items
        const { useDatabase, manualCount } = await shouldUseDatabaseQuery({
            tableName: this.tableName,
            tenantId: this.options.currentTenant.id,
            database: this.options.database,
            logger: this.logger
        });
        let result;
        if (useDatabase) {
            this.logger.info({ context, manualCount }, 'Using database query for manual items');
            result = await databaseQuery();
        }
        else {
            try {
                this.logger.info({ context }, 'Attempting OpenSearch query');
                result = await opensearchQuery();
                return result; // OpenSearch results are typically already normalized
            }
            catch (error) {
                this.logger.warn({ error, context }, 'OpenSearch query failed, falling back to database');
                result = await databaseQuery();
            }
        }
        // Normalize database query results
        return normalizeQueryResult(result, this.logger, context);
    }
}
exports.UnifiedQueryStrategy = UnifiedQueryStrategy;
exports.default = {
    shouldUseDatabaseQuery,
    normalizeQueryResult,
    UnifiedQueryStrategy
};
//# sourceMappingURL=queryStrategyHelper.js.map