import moment from 'moment-timezone'
import { getServiceChildLogger } from '@gitmesh/logging'
import { S3_CONFIG } from '../../../../conf'
import RecurringEmailsHistoryRepository from '../../../../database/repositories/recurringEmailsHistoryRepository'
import SequelizeRepository from '../../../../database/repositories/sequelizeRepository'
import TenantUserRepository from '../../../../database/repositories/tenantUserRepository'
import getUserContext from '../../../../database/utils/getUserContext'
import SignalsContentService from '../../../../services/signalsContentService'
import SignalsSettingsService from '../../../../services/signalsSettingsService'
import EmailSender from '../../../../services/emailSender'
import getStage from '../../../../services/helpers/getStage'
import { RecurringEmailType } from '../../../../types/recurringEmailsHistoryTypes'

const log = getServiceChildLogger('signalsEmailDigestWorker')

async function signalsEmailDigestWorker(userId: string, tenantId: string): Promise<void> {
  const s3Url = `https://${
    S3_CONFIG.microservicesAssetsBucket
  }-${getStage()}.s3.eu-central-1.amazonaws.com`
  const options = await SequelizeRepository.getDefaultIRepositoryOptions()

  const tenantUser = await TenantUserRepository.findByTenantAndUser(tenantId, userId, options)

  if (moment(tenantUser.settings.signals.emailDigest.nextEmailAt) > moment()) {
    log.info(
      'nextEmailAt is already updated. Email is already sent. Exiting without sending the email.',
    )
    return
  }

  const userContext = await getUserContext(tenantId, userId)

  const signalsContentService = new SignalsContentService(userContext)
  const content = (await signalsContentService.search(true)).slice(0, 10).map((c: any) => {
    c.platformIcon = `${s3Url}/email/${c.platform}.png`
    c.post.thumbnail = null
    return c
  })

  await new EmailSender(
    EmailSender.TEMPLATES.SIGNALS_DIGEST,
    {
      content,
      frequency: tenantUser.settings.signals.emailDigest.frequency,
      date: moment().format('D MMM YYYY'),
    },
    tenantId,
  ).sendTo(tenantUser.settings.signals.emailDigest.email)

  const rehRepository = new RecurringEmailsHistoryRepository(userContext)

  const reHistory = await rehRepository.create({
    tenantId: userContext.currentTenant.id,
    type: RecurringEmailType.SIGNALS_DIGEST,
    emailSentAt: moment().toISOString(),
    emailSentTo: [tenantUser.settings.signals.emailDigest.email],
  })

  // update nextEmailAt
  const nextEmailAt = SignalsSettingsService.getNextEmailDigestDate(
    tenantUser.settings.signals.emailDigest,
  )
  const updateSettings = tenantUser.settings.signals
  updateSettings.emailDigest.nextEmailAt = nextEmailAt

  await TenantUserRepository.updateSignalsSettings(
    userContext.currentUser.id,
    updateSettings,
    userContext,
  )

  log.info({ receipt: reHistory })
}

export { signalsEmailDigestWorker }
