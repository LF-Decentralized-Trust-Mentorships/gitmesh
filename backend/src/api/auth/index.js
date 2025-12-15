"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiRateLimiter_1 = require("../apiRateLimiter");
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
exports.default = (app) => {
    app.put(`/auth/password-reset`, (0, errorMiddleware_1.safeWrap)(require('./authPasswordReset').default));
    const emailRateLimiter = (0, apiRateLimiter_1.createRateLimiter)({
        max: 6,
        windowMs: 15 * 60 * 1000,
        message: 'errors.429',
    });
    app.post(`/auth/send-email-address-verification-email`, emailRateLimiter, (0, errorMiddleware_1.safeWrap)(require('./authSendEmailAddressVerificationEmail').default));
    app.post(`/auth/send-password-reset-email`, emailRateLimiter, (0, errorMiddleware_1.safeWrap)(require('./authSendPasswordResetEmail').default));
    const signInRateLimiter = (0, apiRateLimiter_1.createRateLimiter)({
        max: 100,
        windowMs: 15 * 60 * 1000,
        message: 'errors.429',
    });
    app.post(`/auth/sign-in`, signInRateLimiter, (0, errorMiddleware_1.safeWrap)(require('./authSignIn').default));
    const signUpRateLimiter = (0, apiRateLimiter_1.createRateLimiter)({
        max: 20,
        windowMs: 60 * 60 * 1000,
        message: 'errors.429',
    });
    app.post(`/auth/sign-up`, signUpRateLimiter, (0, errorMiddleware_1.safeWrap)(require('./authSignUp').default));
    app.put(`/auth/profile`, (0, errorMiddleware_1.safeWrap)(require('./authUpdateProfile').default));
    app.put(`/auth/change-password`, (0, errorMiddleware_1.safeWrap)(require('./authPasswordChange').default));
    app.put(`/auth/verify-email`, (0, errorMiddleware_1.safeWrap)(require('./authVerifyEmail').default));
    app.get(`/auth/me`, (0, errorMiddleware_1.safeWrap)(require('./authMe').default));
    app.post(`/auth/sso/callback`, (0, errorMiddleware_1.safeWrap)(require('./ssoCallback').default));
};
//# sourceMappingURL=index.js.map