import { FeatureFlag } from '@gitmesh/types'
import { Error403 } from '@gitmesh/common'
import isFeatureEnabled from '../feature-flags/isFeatureEnabled'

export function featureFlagMiddleware(featureFlag: FeatureFlag, errorMessage: string) {
  return async (req, res, next) => {
    if (!(await isFeatureEnabled(featureFlag, req))) {
      await req.responseHandler.error(req, res, new Error403(req.language, errorMessage))
      return
    }
    next()
  }
}
