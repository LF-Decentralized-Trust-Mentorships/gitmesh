"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
const conf_1 = require("../../conf");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const tenantService_1 = __importDefault(require("../../services/tenantService"));
const slackStrategy_1 = require("../../services/auth/passportStrategies/slackStrategy");
exports.default = (app) => {
    app.get('/tenant/:tenantId/automation/slack', (0, errorMiddleware_1.safeWrap)(require('./automationSlackConnect').default));
    app.get('/tenant/automation/slack/callback', passport_1.default.authorize((0, slackStrategy_1.getSlackNotifierStrategy)(), {
        session: false,
        failureRedirect: `${conf_1.API_CONFIG.frontendUrl}/settings?activeTab=automations&error=true`,
    }), (req, _res, next) => {
        const { gitmeshToken } = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
        req.headers.authorization = `Bearer ${gitmeshToken}`;
        next();
    }, authMiddleware_1.authMiddleware, async (req, _res, next) => {
        const { tenantId } = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
        req.currentTenant = await new tenantService_1.default(req).findById(tenantId);
        next();
    }, (0, errorMiddleware_1.safeWrap)(require('./automationSlackCallback').default));
    app.post('/tenant/:tenantId/automation', (0, errorMiddleware_1.safeWrap)(require('./automationCreate').default));
    app.put('/tenant/:tenantId/automation/:automationId', (0, errorMiddleware_1.safeWrap)(require('./automationUpdate').default));
    app.delete('/tenant/:tenantId/automation/:automationId', (0, errorMiddleware_1.safeWrap)(require('./automationDestroy').default));
    app.get('/tenant/:tenantId/automation/:automationId/executions', (0, errorMiddleware_1.safeWrap)(require('./automationExecutionFind').default));
    app.get('/tenant/:tenantId/automation/:automationId', (0, errorMiddleware_1.safeWrap)(require('./automationFind').default));
    app.get('/tenant/:tenantId/automation', (0, errorMiddleware_1.safeWrap)(require('./automationList').default));
};
//# sourceMappingURL=index.js.map