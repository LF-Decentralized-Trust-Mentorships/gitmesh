"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.post(`/tenant/:tenantId/note/query`, (0, errorMiddleware_1.safeWrap)(require('./noteQuery').default));
    app.post(`/tenant/:tenantId/note`, (0, errorMiddleware_1.safeWrap)(require('./noteCreate').default));
    app.put(`/tenant/:tenantId/note/:id`, (0, errorMiddleware_1.safeWrap)(require('./noteUpdate').default));
    app.post(`/tenant/:tenantId/note/import`, (0, errorMiddleware_1.safeWrap)(require('./noteImport').default));
    app.delete(`/tenant/:tenantId/note`, (0, errorMiddleware_1.safeWrap)(require('./noteDestroy').default));
    app.get(`/tenant/:tenantId/note/autocomplete`, (0, errorMiddleware_1.safeWrap)(require('./noteAutocomplete').default));
    app.get(`/tenant/:tenantId/note`, (0, errorMiddleware_1.safeWrap)(require('./noteList').default));
    app.get(`/tenant/:tenantId/note/:id`, (0, errorMiddleware_1.safeWrap)(require('./noteFind').default));
};
//# sourceMappingURL=index.js.map