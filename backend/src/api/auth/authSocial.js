"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const logging_1 = require("@gitmesh/logging");
const conf_1 = require("../../conf");
const authService_1 = __importDefault(require("../../services/auth/authService"));
const log = (0, logging_1.getServiceChildLogger)('AuthSocial');
exports.default = (app, routes) => {
    app.use(passport_1.default.initialize());
    passport_1.default.serializeUser((user, done) => {
        done(null, user);
    });
    passport_1.default.deserializeUser((user, done) => {
        done(null, user);
    });
    routes.post('/auth/social/onboard', async (req, res) => {
        const payload = await authService_1.default.handleOnboard(req.currentUser, req.body.invitationToken, req.body.tenantId, req);
        await req.responseHandler.success(req, res, payload);
    });
    if (conf_1.GOOGLE_CONFIG.clientId) {
        log.info({ clientId: conf_1.GOOGLE_CONFIG.clientId }, 'Registering Google social routes');
        routes.get('/auth/social/google', (req, res, next) => {
            if (!conf_1.GOOGLE_CONFIG.clientSecret) {
                log.error('Google Client Secret is missing!');
                res.redirect(`${conf_1.API_CONFIG.frontendUrl}/auth/signin?socialErrorCode=configuration-error`);
                return;
            }
            passport_1.default.authenticate('google', {
                scope: ['email', 'profile'],
                session: false,
            })(req, res, next);
        }, () => {
            // The request will be redirected for authentication, so this
            // function will not be called.
        });
        routes.get('/auth/social/google/callback', (req, res, next) => {
            if (!conf_1.GOOGLE_CONFIG.clientSecret) {
                log.error('Google Client Secret is missing!');
                res.redirect(`${conf_1.API_CONFIG.frontendUrl}/auth/signin?socialErrorCode=configuration-error`);
                return;
            }
            passport_1.default.authenticate('google', (err, jwtToken) => {
                handleCallback(res, err, jwtToken);
            })(req, res, next);
        });
    }
    if (conf_1.GITHUB_CONFIG.clientId) {
        routes.get('/auth/social/github', (req, res, next) => {
            if (!conf_1.GITHUB_CONFIG.clientSecret) {
                log.error('GitHub Client Secret is missing!');
                res.redirect(`${conf_1.API_CONFIG.frontendUrl}/auth/signin?socialErrorCode=configuration-error`);
                return;
            }
            passport_1.default.authenticate('github', {
                scope: ['user:email', 'read:user'],
                session: false,
            })(req, res, next);
        }, () => {
            // The request will be redirected for authentication, so this
            // function will not be called.
        });
        routes.get('/auth/social/github/callback', (req, res, next) => {
            if (!conf_1.GITHUB_CONFIG.clientSecret) {
                log.error('GitHub Client Secret is missing!');
                res.redirect(`${conf_1.API_CONFIG.frontendUrl}/auth/signin?socialErrorCode=configuration-error`);
                return;
            }
            passport_1.default.authenticate('github', (err, jwtToken) => {
                handleCallback(res, err, jwtToken);
            })(req, res, next);
        });
    }
};
function handleCallback(res, err, jwtToken) {
    if (err) {
        log.error(err, 'Error handling social callback!');
        let errorCode = 'generic';
        if (['auth-invalid-provider', 'auth-no-email'].includes(err.message)) {
            errorCode = err.message;
        }
        res.redirect(`${conf_1.API_CONFIG.frontendUrl}/auth/signin?socialErrorCode=${errorCode}`);
        return;
    }
    res.redirect(`${conf_1.API_CONFIG.frontendUrl}/?social=true&authToken=${jwtToken}`);
}
//# sourceMappingURL=authSocial.js.map