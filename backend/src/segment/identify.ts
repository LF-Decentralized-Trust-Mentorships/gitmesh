import { Edition } from '@gitmesh/types'
import { SEGMENT_CONFIG, API_CONFIG } from '../conf'

export default function identify(user) {
  try {
    const Analytics = require('analytics-node')

    if (SEGMENT_CONFIG.writeKey) {
    const analytics = new Analytics(SEGMENT_CONFIG.writeKey)
    if (API_CONFIG.edition === Edition.HOSTED || API_CONFIG.edition === Edition.LFX) {
      if (user.email && user.email !== 'support@gitmesh.dev') {
        analytics.identify({
          userId: user.id,
          traits: {
            name: user.fullName,
            email: user.email,
            createdAt: user.createdAt,
            tenants: (user.tenants || [])
              .map((tenantUser) => {
                if (tenantUser && tenantUser.tenant) {
                  return {
                    id: tenantUser.tenant.id,
                    name: tenantUser.tenant.name,
                    url: tenantUser.tenant.url,
                  }
                }
                return undefined
              })
              .filter((t) => t),
            // Hubspot custom traits
            created_an_account: true,
            created_an_account__date: user.createdAt,
          },
        })
      }
    } else if (API_CONFIG.edition === Edition.COMMUNITY) {
      if (user.email && !user.email.includes('gitmesh.dev')) {
        analytics.identify({
          userId: user.id,
          traits: {
            createdAt: user.createdAt,
            tenants: (user.tenants || [])
              .map((tenantUser) => {
                if (tenantUser && tenantUser.tenant) {
                  return {
                    id: tenantUser.tenant.id,
                  }
                }
                return undefined
              })
              .filter((t) => t),
          },
        })
      }
    }
    }
  } catch (error) {
    console.error(error)
  }
}
