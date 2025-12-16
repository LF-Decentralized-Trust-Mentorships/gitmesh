import { Edition } from '@gitmesh/types'
import { SEGMENT_CONFIG, API_CONFIG } from '../conf'

export default async function identifyTenant(req) {
  try {
    if (SEGMENT_CONFIG.writeKey) {
    const Analytics = require('analytics-node')
    const analytics = new Analytics(SEGMENT_CONFIG.writeKey)

    if (API_CONFIG.edition === Edition.HOSTED || API_CONFIG.edition === Edition.COMMUNITY) {
      if (req.currentUser && req.currentUser.email && !req.currentUser.email.includes('support@gitmesh.dev')) {
        analytics.group({
          userId: req.currentUser.id,
          groupId: req.currentTenant.id,
          traits: {
            name: req.currentTenant.name,
          },
        })
      }
    } else if (API_CONFIG.edition === Edition.COMMUNITY) {
      if (req.currentUser && req.currentUser.email && !req.currentUser.email.includes('gitmesh.dev')) {
        analytics.group({
          userId: req.currentUser.id,
          groupId: req.currentTenant.id,
          traits: {
            createdAt: req.currentTenant.createdAt,
          },
        })
      }
    }
    }
  } catch (error) {
    console.error(error)
  }
}
