"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.post(`/tenant/:tenantId/activity`, (0, errorMiddleware_1.safeWrap)(require('./activityCreate').default));
    app.post(`/tenant/:tenantId/activity/query`, (0, errorMiddleware_1.safeWrap)(require('./activityQuery').default));
    app.put(`/tenant/:tenantId/activity/:id`, (0, errorMiddleware_1.safeWrap)(require('./activityUpdate').default));
    app.post(`/tenant/:tenantId/activity/import`, (0, errorMiddleware_1.safeWrap)(require('./activityImport').default));
    app.delete(`/tenant/:tenantId/activity`, (0, errorMiddleware_1.safeWrap)(require('./activityDestroy').default));
    app.get(`/tenant/:tenantId/activity/autocomplete`, (0, errorMiddleware_1.safeWrap)(require('./activityAutocomplete').default));
    app.get(`/tenant/:tenantId/activity`, (0, errorMiddleware_1.safeWrap)(require('./activityList').default));
    app.get(`/tenant/:tenantId/activity/:id`, (0, errorMiddleware_1.safeWrap)(require('./activityFind').default));
    app.post('/tenant/:tenantId/activity/with-member', 
    // Call the addActivityWithMember file in this dir
    (0, errorMiddleware_1.safeWrap)(require('./activityAddWithMember').default));
};
//# sourceMappingURL=index.js.map