"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSlackAlert = exports.SlackAlertTypes = void 0;
const axios_1 = __importDefault(require("axios"));
const integrationDataCheckerSettings_1 = require("../serverless/microservices/nodejs/integration-data-checker/integrationDataCheckerSettings");
const conf_1 = require("../conf");
var SlackAlertTypes;
(function (SlackAlertTypes) {
    SlackAlertTypes["DATA_CHECKER"] = "data-checker";
    SlackAlertTypes["INTEGRATION_ERROR"] = "integration-error";
})(SlackAlertTypes = exports.SlackAlertTypes || (exports.SlackAlertTypes = {}));
async function sendSlackAlert(alertType, integration, userContext, log, settings = {}) {
    const blocks = getBlocks(alertType, integration, userContext, log, settings);
    const url = conf_1.SLACK_ALERTING_CONFIG.url;
    await axios_1.default.post(url, blocks);
}
exports.sendSlackAlert = sendSlackAlert;
function getBlocks(alertType, integration, userContext, log, settings) {
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
                                text: settings.type === integrationDataCheckerSettings_1.IntegrationDataCheckerSettingsType.PLATFORM_SPECIFIC
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
                            text: `${isPayingCustomer ? '🚨' : '✋🏼'} *Integration onboarding failed* ${isPayingCustomer ? '🚨' : ''}`,
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
                        ],
                    },
                ],
            };
        default:
            log.warn('Invalid alert type. Not sending message');
            return null;
    }
}
//# sourceMappingURL=slackAlerts.js.map