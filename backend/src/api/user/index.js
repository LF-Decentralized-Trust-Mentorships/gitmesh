"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.post(`/tenant/:tenantId/user`, (0, errorMiddleware_1.safeWrap)(require('./userCreate').default));
    app.put(`/tenant/:tenantId/user`, (0, errorMiddleware_1.safeWrap)(require('./userEdit').default));
    app.post(`/tenant/:tenantId/user/import`, (0, errorMiddleware_1.safeWrap)(require('./userImport').default));
    app.delete(`/tenant/:tenantId/user`, (0, errorMiddleware_1.safeWrap)(require('./userDestroy').default));
    app.get(`/tenant/:tenantId/user`, (0, errorMiddleware_1.safeWrap)(require('./userList').default));
    app.get(`/tenant/:tenantId/user/autocomplete`, (0, errorMiddleware_1.safeWrap)(require('./userAutocomplete').default));
    app.get(`/tenant/:tenantId/user/:id`, (0, errorMiddleware_1.safeWrap)(require('./userFind').default));
};
//# sourceMappingURL=index.js.map