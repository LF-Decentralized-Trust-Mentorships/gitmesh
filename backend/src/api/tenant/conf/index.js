"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
exports.__esModule = true;
exports.SEARCH_SYNC_API_CONFIG = exports.TEMPORAL_CONFIG = exports.ANALYTICS_CONFIG = exports.WEEKLY_EMAILS_CONFIG = exports.INTEGRATION_PROCESSING_CONFIG = exports.SAMPLE_DATA_CONFIG = exports.SLACK_ALERTING_CONFIG = exports.STACKEXCHANGE_CONFIG = exports.OPENSEARCH_CONFIG = exports.UNLEASH_CONFIG = exports.SIGNALS_CONFIG = exports.ORGANIZATION_ENRICHMENT_CONFIG = exports.ENRICHMENT_CONFIG = exports.NANGO_CONFIG = exports.CUBEJS_CONFIG = exports.NETLIFY_CONFIG = exports.SENDGRID_CONFIG = exports.GITHUB_CONFIG = exports.DISCORD_CONFIG = exports.GOOGLE_CONFIG = exports.SLACK_NOTIFIER_CONFIG = exports.SLACK_CONFIG = exports.TWITTER_CONFIG = exports.DEVTO_CONFIG = exports.PLANS_CONFIG = exports.AUTH0_CONFIG = exports.API_CONFIG = exports.CLEARBIT_CONFIG = exports.COMPREHEND_CONFIG = exports.SEGMENT_CONFIG = exports.DB_CONFIG = exports.S3_CONFIG = exports.REDIS_CONFIG = exports.SQS_CONFIG = exports.IS_CLOUD_ENV = exports.LOG_LEVEL = exports.IS_STAGING_ENV = exports.IS_PROD_ENV = exports.IS_DEV_ENV = exports.IS_TEST_ENV = exports.TENANT_MODE = exports.SERVICE = exports.KUBE_MODE = void 0;
var config_1 = __importDefault(require("config"));
// TODO-kube
exports.KUBE_MODE = process.env.KUBE_MODE === '1' || process.env.KUBE_MODE === 'true';
exports.SERVICE = process.env.SERVICE;
exports.TENANT_MODE = process.env.TENANT_MODE;
exports.IS_TEST_ENV = process.env.NODE_ENV === 'test';
exports.IS_DEV_ENV = process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'docker' ||
    process.env.NODE_ENV === undefined;
exports.IS_PROD_ENV = process.env.NODE_ENV === 'production';
exports.IS_STAGING_ENV = process.env.NODE_ENV === 'staging';
exports.LOG_LEVEL = process.env.LOG_LEVEL || 'info';
exports.IS_CLOUD_ENV = exports.IS_PROD_ENV || exports.IS_STAGING_ENV;
exports.SQS_CONFIG = config_1["default"].get('sqs');
exports.REDIS_CONFIG = config_1["default"].get('redis');
exports.S3_CONFIG = config_1["default"].get('s3');
exports.DB_CONFIG = config_1["default"].get('db');
exports.SEGMENT_CONFIG = config_1["default"].get('segment');
exports.COMPREHEND_CONFIG = config_1["default"].get('comprehend');
exports.CLEARBIT_CONFIG = config_1["default"].get('clearbit');
exports.API_CONFIG = config_1["default"].get('api');
exports.AUTH0_CONFIG = config_1["default"].get('auth0');
exports.PLANS_CONFIG = config_1["default"].get('plans');
exports.DEVTO_CONFIG = config_1["default"].get('devto');
exports.TWITTER_CONFIG = config_1["default"].get('twitter');
exports.SLACK_CONFIG = config_1["default"].get('slack');
exports.SLACK_NOTIFIER_CONFIG = config_1["default"].get('slackNotifier');
exports.GOOGLE_CONFIG = config_1["default"].get('google');
exports.DISCORD_CONFIG = config_1["default"].get('discord');
exports.GITHUB_CONFIG = config_1["default"].get('github');
exports.SENDGRID_CONFIG = config_1["default"].get('sendgrid');
exports.NETLIFY_CONFIG = config_1["default"].get('netlify');
exports.CUBEJS_CONFIG = config_1["default"].get('cubejs');
exports.NANGO_CONFIG = config_1["default"].get('nango');
exports.ENRICHMENT_CONFIG = config_1["default"].get('enrichment');
exports.ORGANIZATION_ENRICHMENT_CONFIG = config_1["default"].get('organizationEnrichment');
exports.SIGNALS_CONFIG = config_1["default"].get('signals');
exports.UNLEASH_CONFIG = config_1["default"].get('unleash');
exports.OPENSEARCH_CONFIG = config_1["default"].get('opensearch');
exports.STACKEXCHANGE_CONFIG = (_a = config_1["default"].get('stackexchange')) !== null && _a !== void 0 ? _a : {
    key: process.env.STACKEXCHANGE_KEY
};
exports.SLACK_ALERTING_CONFIG = config_1["default"].get('slackAlerting');
exports.SAMPLE_DATA_CONFIG = config_1["default"].get('sampleData');
exports.INTEGRATION_PROCESSING_CONFIG = config_1["default"].get('integrationProcessing');
exports.WEEKLY_EMAILS_CONFIG = config_1["default"].get('weeklyEmails');
exports.ANALYTICS_CONFIG = config_1["default"].get('gitmeshAnalytics');
exports.TEMPORAL_CONFIG = config_1["default"].get('temporal');
exports.SEARCH_SYNC_API_CONFIG = config_1["default"].get('searchSyncApi');
