"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.get(`/tenant/:tenantId/audit-log`, (0, errorMiddleware_1.safeWrap)(require('./auditLogList').default));
};
//# sourceMappingURL=index.js.map