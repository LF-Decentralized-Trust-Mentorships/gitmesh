import { safeWrap } from '../../middlewares/errorMiddleware'

export default (routes) => {
  routes.get(`/tenant/:tenantId/cubejs/auth`, safeWrap(require('./cubeJsAuth').default))
  routes.post(`/tenant/:tenantId/cubejs/verify`, safeWrap(require('./cubeJsVerifyToken').default))
}
