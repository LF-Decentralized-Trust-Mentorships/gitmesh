"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationTickProcessor = void 0;
const common_1 = require("@gitmesh/common");
const integrations_1 = require("@gitmesh/integrations");
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const sequelizeRepository_1 = __importDefault(require("@/database/repositories/sequelizeRepository"));
const microserviceRepository_1 = __importDefault(require("@/database/repositories/microserviceRepository"));
const integrationRepository_1 = __importDefault(require("@/database/repositories/integrationRepository"));
const nodeWorkerIntegrationProcessMessage_1 = require("../../../types/mq/nodeWorkerIntegrationProcessMessage");
const nodeWorkerSQS_1 = require("../../utils/nodeWorkerSQS");
const serviceSQS_1 = require("../../utils/serviceSQS");
class IntegrationTickProcessor extends logging_1.LoggerBase {
    constructor(options, integrationServices, integrationRunRepository) {
        super(options.log);
        this.integrationServices = integrationServices;
        this.integrationRunRepository = integrationRunRepository;
        this.tickTrackingMap = new Map();
        this.emittersInitialized = false;
        for (const intService of this.integrationServices) {
            this.tickTrackingMap[intService.type] = 0;
        }
        for (const intService of integrations_1.INTEGRATION_SERVICES) {
            this.tickTrackingMap[intService.type] = 0;
        }
    }
    async initEmitters() {
        if (!this.emittersInitialized) {
            this.intRunWorkerEmitter = await (0, serviceSQS_1.getIntegrationRunWorkerEmitter)();
            this.intStreamWorkerEmitter = await (0, serviceSQS_1.getIntegrationStreamWorkerEmitter)();
            this.dataSinkWorkerEmitter = await (0, serviceSQS_1.getDataSinkWorkerEmitter)();
            this.emittersInitialized = true;
        }
    }
    async processTick() {
        await this.processCheckTick();
        await this.processDelayedTick();
    }
    async processCheckTick() {
        this.log.trace('Processing integration processor tick!');
        const tickers = this.integrationServices.map((i) => ({
            type: i.type,
            ticksBetweenChecks: i.ticksBetweenChecks,
        }));
        for (const service of integrations_1.INTEGRATION_SERVICES) {
            tickers.push({
                type: service.type,
                ticksBetweenChecks: service.checkEvery || -1,
            });
        }
        const promises = [];
        for (const intService of tickers) {
            let trigger = false;
            if (intService.ticksBetweenChecks < 0) {
                this.log.debug({ type: intService.type }, 'Integration is set to never be triggered.');
            }
            else if (intService.ticksBetweenChecks === 0) {
                this.log.warn({ type: intService.type }, 'Integration is set to be always triggered.');
                trigger = true;
            }
            else {
                this.tickTrackingMap[intService.type]++;
                if (this.tickTrackingMap[intService.type] === intService.ticksBetweenChecks) {
                    this.log.info({ type: intService.type, tickCount: intService.ticksBetweenChecks }, 'Integration is being triggered since it reached its target tick count!');
                    trigger = true;
                    this.tickTrackingMap[intService.type] = 0;
                }
            }
            if (trigger) {
                this.log.info({ type: intService.type }, 'Triggering integration check!');
                promises.push(this.processCheck(intService.type).catch((err) => {
                    this.log.error(err, 'Error while processing integration check!');
                }));
            }
        }
        if (promises.length > 0) {
            await Promise.all(promises);
        }
    }
    async processCheck(type) {
        const logger = (0, logging_1.getChildLogger)('processCheck', this.log, { IntegrationType: type });
        logger.trace('Processing integration check!');
        if (type === types_1.IntegrationType.TWITTER_REACH) {
            await (0, common_1.processPaginated)(async (page) => microserviceRepository_1.default.findAllByType('twitter_followers', page, 10), async (microservices) => {
                this.log.debug({ type, count: microservices.length }, 'Found microservices to check!');
                for (const micro of microservices) {
                    const existingRun = await this.integrationRunRepository.findLastProcessingRun(undefined, micro.id);
                    if (!existingRun) {
                        const microservice = micro;
                        const run = await this.integrationRunRepository.create({
                            microserviceId: microservice.id,
                            tenantId: microservice.tenantId,
                            onboarding: false,
                            state: types_1.IntegrationRunState.PENDING,
                        });
                        this.log.debug({ type, runId: run.id }, 'Triggering microservice processing!');
                        await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(microservice.tenantId, new nodeWorkerIntegrationProcessMessage_1.NodeWorkerIntegrationProcessMessage(run.id));
                    }
                }
            });
        }
        else {
            const options = (await sequelizeRepository_1.default.getDefaultIRepositoryOptions());
            // get the relevant integration service that is supposed to be configured already
            const intService = (0, common_1.singleOrDefault)(this.integrationServices, (s) => s.type === type);
            if (intService) {
                await (0, common_1.processPaginated)(async (page) => integrationRepository_1.default.findAllActive(type, page, 10), async (integrations) => {
                    logger.debug({ integrationIds: integrations.map((i) => i.id) }, 'Found old integrations to check!');
                    const inactiveIntegrations = [];
                    for (const integration of integrations) {
                        const existingRun = await this.integrationRunRepository.findLastProcessingRun(integration.id);
                        if (!existingRun) {
                            inactiveIntegrations.push(integration);
                        }
                    }
                    if (inactiveIntegrations.length > 0) {
                        logger.info({ integrationIds: inactiveIntegrations.map((i) => i.id) }, 'Triggering old integration checks!');
                        await intService.triggerIntegrationCheck(inactiveIntegrations, options);
                    }
                });
            }
            else {
                const newIntService = (0, common_1.singleOrDefault)(integrations_1.INTEGRATION_SERVICES, (i) => i.type === type);
                if (!newIntService) {
                    throw new Error(`No integration service found for type ${type}!`);
                }
                const emitter = await (0, serviceSQS_1.getIntegrationRunWorkerEmitter)();
                await (0, common_1.processPaginated)(async (page) => integrationRepository_1.default.findAllActive(type, page, 10), async (integrations) => {
                    logger.debug({ integrationIds: integrations.map((i) => i.id) }, 'Found new integrations to check!');
                    for (const integration of integrations) {
                        const existingRun = await this.integrationRunRepository.findLastProcessingRunInNewFramework(integration.id);
                        if (!existingRun) {
                            const CHUNKS = 3; // Define the number of chunks
                            const DELAY_BETWEEN_CHUNKS = 30 * 60 * 1000; // Define the delay between chunks in milliseconds
                            const rand = Math.random() * CHUNKS;
                            const chunkIndex = Math.min(Math.floor(rand), CHUNKS - 1);
                            const delay = chunkIndex * DELAY_BETWEEN_CHUNKS;
                            // Divide integrations into chunks for Discord
                            if (newIntService.type === types_1.IntegrationType.DISCORD) {
                                setTimeout(async () => {
                                    logger.info({ integrationId: integration.id }, `Triggering new delayed integration check for Discord in ${delay / 60 / 1000} minutes!`);
                                    await emitter.triggerIntegrationRun(integration.tenantId, integration.platform, integration.id, false);
                                }, delay);
                            }
                            else {
                                logger.info({ integrationId: integration.id }, 'Triggering new integration check!');
                                await emitter.triggerIntegrationRun(integration.tenantId, integration.platform, integration.id, false);
                            }
                        }
                        else {
                            logger.info({ integrationId: integration.id }, 'Existing run found, skipping!');
                        }
                    }
                });
            }
        }
    }
    async processDelayedTick() {
        await this.initEmitters();
        await this.intRunWorkerEmitter.checkRuns();
        await this.intStreamWorkerEmitter.checkStreams();
        await this.dataSinkWorkerEmitter.checkResults();
        // TODO check streams as well
        this.log.trace('Checking for delayed integration runs!');
        await (0, common_1.processPaginated)(async (page) => this.integrationRunRepository.findDelayedRuns(page, 10), async (delayedRuns) => {
            for (const run of delayedRuns) {
                this.log.info({ runId: run.id }, 'Triggering delayed integration run processing!');
                await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(new Date().toISOString(), new nodeWorkerIntegrationProcessMessage_1.NodeWorkerIntegrationProcessMessage(run.id));
            }
        });
    }
}
exports.IntegrationTickProcessor = IntegrationTickProcessor;
//# sourceMappingURL=integrationTickProcessor.js.map