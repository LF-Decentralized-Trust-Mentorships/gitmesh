import cronGenerator from 'cron-time-generator'
import { GitmeshJob } from '../../types/jobTypes'
import { sendPythonWorkerMessage } from '../../serverless/utils/pythonWorkerSQS'
import { PythonWorkerMessageType } from '../../serverless/types/workerTypes'

const job: GitmeshJob = {
  name: 'Member Score Coordinator',
  cronTime: cronGenerator.every(90).minutes(),
  onTrigger: async () => {
    await sendPythonWorkerMessage('global', {
      type: PythonWorkerMessageType.MEMBERS_SCORE,
    })
  },
}

export default job
