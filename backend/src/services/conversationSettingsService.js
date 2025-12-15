"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const lodash_1 = __importDefault(require("lodash"));
const logging_1 = require("@gitmesh/logging");
const index_1 = require("../conf/index");
const conversationSettingsRepository_1 = __importDefault(require("../database/repositories/conversationSettingsRepository"));
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const DEFAULT_CONVERSATION_SETTINGS = {};
const log = (0, logging_1.getServiceChildLogger)('ConversationSettingsService');
class ConversationSettingsService extends logging_1.LoggerBase {
    constructor(options) {
        super(options.log);
        this.options = options;
    }
    static async findOrCreateDefault(options) {
        return conversationSettingsRepository_1.default.findOrCreateDefault(DEFAULT_CONVERSATION_SETTINGS, options);
    }
    static async save(data, options) {
        const transaction = await sequelizeRepository_1.default.createTransaction(options);
        const settings = await conversationSettingsRepository_1.default.save(data, options);
        await sequelizeRepository_1.default.commitTransaction(transaction);
        return settings;
    }
    static async updateCustomDomainNetlify(customUrl) {
        try {
            const domain = customUrl.indexOf('http') !== -1 ? customUrl : new URL(`https://${customUrl}`).hostname;
            const netlifyClient = axios_1.default.create({
                baseURL: 'https://api.netlify.com/api/v1/',
                headers: {
                    Authorization: `Bearer ${index_1.NETLIFY_CONFIG.apiKey}`,
                },
            });
            const { data: netlifySites } = await netlifyClient.get('sites');
            const netlifySite = netlifySites.find((s) => s.custom_domain === index_1.NETLIFY_CONFIG.siteDomain);
            const domainAliases = [...netlifySite.domain_aliases, domain];
            await netlifyClient.patch(`sites/${netlifySite.id}`, {
                domain_aliases: domainAliases,
            });
        }
        catch (error) {
            log.error(error, 'Error updating custom netflify domain!');
            throw new Error(error.message);
        }
    }
    static isAutoPublishUpdated(dataAutoPublish, currentAutoPublish) {
        if (currentAutoPublish && dataAutoPublish.status === currentAutoPublish.status) {
            if (dataAutoPublish.status === 'all' || dataAutoPublish.status === 'disabled') {
                return false;
            }
            // dataAutoPublish.status === 'custom'
            return !lodash_1.default.isEqual(dataAutoPublish.channelsByPlatform, currentAutoPublish.channelsByPlatform);
        }
        return true;
    }
}
exports.default = ConversationSettingsService;
//# sourceMappingURL=conversationSettingsService.js.map