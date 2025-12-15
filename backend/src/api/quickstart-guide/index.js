"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.get(`/tenant/:tenantId/quickstart-guide`, (0, errorMiddleware_1.safeWrap)(require('./quickstartGuideList').default));
    app.post(`/tenant/:tenantId/quickstart-guide/settings`, (0, errorMiddleware_1.safeWrap)(require('./quickstartGuideSettingsUpdate').default));
};
//# sourceMappingURL=index.js.map