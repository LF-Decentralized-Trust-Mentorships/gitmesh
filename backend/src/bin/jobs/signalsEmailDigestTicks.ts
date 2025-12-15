import { Op } from 'sequelize'
import moment from 'moment'
import SequelizeRepository from '../../database/repositories/sequelizeRepository'
import { GitmeshJob } from '../../types/jobTypes'
import { sendNodeWorkerMessage } from '../../serverless/utils/nodeWorkerSQS'
import { NodeWorkerMessageType } from '../../serverless/types/workerTypes'
import { NodeWorkerMessageBase } from '../../types/mq/nodeWorkerMessageBase'

const job: GitmeshJob = {
  name: 'Signals Email Digest Ticker',
  // every half hour
  cronTime: '*/30 * * * *',
  onTrigger: async () => {
    const options = await SequelizeRepository.getDefaultIRepositoryOptions()
    const tenantUsers = (
      await options.database.tenantUser.findAll({
        where: {
          [Op.and]: [
            {
              'settings.signals.emailDigestActive': {
                [Op.ne]: null,
              },
            },
            {
              'settings.signals.emailDigestActive': {
                [Op.eq]: true,
              },
            },
          ],
        },
      })
    ).filter(
      (tenantUser) =>
        tenantUser.settings.signals &&
        tenantUser.settings.signals.emailDigestActive &&
        moment() > moment(tenantUser.settings.signals.emailDigest.nextEmailAt),
    )

    for (const tenantUser of tenantUsers) {
      await sendNodeWorkerMessage(tenantUser.tenantId, {
        type: NodeWorkerMessageType.NODE_MICROSERVICE,
        user: tenantUser.userId,
        tenant: tenantUser.tenantId,
        service: 'signals-email-digest',
      } as NodeWorkerMessageBase)
    }
  },
}

export default job
