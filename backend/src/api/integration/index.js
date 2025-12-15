"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const types_1 = require("@gitmesh/types");
const conf_1 = require("../../conf");
const segmentRepository_1 = __importDefault(require("../../database/repositories/segmentRepository"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
const tenantService_1 = __importDefault(require("../../services/tenantService"));
const featureFlagMiddleware_1 = require("@/middlewares/featureFlagMiddleware");
const decodeBase64Url = (data) => {
    data = data.replaceAll('-', '+').replaceAll('_', '/');
    while (data.length % 4) {
        data += '=';
    }
    return atob(data);
};
exports.default = (app) => {
    app.post(`/tenant/:tenantId/integration/query`, (0, errorMiddleware_1.safeWrap)(require('./integrationQuery').default));
    app.post(`/tenant/:tenantId/integration`, (0, errorMiddleware_1.safeWrap)(require('./integrationCreate').default));
    app.put(`/tenant/:tenantId/integration/:id`, (0, errorMiddleware_1.safeWrap)(require('./integrationUpdate').default));
    app.post(`/tenant/:tenantId/integration/import`, (0, errorMiddleware_1.safeWrap)(require('./integrationImport').default));
    app.delete(`/tenant/:tenantId/integration`, (0, errorMiddleware_1.safeWrap)(require('./integrationDestroy').default));
    app.get(`/tenant/:tenantId/integration/autocomplete`, (0, errorMiddleware_1.safeWrap)(require('./integrationAutocomplete').default));
    app.get(`/tenant/:tenantId/integration`, (0, errorMiddleware_1.safeWrap)(require('./integrationList').default));
    app.get(`/tenant/:tenantId/integration/:id`, (0, errorMiddleware_1.safeWrap)(require('./integrationFind').default));
    app.put(`/authenticate/:tenantId/:code`, (0, errorMiddleware_1.safeWrap)(require('./helpers/githubAuthenticate').default));
    app.put(`/tenant/:tenantId/integration/:id/github/repos`, (0, errorMiddleware_1.safeWrap)(require('./helpers/githubMapRepos').default));
    app.get(`/tenant/:tenantId/integration/:id/github/repos`, (0, errorMiddleware_1.safeWrap)(require('./helpers/githubMapReposGet').default));
    app.put(`/discord-authenticate/:tenantId/:guild_id`, (0, errorMiddleware_1.safeWrap)(require('./helpers/discordAuthenticate').default));
    app.put(`/reddit-onboard/:tenantId`, (0, errorMiddleware_1.safeWrap)(require('./helpers/redditOnboard').default));
    app.put('/linkedin-connect/:tenantId', (0, errorMiddleware_1.safeWrap)(require('./helpers/linkedinConnect').default));
    app.post('/linkedin-onboard/:tenantId', (0, errorMiddleware_1.safeWrap)(require('./helpers/linkedinOnboard').default));
    app.put(`/tenant/:tenantId/git-connect`, (0, errorMiddleware_1.safeWrap)(require('./helpers/gitAuthenticate').default));
    app.get('/tenant/:tenantId/git', (0, errorMiddleware_1.safeWrap)(require('./helpers/gitGetRemotes').default));
    app.get('/tenant/:tenantId/devto-validate', (0, errorMiddleware_1.safeWrap)(require('./helpers/devtoValidators').default));
    app.get('/tenant/:tenantId/reddit-validate', (0, errorMiddleware_1.safeWrap)(require('./helpers/redditValidator').default));
    app.post('/tenant/:tenantId/devto-connect', (0, errorMiddleware_1.safeWrap)(require('./helpers/devtoCreateOrUpdate').default));
    app.post('/tenant/:tenantId/hackernews-connect', (0, errorMiddleware_1.safeWrap)(require('./helpers/hackerNewsCreateOrUpdate').default));
    app.post('/tenant/:tenantId/stackoverflow-connect', (0, errorMiddleware_1.safeWrap)(require('./helpers/stackOverflowCreateOrUpdate').default));
    app.get('/tenant/:tenantId/stackoverflow-validate', (0, errorMiddleware_1.safeWrap)(require('./helpers/stackOverflowValidator').default));
    app.get('/tenant/:tenantId/stackoverflow-volume', (0, errorMiddleware_1.safeWrap)(require('./helpers/stackOverflowVolume').default));
    app.post('/tenant/:tenantId/discourse-connect', (0, errorMiddleware_1.safeWrap)(require('./helpers/discourseCreateOrUpdate').default));
    app.post('/tenant/:tenantId/discourse-validate', (0, errorMiddleware_1.safeWrap)(require('./helpers/discourseValidator').default));
    app.post('/tenant/:tenantId/discourse-test-webhook', (0, errorMiddleware_1.safeWrap)(require('./helpers/discourseTestWebhook').default));
    app.post('/tenant/:tenantId/hubspot-connect', (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.HUBSPOT, 'hubspot.errors.notInPlan'), (0, errorMiddleware_1.safeWrap)(require('./helpers/hubspotConnect').default));
    app.post('/tenant/:tenantId/hubspot-onboard', (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.HUBSPOT, 'hubspot.errors.notInPlan'), (0, errorMiddleware_1.safeWrap)(require('./helpers/hubspotOnboard').default));
    app.post('/tenant/:tenantId/hubspot-update-properties', (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.HUBSPOT, 'hubspot.errors.notInPlan'), (0, errorMiddleware_1.safeWrap)(require('./helpers/hubspotUpdateProperties').default));
    app.get('/tenant/:tenantId/hubspot-mappable-fields', (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.HUBSPOT, 'hubspot.errors.notInPlan'), (0, errorMiddleware_1.safeWrap)(require('./helpers/hubspotGetMappableFields').default));
    app.get('/tenant/:tenantId/hubspot-get-lists', (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.HUBSPOT, 'hubspot.errors.notInPlan'), (0, errorMiddleware_1.safeWrap)(require('./helpers/hubspotGetLists').default));
    app.post('/tenant/:tenantId/hubspot-sync-member', (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.HUBSPOT, 'hubspot.errors.notInPlan'), (0, errorMiddleware_1.safeWrap)(require('./helpers/hubspotSyncMember').default));
    app.post('/tenant/:tenantId/hubspot-stop-sync-member', (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.HUBSPOT, 'hubspot.errors.notInPlan'), (0, errorMiddleware_1.safeWrap)(require('./helpers/hubspotStopSyncMember').default));
    app.post('/tenant/:tenantId/hubspot-sync-organization', (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.HUBSPOT, 'hubspot.errors.notInPlan'), (0, errorMiddleware_1.safeWrap)(require('./helpers/hubspotSyncOrganization').default));
    app.post('/tenant/:tenantId/hubspot-stop-sync-organization', (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.HUBSPOT, 'hubspot.errors.notInPlan'), (0, errorMiddleware_1.safeWrap)(require('./helpers/hubspotStopSyncOrganization').default));
    app.post('/tenant/:tenantId/groupsio-connect', (0, errorMiddleware_1.safeWrap)(require('./helpers/groupsioConnectOrUpdate').default));
    app.post('/tenant/:tenantId/groupsio-get-token', (0, errorMiddleware_1.safeWrap)(require('./helpers/groupsioGetToken').default));
    app.post('/tenant/:tenantId/groupsio-verify-group', (0, errorMiddleware_1.safeWrap)(require('./helpers/groupsioVerifyGroup').default));
    if (conf_1.TWITTER_CONFIG.clientId) {
        /**
         * Using the passport.authenticate this endpoint forces a
         * redirect to happen to the twitter oauth2 page.
         * We keep a state of the important variables such as tenantId, redirectUrl, ..
         * so that after user logs in through the twitter page, these
         * variables are forwarded back to the callback as well
         * This state is sent using the authenticator options and
         * manipulated through twitterStrategy.staticPKCEStore
         */
        app.get('/twitter/:tenantId/connect', (0, errorMiddleware_1.safeWrap)(require('./helpers/twitterAuthenticate').default), () => {
            // The request will be redirected for authentication, so this
            // function will not be called.
        });
        /**
         * OAuth2 callback endpoint.  After user successfully
         * logs in through twitter page s/he is redirected to
         * this endpoint. Few middlewares first mimic a proper
         * api request in this order:
         *
         * Set headers-> Auth middleware (currentUser)-> Set currentTenant
         * -> finally we call the project service to update the
         * corresponding project.
         *
         * We have to call these standart middlewares explicitly because
         * the request method is get and tenant id does not exist in the
         * uri as request parameters.
         *
         */
        app.get('/twitter/callback', 
        // passport.authenticate('twitter', {
        //   session: false,
        //   failureRedirect: `${API_CONFIG.frontendUrl}/integrations?error=true`,
        // }),
        (req, _res, next) => {
            const stateQueryParam = req.query.state;
            const decodedState = decodeBase64Url(stateQueryParam);
            const stateObject = JSON.parse(decodedState);
            const { gitmeshToken } = stateObject;
            req.headers.authorization = `Bearer ${gitmeshToken}`;
            next();
        }, authMiddleware_1.authMiddleware, async (req, _res, next) => {
            const stateQueryParam = req.query.state;
            const decodedState = decodeBase64Url(stateQueryParam);
            const stateObject = JSON.parse(decodedState);
            const { tenantId } = stateObject;
            req.currentTenant = await new tenantService_1.default(req).findById(tenantId);
            next();
        }, (0, errorMiddleware_1.safeWrap)(require('./helpers/twitterAuthenticateCallback').default));
    }
    /**
     * Slack integration endpoints
     * These should be super similar to Twitter's, since we're also using passport.js
     */
    if (conf_1.SLACK_CONFIG.clientId) {
        // path to start the OAuth flow
        app.get('/slack/:tenantId/connect', (0, errorMiddleware_1.safeWrap)(require('./helpers/slackAuthenticate').default));
        // OAuth callback url
        app.get('/slack/callback', passport_1.default.authorize('slack', {
            session: false,
            failureRedirect: `${conf_1.API_CONFIG.frontendUrl}/integrations?error=true`,
        }), async (req, _res, next) => {
            req.state = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
            next();
        }, (req, _res, next) => {
            const { gitmeshToken } = req.state;
            req.headers.authorization = `Bearer ${gitmeshToken}`;
            next();
        }, authMiddleware_1.authMiddleware, async (req, _res, next) => {
            const { tenantId } = req.state;
            req.currentTenant = await new tenantService_1.default(req).findById(tenantId);
            next();
        }, async (req, _res, next) => {
            const { segmentIds } = req.state;
            const segmentRepository = new segmentRepository_1.default(req);
            req.currentSegments = await segmentRepository.findInIds(segmentIds);
            next();
        }, (0, errorMiddleware_1.safeWrap)(require('./helpers/slackAuthenticateCallback').default));
    }
};
//# sourceMappingURL=index.js.map