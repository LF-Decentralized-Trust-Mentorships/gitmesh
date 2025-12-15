"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.post(`/tenant/:tenantId/tag`, (0, errorMiddleware_1.safeWrap)(require('./tagCreate').default));
    app.post(`/tenant/:tenantId/tag/query`, (0, errorMiddleware_1.safeWrap)(require('./tagQuery').default));
    app.put(`/tenant/:tenantId/tag/:id`, (0, errorMiddleware_1.safeWrap)(require('./tagUpdate').default));
    app.post(`/tenant/:tenantId/tag/import`, (0, errorMiddleware_1.safeWrap)(require('./tagImport').default));
    app.delete(`/tenant/:tenantId/tag`, (0, errorMiddleware_1.safeWrap)(require('./tagDestroy').default));
    app.get(`/tenant/:tenantId/tag/autocomplete`, (0, errorMiddleware_1.safeWrap)(require('./tagAutocomplete').default));
    app.get(`/tenant/:tenantId/tag`, (0, errorMiddleware_1.safeWrap)(require('./tagList').default));
    app.get(`/tenant/:tenantId/tag/:id`, (0, errorMiddleware_1.safeWrap)(require('./tagFind').default));
};
//# sourceMappingURL=index.js.map