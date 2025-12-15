"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.post(`/tenant/:tenantId/customview`, (0, errorMiddleware_1.safeWrap)(require('./customViewCreate').default));
    app.put(`/tenant/:tenantId/customview/:id`, (0, errorMiddleware_1.safeWrap)(require('./customViewUpdate').default));
    app.patch(`/tenant/:tenantId/customview`, (0, errorMiddleware_1.safeWrap)(require('./customViewUpdateBulk').default));
    app.delete(`/tenant/:tenantId/customview`, (0, errorMiddleware_1.safeWrap)(require('./customViewDestroy').default));
    app.get(`/tenant/:tenantId/customview`, (0, errorMiddleware_1.safeWrap)(require('./customViewQuery').default));
};
//# sourceMappingURL=index.js.map