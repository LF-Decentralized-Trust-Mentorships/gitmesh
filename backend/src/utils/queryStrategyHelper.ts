/**
 * Query Strategy Helper - Permanent solution for manual item visibility
 * 
 * This utility provides consistent query strategy logic across all services.
 * It ensures manually created items are always visible by forcing database queries
 * when manual items exist, preventing OpenSearch sync delay issues.
 */

import { IServiceOptions } from '../services/IServiceOptions'

// Use any type for logger to avoid winston dependency issues
type Logger = any

export interface QueryStrategyOptions {
  tableName: string
  tenantId: string
  database: any
  logger: Logger
}

export interface QueryResult {
  count: number
  rows: any[]
}

/**
 * Determines if database query should be used instead of OpenSearch
 * Returns true if manual items exist, forcing database query for instant visibility
 */
export async function shouldUseDatabaseQuery(
  options: QueryStrategyOptions
): Promise<{ useDatabase: boolean; manualCount: number }> {
  const { tableName, tenantId, database, logger } = options
  
  try {
    const manualItemsCheck = await database.sequelize.query(
      `SELECT COUNT(*) as count FROM ${tableName} 
       WHERE "tenantId" = :tenantId 
       AND "deletedAt" IS NULL 
       AND "manuallyCreated" = true`,
      {
        replacements: { tenantId },
        type: database.Sequelize.QueryTypes.SELECT,
      }
    )
    
    const manualCount = parseInt(manualItemsCheck[0]?.count || '0', 10)
    const useDatabase = manualCount > 0
    
    if (useDatabase) {
      logger.info(
        { 
          tableName,
          manualItemsCount: manualCount 
        }, 
        'Manual items detected - using database query for guaranteed visibility'
      )
    }
    
    return { useDatabase, manualCount }
  } catch (error) {
    logger.error({ error, tableName }, 'Failed to check for manual items, defaulting to database query')
    return { useDatabase: true, manualCount: 0 }
  }
}

/**
 * Ensures query result count matches actual rows returned
 * Fixes common count mismatch issues in database queries
 */
export function normalizeQueryResult(
  result: QueryResult,
  logger: Logger,
  context: string = 'query'
): QueryResult {
  if (!result || typeof result !== 'object') {
    logger.warn({ result }, 'Invalid query result structure')
    return { count: 0, rows: [] }
  }
  
  const actualRows = Array.isArray(result.rows) ? result.rows : []
  const reportedCount = parseInt(result.count?.toString() || '0', 10)
  
  if (reportedCount !== actualRows.length) {
    logger.warn(
      { 
        context,
        originalCount: reportedCount, 
        actualRows: actualRows.length 
      }, 
      'Count mismatch detected - correcting to match actual data'
    )
    
    return {
      count: actualRows.length,
      rows: actualRows
    }
  }
  
  logger.info(
    { 
      context,
      count: actualRows.length, 
      rowsLength: actualRows.length 
    }, 
    'Query result validated'
  )
  
  return result
}

/**
 * Creates a unified query strategy that handles OpenSearch/Database fallback
 * with permanent manual item visibility and count normalization
 */
export class UnifiedQueryStrategy {
  constructor(
    private options: IServiceOptions,
    private tableName: string,
    private logger: Logger
  ) {}
  
  async executeQuery<T>(
    opensearchQuery: () => Promise<QueryResult>,
    databaseQuery: () => Promise<QueryResult>,
    context: string = 'query'
  ): Promise<QueryResult> {
    // Check if we should use database query for manual items
    const { useDatabase, manualCount } = await shouldUseDatabaseQuery({
      tableName: this.tableName,
      tenantId: this.options.currentTenant.id,
      database: this.options.database,
      logger: this.logger
    })
    
    let result: QueryResult
    
    if (useDatabase) {
      this.logger.info({ context, manualCount }, 'Using database query for manual items')
      result = await databaseQuery()
    } else {
      try {
        this.logger.info({ context }, 'Attempting OpenSearch query')
        result = await opensearchQuery()
        return result // OpenSearch results are typically already normalized
      } catch (error) {
        this.logger.warn({ error, context }, 'OpenSearch query failed, falling back to database')
        result = await databaseQuery()
      }
    }
    
    // Normalize database query results
    return normalizeQueryResult(result, this.logger, context)
  }
}

export default {
  shouldUseDatabaseQuery,
  normalizeQueryResult,
  UnifiedQueryStrategy
}