"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoogleStrategy = void 0;
const lodash_1 = require("lodash");
const passport_google_oauth20_1 = __importDefault(require("passport-google-oauth20"));
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const conf_1 = require("../../../conf");
const databaseConnection_1 = require("../../../database/databaseConnection");
const authService_1 = __importDefault(require("../authService"));
const splitName_1 = require("../../../utils/splitName");
const log = (0, logging_1.getServiceChildLogger)('AuthSocial');
function getGoogleStrategy() {
    return new passport_google_oauth20_1.default({
        clientID: conf_1.GOOGLE_CONFIG.clientId,
        clientSecret: conf_1.GOOGLE_CONFIG.clientSecret,
        callbackURL: conf_1.GOOGLE_CONFIG.callbackUrl,
    }, (accessToken, refreshToken, profile, done) => {
        (0, databaseConnection_1.databaseInit)()
            .then((database) => {
            const email = (0, lodash_1.get)(profile, 'emails[0].value');
            const emailVerified = (0, lodash_1.get)(profile, 'emails[0].verified', false);
            const displayName = (0, lodash_1.get)(profile, 'displayName');
            const { firstName, lastName } = (0, splitName_1.splitFullName)(displayName);
            return authService_1.default.signinFromSocial(types_1.AuthProvider.GOOGLE, profile.id, email, emailVerified, firstName, lastName, displayName, { database });
        })
            .then((jwtToken) => {
            done(null, jwtToken);
        })
            .catch((error) => {
            log.error(error, 'Error while handling google auth!');
            done(error, null);
        });
    });
}
exports.getGoogleStrategy = getGoogleStrategy;
//# sourceMappingURL=googleStrategy.js.map