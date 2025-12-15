"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const feature_flags_1 = require("@gitmesh/feature-flags");
const logging_1 = require("@gitmesh/logging");
const opensearch_1 = require("@gitmesh/opensearch");
const redis_1 = require("@gitmesh/redis");
const tracing_1 = require("@gitmesh/tracing");
const types_1 = require("@gitmesh/types");
const body_parser_1 = __importDefault(require("body-parser"));
const bunyan_middleware_1 = __importDefault(require("bunyan-middleware"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const http = __importStar(require("http"));
const temporal_1 = require("@gitmesh/temporal");
const sequelize_1 = require("sequelize");
const conf_1 = require("../conf");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const databaseMiddleware_1 = require("../middlewares/databaseMiddleware");
const errorMiddleware_1 = require("../middlewares/errorMiddleware");
const languageMiddleware_1 = require("../middlewares/languageMiddleware");
const opensearchMiddleware_1 = require("../middlewares/opensearchMiddleware");
const passportStrategyMiddleware_1 = require("../middlewares/passportStrategyMiddleware");
const redisMiddleware_1 = require("../middlewares/redisMiddleware");
const responseHandlerMiddleware_1 = require("../middlewares/responseHandlerMiddleware");
const segmentMiddleware_1 = require("../middlewares/segmentMiddleware");
const tenantMiddleware_1 = require("../middlewares/tenantMiddleware");
const apiDocumentation_1 = __importDefault(require("./apiDocumentation"));
const apiRateLimiter_1 = require("./apiRateLimiter");
const authSocial_1 = __importDefault(require("./auth/authSocial"));
const websockets_1 = __importDefault(require("./websockets"));
const databaseConnection_1 = require("@/database/databaseConnection");
const serviceLogger = (0, logging_1.getServiceLogger)();
(0, tracing_1.getServiceTracer)();
const app = (0, express_1.default)();
const server = http.createServer(app);
setImmediate(async () => {
    const redis = await (0, redis_1.getRedisClient)(conf_1.REDIS_CONFIG, true);
    const opensearch = (0, opensearch_1.getOpensearchClient)(conf_1.OPENSEARCH_CONFIG);
    const redisPubSubPair = await (0, redis_1.getRedisPubSubPair)(conf_1.REDIS_CONFIG);
    const userNamespace = await websockets_1.default.initialize(server);
    const pubSubReceiver = new redis_1.RedisPubSubReceiver('api-pubsub', redisPubSubPair.subClient, (err) => {
        serviceLogger.error(err, 'Error while listening to Redis Pub/Sub api-ws channel!');
        process.exit(1);
    }, serviceLogger);
    pubSubReceiver.subscribe('user', async (message) => {
        const data = message;
        if (data.tenantId) {
            await userNamespace.emitForTenant(data.tenantId, data.event, data.data);
        }
        else if (data.userId) {
            userNamespace.emitToUserRoom(data.userId, data.event, data.data);
        }
        else {
            serviceLogger.error({ type: data.type }, 'Received invalid websocket message!');
        }
    });
    // Enables CORS
    app.use((0, cors_1.default)({ origin: true }));
    // Logging middleware
    app.use((0, bunyan_middleware_1.default)({
        headerName: 'x-request-id',
        propertyName: 'requestId',
        logName: `requestId`,
        logger: serviceLogger,
        level: 'trace',
    }));
    // Initializes and adds the database middleware.
    app.use(databaseMiddleware_1.databaseMiddleware);
    // Bind redis to request
    app.use((0, redisMiddleware_1.redisMiddleware)(redis));
    // bind opensearch
    app.use((0, opensearchMiddleware_1.opensearchMiddleware)(opensearch));
    // Bind unleash to request
    if (conf_1.UNLEASH_CONFIG.url && conf_1.API_CONFIG.edition === types_1.Edition.HOSTED) {
        const unleash = await (0, feature_flags_1.getUnleashClient)({
            url: conf_1.UNLEASH_CONFIG.url,
            apiKey: conf_1.UNLEASH_CONFIG.backendApiKey,
            appName: common_1.SERVICE,
        });
        app.use((req, res, next) => {
            req.unleash = unleash;
            next();
        });
    }
    // temp check for production
    if (conf_1.TEMPORAL_CONFIG.serverUrl) {
        // Bind temporal to request
        const temporal = await (0, temporal_1.getTemporalClient)(conf_1.TEMPORAL_CONFIG);
        app.use((req, res, next) => {
            req.temporal = temporal;
            next();
        });
    }
    // initialize passport strategies
    app.use(passportStrategyMiddleware_1.passportStrategyMiddleware);
    // Sets the current language of the request
    app.use(languageMiddleware_1.languageMiddleware);
    // adds our ApiResponseHandler instance to the req object as responseHandler
    app.use(responseHandlerMiddleware_1.responseHandlerMiddleware);
    // Configures the authentication middleware
    // to set the currentUser to the requests
    app.use(authMiddleware_1.authMiddleware);
    // Setup the Documentation
    (0, apiDocumentation_1.default)(app);
    // Default rate limiter
    const defaultRateLimiter = (0, apiRateLimiter_1.createRateLimiter)({
        max: 200,
        windowMs: 60 * 1000,
        message: 'errors.429',
    });
    app.use(defaultRateLimiter);
    // Enables Helmet, a set of tools to
    // increase security.
    app.use((0, helmet_1.default)());
    app.use(body_parser_1.default.json({
        limit: '5mb',
        verify(req, res, buf) {
            const url = req.originalUrl;
            if (url.startsWith('/webhooks/stripe') || url.startsWith('/webhooks/sendgrid')) {
                // Stripe and sendgrid webhooks needs the body raw
                // for verifying the webhook with signing secret
                ;
                req.rawBody = buf.toString();
            }
        },
    }));
    app.use(body_parser_1.default.urlencoded({ limit: '5mb', extended: true }));
    // Configure the Entity routes
    const routes = express_1.default.Router();
    // Enable Passport for Social Sign-in
    (0, authSocial_1.default)(app, routes);
    // Load API modules safely. Some optional modules (e.g. cubejs) may throw
    // during require in dev when their dependencies or globals are not ready.
    // We don't want one failing module to prevent the whole API from starting
    // and mounting already-registered routes (for example social auth routes).
    const apiModules = [
        './auditLog',
        './auth',
        './plan',
        './tenant',
        './user',
        './settings',
        './member',
        './widget',
        './activity',
        './tag',
        './widget',
        './cubejs',
        './report',
        './integration',
        './microservice',
        './conversation',
        './signalsContent',
        './automation',
        './task',
        './note',
        './organization',
        './quickstart-guide',
        './slack',
        './segment',
        './eventTracking',
        './customViews',
        './premium/enrichment',
    ];
    for (const mod of apiModules) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
            const loader = require(mod);
            if (loader && typeof loader.default === 'function') {
                loader.default(routes);
            }
            else if (typeof loader === 'function') {
                loader(routes);
            }
        }
        catch (err) {
            serviceLogger.error({ err, module: mod }, `Failed to load API module ${mod}. Continuing without it.`);
        }
    }
    // Loads the Tenant if the :tenantId param is passed
    routes.param('tenantId', tenantMiddleware_1.tenantMiddleware);
    routes.param('tenantId', segmentMiddleware_1.segmentMiddleware);
    app.use('/', routes);
    const webhookRoutes = express_1.default.Router();
    require('./webhooks').default(webhookRoutes);
    const seq = (await (0, databaseConnection_1.databaseInit)()).sequelize;
    app.use('/health', async (req, res) => {
        try {
            const [osPingRes, redisPingRes, dbPingRes, temporalPingRes] = await Promise.all([
                // ping opensearch
                opensearch.ping().then((res) => res.body),
                // ping redis,
                redis.ping().then((res) => res === 'PONG'),
                // ping database
                seq.query('select 1', { type: sequelize_1.QueryTypes.SELECT }).then((rows) => rows.length === 1),
                // ping temporal
                req.temporal
                    ? req.temporal.workflowService.getSystemInfo({}).then(() => true)
                    : Promise.resolve(true),
            ]);
            if (osPingRes && redisPingRes && dbPingRes && temporalPingRes) {
                res.sendStatus(200);
            }
            else {
                res.status(500).json({
                    opensearch: osPingRes,
                    redis: redisPingRes,
                    database: dbPingRes,
                    temporal: temporalPingRes,
                });
            }
        }
        catch (err) {
            res.status(500).json({ error: err });
        }
    });
    app.use('/webhooks', webhookRoutes);
    const io = require('@pm2/io');
    app.use(errorMiddleware_1.errorMiddleware);
    app.use(io.expressErrorHandler());
});
exports.default = server;
//# sourceMappingURL=index.js.map