import { getServiceChildLogger } from '@gitmesh/logging'
import { Edition } from '@gitmesh/types'
import { API_CONFIG, IS_TEST_ENV, SEGMENT_CONFIG } from '../conf'
import SequelizeRepository from '../database/repositories/sequelizeRepository'
import { ANALYTICS_PLATORM_NAME } from './addProductDataToGitmeshTenant'
import getTenatUser from './trackHelper'

const log = getServiceChildLogger('segment')

export default async function identify(
  event,
  properties,
  options: any,
  userId: any = false,
  timestamp: any = false,
) {
  try {
    const userEmail = SequelizeRepository.getCurrentUser({
      ...options,
    }).email
    if (
      !IS_TEST_ENV &&
      SEGMENT_CONFIG.writeKey &&
      // This is only for events in the hosted version. Self-hosted has less telemetry.
      (API_CONFIG.edition === Edition.HOSTED || API_CONFIG.edition === Edition.COMMUNITY) &&
      userEmail !== 'support@gitmesh.dev'
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

      analytics.track(payload)

      // send product analytics data to gitmesh tenant workspace
      // await addProductData({
      //   userId: userIdOut,
      //   tenantId: tenantIdOut,
      //   event,
      //   timestamp,
      //   properties,
      // })
    }
  } catch (error) {
    log.error(error, 'Could not send payload to Segment')
  }
}
