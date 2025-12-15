"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationServiceBase = void 0;
const one_sdk_1 = require("@superfaceai/one-sdk");
const moment_1 = __importDefault(require("moment"));
const crypto_1 = __importDefault(require("crypto"));
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const conf_1 = require("../../../conf");
const nodeWorkerSQS_1 = require("../../utils/nodeWorkerSQS");
const nodeWorkerIntegrationProcessMessage_1 = require("../../../types/mq/nodeWorkerIntegrationProcessMessage");
const integrationRunRepository_1 = __importDefault(require("../../../database/repositories/integrationRunRepository"));
const logger = (0, logging_1.getServiceChildLogger)('integrationService');
/* eslint class-methods-use-this: 0 */
/* eslint-disable @typescript-eslint/no-unused-vars */
class IntegrationServiceBase {
    /**
     * Every new integration should extend this class and implement its methods.
     *
     * @param type What integration is this?
     * @param ticksBetweenChecks How many ticks to skip between each integration checks (each tick is 1 minute). If 0 it will be triggered every tick same as if it was 1. If negative it will never be triggered.
     */
    constructor(type, ticksBetweenChecks) {
        this.type = type;
        this.ticksBetweenChecks = ticksBetweenChecks;
        this.globalLimit = 0;
        this.onboardingLimitModifierFactor = 1.0;
        this.limitResetFrequencySeconds = 0;
    }
    async triggerIntegrationCheck(integrations, options) {
        const repository = new integrationRunRepository_1.default(options);
        for (const integration of integrations) {
            const run = await repository.create({
                integrationId: integration.id,
                tenantId: integration.tenantId,
                onboarding: false,
                state: types_1.IntegrationRunState.PENDING,
            });
            logger.info({ integrationId: integration.id, runId: run.id }, 'Triggering integration processing!');
            await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(integration.tenantId, new nodeWorkerIntegrationProcessMessage_1.NodeWorkerIntegrationProcessMessage(run.id));
        }
    }
    async preprocess(context) {
        // do nothing - override if something is needed
    }
    async createMemberAttributes(context) {
        // do nothing - override if something is needed
    }
    async isProcessingFinished(context, currentStream, lastOperations, lastRecord, lastRecordTimestamp) {
        return false;
    }
    async postprocess(context) {
        // do nothing - override if something is needed
    }
    async processWebhook(webhook, context) {
        throw new Error('Not implemented');
    }
    static superfaceClient() {
        if (conf_1.IS_TEST_ENV) {
            return undefined;
        }
        return new one_sdk_1.SuperfaceClient();
    }
    /**
     * Check whether the last record is over the retrospect that we are interested in
     * @param lastRecordTimestamp The last activity timestamp we got
     * @param startTimestamp The timestamp when we started
     * @param maxRetrospect The maximum time we want to crawl
     * @returns Whether we are over the retrospect already
     */
    static isRetrospectOver(lastRecordTimestamp, startTimestamp, maxRetrospect) {
        return startTimestamp - (0, moment_1.default)(lastRecordTimestamp).unix() > maxRetrospect;
    }
    /**
     * Some activities will not have a remote(API) counterparts so they will miss sourceIds.
     * Since we're using sourceIds to find out if an activity already exists in our DB,
     * sourceIds are required when creating an activity.
     * This function generates an md5 hash that can be used as a sourceId of an activity.
     * Prepends string `gen-` to the beginning so generated and remote sourceIds
     * can be distinguished.
     *
     * @param {string} uniqueRemoteId remote member id from an integration. This id needs to be unique in a platform
     * @param {string} type type of the activity
     * @param {string} timestamp unix timestamp of the activity
     * @param {string} platform platform of the activity
     * @returns 32 bit md5 hash generated from the given data, prepended with string `gen-`
     */
    static generateSourceIdHash(uniqueRemoteId, type, timestamp, platform) {
        if (!uniqueRemoteId || !type || !timestamp || !platform) {
            throw new Error('Bad hash input');
        }
        const data = `${uniqueRemoteId}-${type}-${timestamp}-${platform}`;
        return `gen-${crypto_1.default.createHash('md5').update(data).digest('hex')}`;
    }
    /**
     * Get the number of seconds from a date to a unix timestamp.
     * Adding a 25% padding for security.
     * If the unix timestamp is before the date, return 3 minutes for security
     * @param date The date to get the seconds from
     * @param unixTimestamp The unix timestamp to get the seconds from
     * @returns The number of seconds from the date to the unix timestamp
     */
    static secondsUntilTimestamp(unixTimestamp, date = (0, moment_1.default)().utc().toDate()) {
        const timestampedDate = moment_1.default.utc(date).unix();
        if (timestampedDate > unixTimestamp) {
            return 60 * 3;
        }
        return Math.floor(unixTimestamp - timestampedDate);
    }
}
exports.IntegrationServiceBase = IntegrationServiceBase;
//# sourceMappingURL=integrationServiceBase.js.map