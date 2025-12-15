"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.post(`/tenant/:tenantId/organization`, (0, errorMiddleware_1.safeWrap)(require('./organizationCreate').default));
    app.post(`/tenant/:tenantId/organization/query`, (0, errorMiddleware_1.safeWrap)(require('./organizationQuery').default));
    app.put(`/tenant/:tenantId/organization/:id`, (0, errorMiddleware_1.safeWrap)(require('./organizationUpdate').default));
    app.post(`/tenant/:tenantId/organization/import`, (0, errorMiddleware_1.safeWrap)(require('./organizationImport').default));
    app.delete(`/tenant/:tenantId/organization`, (0, errorMiddleware_1.safeWrap)(require('./organizationDestroy').default));
    app.get(`/tenant/:tenantId/organization/autocomplete`, (0, errorMiddleware_1.safeWrap)(require('./organizationAutocomplete').default));
    app.get(`/tenant/:tenantId/organization`, (0, errorMiddleware_1.safeWrap)(require('./organizationList').default));
    app.get(`/tenant/:tenantId/organization/:id`, (0, errorMiddleware_1.safeWrap)(require('./organizationFind').default));
    app.put(`/tenant/:tenantId/organization/:organizationId/merge`, (0, errorMiddleware_1.safeWrap)(require('./organizationMerge').default));
    app.put(`/tenant/:tenantId/organization/:organizationId/no-merge`, (0, errorMiddleware_1.safeWrap)(require('./organizationNotMerge').default));
};
//# sourceMappingURL=index.js.map