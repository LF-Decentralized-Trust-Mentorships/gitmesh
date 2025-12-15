import Permissions from '../../security/permissions'
import track from '../../segment/track'
import SignalsContentService from '../../services/signalsContentService'
import PermissionChecker from '../../services/user/permissionChecker'

export default async (req, res) => {
  new PermissionChecker(req).validateHas(Permissions.values.signalsActionCreate)

  const payload = await new SignalsContentService(req).search()
  track('Signals backend search', { ...req.body }, { ...req })
  await req.responseHandler.success(req, res, payload)
}
