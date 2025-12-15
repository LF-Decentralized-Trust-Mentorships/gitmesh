"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const permissions_1 = __importDefault(require("../../security/permissions"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
const slackStrategy_1 = require("../../services/auth/passportStrategies/slackStrategy");
exports.default = async (req, res, next) => {
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.automationCreate);
    const state = {
        tenantId: req.params.tenantId,
        redirectUrl: req.query.redirectUrl,
        gitmeshToken: req.query.gitmeshToken,
    };
    const authenticator = passport_1.default.authenticate((0, slackStrategy_1.getSlackNotifierStrategy)(), {
        scope: ['incoming-webhook'],
        state: Buffer.from(JSON.stringify(state)).toString('base64'),
    });
    authenticator(req, res, next);
};
//# sourceMappingURL=automationSlackConnect.js.map