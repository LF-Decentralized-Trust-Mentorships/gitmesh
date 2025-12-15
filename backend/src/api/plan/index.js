"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.post(`/plan/stripe/webhook`, (0, errorMiddleware_1.safeWrap)(require('./stripe/webhook').default));
    app.post(`/tenant/:tenantId/plan/stripe/portal`, (0, errorMiddleware_1.safeWrap)(require('./stripe/portal').default));
    app.post(`/tenant/:tenantId/plan/stripe/checkout`, (0, errorMiddleware_1.safeWrap)(require('./stripe/checkout').default));
};
//# sourceMappingURL=index.js.map