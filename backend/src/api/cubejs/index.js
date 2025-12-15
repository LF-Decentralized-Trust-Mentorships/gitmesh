"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (routes) => {
    routes.get(`/tenant/:tenantId/cubejs/auth`, (0, errorMiddleware_1.safeWrap)(require('./cubeJsAuth').default));
    routes.post(`/tenant/:tenantId/cubejs/verify`, (0, errorMiddleware_1.safeWrap)(require('./cubeJsVerifyToken').default));
};
//# sourceMappingURL=index.js.map