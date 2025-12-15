import { DB_CONFIG, SQS_CONFIG } from '../conf'
import { DbStore, getDbConnection } from '@gitmesh/database'
import { getServiceTracer } from '@gitmesh/tracing'
import { getServiceLogger } from '@gitmesh/logging'
import { IntegrationRunWorkerEmitter, getSqsClient } from '@gitmesh/sqs'
import IntegrationRunRepository from '../repo/integrationRun.repo'
import { IntegrationState } from '@gitmesh/types'

const tracer = getServiceTracer()
const log = getServiceLogger()

const processArguments = process.argv.slice(2)

const parameter = processArguments[0]
const isOnboarding = processArguments[1] ? processArguments[1] === 'true' : true

setImmediate(async () => {
  const sqsClient = getSqsClient(SQS_CONFIG())
  const emitter = new IntegrationRunWorkerEmitter(sqsClient, tracer, log)
  await emitter.init()

  const dbConnection = await getDbConnection(DB_CONFIG())
  const store = new DbStore(log, dbConnection)

  const repo = new IntegrationRunRepository(store, log)

  const integrationIds = parameter.split(',')

  for (const integrationId of integrationIds) {
    const integration = await repo.getIntegrationData(integrationId)

    if (integration) {
      if (integration.state == IntegrationState.IN_PROGRESS) {
        log.warn(`Integration already running!`)
        continue
      }

      if (integration.state == IntegrationState.INACTIVE) {
        log.warn(`Integration is not active!`)
        continue
      }

      if (integration.state == IntegrationState.WAITING_APPROVAL) {
        log.warn(`Integration is waiting for approval!`)
        continue
      }

      log.info(`Triggering integration run for ${integrationId}, onboarding=${isOnboarding}!`)

      await emitter.triggerIntegrationRun(
        integration.tenantId,
        integration.type,
        integration.id,
        isOnboarding,
      )
    } else {
      log.error({ integrationId }, 'Integration not found!')
      continue
    }
  }

  process.exit(0)
})
