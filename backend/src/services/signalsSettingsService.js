"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const lodash_1 = __importDefault(require("lodash"));
const moment_1 = __importDefault(require("moment"));
const types_1 = require("@gitmesh/types");
const common_1 = require("@gitmesh/common");
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const tenantUserRepository_1 = __importDefault(require("../database/repositories/tenantUserRepository"));
const track_1 = __importDefault(require("../segment/track"));
/* eslint-disable no-case-declarations */
class SignalsSettingsService extends logging_1.LoggerBase {
    constructor(options) {
        super(options.log);
        this.options = options;
    }
    /**
     * Validate and normalize feed settings.
     * @param data Feed data of type SignalsFeedSettings
     * @returns Normalized feed data if the input is valid. Otherwise a 400 Error
     */
    getFeed(data) {
        // Feed is compulsory
        if (!data) {
            throw new common_1.Error400(this.options.language, 'errors.signals.feedSettingsMissing');
        }
        // We need at least one of keywords or exactKeywords
        if (!data.keywords && !data.exactKeywords) {
            throw new common_1.Error400(this.options.language, 'errors.signals.keywordsMissing');
        }
        // We need at least one platform
        if (!data.platforms || data.platforms.length === 0) {
            throw new common_1.Error400(this.options.language, 'errors.signals.platformMissing');
        }
        // Make sure platforms are in the allowed list
        const platforms = Object.values(types_1.SignalsPlatforms);
        data.platforms.forEach((platform) => {
            if (!platforms.includes(platform)) {
                throw new common_1.Error400(this.options.language, 'errors.signals.platformInvalid', platform, platforms.join(', '));
            }
        });
        // We need a date. Make sure it's in the allowed list.
        const publishedDates = Object.values(types_1.SignalsPublishedDates);
        if (publishedDates.indexOf(data.publishedDate) === -1) {
            throw new common_1.Error400(this.options.language, 'errors.signals.publishedDateMissing', publishedDates.join(', '));
        }
        // Remove any extra fields
        return lodash_1.default.pick(data, [
            'keywords',
            'exactKeywords',
            'excludedKeywords',
            'publishedDate',
            'platforms',
        ]);
    }
    /**
     * Validate and normalize email digest settings.
     * @param data Email digest settings of type SignalsEmailDigestSettings
     * @param feed Standard feed settings of type SignalsFeedSettings
     * @returns The normalized email digest settings if the input is valid. Otherwise a 400 Error.
     */
    getEmailDigestSettings(data, feed) {
        // If the matchFeedSettings option is toggled, we set the email feed settings to the standard feed settings.
        // Otherwise, we validate and normalize the email feed settings.
        if (!data.matchFeedSettings) {
            data.feed = this.getFeed(data.feed);
        }
        else {
            data.feed = feed;
        }
        // Make sure the email exists and is valid
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRegex.test(data.email)) {
            throw new common_1.Error400(this.options.language, 'errors.signals.emailInvalid');
        }
        // get next email trigger time
        data.nextEmailAt = SignalsSettingsService.getNextEmailDigestDate(data);
        // Make sure the time exists and is valid
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]?$/;
        if (!timeRegex.test(data.time)) {
            throw new common_1.Error400(this.options.language, 'errors.signals.timeInvalid');
        }
        // Remove any extra fields
        return lodash_1.default.pick(data, [
            'email',
            'frequency',
            'time',
            'matchFeedSettings',
            'feed',
            'nextEmailAt',
        ]);
    }
    /**
     * Finds the next email digest send time using the frequency set by the user
     * signalsSettings.emailDigest.nextEmailAt will be
     * set to actual send time minus 5 minutes.
     * This serves as a buffer for cronjobs - Email crons will fire
     * at every half hour (10:00, 10:30, 11:00,...) to ensure the
     * correct send time set by the user.
     * @param settings
     * @returns next email date as iso string
     */
    static getNextEmailDigestDate(settings) {
        const now = (0, moment_1.default)();
        let nextEmailAt = '';
        switch (settings.frequency) {
            case types_1.SignalsEmailDigestFrequency.DAILY:
                nextEmailAt = (0, moment_1.default)(settings.time, 'HH:mm').subtract(5, 'minutes').toISOString();
                // if send time has passed for today, set it to next day
                if (now > (0, moment_1.default)(settings.time, 'HH:mm')) {
                    nextEmailAt = (0, moment_1.default)(nextEmailAt).add(1, 'day').toISOString();
                }
                break;
            case types_1.SignalsEmailDigestFrequency.WEEKLY:
                const [hour, minute] = settings.time.split(':');
                const startOfWeek = (0, moment_1.default)()
                    .startOf('isoWeek')
                    .set('hour', parseInt(hour, 10))
                    .set('minute', parseInt(minute, 10))
                    .subtract(5, 'minutes');
                nextEmailAt = startOfWeek.toISOString();
                // if send time has passed for this week, set it to next week
                if (now > startOfWeek) {
                    nextEmailAt = startOfWeek.add(1, 'week').toISOString();
                }
                break;
            default:
                throw new Error(`Unknown email digest frequency: ${settings.frequency}`);
        }
        return nextEmailAt;
    }
    /**
     * Validate, normalize and update Signals settings.
     * @param data Input of type SignalsSettings
     * @returns Normalized SignalsSettings if the input is valid. Otherwise a 400 Error.
     */
    async update(data) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            // At this point onboarded is true always
            data.onboarded = true;
            // Validate and normalize feed settings
            data.feed = this.getFeed(data.feed);
            // If an email digest was sent, validate and normalize email digest settings
            // Otherwise, set email digest to false
            if (data.emailDigestActive && data.emailDigest) {
                data.emailDigest = this.getEmailDigestSettings(data.emailDigest, data.feed);
            }
            // Remove any extra fields
            data = lodash_1.default.pick(data, [
                'onboarded',
                'feed',
                'emailDigestActive',
                'emailDigest',
                'aiReplies',
            ]);
            // Update the user's Signals settings
            const tenantUserOut = await tenantUserRepository_1.default.updateSignalsSettings(this.options.currentUser.id, data, Object.assign(Object.assign({}, this.options), { transaction }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            // Track the events in Segment
            const settingsOut = tenantUserOut.settings.signals;
            if (data.emailDigestActive) {
                (0, track_1.default)('Signals email settings updated', {
                    email: settingsOut.emailDigest.email,
                    frequency: settingsOut.emailDigest.frequency,
                    time: settingsOut.emailDigest.time,
                    matchFeedSettings: settingsOut.emailDigest.matchFeedSettings,
                    platforms: settingsOut.emailDigest.feed.platforms,
                    publishedDate: settingsOut.emailDigest.feed.publishedDate,
                    keywords: settingsOut.emailDigest.feed.keywords,
                    exactKeywords: settingsOut.emailDigest.feed.exactKeywords,
                    excludeKeywords: settingsOut.emailDigest.feed.excludedKeywords,
                }, Object.assign({}, this.options));
            }
            else {
                (0, track_1.default)('Signals settings updated', {
                    onboarded: settingsOut.onboarded,
                    emailDigestActive: settingsOut.emailDigestActive,
                    platforms: settingsOut.feed.platforms,
                    publishedDate: settingsOut.feed.publishedDate,
                    keywords: settingsOut.feed.keywords,
                    exactKeywords: settingsOut.feed.exactKeywords,
                    excludeKeywords: settingsOut.feed.excludedKeywords,
                }, Object.assign({}, this.options));
            }
            return tenantUserOut.settings.signals;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'SignalsContent');
            throw error;
        }
    }
}
exports.default = SignalsSettingsService;
//# sourceMappingURL=signalsSettingsService.js.map