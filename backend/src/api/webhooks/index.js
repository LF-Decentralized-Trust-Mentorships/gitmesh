"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    // app.post(`/github`, safeWrap(require('./github').default))
    app.post(`/stripe`, (0, errorMiddleware_1.safeWrap)(require('./stripe').default));
    app.post(`/sendgrid`, (0, errorMiddleware_1.safeWrap)(require('./sendgrid').default));
};
//# sourceMappingURL=index.js.map