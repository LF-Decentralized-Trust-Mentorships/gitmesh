"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signalsEmailDigestWorker = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const logging_1 = require("@gitmesh/logging");
const conf_1 = require("../../../../conf");
const recurringEmailsHistoryRepository_1 = __importDefault(require("../../../../database/repositories/recurringEmailsHistoryRepository"));
const sequelizeRepository_1 = __importDefault(require("../../../../database/repositories/sequelizeRepository"));
const tenantUserRepository_1 = __importDefault(require("../../../../database/repositories/tenantUserRepository"));
const getUserContext_1 = __importDefault(require("../../../../database/utils/getUserContext"));
const signalsContentService_1 = __importDefault(require("../../../../services/signalsContentService"));
const signalsSettingsService_1 = __importDefault(require("../../../../services/signalsSettingsService"));
const emailSender_1 = __importDefault(require("../../../../services/emailSender"));
const getStage_1 = __importDefault(require("../../../../services/helpers/getStage"));
const recurringEmailsHistoryTypes_1 = require("../../../../types/recurringEmailsHistoryTypes");
const log = (0, logging_1.getServiceChildLogger)('signalsEmailDigestWorker');
async function signalsEmailDigestWorker(userId, tenantId) {
    const s3Url = `https://${conf_1.S3_CONFIG.microservicesAssetsBucket}-${(0, getStage_1.default)()}.s3.eu-central-1.amazonaws.com`;
    const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
    const tenantUser = await tenantUserRepository_1.default.findByTenantAndUser(tenantId, userId, options);
    if ((0, moment_timezone_1.default)(tenantUser.settings.signals.emailDigest.nextEmailAt) > (0, moment_timezone_1.default)()) {
        log.info('nextEmailAt is already updated. Email is already sent. Exiting without sending the email.');
        return;
    }
    const userContext = await (0, getUserContext_1.default)(tenantId, userId);
    const signalsContentService = new signalsContentService_1.default(userContext);
    const content = (await signalsContentService.search(true)).slice(0, 10).map((c) => {
        c.platformIcon = `${s3Url}/email/${c.platform}.png`;
        c.post.thumbnail = null;
        return c;
    });
    await new emailSender_1.default(emailSender_1.default.TEMPLATES.SIGNALS_DIGEST, {
        content,
        frequency: tenantUser.settings.signals.emailDigest.frequency,
        date: (0, moment_timezone_1.default)().format('D MMM YYYY'),
    }, tenantId).sendTo(tenantUser.settings.signals.emailDigest.email);
    const rehRepository = new recurringEmailsHistoryRepository_1.default(userContext);
    const reHistory = await rehRepository.create({
        tenantId: userContext.currentTenant.id,
        type: recurringEmailsHistoryTypes_1.RecurringEmailType.SIGNALS_DIGEST,
        emailSentAt: (0, moment_timezone_1.default)().toISOString(),
        emailSentTo: [tenantUser.settings.signals.emailDigest.email],
    });
    // update nextEmailAt
    const nextEmailAt = signalsSettingsService_1.default.getNextEmailDigestDate(tenantUser.settings.signals.emailDigest);
    const updateSettings = tenantUser.settings.signals;
    updateSettings.emailDigest.nextEmailAt = nextEmailAt;
    await tenantUserRepository_1.default.updateSignalsSettings(userContext.currentUser.id, updateSettings, userContext);
    log.info({ receipt: reHistory });
}
exports.signalsEmailDigestWorker = signalsEmailDigestWorker;
//# sourceMappingURL=signalsEmailDigestWorker.js.map