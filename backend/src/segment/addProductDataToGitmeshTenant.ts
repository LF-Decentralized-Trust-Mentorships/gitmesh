import axios from 'axios'
import { getServiceChildLogger } from '@gitmesh/logging'
import { ANALYTICS_CONFIG } from '../conf'
import UserRepository from '../database/repositories/userRepository'
import TenantRepository from '../database/repositories/tenantRepository'
import SequelizeRepository from '../database/repositories/sequelizeRepository'

const IS_ANALYTICS_ENABLED = ANALYTICS_CONFIG.isEnabled === 'true'
const ANALYTICS_TENANT_ID = ANALYTICS_CONFIG.tenantId
const ANALYTICS_BASE_URL = ANALYTICS_CONFIG.baseUrl
const ANALYTICS_TOKEN = ANALYTICS_CONFIG.apiToken

export const ANALYTICS_PLATORM_NAME = 'gitmesh.dev-analytics'

const log = getServiceChildLogger('segment')

interface GitmeshAnalyticsData {
  userId: string
  tenantId: string
  event: string
  timestamp: string
  properties: any
}

const expandAttributes = (attributes: Object) => {
  const obj = {}
  Object.keys(attributes).forEach((key) => {
    obj[key.toLowerCase()] = {
      [ANALYTICS_PLATORM_NAME]: attributes[key],
    }
  })
  return obj
}

export default async function addProductData(data: GitmeshAnalyticsData) {
  if (!IS_ANALYTICS_ENABLED) {
    return
  }

  if (!ANALYTICS_TENANT_ID) {
    return
  }

  if (!ANALYTICS_BASE_URL) {
    return
  }

  if (!ANALYTICS_TOKEN) {
    return
  }

  if (!data?.userId) {
    // we can't send data without a user id
    return
  }

  if (!data?.tenantId) {
    // we can't send data without a tenant id
    return
  }

  try {
    const repositoryOptions = await SequelizeRepository.getDefaultIRepositoryOptions()

    const user = await UserRepository.findById(data.userId, repositoryOptions)

    // this is an array of one tenant
    const tenant = await TenantRepository.getTenantInfo(data.tenantId, repositoryOptions)

    const timestamp = data.timestamp || new Date().toISOString()

    const obj = {
      member: {
        username: {
          [ANALYTICS_PLATORM_NAME]: user.email,
        },
        emails: [user.email],
        displayName: user.fullName,
        attributes: {
          ...expandAttributes({
            email: user.email,
            createdAnAccount: true,
            firstName: user.firstName,
            lastName: user.lastName,
            plan: tenant[0]?.plan,
            isTrialPlan: tenant[0]?.isTrialPlan,
            trialEndsAt: tenant[0]?.trialEndsAt,
          }),
        },
        organizations: [
          {
            name: tenant[0]?.name,
          },
        ],
      },
      type: data.event,
      timestamp,
      platform: ANALYTICS_PLATORM_NAME,
      sourceId: `${data.userId}-${timestamp}-${data.event}`,
    }
    const endpoint = `${ANALYTICS_BASE_URL}/tenant/${ANALYTICS_TENANT_ID}/activity/with-member`
    await axios.post(endpoint, obj, {
      headers: {
        Authorization: `Bearer ${ANALYTICS_TOKEN}`,
      },
    })
  } catch (error) {
    log.error(error, { data }, 'ERROR: Could not send the following payload to Gitmesh Analytics')
  }
}
