import { getAndSendNextEmails as signalsGetAndSendNextEmails } from './workflows/signals-digest/getAndSendNextEmails'
import { sendEmailAndUpdateHistory as signalsSendEmailAndUpdateHistory } from './workflows/signals-digest/sendEmailAndUpdateHistory'

import { getAndSendNextEmails as weeklyGetAndSendNextEmails } from './workflows/weekly-analytics/getAndSendNextEmails'
import { sendEmailAndUpdateHistory as weeklySendEmailAndUpdateHistory } from './workflows/weekly-analytics/sendEmailAndUpdateHistory'

export {
  signalsGetAndSendNextEmails,
  signalsSendEmailAndUpdateHistory,
  weeklyGetAndSendNextEmails,
  weeklySendEmailAndUpdateHistory,
}
