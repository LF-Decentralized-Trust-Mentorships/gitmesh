"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackAlertTypes = void 0;
exports.sendSlackAlert = sendSlackAlert;
const axios_1 = __importDefault(require("axios"));
var SlackAlertTypes;
(function (SlackAlertTypes) {
    SlackAlertTypes["DATA_CHECKER"] = "data-checker";
    SlackAlertTypes["INTEGRATION_ERROR"] = "integration-error";
    SlackAlertTypes["DATA_WORKER_ERROR"] = "data-worker-error";
    SlackAlertTypes["SINK_WORKER_ERROR"] = "sink-worker-error";
})(SlackAlertTypes || (exports.SlackAlertTypes = SlackAlertTypes = {}));
var IntegrationDataCheckerSettingsType;
(function (IntegrationDataCheckerSettingsType) {
    IntegrationDataCheckerSettingsType["REGULAR"] = "regular";
    IntegrationDataCheckerSettingsType["PLATFORM_SPECIFIC"] = "platformSpecific";
})(IntegrationDataCheckerSettingsType || (IntegrationDataCheckerSettingsType = {}));
async function sendSlackAlert({ slackURL, alertType, integration, userContext, log, settings = null, frameworkVersion, }) {
    const blocks = getBlocks(alertType, integration, userContext, log, settings, frameworkVersion);
    await axios_1.default.post(slackURL, blocks);
}
function getBlocks(alertType, integration, userContext, log, settings, frameworkVersion) {
    const tenantName = userContext.currentTenant.name;
    const isPayingCustomer = userContext.currentTenant.plan !== 'Essential';
    const isTrial = userContext.currentTenant.isTrial;
    const payingCustomerMarker = `✅ ${isTrial ? ' (trial)' : ''}`;
    switch (alertType) {
        case SlackAlertTypes.DATA_CHECKER:
            return {
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `${isPayingCustomer ? '🚨' : '✋🏼'} *Integration not getting data* ${isPayingCustomer ? '🚨' : ''}`,
                        },
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*Tenant Name:*\n${tenantName}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Paying customer:* ${isPayingCustomer ? payingCustomerMarker : '❌'}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Time since last data:*\n${settings.timeSinceLastData}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Notified user (in-app):* ${settings.actions.changeStatus ? '✔️' : '✖️'}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Platform:*\n${integration.platform}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: settings.type === IntegrationDataCheckerSettingsType.PLATFORM_SPECIFIC
                                    ? `*Activity type:*\n${settings.activityPlatformsAndType.type}`
                                    : ' ',
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Tenant ID:*\n${integration.tenantId}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Integration ID:*\n${integration.id}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Framework Version:*\n${frameworkVersion}`,
                            },
                        ],
                    },
                ],
            };
        case SlackAlertTypes.INTEGRATION_ERROR:
            return {
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `${isPayingCustomer ? '🚨' : '✋🏼'} *Integration streams failed (onboarding or incremental)* ${isPayingCustomer ? '🚨' : ''}`,
                        },
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*Tenant Name:*\n${tenantName}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Paying customer:* ${isPayingCustomer ? payingCustomerMarker : '❌'}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Platform:*\n${integration.platform}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: ' ',
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Tenant ID:*\n${integration.tenantId}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Integration ID:*\n${integration.id}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Framework Version:*\n${frameworkVersion}`,
                            },
                        ],
                    },
                ],
            };
        case SlackAlertTypes.DATA_WORKER_ERROR:
            return {
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `${isPayingCustomer ? '🚨' : '✋🏼'} *Integration data worker failed (parsing API data into activities)* ${isPayingCustomer ? '🚨' : ''}`,
                        },
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*Tenant Name:*\n${tenantName}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Paying customer:* ${isPayingCustomer ? payingCustomerMarker : '❌'}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Platform:*\n${integration.platform}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: ' ',
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Tenant ID:*\n${integration.tenantId}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Integration ID:*\n${integration.id}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*API Data ID:*\n${integration.apiDataId}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Framework Version:*\n${frameworkVersion}`,
                            },
                        ],
                    },
                ],
            };
        case SlackAlertTypes.SINK_WORKER_ERROR:
            return {
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `${isPayingCustomer ? '🚨' : '✋🏼'} *Data sink worker failed (upsert in db) * ${isPayingCustomer ? '🚨' : ''}`,
                        },
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*Tenant Name:*\n${tenantName}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Paying customer:* ${isPayingCustomer ? payingCustomerMarker : '❌'}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Platform:*\n${integration.platform}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: ' ',
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Tenant ID:*\n${integration.tenantId}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Integration ID:*\n${integration.id}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Result ID:*\n${integration.resultId}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*API Data ID:*\n${integration.apiDataId}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Framework Version:*\n${frameworkVersion}`,
                            },
                        ],
                    },
                ],
            };
        default:
            log.warn('Invalid alert type. Not sending message');
            return null;
    }
}
//# sourceMappingURL=integrations.js.map