"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.post(`/tenant/:tenantId/segment/projectGroup`, (0, errorMiddleware_1.safeWrap)(require('./segmentCreateProjectGroup').default));
    app.post(`/tenant/:tenantId/segment/project`, (0, errorMiddleware_1.safeWrap)(require('./segmentCreateProject').default));
    app.post(`/tenant/:tenantId/segment/subproject`, (0, errorMiddleware_1.safeWrap)(require('./segmentCreateSubproject').default));
    // query all project groups
    app.post(`/tenant/:tenantId/segment/projectGroup/query`, (0, errorMiddleware_1.safeWrap)(require('./segmentProjectGroupQuery').default));
    // query all projects
    app.post(`/tenant/:tenantId/segment/project/query`, (0, errorMiddleware_1.safeWrap)(require('./segmentProjectQuery').default));
    // query all subprojects
    app.post(`/tenant/:tenantId/segment/subproject/query`, (0, errorMiddleware_1.safeWrap)(require('./segmentSubprojectQuery').default));
    // get segment by id
    app.get(`/tenant/:tenantId/segment/:id`, (0, errorMiddleware_1.safeWrap)(require('./segmentFind').default));
    app.put(`/tenant/:tenantId/segment/:id`, (0, errorMiddleware_1.safeWrap)(require('./segmentUpdate').default));
    // app.get(`/tenant/:tenantId/segment/projectGroup/:id`, safeWrap(require('./segmentFind').default))
    // app.get(`/tenant/:tenantId/segment/project/:id`, safeWrap(require('./segmentFind').default))
    // app.get(`/tenant/:tenantId/segment/subproject/:id`, safeWrap(require('./segmentFind').default))
};
//# sourceMappingURL=index.js.map