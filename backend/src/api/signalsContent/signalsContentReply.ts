import Permissions from '../../security/permissions'
import track from '../../segment/track'
import SignalsContentService from '../../services/signalsContentService'
import PermissionChecker from '../../services/user/permissionChecker'

export default async (req, res) => {
  new PermissionChecker(req).validateHas(Permissions.values.signalsActionCreate)

  const payload = await SignalsContentService.reply(req.query.title, req.query.description)

  track(
    'Signals reply generated',
    {
      title: req.query.title,
      description: req.query.description,
      reply: payload.reply,
    },
    { ...req },
  )
  await req.responseHandler.success(req, res, payload)
}
