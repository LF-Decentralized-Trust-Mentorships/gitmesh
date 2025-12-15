import { DbColumnSet, DbStore, RepositoryBase } from '@gitmesh/database'
import { Logger } from '@gitmesh/logging'
import { getSelectIntegrationColumnSet, IDbIntegration } from '../repo/integration.data'

export default class IntegrationRepository extends RepositoryBase<IntegrationRepository> {
  private readonly selectIntegrationColumnSet: DbColumnSet

  constructor(dbStore: DbStore, parentLog: Logger) {
    super(dbStore, parentLog)

    this.selectIntegrationColumnSet = getSelectIntegrationColumnSet(this.dbInstance)
  }

  public async findById(id: string): Promise<IDbIntegration | null> {
    return await this.db().oneOrNone(
      `
        SELECT ${this.selectIntegrationColumnSet.columns.map((c) => `"${c.name}"`).join(', ')}
        FROM "integrations"
        WHERE id = $(id)
      `,
      { id },
    )
  }
}
