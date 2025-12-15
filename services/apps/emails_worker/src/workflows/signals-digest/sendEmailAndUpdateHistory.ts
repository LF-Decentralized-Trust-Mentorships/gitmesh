import { proxyActivities } from '@temporalio/workflow'

import * as activities from '../../activities'
import { UserTenant } from '../../types/user'

// Configure timeouts and retry policies to fetch content from third-party sources.
const { signalsFetchFromSignals, signalsFetchFromDatabase } = proxyActivities<typeof activities>(
  {
    startToCloseTimeout: '5 seconds',
  },
)

// Configure timeouts and retry policies to build the content of the email to send.
const { signalsBuildEmailContent } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 seconds',
})

// Configure timeouts and retry policies to actually send the email.
const { signalsSendEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 seconds',
})

// Configure timeouts and retry policies to update email history in the database.
const { updateEmailHistory, signalsUpdateNextEmailAt } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
})

/*
sendEmailAndUpdateHistory is a Temporal workflow that:
  - [Async Activities]: Fetch posts from Signals API and the database.
  - [Activity]: Build the content of the email to send based on the posts
    previously found.
  - [Activity]: Actually send the email to the user's email address using the
    SendGrid API.
  - [Async Activities]: Update email history and digest status in the database.
*/
export async function sendEmailAndUpdateHistory(row: UserTenant): Promise<void> {
  const [fetchedFromSignals, fetchedFromDatabase] = await Promise.all([
    signalsFetchFromSignals(row),
    signalsFetchFromDatabase(row),
  ])

  // No need to continue the workflow if no data was fetched.
  if (fetchedFromSignals.length == 0 && fetchedFromDatabase.length == 0) {
    return
  }

  const content = await signalsBuildEmailContent({
    fromDatabase: fetchedFromDatabase,
    fromSignals: fetchedFromSignals,
  })

  // No need to continue the workflow if content of email built is empty.
  if (content.length == 0) {
    return
  }

  const email = await signalsSendEmail({
    userId: row.userId,
    tenantId: row.tenantId,
    settings: row.settings,
    content: content,
  })

  await Promise.all([
    updateEmailHistory({
      ...row,
      type: 'signals-digest',
      emails: [row.settings.signals.emailDigest?.email],
      sentAt: email.sentAt,
    }),
    signalsUpdateNextEmailAt({
      ...row,
      type: 'signals-digest',
      emails: [row.settings.signals.emailDigest?.email],
      sentAt: email.sentAt,
    }),
  ])
}
