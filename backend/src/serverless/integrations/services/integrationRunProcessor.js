"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationRunProcessor = void 0;
const moment_1 = __importDefault(require("moment"));
const logging_1 = require("@gitmesh/logging");
const common_1 = require("@gitmesh/common");
const types_1 = require("@gitmesh/types");
const alerting_1 = require("@gitmesh/alerting");
const integrationRepository_1 = __importDefault(require("../../../database/repositories/integrationRepository"));
const microserviceRepository_1 = __importDefault(require("../../../database/repositories/microserviceRepository"));
const getUserContext_1 = __importDefault(require("../../../database/utils/getUserContext"));
const microserviceTypes_1 = require("../../../database/utils/keys/microserviceTypes");
const sampleDataService_1 = __importDefault(require("../../../services/sampleDataService"));
const integrationStreamTypes_1 = require("../../../types/integrationStreamTypes");
const operationsWorker_1 = __importDefault(require("../../dbOperations/operationsWorker"));
const userRepository_1 = __importDefault(require("../../../database/repositories/userRepository"));
const emailSender_1 = __importDefault(require("../../../services/emailSender"));
const conf_1 = require("../../../conf");
const segmentRepository_1 = __importDefault(require("../../../database/repositories/segmentRepository"));
class IntegrationRunProcessor extends logging_1.LoggerBase {
    constructor(options, integrationServices, integrationRunRepository, integrationStreamRepository, apiPubSubEmitter) {
        super(options.log);
        this.integrationServices = integrationServices;
        this.integrationRunRepository = integrationRunRepository;
        this.integrationStreamRepository = integrationStreamRepository;
        this.apiPubSubEmitter = apiPubSubEmitter;
    }
    async process(req) {
        var _a;
        if (!req.runId) {
            this.log.warn("No runId provided! Skipping because it's an old message.");
            return;
        }
        this.log.info({ runId: req.runId }, 'Detected integration run!');
        const run = await this.integrationRunRepository.findById(req.runId);
        const userContext = await (0, getUserContext_1.default)(run.tenantId);
        let integration;
        if (run.integrationId) {
            integration = await integrationRepository_1.default.findById(run.integrationId, userContext);
        }
        else if (run.microserviceId) {
            const microservice = await microserviceRepository_1.default.findById(run.microserviceId, userContext);
            switch (microservice.type) {
                case microserviceTypes_1.twitterFollowers:
                    integration = await integrationRepository_1.default.findByPlatform(types_1.PlatformType.TWITTER, userContext);
                    break;
                default:
                    throw new Error(`Microservice type '${microservice.type}' is not supported!`);
            }
        }
        else {
            this.log.error({ runId: req.runId }, 'Integration run has no integration or microservice!');
            throw new Error(`Integration run '${req.runId}' has no integration or microservice!`);
        }
        const segmentRepository = new segmentRepository_1.default(userContext);
        userContext.currentSegments = [await segmentRepository.findById(integration.segmentId)];
        const logger = (0, logging_1.getChildLogger)('process', this.log, {
            runId: req.runId,
            type: integration.platform,
            tenantId: integration.tenantId,
            integrationId: run.integrationId,
            onboarding: run.onboarding,
            microserviceId: run.microserviceId,
        });
        logger.info('Processing integration!');
        userContext.log = logger;
        // get the relevant integration service that is supposed to be configured already
        const intService = (0, common_1.singleOrDefault)(this.integrationServices, (s) => s.type === integration.platform);
        if (intService === undefined) {
            logger.error('No integration service configured!');
            throw new Error(`No integration service configured for type '${integration.platform}'!`);
        }
        const stepContext = {
            startTimestamp: (0, moment_1.default)().utc().unix(),
            limitCount: integration.limitCount || 0,
            onboarding: run.onboarding,
            pipelineData: {},
            runId: req.runId,
            integration,
            serviceContext: userContext,
            repoContext: userContext,
            logger,
        };
        if (!req.streamId) {
            const existingRun = await this.integrationRunRepository.findLastProcessingRun(run.integrationId, run.microserviceId, req.runId);
            if (existingRun) {
                logger.info('Integration is already being processed!');
                await this.integrationRunRepository.markError(req.runId, {
                    errorPoint: 'check_existing_run',
                    message: 'Integration is already being processed!',
                    existingRunId: existingRun.id,
                });
                return;
            }
            if (run.state === types_1.IntegrationRunState.PROCESSED) {
                logger.warn('Integration is already processed!');
                return;
            }
            if (run.state === types_1.IntegrationRunState.PENDING) {
                logger.info('Started processing integration!');
            }
            else if (run.state === types_1.IntegrationRunState.DELAYED) {
                logger.info('Continued processing delayed integration!');
            }
            else if (run.state === types_1.IntegrationRunState.ERROR) {
                logger.info('Restarted processing errored integration!');
            }
            else if (run.state === types_1.IntegrationRunState.PROCESSING) {
                throw new Error(`Invalid state '${run.state}' for integration run!`);
            }
            await this.integrationRunRepository.markProcessing(req.runId);
            run.state = types_1.IntegrationRunState.PROCESSING;
            if (integration.settings.updateMemberAttributes) {
                logger.trace('Updating member attributes!');
                await intService.createMemberAttributes(stepContext);
                integration.settings.updateMemberAttributes = false;
                await integrationRepository_1.default.update(integration.id, { settings: integration.settings }, userContext);
            }
            // delete sample data on onboarding
            if (run.onboarding) {
                try {
                    await new sampleDataService_1.default(userContext).deleteSampleData();
                }
                catch (err) {
                    logger.error(err, { tenantId: integration.tenantId }, 'Error deleting sample data!');
                    await this.integrationRunRepository.markError(req.runId, {
                        errorPoint: 'delete_sample_data',
                        message: err.message,
                        stack: err.stack,
                        errorString: JSON.stringify(err),
                    });
                    return;
                }
            }
        }
        try {
            // check global limit reset
            if (intService.limitResetFrequencySeconds > 0 && integration.limitLastResetAt) {
                const secondsSinceLastReset = (0, moment_1.default)()
                    .utc()
                    .diff((0, moment_1.default)(integration.limitLastResetAt).utc(), 'seconds');
                if (secondsSinceLastReset >= intService.limitResetFrequencySeconds) {
                    integration.limitCount = 0;
                    integration.limitLastResetAt = (0, moment_1.default)().utc().toISOString();
                    await integrationRepository_1.default.update(integration.id, {
                        limitCount: integration.limitCount,
                        limitLastResetAt: integration.limitLastResetAt,
                    }, userContext);
                }
            }
            // preprocess if needed
            logger.trace('Preprocessing integration!');
            try {
                await intService.preprocess(stepContext);
            }
            catch (err) {
                if (err.rateLimitResetSeconds) {
                    // need to delay integration processing
                    logger.warn(err, 'Rate limit reached while preprocessing integration! Delaying...');
                    await this.handleRateLimitError(logger, run, err.rateLimitResetSeconds, stepContext);
                    return;
                }
                logger.error(err, 'Error preprocessing integration!');
                await this.integrationRunRepository.markError(req.runId, {
                    errorPoint: 'preprocessing',
                    message: err.message,
                    stack: err.stack,
                    errorString: JSON.stringify(err),
                });
                return;
            }
            // detect streams to process for this integration
            let forcedStream;
            if (req.streamId) {
                forcedStream = await this.integrationStreamRepository.findById(req.streamId);
                if (!forcedStream) {
                    logger.error({ streamId: req.streamId }, 'Stream not found!');
                    throw new Error(`Stream '${req.streamId}' not found!`);
                }
            }
            else {
                const dbStreams = await this.integrationStreamRepository.findByRunId(req.runId, 1, 1);
                if (dbStreams.length > 0) {
                    logger.trace('Streams already detected and saved to the database!');
                }
                else {
                    // need to optimize this as well since it may happen that we have a lot of streams
                    logger.trace('Detecting streams!');
                    try {
                        const pendingStreams = await intService.getStreams(stepContext);
                        const createStreams = pendingStreams.map((s) => ({
                            runId: req.runId,
                            tenantId: run.tenantId,
                            integrationId: run.integrationId,
                            microserviceId: run.microserviceId,
                            name: s.value,
                            metadata: s.metadata,
                        }));
                        await this.integrationStreamRepository.bulkCreate(createStreams);
                        await this.integrationRunRepository.touch(run.id);
                    }
                    catch (err) {
                        if (err.rateLimitResetSeconds) {
                            // need to delay integration processing
                            logger.warn(err, 'Rate limit reached while getting integration streams! Delaying...');
                            await this.handleRateLimitError(logger, run, err.rateLimitResetSeconds, stepContext);
                            return;
                        }
                        throw err;
                    }
                }
            }
            // process streams
            let processedCount = 0;
            let notifyCount = 0;
            let nextStream;
            if (forcedStream) {
                nextStream = forcedStream;
            }
            else {
                nextStream = await this.integrationStreamRepository.getNextStreamToProcess(req.runId);
            }
            while (nextStream) {
                if (req.exiting) {
                    if (!run.onboarding) {
                        logger.warn('Stopped processing integration (not onboarding)!');
                        break;
                    }
                    else {
                        logger.warn('Stopped processing integration (onboarding)!');
                        const delayUntil = (0, moment_1.default)()
                            .add(3 * 60, 'seconds')
                            .toDate();
                        await this.integrationRunRepository.delay(req.runId, delayUntil);
                        break;
                    }
                }
                const stream = {
                    id: nextStream.id,
                    value: nextStream.name,
                    metadata: nextStream.metadata,
                };
                processedCount++;
                notifyCount++;
                let processStreamResult;
                logger.trace({ streamId: stream.id }, 'Processing stream!');
                await this.integrationStreamRepository.markProcessing(stream.id);
                await this.integrationRunRepository.touch(run.id);
                try {
                    processStreamResult = await intService.processStream(stream, stepContext);
                }
                catch (err) {
                    if (err.rateLimitResetSeconds) {
                        logger.warn({ streamId: stream.id, message: err.message }, 'Rate limit reached while processing stream! Delaying...');
                        await this.handleRateLimitError(logger, run, err.rateLimitResetSeconds, stepContext, stream);
                        return;
                    }
                    const retries = await this.integrationStreamRepository.markError(stream.id, {
                        errorPoint: 'process_stream',
                        message: err.message,
                        stack: err.stack,
                        errorString: JSON.stringify(err),
                    });
                    await this.integrationRunRepository.touch(run.id);
                    logger.error(err, { retries, streamId: stream.id }, 'Error while processing stream!');
                }
                if (processStreamResult) {
                    // surround with try catch so if one stream fails we try all of them as well just in case
                    try {
                        logger.trace({ stream: JSON.stringify(stream) }, `Processing stream results!`);
                        if (processStreamResult.newStreams && processStreamResult.newStreams.length > 0) {
                            const dbCreateStreams = processStreamResult.newStreams.map((s) => ({
                                runId: req.runId,
                                tenantId: run.tenantId,
                                integrationId: run.integrationId,
                                microserviceId: run.microserviceId,
                                name: s.value,
                                metadata: s.metadata,
                            }));
                            await this.integrationStreamRepository.bulkCreate(dbCreateStreams);
                            await this.integrationRunRepository.touch(run.id);
                            logger.info(`Detected ${processStreamResult.newStreams.length} new streams to process!`);
                        }
                        for (const operation of processStreamResult.operations) {
                            if (operation.records.length > 0) {
                                logger.trace({ operationType: operation.type }, `Processing bulk operation with ${operation.records.length} records!`);
                                stepContext.limitCount += operation.records.length;
                                await (0, operationsWorker_1.default)(operation.type, operation.records, userContext, (_a = req.fireGitmeshWebhooks) !== null && _a !== void 0 ? _a : true);
                            }
                        }
                        if (processStreamResult.nextPageStream !== undefined) {
                            if (!run.onboarding &&
                                (await intService.isProcessingFinished(stepContext, stream, processStreamResult.operations, processStreamResult.lastRecordTimestamp))) {
                                logger.warn('Integration processing finished because of service implementation!');
                            }
                            else {
                                logger.trace({ currentStream: JSON.stringify(stream) }, `Detected next page stream!`);
                                await this.integrationStreamRepository.create({
                                    runId: req.runId,
                                    tenantId: run.tenantId,
                                    integrationId: run.integrationId,
                                    microserviceId: run.microserviceId,
                                    name: processStreamResult.nextPageStream.value,
                                    metadata: processStreamResult.nextPageStream.metadata,
                                });
                                await this.integrationRunRepository.touch(run.id);
                            }
                        }
                        if (processStreamResult.sleep !== undefined && processStreamResult.sleep > 0) {
                            logger.warn(`Stream processing resulted in a requested delay of ${processStreamResult.sleep}! Will delay remaining streams!`);
                            const delayUntil = (0, moment_1.default)().add(processStreamResult.sleep, 'seconds').toDate();
                            await this.integrationRunRepository.delay(req.runId, delayUntil);
                            break;
                        }
                        if (intService.globalLimit > 0 && stepContext.limitCount >= intService.globalLimit) {
                            // if limit reset frequency is 0 we don't need to care about limits
                            if (intService.limitResetFrequencySeconds > 0) {
                                logger.warn({
                                    limitCount: stepContext.limitCount,
                                    globalLimit: intService.globalLimit,
                                }, 'We reached a global limit - stopping processing!');
                                integration.limitCount = stepContext.limitCount;
                                const secondsSinceLastReset = (0, moment_1.default)()
                                    .utc()
                                    .diff((0, moment_1.default)(integration.limitLastResetAt).utc(), 'seconds');
                                if (secondsSinceLastReset < intService.limitResetFrequencySeconds) {
                                    const delayUntil = (0, moment_1.default)()
                                        .add(intService.limitResetFrequencySeconds - secondsSinceLastReset, 'seconds')
                                        .toDate();
                                    await this.integrationRunRepository.delay(req.runId, delayUntil);
                                }
                                break;
                            }
                        }
                        if (notifyCount === 50) {
                            logger.info(`Processed ${processedCount} streams!`);
                            notifyCount = 0;
                        }
                        await this.integrationStreamRepository.markProcessed(stream.id);
                        await this.integrationRunRepository.touch(run.id);
                    }
                    catch (err) {
                        logger.error(err, { stream: JSON.stringify(stream) }, 'Error processing stream results!');
                        await this.integrationStreamRepository.markError(stream.id, {
                            errorPoint: 'process_stream_results',
                            message: err.message,
                            stack: err.stack,
                            errorString: JSON.stringify(err),
                        });
                        await this.integrationRunRepository.touch(run.id);
                    }
                }
                if (forcedStream) {
                    break;
                }
                nextStream = await this.integrationStreamRepository.getNextStreamToProcess(req.runId);
            }
            // postprocess integration settings
            await intService.postprocess(stepContext);
            logger.info('Done processing integration!');
        }
        catch (err) {
            logger.error(err, 'Error while processing integration!');
        }
        finally {
            const newState = await this.integrationRunRepository.touchState(req.runId);
            let emailSentAt;
            if (newState === types_1.IntegrationRunState.PROCESSED) {
                if (!integration.emailSentAt) {
                    const tenantUsers = await userRepository_1.default.findAllUsersOfTenant(integration.tenantId);
                    emailSentAt = new Date();
                    for (const user of tenantUsers) {
                        await new emailSender_1.default(emailSender_1.default.TEMPLATES.INTEGRATION_DONE, {
                            integrationName: (0, common_1.i18n)('en', `entities.integration.name.${integration.platform}`),
                            link: conf_1.API_CONFIG.frontendUrl,
                        }).sendTo(user.email);
                    }
                }
            }
            let status;
            switch (newState) {
                case types_1.IntegrationRunState.PROCESSED:
                    status = 'done';
                    break;
                case types_1.IntegrationRunState.ERROR:
                    status = 'error';
                    break;
                default:
                    status = integration.status;
            }
            await integrationRepository_1.default.update(integration.id, {
                status,
                emailSentAt,
                settings: stepContext.integration.settings,
                refreshToken: stepContext.integration.refreshToken,
                token: stepContext.integration.token,
            }, userContext);
            if (newState === types_1.IntegrationRunState.PROCESSING && !req.streamId) {
                const failedStreams = await this.integrationStreamRepository.findByRunId(req.runId, 1, 1, [
                    integrationStreamTypes_1.IntegrationStreamState.ERROR,
                ]);
                if (failedStreams.length > 0) {
                    logger.warn('Integration ended but we are still processing - delaying for a minute!');
                    const delayUntil = (0, moment_1.default)().add(60, 'seconds');
                    await this.integrationRunRepository.delay(run.id, delayUntil.toDate());
                }
                else {
                    logger.error('Integration ended but we are still processing!');
                }
            }
            else if (newState === types_1.IntegrationRunState.ERROR) {
                await (0, alerting_1.sendSlackAlert)({
                    slackURL: conf_1.SLACK_ALERTING_CONFIG.url,
                    alertType: alerting_1.SlackAlertTypes.INTEGRATION_ERROR,
                    integration,
                    userContext,
                    log: logger,
                    frameworkVersion: 'old',
                });
            }
            if (run.onboarding && this.apiPubSubEmitter) {
                this.apiPubSubEmitter.emitIntegrationCompleted(integration.tenantId, integration.id, status);
            }
        }
    }
    async handleRateLimitError(logger, run, rateLimitResetSeconds, context, stream) {
        await integrationRepository_1.default.update(context.integration.id, {
            settings: context.integration.settings,
            refreshToken: context.integration.refreshToken,
            token: context.integration.token,
        }, context.repoContext);
        logger.warn('Rate limit reached, delaying integration processing!');
        const delayUntil = (0, moment_1.default)().add(rateLimitResetSeconds + 30, 'seconds');
        await this.integrationRunRepository.delay(run.id, delayUntil.toDate());
        if (stream) {
            await this.integrationStreamRepository.reset(stream.id);
        }
    }
}
exports.IntegrationRunProcessor = IntegrationRunProcessor;
//# sourceMappingURL=integrationRunProcessor.js.map