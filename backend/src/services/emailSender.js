"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const mail_1 = __importDefault(require("@sendgrid/mail"));
const assert_1 = __importDefault(require("assert"));
const conf_1 = require("../conf");
class EmailSender extends logging_1.LoggerBase {
    constructor(templateId, variables, tenantId = null) {
        super();
        this.templateId = templateId;
        this.variables = variables;
        this.tenantId = tenantId;
        if (conf_1.SENDGRID_CONFIG.key) {
            mail_1.default.setApiKey(conf_1.SENDGRID_CONFIG.key);
        }
    }
    static get TEMPLATES() {
        if (!EmailSender.isConfigured) {
            return {};
        }
        return {
            EMAIL_ADDRESS_VERIFICATION: conf_1.SENDGRID_CONFIG.templateEmailAddressVerification,
            INVITATION: conf_1.SENDGRID_CONFIG.templateInvitation,
            PASSWORD_RESET: conf_1.SENDGRID_CONFIG.templatePasswordReset,
            WEEKLY_ANALYTICS: conf_1.SENDGRID_CONFIG.templateWeeklyAnalytics,
            INTEGRATION_DONE: conf_1.SENDGRID_CONFIG.templateIntegrationDone,
            CSV_EXPORT: conf_1.SENDGRID_CONFIG.templateCsvExport,
            SIGNALS_DIGEST: conf_1.SENDGRID_CONFIG.templateSignalsDigest,
        };
    }
    /**
     * Sends an email to given recipient using sendgrid dynamic templates.
     * @param {string} recipient recipient email address
     * @param asm sendgrid advanced suppression manager for managing unsubscribe groups
     * @returns
     */
    async sendTo(recipient, asm) {
        if (!EmailSender.isConfigured) {
            this.log.error('Email provider is not configured.');
            return undefined;
        }
        (0, assert_1.default)(recipient, 'to is required');
        (0, assert_1.default)(conf_1.SENDGRID_CONFIG.emailFrom, 'SENDGRID_EMAIL_FROM is required');
        (0, assert_1.default)(this.templateId, 'templateId is required');
        const msg = {
            to: recipient,
            from: {
                name: conf_1.SENDGRID_CONFIG.nameFrom,
                email: conf_1.SENDGRID_CONFIG.emailFrom,
            },
            templateId: this.templateId,
            dynamicTemplateData: Object.assign(Object.assign({}, this.variables), { appHost: conf_1.API_CONFIG.frontendUrl }),
        };
        if (this.tenantId) {
            msg.custom_args = {
                tenantId: this.tenantId,
            };
        }
        if (asm) {
            msg.asm = asm;
        }
        try {
            return await mail_1.default.send(msg);
        }
        catch (error) {
            this.log.error(error, 'Error sending SendGrid email.');
            throw error;
        }
    }
    static get isConfigured() {
        return Boolean(conf_1.SENDGRID_CONFIG.emailFrom && conf_1.SENDGRID_CONFIG.key);
    }
}
exports.default = EmailSender;
//# sourceMappingURL=emailSender.js.map