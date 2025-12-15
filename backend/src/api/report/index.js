"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.post(`/tenant/:tenantId/report`, (0, errorMiddleware_1.safeWrap)(require('./reportCreate').default));
    app.post(`/tenant/:tenantId/report/query`, (0, errorMiddleware_1.safeWrap)(require('./reportQuery').default));
    app.put(`/tenant/:tenantId/report/:id`, (0, errorMiddleware_1.safeWrap)(require('./reportUpdate').default));
    app.post(`/tenant/:tenantId/report/:id/duplicate`, (0, errorMiddleware_1.safeWrap)(require('./reportDuplicate').default));
    app.post(`/tenant/:tenantId/report/import`, (0, errorMiddleware_1.safeWrap)(require('./reportImport').default));
    app.delete(`/tenant/:tenantId/report`, (0, errorMiddleware_1.safeWrap)(require('./reportDestroy').default));
    app.get(`/tenant/:tenantId/report/autocomplete`, (0, errorMiddleware_1.safeWrap)(require('./reportAutocomplete').default));
    app.get(`/tenant/:tenantId/report`, (0, errorMiddleware_1.safeWrap)(require('./reportList').default));
    app.get(`/tenant/:tenantId/report/:id`, (0, errorMiddleware_1.safeWrap)(require('./reportFind').default));
};
//# sourceMappingURL=index.js.map