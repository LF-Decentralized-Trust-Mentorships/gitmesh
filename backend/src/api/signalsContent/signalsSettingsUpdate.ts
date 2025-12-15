import Permissions from '../../security/permissions'
import SignalsSettingsService from '../../services/signalsSettingsService'
import PermissionChecker from '../../services/user/permissionChecker'

export default async (req, res) => {
  new PermissionChecker(req).validateHas(Permissions.values.signalsActionCreate)

  const payload = await new SignalsSettingsService(req).update(req.body)

  await req.responseHandler.success(req, res, payload)
}
