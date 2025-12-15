import Permissions from '../../security/permissions'
import track from '../../segment/track'
import SignalsContentService from '../../services/signalsContentService'
import PermissionChecker from '../../services/user/permissionChecker'

// /**
//  * POST /tenant/{tenantId}/signalsContent
//  * @summary Create or update an signalsContent
//  * @tag Activities
//  * @security Bearer
//  * @description Create or update an signalsContent. Existence is checked by sourceId and tenantId.
//  * @pathParam {string} tenantId - Your workspace/tenant ID
//  * @bodyContent {SignalsContentUpsertInput} application/json
//  * @response 200 - Ok
//  * @responseContent {SignalsContent} 200.application/json
//  * @responseExample {SignalsContentUpsert} 200.application/json.SignalsContent
//  * @response 401 - Unauthorized
//  * @response 404 - Not found
//  * @response 429 - Too many requests
//  */
export default async (req, res) => {
  new PermissionChecker(req).validateHas(Permissions.values.signalsContentRead)

  const payload = await new SignalsContentService(req).query(req.body)

  if (req.body?.filter && Object.keys(req.body.filter).length > 0) {
    track('SignalsContent Advanced Filter', { ...payload }, { ...req })
  }

  await req.responseHandler.success(req, res, payload)
}
