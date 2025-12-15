"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.post(`/tenant/:tenantId/task/query`, (0, errorMiddleware_1.safeWrap)(require('./taskQuery').default));
    app.post(`/tenant/:tenantId/task`, (0, errorMiddleware_1.safeWrap)(require('./taskCreate').default));
    app.put(`/tenant/:tenantId/task/:id`, (0, errorMiddleware_1.safeWrap)(require('./taskUpdate').default));
    app.put(`/tenant/:tenantId/task/:id`, (0, errorMiddleware_1.safeWrap)(require('./taskUpdate').default));
    app.post(`/tenant/:tenantId/task/import`, (0, errorMiddleware_1.safeWrap)(require('./taskImport').default));
    app.delete(`/tenant/:tenantId/task`, (0, errorMiddleware_1.safeWrap)(require('./taskDestroy').default));
    app.get(`/tenant/:tenantId/task/autocomplete`, (0, errorMiddleware_1.safeWrap)(require('./taskAutocomplete').default));
    app.get(`/tenant/:tenantId/task`, (0, errorMiddleware_1.safeWrap)(require('./taskList').default));
    app.get(`/tenant/:tenantId/task/:id`, (0, errorMiddleware_1.safeWrap)(require('./taskFind').default));
    app.post(`/tenant/:tenantId/task/batch`, (0, errorMiddleware_1.safeWrap)(require('./taskBatchOperations').default));
};
//# sourceMappingURL=index.js.map