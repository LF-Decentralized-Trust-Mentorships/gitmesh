"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.post(`/tenant/:tenantId/conversation`, (0, errorMiddleware_1.safeWrap)(require('./conversationCreate').default));
    app.put(`/tenant/:tenantId/conversation/:id`, (0, errorMiddleware_1.safeWrap)(require('./conversationUpdate').default));
    app.delete(`/tenant/:tenantId/conversation`, (0, errorMiddleware_1.safeWrap)(require('./conversationDestroy').default));
    app.post(`/tenant/:tenantId/conversation/query`, (0, errorMiddleware_1.safeWrap)(require('./conversationQuery').default));
    app.get(`/tenant/:tenantId/conversation`, (0, errorMiddleware_1.safeWrap)(require('./conversationList').default));
    app.get(`/tenant/:tenantId/conversation/:id`, (0, errorMiddleware_1.safeWrap)(require('./conversationFind').default));
    app.post(`/tenant/:tenantId/conversation/settings`, (0, errorMiddleware_1.safeWrap)(require('./conversationSettingsUpdate').default));
};
//# sourceMappingURL=index.js.map