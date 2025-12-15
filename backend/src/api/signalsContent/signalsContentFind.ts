import Permissions from '../../security/permissions'
import SignalsContentService from '../../services/signalsContentService'
import PermissionChecker from '../../services/user/permissionChecker'

export default async (req, res) => {
  new PermissionChecker(req).validateHas(Permissions.values.signalsContentRead)

  const payload = await new SignalsContentService(req).findById(req.params.id)

  await req.responseHandler.success(req, res, payload)
}
