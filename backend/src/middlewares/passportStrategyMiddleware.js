"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passportStrategyMiddleware = void 0;
const logging_1 = require("@gitmesh/logging");
const passport_1 = __importDefault(require("passport"));
const conf_1 = require("../conf");
const googleStrategy_1 = require("../services/auth/passportStrategies/googleStrategy");
const slackStrategy_1 = require("../services/auth/passportStrategies/slackStrategy");
const githubStrategy_1 = require("../services/auth/passportStrategies/githubStrategy");
const log = (0, logging_1.getServiceLogger)();
async function passportStrategyMiddleware(req, res, next) {
    try {
        // if (TWITTER_CONFIG.clientId) {
        //   passport.use(getTwitterStrategy(req.redis, req.log))
        // }
        if (conf_1.SLACK_CONFIG.clientId) {
            passport_1.default.use((0, slackStrategy_1.getSlackStrategy)());
        }
        if (conf_1.GOOGLE_CONFIG.clientId && conf_1.GOOGLE_CONFIG.clientSecret && conf_1.GOOGLE_CONFIG.callbackUrl) {
            passport_1.default.use((0, googleStrategy_1.getGoogleStrategy)());
        } else {
            log.warn('Skipping Google Strategy: Missing config (clientId, clientSecret, or callbackUrl)');
            try {
                const fs = require('fs');
                fs.appendFileSync('/home/raw/Documents/workspace/alveoli-labs/current/gitmesh-pro/debug_log.txt', 'GOOGLE_CONFIG: ' + JSON.stringify(conf_1.GOOGLE_CONFIG) + '\n');
            } catch (e) {}
        }
        if (conf_1.GITHUB_CONFIG.clientId && conf_1.GITHUB_CONFIG.clientSecret) {
            passport_1.default.use((0, githubStrategy_1.getGithubStrategy)());
        }
    }
    catch (error) {
        log.error(error, 'Error getting some passport strategies!');
    }
    finally {
        next();
    }
}
exports.passportStrategyMiddleware = passportStrategyMiddleware;
//# sourceMappingURL=passportStrategyMiddleware.js.map