import { DbStore, RepositoryBase } from '@gitmesh/database'
import { Logger } from '@gitmesh/logging'
import { IAutomationExecution } from '@gitmesh/types'
import { generateUUIDv1 as uuid } from '@gitmesh/common'

export class AutomationExecutionRepository extends RepositoryBase<AutomationExecutionRepository> {
  constructor(dbStore: DbStore, parentLog: Logger) {
    super(dbStore, parentLog)
  }

  public async addExecution(data: IAutomationExecution): Promise<void> {
    await this.db().none(
      `insert into "automationExecutions" ("id", "automationId", "type", "tenantId", "trigger", "state", "error", "executedAt", "eventId", "payload")
        values
            ($(id), $(automationId), $(type), $(tenantId), $(trigger), $(state), $(error), now(), $(eventId), $(payload))`,
      {
        id: uuid(),
        automationId: data.automationId,
        type: data.type,
        tenantId: data.tenantId,
        trigger: data.trigger,
        state: data.state,
        error: data.error || null,
        eventId: data.eventId || uuid(),
        payload: JSON.stringify(data.payload) || JSON.stringify({}),
      },
    )
  }
}
