import { FeatureFlag } from '@gitmesh/types'
import { safeWrap } from '../../middlewares/errorMiddleware'
import { featureFlagMiddleware } from '../../middlewares/featureFlagMiddleware'

export default (app) => {
  app.post(
    `/tenant/:tenantId/signalsContent/query`,
    featureFlagMiddleware(FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'),
    safeWrap(require('./signalsContentQuery').default),
  )

  app.post(
    `/tenant/:tenantId/signalsContent`,
    featureFlagMiddleware(FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'),
    safeWrap(require('./signalsContentUpsert').default),
  )

  app.post(
    `/tenant/:tenantId/signalsContent/track`,
    featureFlagMiddleware(FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'),
    safeWrap(require('./signalsContentTrack').default),
  )

  app.get(
    `/tenant/:tenantId/signalsContent/reply`,
    featureFlagMiddleware(FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'),
    safeWrap(require('./signalsContentReply').default),
  )

  app.get(
    `/tenant/:tenantId/signalsContent/search`,
    featureFlagMiddleware(FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'),
    safeWrap(require('./signalsContentSearch').default),
  )

  app.get(
    `/tenant/:tenantId/signalsContent/:id`,
    featureFlagMiddleware(FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'),
    safeWrap(require('./signalsContentFind').default),
  )

  app.post(
    `/tenant/:tenantId/signalsContent/:contentId/action`,
    featureFlagMiddleware(FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'),
    safeWrap(require('./signalsActionCreate').default),
  )

  app.put(
    `/tenant/:tenantId/signalsContent/settings`,
    featureFlagMiddleware(FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'),
    safeWrap(require('./signalsSettingsUpdate').default),
  )

  app.delete(
    `/tenant/:tenantId/signalsContent/:contentId/action/:actionId`,
    featureFlagMiddleware(FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'),
    safeWrap(require('./signalsActionDestroy').default),
  )
}
