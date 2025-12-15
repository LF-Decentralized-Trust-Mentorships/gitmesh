import { Sequelize } from 'sequelize'
import lodash from 'lodash'
import { LoggerBase } from '@gitmesh/logging'
import { FeatureFlag } from '@gitmesh/types'
import { IServiceOptions } from './IServiceOptions'
import isFeatureEnabled from '../feature-flags/isFeatureEnabled'
import {
  DEFAULT_GUIDES,
  DEFAULT_GUIDES_V2,
  QuickstartGuideMap,
  QuickstartGuideSettings,
  QuickstartGuideType,
} from '../types/quickstartGuideTypes'
import IntegrationRepository from '../database/repositories/integrationRepository'
import MemberService from './memberService'
import TenantUserRepository from '../database/repositories/tenantUserRepository'
import ReportRepository from '../database/repositories/reportRepository'
import AutomationRepository from '../database/repositories/automationRepository'
import SettingsRepository from '../database/repositories/settingsRepository'

export default class QuickstartGuideService extends LoggerBase {
  options: IServiceOptions

  constructor(options: IServiceOptions) {
    super(options.log)
    this.options = options
  }

  async updateSettings(settings: any) {
    const quickstartGuideSettings: QuickstartGuideSettings = lodash.pick(settings, [
      'isSignalsGuideDismissed',
      'isQuickstartGuideDismissed',
    ])

    const tenantUser = await TenantUserRepository.updateSettings(
      this.options.currentUser.id,
      quickstartGuideSettings,
      this.options,
    )

    return tenantUser
  }

  async find(): Promise<QuickstartGuideMap> {
    // Default to V2 guides for community edition or when feature flags are not available
    let isGuidesV2Enabled = true
    try {
      isGuidesV2Enabled = await isFeatureEnabled(FeatureFlag.QUICKSTART_V2, this.options)
    } catch (error) {
      this.log.warn(error, 'Failed to check QUICKSTART_V2 feature flag, using V2 guides by default')
    }
    
    const guides: QuickstartGuideMap = JSON.parse(
      JSON.stringify(isGuidesV2Enabled ? DEFAULT_GUIDES_V2 : DEFAULT_GUIDES),
    )
    this.log.info(guides)
    
    // If no segments are available, return empty guides (tenant not fully set up yet)
    if (!this.options.currentSegments || this.options.currentSegments.length === 0) {
      this.log.warn('No segments available for quickstart guide, returning empty progress')
      return guides
    }
    
    let integrationCount = 0
    try {
      integrationCount = await IntegrationRepository.count({}, this.options)
    } catch (error) {
      this.log.warn(error, 'Failed to get integration count for quickstart guide')
    }

    const ms = new MemberService(this.options)

    if (QuickstartGuideType.CONNECT_INTEGRATION in guides) {
      guides[QuickstartGuideType.CONNECT_INTEGRATION].completed = integrationCount > 1
    }
    if (QuickstartGuideType.ENRICH_MEMBER in guides) {
      try {
        const enrichedMembers = await ms.findAndCountAll({
          advancedFilter: { enrichedBy: { contains: [this.options.currentUser.id] } },
          limit: 1,
        })
        guides[QuickstartGuideType.ENRICH_MEMBER].completed = enrichedMembers.count > 0
      } catch (error) {
        this.log.warn(error, 'Failed to check enriched members for quickstart guide')
      }
    }
    if (QuickstartGuideType.VIEW_REPORT in guides) {
      try {
        const viewedReports = await ReportRepository.findAndCountAll(
          { advancedFilter: { viewedBy: { contains: [this.options.currentUser.id] } } },
          this.options,
        )
        guides[QuickstartGuideType.VIEW_REPORT].completed = viewedReports.count > 0
      } catch (error) {
        this.log.warn(error, 'Failed to check viewed reports for quickstart guide')
      }
    }
    if (QuickstartGuideType.INVITE_COLLEAGUES in guides) {
      try {
        const allTenantUsers = await TenantUserRepository.findByTenant(
          this.options.currentTenant.id,
          this.options,
        )
        guides[QuickstartGuideType.INVITE_COLLEAGUES].completed = allTenantUsers.some(
          (tu) => tu.invitedById === this.options.currentUser.id,
        )
      } catch (error) {
        this.log.warn(error, 'Failed to check invited colleagues for quickstart guide')
      }
    }

    if (QuickstartGuideType.CONNECT_FIRST_INTEGRATION in guides) {
      guides[QuickstartGuideType.CONNECT_FIRST_INTEGRATION].completed = integrationCount > 0
    }

    if (QuickstartGuideType.CREATE_AUTOMATIONS in guides) {
      try {
        const automations = await new AutomationRepository(this.options).findAndCountAll({})
        guides[QuickstartGuideType.CREATE_AUTOMATIONS].completed = automations.count > 0
      } catch (error) {
        this.log.warn(error, 'Failed to check automations for quickstart guide')
      }
    }

    if (
      QuickstartGuideType.EXPLORE_ORGANIZATIONS in guides ||
      QuickstartGuideType.EXPLORE_CONTACTS in guides
    ) {
      try {
        const tenantSettings = await SettingsRepository.getTenantSettings(
          this.options.currentTenant.id,
          this.options,
        )
        if (QuickstartGuideType.EXPLORE_ORGANIZATIONS in guides) {
          guides[QuickstartGuideType.EXPLORE_ORGANIZATIONS].completed =
            tenantSettings?.organizationsViewed || false
        }

        if (QuickstartGuideType.EXPLORE_CONTACTS in guides) {
          guides[QuickstartGuideType.EXPLORE_CONTACTS].completed = tenantSettings?.contactsViewed || false
        }
      } catch (error) {
        this.log.warn(error, 'Failed to check tenant settings for quickstart guide')
      }
    }

    // Check if SIGNALS feature is enabled
    let isSignalsEnabled = false
    try {
      isSignalsEnabled = await isFeatureEnabled(FeatureFlag.SIGNALS, this.options)
    } catch (error) {
      this.log.warn(error, 'Failed to check SIGNALS feature flag')
    }
    
    if (QuickstartGuideType.SET_SIGNALS in guides && isSignalsEnabled) {
      try {
        const tenantUser = await TenantUserRepository.findByTenantAndUser(
          this.options.currentTenant.id,
          this.options.currentUser.id,
          this.options,
        )
        guides[QuickstartGuideType.SET_SIGNALS].completed = tenantUser?.settings?.signals?.onboarded || false
      } catch (error) {
        this.log.warn(error, 'Failed to check signals settings for quickstart guide')
      }
    } else {
      delete guides[QuickstartGuideType.SET_SIGNALS]
    }

    // try to find an enrichable member for button CTA of enrich member guide
    if (
      QuickstartGuideType.ENRICH_MEMBER in guides &&
      !guides[QuickstartGuideType.ENRICH_MEMBER].completed
    ) {
      try {
        const enrichableMembers = await ms.findAndCountAll({
          advancedFilter: {
            and: [
              {
                or: [
                  {
                    emails: {
                      ne: Sequelize.literal("'{}'"),
                    },
                  },
                  {
                    identities: {
                      contains: ['github'],
                    },
                  },
                ],
              },
              {
                enrichedBy: {
                  eq: Sequelize.literal("'{}'"),
                },
              },
            ],
          },
          limit: 1,
        })

        if (enrichableMembers.count > 0) {
          guides[
            QuickstartGuideType.ENRICH_MEMBER
          ].buttonLink = `/contacts/${enrichableMembers.rows[0].id}`
        }
      } catch (error) {
        this.log.warn(error, 'Failed to find enrichable members for quickstart guide')
      }
    }

    return guides
  }
}
