"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.post(`/tenant/:tenantId/event-tracking`, (0, errorMiddleware_1.safeWrap)(require('./eventTrack').default));
};
//# sourceMappingURL=index.js.map