import { getServiceChildLogger } from '@gitmesh/logging'
import { Edition } from '@gitmesh/types'
import { API_CONFIG, IS_TEST_ENV, SEGMENT_CONFIG } from '../conf'
import SequelizeRepository from '../database/repositories/sequelizeRepository'
import getTenatUser from './trackHelper'
import { ANALYTICS_PLATORM_NAME } from './addProductDataToGitmeshTenant'

const log = getServiceChildLogger('telemetryTrack')

export default function track(
  event,
  properties,
  options: any,
  userId: any = false,
  timestamp: any = false,
) {
  try {
    const email = SequelizeRepository.getCurrentUser({
      ...options,
    })?.email

    if (
      !IS_TEST_ENV &&
      SEGMENT_CONFIG.writeKey &&
      // This is only for events in the self-hosted version. Hosted has more telemetry.
      API_CONFIG.edition === Edition.COMMUNITY &&
      email &&
      !email.includes('gitmesh.dev')
    ) {
      if (
        properties &&
        properties?.platform &&
        properties?.platform === ANALYTICS_PLATORM_NAME
      ) {
        // no need to track gitmesh analytics events in segment
        // and this is also to ensure we don't get into an infinite loop
        return
      }
      const Analytics = require('analytics-node')
      const analytics = new Analytics(SEGMENT_CONFIG.writeKey)

      const { userIdOut, tenantIdOut } = getTenatUser(userId, options)

      const payload = {
        userId: userIdOut,
        event,
        properties,
        context: {
          groupId: tenantIdOut,
        },
        ...(timestamp && { timestamp }),
      }

      if (event === 'Conversation created') {
        log.trace('Added conversation')
      }
      analytics.track(payload)
    }
  } catch (error) {
    log.error(error, 'ERROR: Could not send the following payload to Segment')
  }
}
