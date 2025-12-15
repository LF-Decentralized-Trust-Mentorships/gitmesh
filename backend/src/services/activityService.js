"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const logging_1 = require("@gitmesh/logging");
const temporal_1 = require("@gitmesh/temporal");
const types_1 = require("@gitmesh/types");
const buffer_1 = require("buffer");
const gitmesh_sentiment_1 = __importDefault(require("crowd-sentiment"));
const isFeatureEnabled_1 = __importDefault(require("@/feature-flags/isFeatureEnabled"));
const conf_1 = require("../conf");
const activityRepository_1 = __importDefault(require("../database/repositories/activityRepository"));
const memberAttributeSettingsRepository_1 = __importDefault(require("../database/repositories/memberAttributeSettingsRepository"));
const memberRepository_1 = __importDefault(require("../database/repositories/memberRepository"));
const segmentRepository_1 = __importDefault(require("../database/repositories/segmentRepository"));
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const memberTypes_1 = require("../database/repositories/types/memberTypes");
const telemetryTrack_1 = __importDefault(require("../segment/telemetryTrack"));
const nodeWorkerSQS_1 = require("../serverless/utils/nodeWorkerSQS");
const aws_1 = require("./aws");
const conversationService_1 = __importDefault(require("./conversationService"));
const conversationSettingsService_1 = __importDefault(require("./conversationSettingsService"));
const merge_1 = __importDefault(require("./helpers/merge"));
const memberAffiliationService_1 = __importDefault(require("./memberAffiliationService"));
const memberService_1 = __importDefault(require("./memberService"));
const searchSyncService_1 = __importDefault(require("./searchSyncService"));
const segmentService_1 = __importDefault(require("./segmentService"));
const IS_GITHUB_COMMIT_DATA_ENABLED = conf_1.GITHUB_CONFIG.isCommitDataEnabled === 'true';
class ActivityService extends logging_1.LoggerBase {
    constructor(options) {
        super(options.log);
        this.options = options;
    }
    /**
     * Upsert an activity. If the member exists, it updates it. If it does not exist, it creates it.
     * The update is done with a deep merge of the original and the new activities.
     * @param data Activity data
     * data.sourceId is the platform specific id given by the platform.
     * data.sourceParentId is the platform specific parentId given by the platform
     * We save both ids to create relationships with other activities.
     * When a sourceParentId is present in upsert, all sourceIds are searched to find the activity entity where sourceId = sourceParentId
     * Found activity's(parent) id(uuid) is written to the new activities parentId.
     * If data.sourceParentId is not present, we try finding children activities of current activity
     * where sourceParentId = data.sourceId. Found activity's parentId and conversations gets updated accordingly
     * @param existing If the activity already exists, the activity. If it doesn't or we don't know, false
     * @returns The upserted activity
     */
    async upsert(data, existing = false, fireGitmeshWebhooks = true, fireSync = true) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        const searchSyncService = new searchSyncService_1.default(this.options);
        const repositoryOptions = Object.assign(Object.assign({}, this.options), { transaction });
        try {
            if (data.member) {
                data.member = await memberRepository_1.default.filterIdInTenant(data.member, repositoryOptions);
            }
            // check type exists, if doesn't exist, create a placeholder type with activity type key
            if (data.platform &&
                data.type &&
                !segmentRepository_1.default.activityTypeExists(data.platform, data.type, repositoryOptions)) {
                await new segmentService_1.default(repositoryOptions).createActivityType({ type: data.type }, data.platform);
                await segmentService_1.default.refreshSegments(repositoryOptions);
            }
            // check if channel exists in settings for respective platform. If not, update by adding channel to settings
            if (data.platform && data.channel) {
                await new segmentService_1.default(repositoryOptions).updateActivityChannels(data);
                await segmentService_1.default.refreshSegments(repositoryOptions);
            }
            // If a sourceParentId is sent, try to find it in our db
            if ('sourceParentId' in data && data.sourceParentId) {
                const parent = await activityRepository_1.default.findOne({ sourceId: data.sourceParentId }, repositoryOptions);
                if (parent) {
                    data.parent = await activityRepository_1.default.filterIdInTenant(parent.id, repositoryOptions);
                }
                else {
                    data.parent = null;
                }
            }
            if (!existing) {
                existing = await this._activityExists(data, transaction);
            }
            let record;
            if (existing) {
                const { id } = existing;
                delete existing.id;
                const toUpdate = (0, merge_1.default)(existing, data, {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    timestamp: (oldValue, _newValue) => oldValue,
                    attributes: (oldValue, newValue) => {
                        if (oldValue && newValue) {
                            const out = Object.assign(Object.assign({}, oldValue), newValue);
                            // If either of the two has isMainBranch set to true, then set it to true
                            if (oldValue.isMainBranch || newValue.isMainBranch) {
                                out.isMainBranch = true;
                            }
                            return out;
                        }
                        return newValue;
                    },
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    organizationId: (oldValue, _newValue) => oldValue,
                });
                record = await activityRepository_1.default.update(id, toUpdate, repositoryOptions);
                if (data.parent) {
                    await this.addToConversation(record.id, data.parent, transaction);
                }
            }
            else {
                if (!data.sentiment) {
                    const sentiment = await this.getSentiment(data);
                    data.sentiment = sentiment;
                }
                if (!data.username && data.platform === types_1.PlatformType.OTHER) {
                    const { displayName } = await memberRepository_1.default.findById(data.member, repositoryOptions);
                    // Get the first key of the username object as a string
                    data.username = displayName;
                }
                const memberAffilationService = new memberAffiliationService_1.default(this.options);
                data.organizationId = await memberAffilationService.findAffiliation(data.member, data.timestamp);
                record = await activityRepository_1.default.create(data, repositoryOptions);
                // Only track activity's platform and timestamp and memberId. It is completely annonymous.
                (0, telemetryTrack_1.default)('Activity created', {
                    id: record.id,
                    platform: record.platform,
                    timestamp: record.timestamp,
                    memberId: record.memberId,
                    createdAt: record.createdAt,
                }, this.options);
                // newly created activity can be a parent or a child (depending on the insert order)
                // if child
                if (data.parent) {
                    record = await this.addToConversation(record.id, data.parent, transaction);
                }
                else if ('sourceId' in data && data.sourceId) {
                    // if it's not a child, it may be a parent of previously added activities
                    const children = await activityRepository_1.default.findAndCountAll({ filter: { sourceParentId: data.sourceId } }, repositoryOptions);
                    for (const child of children.rows) {
                        // update children with newly created parentId
                        await activityRepository_1.default.update(child.id, { parent: record.id }, repositoryOptions);
                        // manage conversations for each child
                        await this.addToConversation(child.id, record.id, transaction);
                    }
                }
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
            if (fireSync) {
                await searchSyncService.triggerMemberSync(this.options.currentTenant.id, record.memberId);
                await searchSyncService.triggerActivitySync(this.options.currentTenant.id, record.id);
            }
            if (!existing && fireGitmeshWebhooks) {
                try {
                    if (await (0, isFeatureEnabled_1.default)(types_1.FeatureFlag.TEMPORAL_AUTOMATIONS, this.options)) {
                        const handle = await this.options.temporal.workflow.start('processNewActivityAutomation', {
                            workflowId: `new-activity-automation-${record.id}`,
                            taskQueue: conf_1.TEMPORAL_CONFIG.automationsTaskQueue,
                            workflowIdReusePolicy: temporal_1.WorkflowIdReusePolicy.WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE,
                            retry: {
                                maximumAttempts: 100,
                            },
                            args: [
                                {
                                    tenantId: this.options.currentTenant.id,
                                    activityId: record.id,
                                },
                            ],
                        });
                        this.log.info({ workflowId: handle.workflowId }, 'Started temporal workflow to process new activity automation!');
                    }
                    else {
                        await (0, nodeWorkerSQS_1.sendNewActivityNodeSQSMessage)(this.options.currentTenant.id, record.id, record.segmentId);
                    }
                }
                catch (err) {
                    this.log.error(err, { activityId: record.id }, 'Error triggering new activity automation!');
                }
            }
            if (!fireGitmeshWebhooks) {
                this.log.info('Ignoring outgoing webhooks because of fireGitmeshWebhooks!');
            }
            return record;
        }
        catch (error) {
            if (error.name && error.name.includes('Sequelize')) {
                this.log.error(error, {
                    query: error.sql,
                    errorMessage: error.original.message,
                }, 'Error during activity upsert!');
            }
            else {
                this.log.error(error, 'Error during activity upsert!');
            }
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'activity');
            throw error;
        }
    }
    /**
     * Get the sentiment of an activity from its body and title.
     * Only first 5000 bytes of text are passed through because of AWS Comprehend restrictions.
     * @param data Activity data. Includes body and title.
     * @returns The sentiment of the combination of body and title. Between -1 and 1.
     */
    async getSentiment(data) {
        var _a, _b;
        if (conf_1.IS_TEST_ENV) {
            return {
                positive: 0.42,
                negative: 0.42,
                neutral: 0.42,
                mixed: 0.42,
                label: 'positive',
                sentiment: 0.42,
            };
        }
        if (conf_1.IS_DEV_ENV) {
            if (data.body === '' || data.body === undefined) {
                return {};
            }
            // Return a random number between 0 and 100
            const score = Math.floor(Math.random() * 100);
            let label = 'neutral';
            if (score < 33) {
                label = 'negative';
            }
            else if (score > 66) {
                label = 'positive';
            }
            return {
                positive: Math.floor(Math.random() * 100),
                negative: Math.floor(Math.random() * 100),
                neutral: Math.floor(Math.random() * 100),
                mixed: Math.floor(Math.random() * 100),
                sentiment: score,
                label,
            };
        }
        // When we implement Kern.ais's sentiment, we will get rid of this. In the meantime, we use Vader
        // because we don't have an agreement with LF for comprehend.
        if (IS_GITHUB_COMMIT_DATA_ENABLED) {
            const text = data.sourceParentId ? data.body : `${data.title} ${data.body}`;
            const sentiment = gitmesh_sentiment_1.default.SentimentIntensityAnalyzer.polarity_scores(text);
            const compound = Math.round(((sentiment.compound + 1) / 2) * 100);
            // Some activities are inherently different, we might want to dampen their sentiment
            let label = 'neutral';
            if (compound < 33) {
                label = 'negative';
            }
            else if (compound > 66) {
                label = 'positive';
            }
            return {
                positive: Math.round(sentiment.pos * 100),
                negative: Math.round(sentiment.neg * 100),
                neutral: Math.round(sentiment.neu * 100),
                mixed: Math.round(sentiment.neu * 100),
                sentiment: compound,
                label,
            };
        }
        try {
            data.body = (_a = data.body) !== null && _a !== void 0 ? _a : '';
            data.title = (_b = data.title) !== null && _b !== void 0 ? _b : '';
            // Concatenate title and body
            const text = `${data.title} ${data.body}`.trim();
            return text === '' ? {} : await (0, aws_1.detectSentiment)(text);
        }
        catch (err) {
            this.log.error({ err, data }, 'Error getting sentiment of activity - Setting sentiment to empty object.');
            return {};
        }
    }
    /**
     * Get the sentiment of an array of activities form its' body and title
     * Only first 5000 bytes of text are passed through because of AWS Comprehend restrictions.
     * @param activityArray activity array
     * @returns list of sentiments ordered same as input array
     */
    async getSentimentBatch(activityArray) {
        const ALLOWED_MAX_BYTE_LENGTH = 4500;
        let textArray = await Promise.all(activityArray.map(async (i) => {
            let text = `${i.title} ${i.body}`.trim();
            let blob = new buffer_1.Blob([text]);
            if (blob.size > ALLOWED_MAX_BYTE_LENGTH) {
                blob = blob.slice(0, ALLOWED_MAX_BYTE_LENGTH);
                text = await blob.text();
            }
            return text;
        }));
        const MAX_BATCH_SIZE = 25;
        const promiseArray = [];
        if (textArray.length > MAX_BATCH_SIZE) {
            while (textArray.length > MAX_BATCH_SIZE) {
                promiseArray.push((0, aws_1.detectSentimentBatch)(textArray.slice(0, MAX_BATCH_SIZE)));
                textArray = textArray.slice(MAX_BATCH_SIZE);
            }
            // insert last small chunk
            if (textArray.length > 0)
                promiseArray.push((0, aws_1.detectSentimentBatch)(textArray));
        }
        else {
            promiseArray.push(textArray);
        }
        const values = await (0, logging_1.logExecutionTime)(() => Promise.all(promiseArray), this.log, 'sentiment-api-request');
        return values.reduce((acc, i) => {
            acc.push(...i);
            return acc;
        }, []);
    }
    /**
     * Adds an activity to a conversation.
     * If parent already has a conversation, adds child to parent's conversation
     * If parent doesn't have a conversation, and child has one,
     * adds parent to child's conversation.
     * If both of them doesn't have a conversation yet, creates one and adds both to the conversation.
     * @param {string} id id of the activity
     * @param parentId id of the parent activity
     * @param {Transaction} transaction
     * @returns updated activity plain object
     */
    async addToConversation(id, parentId, transaction) {
        const searchSyncService = new searchSyncService_1.default(this.options);
        const parent = await activityRepository_1.default.findById(parentId, Object.assign(Object.assign({}, this.options), { transaction }));
        const child = await activityRepository_1.default.findById(id, Object.assign(Object.assign({}, this.options), { transaction }));
        const conversationService = new conversationService_1.default(Object.assign(Object.assign({}, this.options), { transaction }));
        let record;
        let conversation;
        // check if parent is in a conversation already
        if (parent.conversationId) {
            conversation = await conversationService.findById(parent.conversationId);
            record = await activityRepository_1.default.update(id, { conversationId: parent.conversationId }, Object.assign(Object.assign({}, this.options), { transaction }));
        }
        else if (child.conversationId) {
            // if child is already in a conversation
            conversation = await conversationService.findById(child.conversationId);
            record = child;
            // if conversation is not already published, update conversation info with new parent
            if (!conversation.published) {
                const newConversationTitle = await conversationService.generateTitle(parent.title || parent.body, ActivityService.hasHtmlActivities(parent.platform));
                conversation = await conversationService.update(conversation.id, {
                    title: newConversationTitle,
                    slug: await conversationService.generateSlug(newConversationTitle),
                });
            }
            // add parent to the conversation
            await activityRepository_1.default.update(parent.id, { conversationId: conversation.id }, Object.assign(Object.assign({}, this.options), { transaction }));
            await searchSyncService.triggerActivitySync(this.options.currentTenant.id, parent.id);
        }
        else {
            // neither child nor parent is in a conversation, create one from parent
            const conversationTitle = await conversationService.generateTitle(parent.title || parent.body, ActivityService.hasHtmlActivities(parent.platform));
            const conversationSettings = await conversationSettingsService_1.default.findOrCreateDefault(this.options);
            const channel = conversationService_1.default.getChannelFromActivity(parent);
            const published = conversationService_1.default.shouldAutoPublishConversation(conversationSettings, parent.platform, channel);
            conversation = await conversationService.create({
                title: conversationTitle,
                published,
                slug: await conversationService.generateSlug(conversationTitle),
                platform: parent.platform,
            });
            await activityRepository_1.default.update(parentId, { conversationId: conversation.id }, Object.assign(Object.assign({}, this.options), { transaction }));
            await searchSyncService.triggerActivitySync(this.options.currentTenant.id, parentId);
            record = await activityRepository_1.default.update(id, { conversationId: conversation.id }, Object.assign(Object.assign({}, this.options), { transaction }));
        }
        return record;
    }
    /**
     * Check if an activity exists. An activity is considered unique by sourceId & tenantId
     * @param data Data to be added to the database
     * @param transaction DB transaction
     * @returns The existing activity if it exists, false otherwise
     */
    async _activityExists(data, transaction) {
        // An activity is unique by it's sourceId and tenantId
        const exists = await activityRepository_1.default.findOne({
            sourceId: data.sourceId,
        }, Object.assign(Object.assign({}, this.options), { transaction }));
        return exists || false;
    }
    async createWithMember(data, fireGitmeshWebhooks = true) {
        const logger = this.options.log;
        const searchSyncService = new searchSyncService_1.default(this.options, types_1.SyncMode.ASYNCHRONOUS);
        const errorDetails = {};
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        const memberService = new memberService_1.default(this.options);
        try {
            data.member.username = (0, memberTypes_1.mapUsernameToIdentities)(data.member.username, data.platform);
            const platforms = Object.keys(data.member.username);
            if (platforms.length === 0) {
                throw new Error('Member must have at least one platform username set!');
            }
            if (!data.username) {
                data.username = data.member.username[data.platform][0].username;
            }
            logger.trace({ type: data.type, platform: data.platform, username: data.username }, 'Creating activity with member!');
            let activityExists = await this._activityExists(data, transaction);
            let existingMember = activityExists
                ? await memberService.findById(activityExists.memberId, true, false)
                : false;
            if (existingMember) {
                // let's look just in case for an existing member and if they are different we should log them because they will probably fail to insert
                const tempExisting = await memberService.memberExists(data.member.username, data.platform);
                if (!tempExisting) {
                    logger.warn({
                        existingMemberId: existingMember.id,
                        username: data.username,
                        platform: data.platform,
                        activityType: data.type,
                    }, 'We have found an existing member but actually we could not find him by username and platform!');
                    errorDetails.reason = 'activity_service_createWithMember_existing_member_not_found';
                    errorDetails.details = {
                        existingMemberId: existingMember.id,
                        existingActivityId: activityExists.id,
                        username: data.username,
                        platform: data.platform,
                        activityType: data.type,
                    };
                }
                else if (existingMember.id !== tempExisting.id) {
                    logger.warn({
                        existingMemberId: existingMember.id,
                        actualExistingMemberId: tempExisting.id,
                        existingActivityId: activityExists.id,
                        username: data.username,
                        platform: data.platform,
                        activityType: data.type,
                    }, 'We found a member with the same username and platform but different id! Deleting the activity and continuing as if the activity did not exist.');
                    await activityRepository_1.default.destroy(activityExists.id, this.options, true);
                    await searchSyncService.triggerRemoveActivity(this.options.currentTenant.id, activityExists.id);
                    activityExists = false;
                    existingMember = false;
                }
            }
            const member = await memberService.upsert(Object.assign(Object.assign({}, data.member), { platform: data.platform, joinedAt: activityExists ? activityExists.timestamp : data.timestamp }), existingMember, fireGitmeshWebhooks, false);
            if (data.objectMember) {
                if (typeof data.objectMember.username === 'string') {
                    data.objectMember.username = {
                        [data.platform]: {
                            username: data.objectMember.username,
                        },
                    };
                }
                const objectMemberPlatforms = Object.keys(data.objectMember.username);
                if (objectMemberPlatforms.length === 0) {
                    throw new Error('Object member must have at least one platform username set!');
                }
                for (const platform of objectMemberPlatforms) {
                    if (typeof data.objectMember.username[platform] === 'string') {
                        data.objectMember.username[platform] = {
                            username: data.objectMember.username[platform],
                        };
                    }
                }
                const objectMember = await memberService.upsert(Object.assign(Object.assign({}, data.objectMember), { platform: data.platform, joinedAt: data.timestamp }), false, fireGitmeshWebhooks);
                if (!data.objectMemberUsername) {
                    data.objectMemberUsername = data.objectMember.username[data.platform].username;
                }
                data.objectMember = objectMember.id;
            }
            data.member = member.id;
            const memberAffilationService = new memberAffiliationService_1.default(this.options);
            data.organizationId = await memberAffilationService.findAffiliation(member.id, data.timestamp);
            const record = await this.upsert(data, activityExists, fireGitmeshWebhooks, false);
            await sequelizeRepository_1.default.commitTransaction(transaction);
            await searchSyncService.triggerMemberSync(this.options.currentTenant.id, record.memberId);
            await searchSyncService.triggerActivitySync(this.options.currentTenant.id, record.id);
            if (data.objectMember) {
                await searchSyncService.triggerMemberSync(this.options.currentTenant.id, data.objectMember);
            }
            return record;
        }
        catch (error) {
            const reason = errorDetails.reason || undefined;
            const details = errorDetails.details || undefined;
            if (error.name && error.name.includes('Sequelize') && error.original) {
                this.log.error(error, {
                    query: error.sql,
                    errorMessage: error.original.message,
                    reason,
                    details,
                }, 'Error during activity create with member!');
            }
            else {
                this.log.error(error, { reason, details }, 'Error during activity create with member!');
            }
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'activity');
            throw Object.assign(Object.assign({}, error), { reason, details });
        }
    }
    async update(id, data) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        const searchSyncService = new searchSyncService_1.default(this.options);
        try {
            data.member = await memberRepository_1.default.filterIdInTenant(data.member, Object.assign(Object.assign({}, this.options), { transaction }));
            if (data.parent) {
                data.parent = await activityRepository_1.default.filterIdInTenant(data.parent, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            const record = await activityRepository_1.default.update(id, data, Object.assign(Object.assign({}, this.options), { transaction }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            await searchSyncService.triggerActivitySync(this.options.currentTenant.id, record.id);
            await searchSyncService.triggerMemberSync(this.options.currentTenant.id, record.memberId);
            return record;
        }
        catch (error) {
            if (error.name && error.name.includes('Sequelize')) {
                this.log.error(error, {
                    query: error.sql,
                    errorMessage: error.original.message,
                }, 'Error during activity update!');
            }
            else {
                this.log.error(error, 'Error during activity update!');
            }
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'activity');
            throw error;
        }
    }
    async destroyAll(ids) {
        const searchSyncService = new searchSyncService_1.default(this.options);
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            for (const id of ids) {
                await activityRepository_1.default.destroy(id, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
        for (const id of ids) {
            await searchSyncService.triggerRemoveActivity(this.options.currentTenant.id, id);
        }
    }
    async findById(id) {
        return activityRepository_1.default.findById(id, this.options);
    }
    async findAllAutocomplete(search, limit) {
        return activityRepository_1.default.findAllAutocomplete(search, limit, this.options);
    }
    async findAndCountAll(args) {
        return activityRepository_1.default.findAndCountAll(args, this.options);
    }
    async query(data) {
        const memberAttributeSettings = (await memberAttributeSettingsRepository_1.default.findAndCountAll({}, this.options)).rows;
        const advancedFilter = data.filter;
        const orderBy = data.orderBy;
        const limit = data.limit;
        const offset = data.offset;
        return activityRepository_1.default.findAndCountAll({ advancedFilter, orderBy, limit, offset, attributesSettings: memberAttributeSettings }, this.options);
    }
    async import(data, importHash) {
        if (!importHash) {
            throw new common_1.Error400(this.options.language, 'importer.errors.importHashRequired');
        }
        if (await this._isImportHashExistent(importHash)) {
            throw new common_1.Error400(this.options.language, 'importer.errors.importHashExistent');
        }
        const dataToCreate = Object.assign(Object.assign({}, data), { importHash });
        return this.upsert(dataToCreate);
    }
    async _isImportHashExistent(importHash) {
        const count = await activityRepository_1.default.count({
            importHash,
        }, this.options);
        return count > 0;
    }
    static hasHtmlActivities(platform) {
        switch (platform) {
            case types_1.PlatformType.DEVTO:
                return true;
            default:
                return false;
        }
    }
}
exports.default = ActivityService;
//# sourceMappingURL=activityService.js.map