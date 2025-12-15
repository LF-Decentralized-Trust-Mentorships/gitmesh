"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-case-declarations */
const types_1 = require("@gitmesh/types");
const feature_flags_1 = require("@gitmesh/feature-flags");
const weeklyAnalyticsEmailsWorker_1 = require("./analytics/workers/weeklyAnalyticsEmailsWorker");
const newActivityWorker_1 = __importDefault(require("./automation/workers/newActivityWorker"));
const newMemberWorker_1 = __importDefault(require("./automation/workers/newMemberWorker"));
const webhookWorker_1 = __importDefault(require("./automation/workers/webhookWorker"));
const slackWorker_1 = __importDefault(require("./automation/workers/slackWorker"));
const csvExportWorker_1 = require("./csv-export/csvExportWorker");
const stripeWebhookWorker_1 = require("../../integrations/workers/stripeWebhookWorker");
const sendgridWebhookWorker_1 = require("../../integrations/workers/sendgridWebhookWorker");
const bulkEnrichmentWorker_1 = require("./bulk-enrichment/bulkEnrichmentWorker");
const signalsEmailDigestWorker_1 = require("./signals-email-digest/signalsEmailDigestWorker");
const integrationDataCheckerWorker_1 = require("./integration-data-checker/integrationDataCheckerWorker");
const refreshSampleDataWorker_1 = require("./integration-data-checker/refreshSampleDataWorker");
const mergeSuggestionsWorker_1 = require("./merge-suggestions/mergeSuggestionsWorker");
const orgMergeWorker_1 = require("./org-merge/orgMergeWorker");
const bulkOrganizationEnrichmentWorker_1 = require("./bulk-enrichment/bulkOrganizationEnrichmentWorker");
const conf_1 = require("../../../conf");
/**
 * Worker factory for spawning different microservices
 * according to event.service
 * @param event
 * @returns worker function promise
 */
async function workerFactory(event) {
    const unleash = await (0, feature_flags_1.getUnleashClient)({
        url: conf_1.UNLEASH_CONFIG.url,
        appName: event.service,
        apiKey: conf_1.UNLEASH_CONFIG.backendApiKey,
    });
    const { service, tenant } = event;
    switch (service.toLowerCase()) {
        case 'stripe-webhooks':
            return (0, stripeWebhookWorker_1.processStripeWebhook)(event);
        case 'sendgrid-webhooks':
            return (0, sendgridWebhookWorker_1.processSendgridWebhook)(event);
        case 'weekly-analytics-emails':
            if ((0, feature_flags_1.isFeatureEnabled)(types_1.FeatureFlag.TEMPORAL_EMAILS, async () => ({
                tenant,
            }), unleash)) {
                return {};
            }
            return (0, weeklyAnalyticsEmailsWorker_1.weeklyAnalyticsEmailsWorker)(tenant);
        case 'signals-email-digest':
            if ((0, feature_flags_1.isFeatureEnabled)(types_1.FeatureFlag.TEMPORAL_EMAILS, async () => ({
                tenant,
            }), unleash)) {
                return {};
            }
            const signalsDigestMessage = event;
            return (0, signalsEmailDigestWorker_1.signalsEmailDigestWorker)(signalsDigestMessage.user, signalsDigestMessage.tenant);
        case 'integration-data-checker':
            const integrationDataCheckerMessage = event;
            return (0, integrationDataCheckerWorker_1.integrationDataCheckerWorker)(integrationDataCheckerMessage.integrationId, integrationDataCheckerMessage.tenantId);
        case 'merge-suggestions':
            return (0, mergeSuggestionsWorker_1.mergeSuggestionsWorker)(tenant);
        case 'refresh-sample-data':
            return (0, refreshSampleDataWorker_1.refreshSampleDataWorker)();
        case 'csv-export':
            const csvExportMessage = event;
            return (0, csvExportWorker_1.csvExportWorker)(csvExportMessage.entity, csvExportMessage.user, tenant, csvExportMessage.segmentIds, csvExportMessage.criteria);
        case 'bulk-enrich':
            const bulkEnrichMessage = event;
            return (0, bulkEnrichmentWorker_1.bulkEnrichmentWorker)(bulkEnrichMessage.tenant, bulkEnrichMessage.memberIds, bulkEnrichMessage.segmentIds, bulkEnrichMessage.notifyFrontend, bulkEnrichMessage.skipCredits);
        case 'enrich-organizations': {
            const bulkEnrichMessage = event;
            return (0, bulkOrganizationEnrichmentWorker_1.BulkorganizationEnrichmentWorker)(bulkEnrichMessage.tenantId, bulkEnrichMessage.maxEnrichLimit);
        }
        case 'automation-process':
            if (conf_1.API_CONFIG.edition === types_1.Edition.LFX) {
                return {};
            }
            const automationProcessRequest = event;
            switch (automationProcessRequest.automationType) {
                case types_1.AutomationType.WEBHOOK:
                    const webhookProcessRequest = event;
                    return (0, webhookWorker_1.default)(tenant, webhookProcessRequest.automationId, webhookProcessRequest.automation, webhookProcessRequest.eventId, webhookProcessRequest.payload);
                case types_1.AutomationType.SLACK:
                    const slackProcessRequest = event;
                    return (0, slackWorker_1.default)(tenant, slackProcessRequest.automationId, slackProcessRequest.automation, slackProcessRequest.eventId, slackProcessRequest.payload);
                default:
                    throw new Error(`Invalid automation type ${automationProcessRequest.automationType}!`);
            }
        case 'automation':
            if (conf_1.API_CONFIG.edition === types_1.Edition.LFX) {
                return {};
            }
            const automationRequest = event;
            switch (automationRequest.trigger) {
                case types_1.AutomationTrigger.NEW_ACTIVITY:
                    const newActivityAutomationRequest = event;
                    return (0, newActivityWorker_1.default)(tenant, newActivityAutomationRequest.activityId, newActivityAutomationRequest.segmentId);
                case types_1.AutomationTrigger.NEW_MEMBER:
                    const newMemberAutomationRequest = event;
                    return (0, newMemberWorker_1.default)(tenant, newMemberAutomationRequest.memberId, newMemberAutomationRequest.segmentId);
                default:
                    throw new Error(`Invalid automation trigger ${automationRequest.trigger}!`);
            }
        case 'org-merge':
            const orgMergeMessage = event;
            return (0, orgMergeWorker_1.orgMergeWorker)(orgMergeMessage.tenantId, orgMergeMessage.primaryOrgId, orgMergeMessage.secondaryOrgId, orgMergeMessage.notifyFrontend);
        default:
            throw new Error(`Invalid microservice ${service}`);
    }
}
exports.default = workerFactory;
//# sourceMappingURL=workerFactory.js.map