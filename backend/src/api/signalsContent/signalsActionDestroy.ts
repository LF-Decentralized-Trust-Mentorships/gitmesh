import Permissions from '../../security/permissions'
import SignalsActionService from '../../services/signalsActionService'
import PermissionChecker from '../../services/user/permissionChecker'

export default async (req, res) => {
  new PermissionChecker(req).validateHas(Permissions.values.signalsActionDestroy)

  const payload = await new SignalsActionService(req).destroy(req.params.actionId)

  await req.responseHandler.success(req, res, payload)
}
