"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGithubStrategy = void 0;
const lodash_1 = require("lodash");
const passport_github2_1 = __importDefault(require("passport-github2"));
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const conf_1 = require("../../../conf");
const databaseConnection_1 = require("../../../database/databaseConnection");
const authService_1 = __importDefault(require("../authService"));
const splitName_1 = require("../../../utils/splitName");
const log = (0, logging_1.getServiceChildLogger)('AuthSocial');
function getGithubStrategy() {
    return new passport_github2_1.default({
        clientID: conf_1.GITHUB_CONFIG.clientId,
        clientSecret: conf_1.GITHUB_CONFIG.clientSecret,
        callbackURL: conf_1.GITHUB_CONFIG.callbackUrl,
        scope: ['user:email', 'read:user'], // Request email and user info scope
    }, (accessToken, refreshToken, profile, done) => {
        (0, databaseConnection_1.databaseInit)()
            .then((database) => {
            const email = (0, lodash_1.get)(profile, 'emails[0].value');
            // Check if we got an email
            if (!email) {
                log.error({ profile }, 'GitHub profile missing email address');
                throw new Error('auth-no-email');
            }
            // GitHub user's profile doesn't include 'verified' field
            // However, GitHub accounts require email verification for activation
            const emailVerified = !!email;
            const displayName = (0, lodash_1.get)(profile, 'displayName') || (0, lodash_1.get)(profile, 'username') || 'GitHub User';
            const { firstName, lastName } = (0, splitName_1.splitFullName)(displayName);
            return authService_1.default.signinFromSocial(types_1.AuthProvider.GITHUB, profile.id, email, emailVerified, firstName, lastName, displayName, { database });
        })
            .then((jwtToken) => {
            done(null, jwtToken);
        })
            .catch((error) => {
            log.error(error, 'Error while handling github auth!');
            done(error, null);
        });
    });
}
exports.getGithubStrategy = getGithubStrategy;
//# sourceMappingURL=githubStrategy.js.map