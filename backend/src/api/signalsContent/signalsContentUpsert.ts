import Permissions from '../../security/permissions'
import SignalsContentService from '../../services/signalsContentService'
import PermissionChecker from '../../services/user/permissionChecker'

export default async (req, res) => {
  new PermissionChecker(req).validateHas(Permissions.values.signalsContentCreate)

  const payload = await new SignalsContentService(req).upsert(req.body)

  await req.responseHandler.success(req, res, payload)
}
