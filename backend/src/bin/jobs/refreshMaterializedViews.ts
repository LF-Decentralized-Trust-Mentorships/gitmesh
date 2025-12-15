import cronGenerator from 'cron-time-generator'
import SequelizeRepository from '../../database/repositories/sequelizeRepository'
import { GitmeshJob } from '../../types/jobTypes'

let processingRefreshMemberAggregteMVs = false

const job: GitmeshJob = {
  name: 'Refresh Materialized View',
  // every two hours
  cronTime: cronGenerator.every(2).hours(),
  onTrigger: async () => {
    if (!processingRefreshMemberAggregteMVs) {
      processingRefreshMemberAggregteMVs = true
    } else {
      return
    }
    const dbOptions = await SequelizeRepository.getDefaultIRepositoryOptions()

    await dbOptions.database.sequelize.query(
      'refresh materialized view concurrently "memberActivityAggregatesMVs"',
    )

    processingRefreshMemberAggregteMVs = false
  },
}

export default job
