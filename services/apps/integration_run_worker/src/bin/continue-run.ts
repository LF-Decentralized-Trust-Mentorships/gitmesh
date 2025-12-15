import { DB_CONFIG, SQS_CONFIG } from '../conf'
import { DbStore, getDbConnection } from '@gitmesh/database'
import { getServiceTracer } from '@gitmesh/tracing'
import { getServiceLogger } from '@gitmesh/logging'
import { IntegrationStreamWorkerEmitter, getSqsClient } from '@gitmesh/sqs'
import IntegrationRunRepository from '../repo/integrationRun.repo'
import { IntegrationRunState } from '@gitmesh/types'

const tracer = getServiceTracer()
const log = getServiceLogger()

const processArguments = process.argv.slice(2)

const runId = processArguments[0]

setImmediate(async () => {
  const sqsClient = getSqsClient(SQS_CONFIG())
  const emitter = new IntegrationStreamWorkerEmitter(sqsClient, tracer, log)
  await emitter.init()

  const dbConnection = await getDbConnection(DB_CONFIG())
  const store = new DbStore(log, dbConnection)

  const repo = new IntegrationRunRepository(store, log)

  const run = await repo.findIntegrationRunById(runId)

  if (run) {
    log.info({ run }, 'Found run!')

    if (run.state != IntegrationRunState.PENDING) {
      log.warn(`Integration run is not pending, setting to pending!`)

      await repo.resetDelayedRun(run.id)
    }

    log.info(`Triggering integration run for ${runId}!`)

    await emitter.continueProcessingRunStreams(run.tenantId, run.platform, run.id)
    process.exit(0)
  } else {
    log.error({ run }, 'Run not found!')
    process.exit(1)
  }
})
