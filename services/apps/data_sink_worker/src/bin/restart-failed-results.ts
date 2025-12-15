import { DB_CONFIG, SQS_CONFIG } from '../conf'
import DataSinkRepository from '../repo/dataSink.repo'
import { DbStore, getDbConnection } from '@gitmesh/database'
import { getServiceTracer } from '@gitmesh/tracing'
import { getServiceLogger } from '@gitmesh/logging'
import { DataSinkWorkerEmitter, getSqsClient } from '@gitmesh/sqs'
import { ProcessIntegrationResultQueueMessage } from '@gitmesh/types'

const tracer = getServiceTracer()
const log = getServiceLogger()

const processArguments = process.argv.slice(2)

if (processArguments.length !== 1) {
  log.error('Expected 1 argument: runId')
  process.exit(1)
}

const runId = processArguments[0]

setImmediate(async () => {
  const sqsClient = getSqsClient(SQS_CONFIG())
  const emitter = new DataSinkWorkerEmitter(sqsClient, tracer, log)
  await emitter.init()

  const dbConnection = await getDbConnection(DB_CONFIG())
  const store = new DbStore(log, dbConnection)

  const repo = new DataSinkRepository(store, log)

  let results = await repo.getFailedResultsForRun(runId, 1, 20)
  while (results.length > 0) {
    await repo.resetResults(results.map((r) => r.id))

    for (const result of results) {
      await emitter.sendMessage(
        `results-${result.tenantId}-${result.platform}`,
        new ProcessIntegrationResultQueueMessage(result.id),
      )
    }

    results = await repo.getFailedResultsForRun(runId, 1, 20)
  }
})
