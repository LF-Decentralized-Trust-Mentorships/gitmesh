"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const integrationTicks_1 = __importDefault(require("./integrationTicks"));
const weeklyAnalyticsEmailsCoordinator_1 = __importDefault(require("./weeklyAnalyticsEmailsCoordinator"));
const memberScoreCoordinator_1 = __importDefault(require("./memberScoreCoordinator"));
const refreshMaterializedViews_1 = __importDefault(require("./refreshMaterializedViews"));
const refreshMaterializedViewsForCube_1 = __importDefault(require("./refreshMaterializedViewsForCube"));
const downgradeExpiredPlans_1 = __importDefault(require("./downgradeExpiredPlans"));
const signalsEmailDigestTicks_1 = __importDefault(require("./signalsEmailDigestTicks"));
const integrationDataChecker_1 = __importDefault(require("./integrationDataChecker"));
const mergeSuggestions_1 = __importDefault(require("./mergeSuggestions"));
const refreshSampleData_1 = __importDefault(require("./refreshSampleData"));
const cleanUp_1 = __importDefault(require("./cleanUp"));
const checkStuckIntegrationRuns_1 = __importDefault(require("./checkStuckIntegrationRuns"));
const organizationEnricher_1 = __importDefault(require("./organizationEnricher"));
const conf_1 = require("../../conf");
const EMAILS_ENABLED = conf_1.WEEKLY_EMAILS_CONFIG.enabled === 'true';
const jobs = [
    integrationTicks_1.default,
    memberScoreCoordinator_1.default,
    refreshMaterializedViews_1.default,
    refreshMaterializedViewsForCube_1.default,
    downgradeExpiredPlans_1.default,
    signalsEmailDigestTicks_1.default,
    integrationDataChecker_1.default,
    mergeSuggestions_1.default,
    refreshSampleData_1.default,
    cleanUp_1.default,
    checkStuckIntegrationRuns_1.default,
    organizationEnricher_1.default,
];
if (EMAILS_ENABLED) {
    jobs.push(weeklyAnalyticsEmailsCoordinator_1.default);
}
exports.default = jobs;
//# sourceMappingURL=index.js.map