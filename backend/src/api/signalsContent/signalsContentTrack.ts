import { Error404 } from '@gitmesh/common'
import Permissions from '../../security/permissions'
import PermissionChecker from '../../services/user/permissionChecker'
import SignalsContentService from '../../services/signalsContentService'
import track from '../../segment/track'

export default async (req, res) => {
  new PermissionChecker(req).validateHas(Permissions.values.signalsContentRead)

  const event = req.body.event
  const params = req.body.params

  switch (event) {
    case 'postClicked':
      SignalsContentService.trackPostClicked(req.body.url, req.body.platform, req)
      break
    case 'generatedReply':
      track(
        'Signals AI reply generated',
        {
          title: params.title,
          description: params.description,
          platform: params.platform,
          reply: params.reply,
          url: params.url,
        },
        { ...req },
      )
      break
    case 'generatedReplyFeedback':
      track(
        'Signals AI reply feedback',
        {
          type: params.type,
          title: params.title,
          description: params.description,
          platform: params.platform,
          reply: params.reply,
          url: params.url,
        },
        { ...req },
      )
      break
    case 'generatedReplyCopied':
      track(
        'Signals AI reply copied',
        {
          title: params.title,
          description: params.description,
          platform: params.platform,
          url: params.url,
          reply: params.reply,
        },
        { ...req },
      )
      break

    default:
      throw new Error404('en', 'erros.signals.invlaidEvent')
  }

  const out = {
    Success: true,
  }

  await req.responseHandler.success(req, res, out)
}
