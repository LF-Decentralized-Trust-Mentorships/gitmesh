"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const axios_1 = __importDefault(require("axios"));
const moment_1 = __importDefault(require("moment"));
const types_1 = require("@gitmesh/types");
const common_1 = require("@gitmesh/common");
const conf_1 = require("../conf");
const signalsContentRepository_1 = __importDefault(require("../database/repositories/signalsContentRepository"));
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const tenantUserRepository_1 = __importDefault(require("../database/repositories/tenantUserRepository"));
const track_1 = __importDefault(require("../segment/track"));
class SignalsContentService extends logging_1.LoggerBase {
    constructor(options) {
        super(options.log);
        this.options = options;
    }
    /**
     * Create an signals shown content record.
     * @param data Data to a new SignalsContent record.
     * @param options Repository options.
     * @returns Created SignalsContent record.
     */
    async upsert(data) {
        if (!data.url) {
            throw new common_1.Error400(this.options.language, 'errors.signals.urlRequiredWhenUpserting');
        }
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            // find by url
            const existing = await signalsContentRepository_1.default.findByUrl(data.url, Object.assign(Object.assign({}, this.options), { transaction }));
            let record;
            if (existing) {
                record = await signalsContentRepository_1.default.update(existing.id, data, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            else {
                record = await signalsContentRepository_1.default.create(data, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return record;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async findById(id) {
        return signalsContentRepository_1.default.findById(id, this.options);
    }
    async query(data) {
        const advancedFilter = data.filter;
        const orderBy = data.orderBy;
        const limit = data.limit;
        const offset = data.offset;
        return signalsContentRepository_1.default.findAndCountAll({ advancedFilter, orderBy, limit, offset }, this.options);
    }
    static trackPostClicked(url, platform, req, source = 'app') {
        (0, track_1.default)('Signals post clicked', {
            url,
            platform,
            source,
        }, Object.assign({}, req));
    }
    static trackDigestEmailOpened(req) {
        (0, track_1.default)('Signals digest opened', {}, Object.assign({}, req));
    }
    /**
     * Convert a relative string date to a Date. For example, 30 days ago -> 2020-01-01
     * @param date String date. Can be one of SignalsPublishedDates
     * @returns The corresponding Date
     */
    static switchDate(date, offset = 0) {
        let dateMoment;
        switch (date) {
            case types_1.SignalsPublishedDates.LAST_24_HOURS:
                dateMoment = (0, moment_1.default)().subtract(1, 'days');
                break;
            case types_1.SignalsPublishedDates.LAST_7_DAYS:
                dateMoment = (0, moment_1.default)().subtract(7, 'days');
                break;
            case types_1.SignalsPublishedDates.LAST_14_DAYS:
                dateMoment = (0, moment_1.default)().subtract(14, 'days');
                break;
            case types_1.SignalsPublishedDates.LAST_30_DAYS:
                dateMoment = (0, moment_1.default)().subtract(30, 'days');
                break;
            case types_1.SignalsPublishedDates.LAST_90_DAYS:
                dateMoment = (0, moment_1.default)().subtract(90, 'days');
                break;
            default:
                return null;
        }
        return dateMoment.subtract(offset, 'days').format('YYYY-MM-DD');
    }
    async search(email = false) {
        const signalsSettings = (await tenantUserRepository_1.default.findByTenantAndUser(this.options.currentTenant.id, this.options.currentUser.id, this.options)).settings.signals;
        if (!signalsSettings.onboarded) {
            throw new common_1.Error400(this.options.language, 'errors.signals.notOnboarded');
        }
        const feedSettings = email ? signalsSettings.emailDigest.feed : signalsSettings.feed;
        const keywords = feedSettings.keywords ? feedSettings.keywords.join(',') : '';
        const exactKeywords = feedSettings.exactKeywords ? feedSettings.exactKeywords.join(',') : '';
        const excludedKeywords = feedSettings.excludedKeywords
            ? feedSettings.excludedKeywords.join(',')
            : '';
        const afterDate = SignalsContentService.switchDate(feedSettings.publishedDate);
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${conf_1.SIGNALS_CONFIG.url}`,
            params: {
                platforms: feedSettings.platforms.join(','),
                keywords,
                exact_keywords: exactKeywords,
                exclude_keywords: excludedKeywords,
                after_date: afterDate,
            },
            headers: {
                Authorization: `Bearer ${conf_1.SIGNALS_CONFIG.apiKey}`,
            },
        };
        const response = await (0, axios_1.default)(config);
        const interacted = (await this.query({
            filter: {
                postedAt: { gt: SignalsContentService.switchDate(feedSettings.publishedDate, 90) },
            },
        })).rows;
        const interactedMap = {};
        for (const item of interacted) {
            interactedMap[item.url] = item;
        }
        const out = [];
        for (const item of response.data) {
            const post = {
                description: item.description,
                thumbnail: item.thumbnail,
                title: item.title,
            };
            out.push({
                url: item.url,
                postedAt: item.date,
                post,
                platform: item.platform,
                actions: interactedMap[item.url] ? interactedMap[item.url].actions : [],
            });
        }
        return out;
    }
    static async reply(title, description) {
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${conf_1.SIGNALS_CONFIG.url}/reply`,
            params: {
                title,
                description,
            },
            headers: {
                Authorization: `Bearer ${conf_1.SIGNALS_CONFIG.apiKey}`,
            },
        };
        const response = await (0, axios_1.default)(config);
        return {
            reply: response.data,
        };
    }
}
exports.default = SignalsContentService;
//# sourceMappingURL=signalsContentService.js.map