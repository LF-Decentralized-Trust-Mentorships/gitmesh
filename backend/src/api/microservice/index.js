"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.post(`/tenant/:tenantId/microservice`, (0, errorMiddleware_1.safeWrap)(require('./microserviceCreate').default));
    app.post(`/tenant/:tenantId/microservice/query`, (0, errorMiddleware_1.safeWrap)(require('./microserviceQuery').default));
    app.put(`/tenant/:tenantId/microservice/:id`, (0, errorMiddleware_1.safeWrap)(require('./microserviceUpdate').default));
    app.post(`/tenant/:tenantId/microservice/import`, (0, errorMiddleware_1.safeWrap)(require('./microserviceImport').default));
    app.delete(`/tenant/:tenantId/microservice`, (0, errorMiddleware_1.safeWrap)(require('./microserviceDestroy').default));
    app.get(`/tenant/:tenantId/microservice/autocomplete`, (0, errorMiddleware_1.safeWrap)(require('./microserviceAutocomplete').default));
    app.get(`/tenant/:tenantId/microservice`, (0, errorMiddleware_1.safeWrap)(require('./microserviceList').default));
    app.get(`/tenant/:tenantId/microservice/:id`, (0, errorMiddleware_1.safeWrap)(require('./microserviceFind').default));
};
//# sourceMappingURL=index.js.map