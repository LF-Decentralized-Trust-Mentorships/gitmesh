import cronGenerator from 'cron-time-generator'
import { getServiceLogger } from '@gitmesh/logging'
import SequelizeRepository from '../../database/repositories/sequelizeRepository'
import { IntegrationProcessor } from '../../serverless/integrations/services/integrationProcessor'
import { IServiceOptions } from '../../services/IServiceOptions'
import { GitmeshJob } from '../../types/jobTypes'

let integrationProcessorInstance: IntegrationProcessor

async function getIntegrationProcessor(): Promise<IntegrationProcessor> {
  if (integrationProcessorInstance) return integrationProcessorInstance

  const options: IServiceOptions = {
    ...(await SequelizeRepository.getDefaultIRepositoryOptions()),
    log: getServiceLogger(),
  }

  integrationProcessorInstance = new IntegrationProcessor(options)

  return integrationProcessorInstance
}

const job: GitmeshJob = {
  name: 'Integration Ticker',
  // every two hours
  cronTime: cronGenerator.every(1).minutes(),
  onTrigger: async () => {
    const processor = await getIntegrationProcessor()
    await processor.processTick()
  },
}

export default job
