"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@gitmesh/types");
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
const featureFlagMiddleware_1 = require("../../middlewares/featureFlagMiddleware");
exports.default = (app) => {
    app.post(`/tenant/:tenantId/member/query`, (0, errorMiddleware_1.safeWrap)(require('./memberQuery').default));
    app.post(`/tenant/:tenantId/member/export`, (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.CSV_EXPORT, 'errors.csvExport.planLimitExceeded'), (0, errorMiddleware_1.safeWrap)(require('./memberExport').default));
    app.post(`/tenant/:tenantId/member`, (0, errorMiddleware_1.safeWrap)(require('./memberCreate').default));
    app.put(`/tenant/:tenantId/member/:id`, (0, errorMiddleware_1.safeWrap)(require('./memberUpdate').default));
    app.post(`/tenant/:tenantId/member/import`, (0, errorMiddleware_1.safeWrap)(require('./memberImport').default));
    app.delete(`/tenant/:tenantId/member`, (0, errorMiddleware_1.safeWrap)(require('./memberDestroy').default));
    app.get(`/tenant/:tenantId/member/autocomplete`, (0, errorMiddleware_1.safeWrap)(require('./memberAutocomplete').default));
    app.get(`/tenant/:tenantId/member/orautocomplete`, (0, errorMiddleware_1.safeWrap)(require('./memberAutocomplete').default));
    app.get(`/tenant/:tenantId/member`, (0, errorMiddleware_1.safeWrap)(require('./memberList').default));
    app.get(`/tenant/:tenantId/member/active`, (0, errorMiddleware_1.safeWrap)(require('./memberActiveList').default));
    app.get(`/tenant/:tenantId/member/:id`, (0, errorMiddleware_1.safeWrap)(require('./memberFind').default));
    app.put(`/tenant/:tenantId/member/:memberId/merge`, (0, errorMiddleware_1.safeWrap)(require('./memberMerge').default));
    app.put(`/tenant/:tenantId/member/:memberId/no-merge`, (0, errorMiddleware_1.safeWrap)(require('./memberNotMerge').default));
    app.patch(`/tenant/:tenantId/member`, (0, errorMiddleware_1.safeWrap)(require('./memberUpdateBulk').default));
};
//# sourceMappingURL=index.js.map