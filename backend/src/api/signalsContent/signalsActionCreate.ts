import Permissions from '../../security/permissions'
import SignalsActionService from '../../services/signalsActionService'
import PermissionChecker from '../../services/user/permissionChecker'

export default async (req, res) => {
  new PermissionChecker(req).validateHas(Permissions.values.signalsActionCreate)

  const payload = await new SignalsActionService(req).create(req.body, req.params.contentId)

  await req.responseHandler.success(req, res, payload)
}
