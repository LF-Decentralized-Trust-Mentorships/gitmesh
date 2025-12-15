"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.post(`/tenant/invitation/:token/accept`, (0, errorMiddleware_1.safeWrap)(require('./tenantInvitationAccept').default));
    app.delete(`/tenant/invitation/:token/decline`, (0, errorMiddleware_1.safeWrap)(require('./tenantInvitationDecline').default));
    app.post(`/tenant`, (0, errorMiddleware_1.safeWrap)(require('./tenantCreate').default));
    app.put(`/tenant/:id`, (0, errorMiddleware_1.safeWrap)(require('./tenantUpdate').default));
    app.delete(`/tenant`, (0, errorMiddleware_1.safeWrap)(require('./tenantDestroy').default));
    app.get(`/tenant`, (0, errorMiddleware_1.safeWrap)(require('./tenantList').default));
    app.get(`/tenant/url`, (0, errorMiddleware_1.safeWrap)(require('./tenantFind').default));
    app.get(`/tenant/:id`, (0, errorMiddleware_1.safeWrap)(require('./tenantFind').default));
    app.get(`/tenant/:id/name`, (0, errorMiddleware_1.safeWrap)(require('./tenantFindName').default));
    app.get(`/tenant/:tenantId/membersToMerge`, (0, errorMiddleware_1.safeWrap)(require('./tenantMembersToMerge').default));
    app.get(`/tenant/:tenantId/organizationsToMerge`, (0, errorMiddleware_1.safeWrap)(require('./tenantOrganizationsToMerge').default));
    app.post(`/tenant/:tenantId/sampleData`, (0, errorMiddleware_1.safeWrap)(require('./tenantGenerateSampleData').default));
    app.delete(`/tenant/:tenantId/sampleData`, (0, errorMiddleware_1.safeWrap)(require('./tenantDeleteSampleData').default));
    app.post(`/tenant/:tenantId/viewOrganizations`, (0, errorMiddleware_1.safeWrap)(require('./tenantViewOrganizations').default));
    app.post(`/tenant/:tenantId/viewContacts`, (0, errorMiddleware_1.safeWrap)(require('./tenantViewContacts').default));
};
//# sourceMappingURL=index.js.map