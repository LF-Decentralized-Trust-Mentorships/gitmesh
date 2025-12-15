"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationDataCheckerWorker = void 0;
const moment_1 = __importDefault(require("moment"));
const logging_1 = require("@gitmesh/logging");
const alerting_1 = require("@gitmesh/alerting");
const getUserContext_1 = __importDefault(require("../../../../database/utils/getUserContext"));
const integrationService_1 = __importDefault(require("../../../../services/integrationService"));
const activityService_1 = __importDefault(require("../../../../services/activityService"));
const integrationDataCheckerSettings_1 = require("./integrationDataCheckerSettings");
const conf_1 = require("../../../../conf");
const log = (0, logging_1.getServiceChildLogger)('integrationDataCheckerWorker');
async function integrationDataCheckerWorker(integrationId, tenantId) {
    const userContext = await (0, getUserContext_1.default)(tenantId);
    const integrationService = new integrationService_1.default(userContext);
    const integration = await integrationService.findById(integrationId);
    if (integration) {
        await checkIntegrationForAllSettings(integration, userContext);
    }
}
exports.integrationDataCheckerWorker = integrationDataCheckerWorker;
/**
 * Check if the integration has data, platform-agnostic.
 * Each setting will contain a timeframe that we want, and some instructions of what to do.
 * If there have not been any activities in the timeframe, we will act accordingly.
 * @param integration The integration to check
 * @param userContext User context
 */
async function checkIntegrationForAllSettings(integration, userContext) {
    var _a;
    const activityService = new activityService_1.default(userContext);
    for (const settings of integrationDataCheckerSettings_1.integrationDataCheckerSettings) {
        // This is moment() - the time. For example, moment().subtract(1, 'hour') is 1 hour ago.
        const timestampSinceLastData = generateDate(settings.timeSinceLastData);
        if (shouldCheckThisIntegration(integration, settings, timestampSinceLastData)) {
            if (!(settings.type === integrationDataCheckerSettings_1.IntegrationDataCheckerSettingsType.PLATFORM_SPECIFIC) ||
                ((_a = settings.activityPlatformsAndType) === null || _a === void 0 ? void 0 : _a.platforms.includes(integration.platform))) {
                const activityCount = (await activityService.findAndCountAll({
                    filter: Object.assign({ platform: integration.platform, createdAt: {
                            gte: timestampSinceLastData,
                        } }, (settings.type === integrationDataCheckerSettings_1.IntegrationDataCheckerSettingsType.PLATFORM_SPECIFIC && {
                        type: settings.activityPlatformsAndType.type,
                    })),
                    limit: 1,
                })).count;
                if (!activityCount) {
                    await changeStatusAction(settings, integration, userContext);
                    await sendSlackAlertAction(settings, integration, userContext);
                    break;
                }
            }
        }
    }
}
function shouldCheckThisIntegration(integration, settings, timestampSinceLastData) {
    // We always should be only checking integrations that have been created before the time we want to check.
    // Otherwise, it is never relevant.
    if (integration.createdAt < timestampSinceLastData) {
        // Either we do not care about it being only new integrations,
        // or the integration's createdAt is before the time we want to check + the reset frequency.
        return (!settings.onlyNewIntegrations ||
            integration.createdAt > timestampSinceLastData.subtract(1, 'hour'));
    }
    return false;
}
async function changeStatusAction(settings, integration, userContext) {
    if (settings.actions.changeStatus) {
        const integrationService = new integrationService_1.default(userContext);
        await integrationService.update(integration.id, {
            status: 'no-data',
        });
    }
}
async function sendSlackAlertAction(settings, integration, userContext) {
    return (0, alerting_1.sendSlackAlert)({
        slackURL: conf_1.SLACK_ALERTING_CONFIG.url,
        alertType: alerting_1.SlackAlertTypes.DATA_CHECKER,
        integration,
        userContext,
        log,
        frameworkVersion: 'old',
        settings,
    });
}
function generateDate(timeframe) {
    const now = (0, moment_1.default)();
    if (timeframe.includes('hour')) {
        // Parse int will actually work. 2 hours => 2, 1 day => 1, etc.
        const hours = parseInt(timeframe, 10);
        return now.subtract(hours, 'hours');
    }
    if (timeframe.includes('day')) {
        const days = parseInt(timeframe, 10);
        return now.subtract(days, 'days');
    }
    log.error('Invalid timeframe', timeframe);
    throw new Error('Invalid timeframe');
}
//# sourceMappingURL=integrationDataCheckerWorker.js.map