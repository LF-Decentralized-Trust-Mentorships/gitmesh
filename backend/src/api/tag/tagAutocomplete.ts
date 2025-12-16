import Permissions from '../../security/permissions'
import TagService from '../../services/tagService'
import PermissionChecker from '../../services/user/permissionChecker'

export default async (req, res) => {
  new PermissionChecker(req).validateHas(Permissions.values.tagAutocomplete)

  // Handle both flat and nested query parameter formats
  let query = req.query.query
  let limit = req.query.limit
  
  // If query is an object (nested format from frontend), extract the values
  if (typeof query === 'object' && query !== null) {
    limit = query.limit || limit
    query = query.query || ''
  }

  const payload = await new TagService(req).findAllAutocomplete(query, limit)

  await req.responseHandler.success(req, res, payload)
}
