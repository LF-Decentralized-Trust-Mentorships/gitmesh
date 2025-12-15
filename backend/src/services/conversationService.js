"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const emoji_dictionary_1 = __importDefault(require("emoji-dictionary"));
const html_to_text_1 = require("html-to-text");
const node_fetch_1 = __importDefault(require("node-fetch"));
const index_1 = require("../conf/index");
const conversationRepository_1 = __importDefault(require("../database/repositories/conversationRepository"));
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const telemetryTrack_1 = __importDefault(require("../segment/telemetryTrack"));
const aws_1 = require("./aws");
const conversationSettingsService_1 = __importDefault(require("./conversationSettingsService"));
const getStage_1 = __importDefault(require("./helpers/getStage"));
const integrationService_1 = __importDefault(require("./integrationService"));
const settingsService_1 = __importDefault(require("./settingsService"));
const tenantService_1 = __importDefault(require("./tenantService"));
class ConversationService extends logging_1.LoggerBase {
    constructor(options) {
        super(options.log);
        this.options = options;
    }
    async create(data) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            const record = await conversationRepository_1.default.create(data, Object.assign(Object.assign({}, this.options), { transaction }));
            (0, telemetryTrack_1.default)('Conversation created', {
                id: record.id,
                createdAt: record.createdAt,
                platform: data.platform || 'unknown',
            }, this.options);
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return record;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'conversation');
            throw error;
        }
    }
    /**
     * Updates general conversation settings for a tenant
     * Example data payload:
     * {
     *    tenant:{
     *       name: 'tenantName'
     *       url: 'tenantSlug'
     *    }
     *    inviteLinks:{
     *       discord: 'some-url'
     *       slack: 'some-url'
     *    }
     *    website: 'some-website',
     *    theme: {
     *      text: “#FFDD75”,
     *     	textSecondary: “#A1B6A1",
     *      textCta: “#D93920”,
     *      bg: “#081C08",
     *      bgHighlight: “#144914”,
     *      bgNav: “#193ED2",
     *    },
     *    customUrl: 'some-url',
     *    logoUrl: 'some-url',
     *    faviconUrl: 'some-url',
     * }
     * If tenant already has published conversations,
     * updating tenant.url is not allowed.
     *
     * @param data settings payload
     * @returns settings object that will be sent to search engine
     */
    async updateSettings(data) {
        var _a, _b, _c, _d, _e, _f, _g;
        const tenantService = new tenantService_1.default(this.options);
        const integrationService = new integrationService_1.default(this.options);
        let tenant;
        let settings;
        let conversationSettings = await conversationSettingsService_1.default.findOrCreateDefault(this.options);
        if (data.tenant) {
            tenant = await tenantService.update(this.options.currentTenant.id, data.tenant);
        }
        if (data.inviteLinks) {
            for (const platform in data.inviteLinks) {
                if (Object.prototype.hasOwnProperty.call(data.inviteLinks, platform)) {
                    // find the integration
                    const integration = (await integrationService.findAndCountAll({
                        filter: { platform },
                    })).rows[0];
                    await integrationService.update(integration.id, {
                        settings: Object.assign(Object.assign({}, integration.settings), { inviteLink: data.inviteLinks[platform] }),
                    });
                }
            }
        }
        if (data.website) {
            settings = await settingsService_1.default.save({ website: data.website }, this.options);
        }
        if (data.customUrl || data.logoUrl || data.faviconUrl || data.theme || data.autoPublish) {
            if (data.customUrl) {
                await conversationSettingsService_1.default.updateCustomDomainNetlify(data.customUrl);
            }
            if (data.autoPublish &&
                data.autoPublish.status &&
                conversationSettingsService_1.default.isAutoPublishUpdated(data.autoPublish, conversationSettings.autoPublish)) {
                await this.autoPublishPastConversations(data.autoPublish);
            }
            conversationSettings = await conversationSettingsService_1.default.save({
                enabled: data.enabled,
                customUrl: data.customUrl,
                logoUrl: data.logoUrl,
                faviconUrl: data.faviconUrl,
                theme: data.theme,
                autoPublish: data.autoPublish,
            }, this.options);
        }
        const activeIntegrations = await integrationService.getAllActiveIntegrations();
        const inviteLinks = activeIntegrations.rows.reduce((acc, i) => {
            acc[i.platform] = i.settings && i.settings.inviteLink ? i.settings.inviteLink : undefined;
            return acc;
        }, {});
        tenant = await tenantService.findById(this.options.currentTenant.id, this.options);
        settings = await settingsService_1.default.findOrCreateDefault(this.options);
        const settingsDocument = {
            id: tenant.id,
            tenantName: tenant.name,
            inviteLinks,
            website: (_a = settings.website) !== null && _a !== void 0 ? _a : undefined,
            tenantSlug: tenant.url,
            enabled: (_b = conversationSettings.enabled) !== null && _b !== void 0 ? _b : false,
            customUrl: (_c = conversationSettings.customUrl) !== null && _c !== void 0 ? _c : undefined,
            logoUrl: (_d = conversationSettings.logoUrl) !== null && _d !== void 0 ? _d : undefined,
            faviconUrl: (_e = conversationSettings.faviconUrl) !== null && _e !== void 0 ? _e : undefined,
            theme: (_f = conversationSettings.theme) !== null && _f !== void 0 ? _f : undefined,
            autoPublish: (_g = conversationSettings.autoPublish) !== null && _g !== void 0 ? _g : undefined,
        };
        return settingsDocument;
    }
    /**
     * Clean a channel of non-unicode characters and remove front and trailing dashes
     * @param channel Channel to clean
     * @returns Cleaned channel
     */
    static sanitizeChannel(channel) {
        const hasAlha = channel.replace(/[^a-z0-9]/gi, '') !== '';
        if (!hasAlha && /\p{Emoji}/u.test(channel)) {
            return [...channel]
                .filter((char) => /\p{Emoji}/u.test(char))
                .map((unicodeEmoji) => emoji_dictionary_1.default.getName(unicodeEmoji))
                .join('-');
            // return emoji.getName(rawChannel) || 'no-channel'
        }
        return (channel
            .split('-')
            .map((word) => word.replace(/[^a-z0-9]/gi, ''))
            .filter((word) => word !== '' && word !== undefined)
            .join('-') || 'no-channel');
    }
    static getChannelFromActivity(activity) {
        let channel = null;
        if (activity.platform === types_1.PlatformType.DISCORD) {
            channel = activity.channel;
        }
        else if (activity.platform === types_1.PlatformType.SLACK) {
            channel = activity.channel;
        }
        else if (activity.platform === types_1.PlatformType.GITHUB) {
            const prefix = 'https://github.com/';
            if (activity.channel.startsWith(prefix)) {
                channel = activity.channel.slice(prefix.length).split('/')[1];
            }
            else {
                channel = activity.channel.split('/')[1];
            }
        }
        else {
            channel = activity.channel;
        }
        return channel;
    }
    /**
     * Will return true if:
     * - conversationSettings.autoPublish.status === 'all'
     * - conversationSettings.autoPublish.status === 'custom' and channel & platform exist within autoPublish.channelsByPlatform
     *
     * else returns false
     *
     * @param conversationSettings
     * @param platform
     * @param channel
     *
     * @returns shouldAutoPublish
     */
    static shouldAutoPublishConversation(conversationSettings, platform, channel) {
        let shouldAutoPublish = false;
        if (!conversationSettings.autoPublish) {
            return shouldAutoPublish;
        }
        if (conversationSettings.autoPublish.status === 'all') {
            shouldAutoPublish = true;
        }
        else if (conversationSettings.autoPublish.status === 'custom') {
            shouldAutoPublish =
                conversationSettings.autoPublish.channelsByPlatform[platform] &&
                    conversationSettings.autoPublish.channelsByPlatform[platform].includes(channel);
        }
        return shouldAutoPublish;
    }
    async autoPublishPastConversations(dataAutoPublish) {
        const conversations = await conversationRepository_1.default.findAndCountAll({
            filter: {
                published: false,
            },
            lazyLoad: ['activities'],
        }, this.options);
        for (const conversation of conversations.rows) {
            if (ConversationService.shouldAutoPublishConversation({ autoPublish: dataAutoPublish }, conversation.platform, conversation.channel)) {
                await this.update(conversation.id, { published: true });
            }
        }
    }
    /**
     * Downloads slack attachments and saves them to an S3 bucket
     * @param activities activities to download attachments for
     * @returns The same activities, but the attachment URL is replaced with a public S3 bucket URL
     */
    async downloadSlackAttachments(activities) {
        const integrationService = new integrationService_1.default(this.options);
        const token = (await integrationService.findByPlatform(types_1.PlatformType.SLACK)).token;
        const headers = {
            Authorization: `Bearer ${token}`,
        };
        return Promise.all(activities.map(async (act) => {
            if (act.attributes.attachments && act.attributes.attachments.length > 0) {
                act.attributes.attachments = await Promise.all(act.attributes.attachments.map(async (attachment) => {
                    if (attachment.mediaType === 'image/png') {
                        // Get the file URL from the attachment ID
                        const axios = require('axios');
                        const configForUrl = {
                            method: 'get',
                            url: `https://slack.com/api/files.info?file=${attachment.id}`,
                            headers,
                        };
                        const response = await axios(configForUrl);
                        const data = response.data;
                        if ((data.error && data.needed === 'files:read') || !data.ok) {
                            throw new common_1.Error403('en', 'errors.missingScopes.message', {
                                integration: 'Slack',
                                scopes: 'files:read',
                            });
                        }
                        this.log.info(`trying to get bucket ${index_1.S3_CONFIG.integrationsAssetsBucket}-${(0, getStage_1.default)()}`);
                        const url = data.file.url_private;
                        // Get the image from the URL
                        return (0, node_fetch_1.default)(url, {
                            method: 'POST',
                            headers,
                        }).then(async (res) => {
                            const objectParams = {
                                Bucket: `${index_1.S3_CONFIG.integrationsAssetsBucket}-${(0, getStage_1.default)()}`,
                                ContentType: 'image/png',
                                Body: res.body,
                                Key: `slack/${attachment.id}.png`,
                            };
                            // Upload the image to S3
                            const data = await aws_1.s3.upload(objectParams).promise();
                            attachment.url = data.Location.replace('http://localstack', 'https://localhost.localstack.cloud');
                            return attachment;
                        });
                    }
                    return attachment;
                }));
                return act;
            }
            return act;
        }));
    }
    async update(id, data) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            const record = await conversationRepository_1.default.update(id, data, Object.assign(Object.assign({}, this.options), { transaction }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return record;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'conversation');
            throw error;
        }
    }
    async destroyAll(ids) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            for (const id of ids) {
                await conversationRepository_1.default.destroy(id, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async findById(id) {
        return conversationRepository_1.default.findById(id, this.options);
    }
    async findAndCountAll(args) {
        return conversationRepository_1.default.findAndCountAll(args, this.options);
    }
    async query(data) {
        const advancedFilter = data.filter;
        const orderBy = data.orderBy;
        const limit = data.limit;
        const offset = data.offset;
        const lazyLoad = ['activities'];
        return conversationRepository_1.default.findAndCountAll({ advancedFilter, orderBy, limit, offset, lazyLoad }, this.options);
    }
    /**
     * Generates a clean title from given string
     * @param title string used to generate a cleaned title
     * @param isHtml whether the title param is html or plain text
     * @returns cleaned title
     */
    async generateTitle(title, isHtml = false) {
        if (!title || (0, common_1.getCleanString)(title) === '') {
            return `conversation-${await conversationRepository_1.default.count({}, this.options)}`;
        }
        if (isHtml) {
            // convert html to text
            const plainText = (0, html_to_text_1.convert)(title);
            // and remove new lines
            return plainText.replace(/\n/g, ' ');
        }
        return title;
    }
    async destroyBulk(ids) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            await conversationRepository_1.default.destroyBulk(ids, Object.assign(Object.assign({}, this.options), { transaction }), true);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    /**
     * Generates a slug-like string from given title
     * If generated slug already exists for a tenant,
     * adds dashed suffixes until it finds a unique slug
     * @param title title used to generate slug-like string
     * @returns slug-like string
     *
     */
    async generateSlug(title) {
        // Remove non-standart characters and extra whitespaces
        const cleanedTitle = (0, common_1.getCleanString)(title);
        const slugArray = cleanedTitle.split(' ');
        let cleanedSlug = '';
        for (let i = 0; i < slugArray.length; i++) {
            if (i >= ConversationService.MAX_SLUG_WORD_LENGTH) {
                break;
            }
            cleanedSlug += `${slugArray[i]}-`;
        }
        // remove trailing dash
        cleanedSlug = cleanedSlug.replace(/-$/gi, '');
        // check generated slug already exists in tenant
        let checkSlug = await conversationRepository_1.default.findAndCountAll({ filter: { slug: cleanedSlug } }, this.options);
        // generated slug already exists in the tenant, start adding suffixes and re-check
        if (checkSlug.count > 0) {
            let suffix = 1;
            const slugCopy = cleanedSlug;
            while (checkSlug.count > 0) {
                const suffixedSlug = `${slugCopy}-${suffix}`;
                checkSlug = await conversationRepository_1.default.findAndCountAll({ filter: { slug: suffixedSlug } }, this.options);
                suffix += 1;
                cleanedSlug = suffixedSlug;
            }
        }
        return cleanedSlug;
    }
}
exports.default = ConversationService;
ConversationService.MAX_SLUG_WORD_LENGTH = 10;
//# sourceMappingURL=conversationService.js.map