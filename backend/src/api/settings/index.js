"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.put(`/tenant/:tenantId/settings`, (0, errorMiddleware_1.safeWrap)(require('./settingsSave').default));
    app.get(`/tenant/:tenantId/settings`, (0, errorMiddleware_1.safeWrap)(require('./settingsFind').default));
    app.get('/tenant/:tenantId/settings/activity/types', (0, errorMiddleware_1.safeWrap)(require('./activityTypeList').default));
    app.post('/tenant/:tenantId/settings/activity/types', (0, errorMiddleware_1.safeWrap)(require('./activityTypeCreate').default));
    app.put('/tenant/:tenantId/settings/activity/types/:key', (0, errorMiddleware_1.safeWrap)(require('./activityTypeUpdate').default));
    app.delete('/tenant/:tenantId/settings/activity/types/:key', (0, errorMiddleware_1.safeWrap)(require('./activityTypeDestroy').default));
    app.post('/tenant/:tenantId/settings/members/attributes', (0, errorMiddleware_1.safeWrap)(require('./memberAttributeCreate').default));
    app.delete(`/tenant/:tenantId/settings/members/attributes`, (0, errorMiddleware_1.safeWrap)(require('./memberAttributeDestroy').default));
    app.put(`/tenant/:tenantId/settings/members/attributes/:id`, (0, errorMiddleware_1.safeWrap)(require('./memberAttributeUpdate').default));
    app.get(`/tenant/:tenantId/settings/members/attributes`, (0, errorMiddleware_1.safeWrap)(require('./memberAttributeList').default));
    app.get(`/tenant/:tenantId/settings/members/attributes/:id`, (0, errorMiddleware_1.safeWrap)(require('./memberAttributeFind').default));
};
//# sourceMappingURL=index.js.map