"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.post(`/tenant/:tenantId/widget`, (0, errorMiddleware_1.safeWrap)(require('./widgetCreate').default));
    app.post(`/tenant/:tenantId/widget/query`, (0, errorMiddleware_1.safeWrap)(require('./widgetQuery').default));
    app.put(`/tenant/:tenantId/widget/:id`, (0, errorMiddleware_1.safeWrap)(require('./widgetUpdate').default));
    app.post(`/tenant/:tenantId/widget/import`, (0, errorMiddleware_1.safeWrap)(require('./widgetImport').default));
    app.delete(`/tenant/:tenantId/widget`, (0, errorMiddleware_1.safeWrap)(require('./widgetDestroy').default));
    app.get(`/tenant/:tenantId/widget/autocomplete`, (0, errorMiddleware_1.safeWrap)(require('./widgetAutocomplete').default));
    app.get(`/tenant/:tenantId/widget`, (0, errorMiddleware_1.safeWrap)(require('./widgetList').default));
    app.get(`/tenant/:tenantId/widget/:id`, (0, errorMiddleware_1.safeWrap)(require('./widgetFind').default));
};
//# sourceMappingURL=index.js.map