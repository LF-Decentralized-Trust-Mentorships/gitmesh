"use strict";
/* eslint-disable no-continue */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const logging_1 = require("@gitmesh/logging");
const temporal_1 = require("@gitmesh/temporal");
const types_1 = require("@gitmesh/types");
const lodash_1 = __importDefault(require("lodash"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const validator_1 = __importDefault(require("validator"));
const conf_1 = require("@/conf");
const activityRepository_1 = __importDefault(require("../database/repositories/activityRepository"));
const memberAttributeSettingsRepository_1 = __importDefault(require("../database/repositories/memberAttributeSettingsRepository"));
const memberRepository_1 = __importDefault(require("../database/repositories/memberRepository"));
const segmentRepository_1 = __importDefault(require("../database/repositories/segmentRepository"));
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const tagRepository_1 = __importDefault(require("../database/repositories/tagRepository"));
const memberTypes_1 = require("../database/repositories/types/memberTypes");
const isFeatureEnabled_1 = __importDefault(require("../feature-flags/isFeatureEnabled"));
const telemetryTrack_1 = __importDefault(require("../segment/telemetryTrack"));
const messageTypes_1 = require("../serverless/microservices/nodejs/messageTypes");
const nodeWorkerSQS_1 = require("../serverless/utils/nodeWorkerSQS");
const merge_1 = __importDefault(require("./helpers/merge"));
const memberAttributeSettingsService_1 = __importDefault(require("./memberAttributeSettingsService"));
const organizationService_1 = __importDefault(require("./organizationService"));
const searchSyncService_1 = __importDefault(require("./searchSyncService"));
const settingsService_1 = __importDefault(require("./settingsService"));
const configTypes_1 = require("@/conf/configTypes");
class MemberService extends logging_1.LoggerBase {
    constructor(options) {
        super(options.log);
        this.options = options;
    }
    /**
     * Validates the attributes against its saved settings.
     *
     * Throws 400 Errors if the attribute does not exist in settings,
     * or if the sent attribute type does not match the type in the settings.
     * Also restructures custom attributes that come only as a value, without platforms.
     *
     * Example custom attributes restructuring
     * {
     *   attributes: {
     *      someAttributeName: 'someValue'
     *   }
     * }
     *
     * This object is transformed into:
     * {
     *   attributes: {
     *     someAttributeName: {
     *        custom: 'someValue'
     *     },
     *   }
     * }
     *
     * @param attributes
     * @returns restructured object
     */
    async validateAttributes(attributes, transaction = null) {
        // check attribute exists in memberAttributeSettings
        const memberAttributeSettings = (await memberAttributeSettingsRepository_1.default.findAndCountAll({}, Object.assign(Object.assign({}, this.options), (transaction && { transaction })))).rows.reduce((acc, attribute) => {
            acc[attribute.name] = attribute;
            return acc;
        }, {});
        for (const attributeName of Object.keys(attributes)) {
            if (!memberAttributeSettings[attributeName]) {
                this.log.error('Attribute does not exist', {
                    attributeName,
                    attributes,
                });
                delete attributes[attributeName];
                continue;
            }
            if (typeof attributes[attributeName] !== 'object') {
                attributes[attributeName] = {
                    custom: attributes[attributeName],
                };
            }
            for (const platform of Object.keys(attributes[attributeName])) {
                if (attributes[attributeName][platform] !== undefined &&
                    attributes[attributeName][platform] !== null) {
                    if (!memberAttributeSettingsService_1.default.isCorrectType(attributes[attributeName][platform], memberAttributeSettings[attributeName].type, { options: memberAttributeSettings[attributeName].options })) {
                        this.log.error('Failed to validate attributee', {
                            attributeName,
                            platform,
                            attributeValue: attributes[attributeName][platform],
                            attributeType: memberAttributeSettings[attributeName].type,
                            options: memberAttributeSettings[attributeName].options,
                        });
                        throw new common_1.Error400(this.options.language, 'settings.memberAttributes.wrongType', attributeName, memberAttributeSettings[attributeName].type);
                    }
                }
            }
        }
        return attributes;
    }
    /**
     * Sets the attribute.default key as default values of attribute
     * object using the priority array stored in the settings.
     * Throws a 400 Error if priority array does not exist.
     * @param attributes
     * @returns attribute object with default values
     */
    async setAttributesDefaultValues(attributes) {
        if (!(await settingsService_1.default.platformPriorityArrayExists(this.options))) {
            throw new common_1.Error400(this.options.language, 'settings.memberAttributes.priorityArrayNotFound');
        }
        const priorityArray = this.options.currentTenant.settings[0].get({ plain: true })
            .attributeSettings.priorities;
        for (const attributeName of Object.keys(attributes)) {
            const highestPriorityPlatform = MemberService.getHighestPriorityPlatformForAttributes(Object.keys(attributes[attributeName]), priorityArray);
            if (highestPriorityPlatform !== undefined) {
                attributes[attributeName].default = attributes[attributeName][highestPriorityPlatform];
            }
            else {
                delete attributes[attributeName];
            }
        }
        return attributes;
    }
    /**
     * Returns the highest priority platform from an array of platforms
     * If any of the platforms does not exist in the priority array, returns
     * the first platform sent as the highest priority platform.
     * @param platforms Array of platforms to select the highest priority platform
     * @param priorityArray zero indexed priority array. Lower index means higher priority
     * @returns the highest priority platform or undefined if values are incorrect
     */
    static getHighestPriorityPlatformForAttributes(platforms, priorityArray) {
        if (platforms.length <= 0) {
            return undefined;
        }
        const filteredPlatforms = priorityArray.filter((i) => platforms.includes(i));
        return filteredPlatforms.length > 0 ? filteredPlatforms[0] : platforms[0];
    }
    /**
     * Upsert a member. If the member exists, it updates it. If it does not exist, it creates it.
     * The update is done with a deep merge of the original and the new member.
     * The member is returned without relations
     * Only the fields that have changed are updated.
     * @param data Data for the member
     * @param existing If the member already exists. If it does not, false. Othwerwise, the member.
     * @returns The created member
     */
    async upsert(data, existing = false, fireGitmeshWebhooks = true, syncToOpensearch = true) {
        var _a;
        const logger = this.options.log;
        const searchSyncService = new searchSyncService_1.default(this.options, common_1.SERVICE === configTypes_1.ServiceType.NODEJS_WORKER ? types_1.SyncMode.ASYNCHRONOUS : undefined);
        const errorDetails = {};
        if (!('platform' in data)) {
            throw new common_1.Error400(this.options.language, 'activity.platformRequiredWhileUpsert');
        }
        data.username = (0, memberTypes_1.mapUsernameToIdentities)(data.username, data.platform);
        if (!(data.platform in data.username)) {
            throw new common_1.Error400(this.options.language, 'activity.platformAndUsernameNotMatching');
        }
        if (!data.displayName) {
            data.displayName = data.username[data.platform][0].username;
        }
        if (!(data.platform in data.username)) {
            throw new common_1.Error400(this.options.language, 'activity.platformAndUsernameNotMatching');
        }
        if (!data.displayName) {
            data.displayName = data.username[data.platform].username;
        }
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            if (data.activities) {
                data.activities = await activityRepository_1.default.filterIdsInTenant(data.activities, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            if (data.tags) {
                data.tags = await tagRepository_1.default.filterIdsInTenant(data.tags, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            if (data.noMerge) {
                data.noMerge = await memberRepository_1.default.filterIdsInTenant(data.noMerge, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            if (data.toMerge) {
                data.toMerge = await memberRepository_1.default.filterIdsInTenant(data.toMerge, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            const { platform } = data;
            if (data.attributes) {
                data.attributes = await this.validateAttributes(data.attributes, transaction);
            }
            if (data.reach) {
                data.reach = typeof data.reach === 'object' ? data.reach : { [platform]: data.reach };
                data.reach = MemberService.calculateReach(data.reach, {});
            }
            else {
                data.reach = { total: -1 };
            }
            delete data.platform;
            if (!('joinedAt' in data)) {
                data.joinedAt = moment_timezone_1.default.tz('Europe/London').toDate();
            }
            if (!existing) {
                existing = await this.memberExists(data.username, platform);
            }
            else {
                // let's look just in case for an existing member and if they are different we should log them because they will probably fail to insert
                const tempExisting = await this.memberExists(data.username, platform);
                if (!tempExisting) {
                    logger.warn({ existingMemberId: existing.id }, 'We have received an existing member but actually we could not find him by username and platform!');
                    errorDetails.reason = 'member_service_upsert_existing_member_not_found';
                    errorDetails.details = {
                        existingMemberId: existing.id,
                        username: data.username,
                        platform,
                    };
                }
                else if (existing.id !== tempExisting.id) {
                    logger.warn({ existingMemberId: existing.id, actualExistingMemberId: tempExisting.id }, 'We found a member with the same username and platform but different id!');
                    errorDetails.reason = 'member_service_upsert_existing_member_mismatch';
                    errorDetails.details = {
                        existingMemberId: existing.id,
                        actualExistingMemberId: tempExisting.id,
                        username: data.username,
                        platform,
                    };
                }
            }
            // Collect IDs for relation
            const organizations = [];
            // If organizations are sent
            if (data.organizations) {
                for (const organization of data.organizations) {
                    if (typeof organization === 'string' && validator_1.default.isUUID(organization)) {
                        // If an ID was already sent, we simply push it to the list
                        organizations.push(organization);
                    }
                    else if (typeof organization === 'object' && organization.id) {
                        organizations.push(organization);
                    }
                    else {
                        // Otherwise, either another string or an object was sent
                        const organizationService = new organizationService_1.default(this.options);
                        let data = {};
                        if (typeof organization === 'string') {
                            // If a string was sent, we assume it is the name of the organization
                            data = {
                                identities: [
                                    {
                                        name: organization,
                                        platform,
                                    },
                                ],
                            };
                        }
                        else {
                            // Otherwise, we assume it is an object with the data of the organization
                            data = organization;
                        }
                        // We createOrUpdate the organization and add it to the list of IDs
                        const organizationRecord = await organizationService.createOrUpdate(data, {
                            doSync: syncToOpensearch,
                            mode: types_1.SyncMode.ASYNCHRONOUS,
                        });
                        organizations.push({ id: organizationRecord.id });
                    }
                }
            }
            // Auto assign member to organization if email domain matches
            if (data.emails) {
                const emailDomains = new Set();
                // Collect unique domains
                for (const email of data.emails) {
                    if (email) {
                        const domain = email.split('@')[1];
                        if (!(0, common_1.isDomainExcluded)(domain)) {
                            emailDomains.add(domain);
                        }
                    }
                }
                // Fetch organization ids for these domains
                const organizationService = new organizationService_1.default(this.options);
                for (const domain of emailDomains) {
                    if (domain) {
                        const org = await organizationService.createOrUpdate({
                            website: domain,
                            identities: [
                                {
                                    name: domain,
                                    platform: 'email',
                                },
                            ],
                        }, {
                            doSync: syncToOpensearch,
                            mode: types_1.SyncMode.ASYNCHRONOUS,
                        });
                        if (org) {
                            organizations.push({ id: org.id });
                        }
                    }
                }
            }
            // Remove dups
            if (organizations.length > 0) {
                data.organizations = lodash_1.default.uniqBy(organizations, 'id');
            }
            const fillRelations = false;
            let record;
            if (existing) {
                const { id } = existing;
                delete existing.id;
                const toUpdate = MemberService.membersMerge(existing, data);
                if (toUpdate.attributes) {
                    toUpdate.attributes = await this.setAttributesDefaultValues(toUpdate.attributes);
                }
                // It is important to call it with doPopulateRelations=false
                // because otherwise the performance is greatly decreased in integrations
                record = await memberRepository_1.default.update(id, toUpdate, Object.assign(Object.assign({}, this.options), { transaction }), fillRelations);
            }
            else {
                // It is important to call it with doPopulateRelations=false
                // because otherwise the performance is greatly decreased in integrations
                if (data.attributes) {
                    data.attributes = await this.setAttributesDefaultValues(data.attributes);
                }
                record = await memberRepository_1.default.create(data, Object.assign(Object.assign({}, this.options), { transaction }), fillRelations);
                (0, telemetryTrack_1.default)('Member created', {
                    id: record.id,
                    createdAt: record.createdAt,
                    sample: (_a = record.attributes.sample) === null || _a === void 0 ? void 0 : _a.gitmesh,
                    identities: Object.keys(record.username),
                }, this.options);
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
            if (syncToOpensearch) {
                try {
                    await searchSyncService.triggerMemberSync(this.options.currentTenant.id, record.id);
                }
                catch (syncError) {
                    logger.warn(syncError, { memberId: record.id }, 'Failed to sync member to OpenSearch, continuing anyway');
                }
            }
            if (!existing && fireGitmeshWebhooks) {
                try {
                    const segment = sequelizeRepository_1.default.getStrictlySingleActiveSegment(this.options);
                    if (await (0, isFeatureEnabled_1.default)(types_1.FeatureFlag.TEMPORAL_AUTOMATIONS, this.options)) {
                        const handle = await this.options.temporal.workflow.start('processNewMemberAutomation', {
                            workflowId: `new-member-automation-${record.id}`,
                            taskQueue: conf_1.TEMPORAL_CONFIG.automationsTaskQueue,
                            workflowIdReusePolicy: temporal_1.WorkflowIdReusePolicy.WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE,
                            retry: {
                                maximumAttempts: 100,
                            },
                            args: [
                                {
                                    tenantId: this.options.currentTenant.id,
                                    memberId: record.id,
                                },
                            ],
                        });
                        this.log.info({ workflowId: handle.workflowId }, 'Started temporal workflow to process new member automation!');
                    }
                    else {
                        await (0, nodeWorkerSQS_1.sendNewMemberNodeSQSMessage)(this.options.currentTenant.id, record.id, segment.id);
                    }
                }
                catch (err) {
                    logger.error(err, `Error triggering new member automation - ${record.id}!`);
                }
            }
            if (!fireGitmeshWebhooks) {
                this.log.info('Ignoring outgoing webhooks because of fireGitmeshWebhooks!');
            }
            return record;
        }
        catch (error) {
            const reason = errorDetails.reason || undefined;
            const details = errorDetails.details || undefined;
            if (error.name && error.name.includes('Sequelize')) {
                logger.error(error, {
                    query: error.sql,
                    errorMessage: error.original.message,
                    reason,
                    details,
                }, 'Error during member upsert!');
            }
            else {
                logger.error(error, { reason, details }, 'Error during member upsert!');
            }
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'member');
            throw Object.assign(Object.assign({}, error), { reason, details });
        }
    }
    /**
     * Checks if given user already exists by username and platform.
     * Username can be given as a plain string or as dictionary with
     * related platforms.
     * Ie:
     * username = 'anil' || username = { github: 'anil' } || username = { github: 'anil', twitter: 'some-other-username' } || username = { github: { username: 'anil' } } || username = { github: [{ username: 'anil' }] }
     * @param username username of the member
     * @param platform platform of the member
     * @returns null | found member
     */
    async memberExists(username, platform) {
        const fillRelations = false;
        const usernames = [];
        if (typeof username === 'string') {
            usernames.push(username);
        }
        else if (typeof username === 'object') {
            if ('username' in username) {
                usernames.push(username.username);
            }
            else if (platform in username) {
                if (typeof username[platform] === 'string') {
                    usernames.push(username[platform]);
                }
                else if (Array.isArray(username[platform])) {
                    if (username[platform].length === 0) {
                        throw new common_1.Error400(this.options.language, 'activity.platformAndUsernameNotMatching');
                    }
                    else if (typeof username[platform] === 'string') {
                        usernames.push(...username[platform]);
                    }
                    else if (typeof username[platform][0] === 'object') {
                        usernames.push(...username[platform].map((u) => u.username));
                    }
                }
                else if (typeof username[platform] === 'object') {
                    usernames.push(username[platform].username);
                }
                else {
                    throw new common_1.Error400(this.options.language, 'activity.platformAndUsernameNotMatching');
                }
            }
            else {
                throw new common_1.Error400(this.options.language, 'activity.platformAndUsernameNotMatching');
            }
        }
        // It is important to call it with doPopulateRelations=false
        // because otherwise the performance is greatly decreased in integrations
        const existing = await memberRepository_1.default.memberExists(usernames, platform, Object.assign({}, this.options), fillRelations);
        return existing;
    }
    /**
     * Perform a merge between two members.
     * - For all fields, a deep merge is performed.
     * - Then, an object is obtained with the fields that have been changed in the deep merge.
     * - The original member is updated,
     * - the other member is destroyed, and
     * - the toMerge field in tenant is updated, where each entry with the toMerge member is removed.
     * @param originalId ID of the original member. This is the member that will be updated.
     * @param toMergeId ID of the member that will be merged into the original member and deleted.
     * @returns Success/Error message
     */
    async merge(originalId, toMergeId, syncOptions = { doSync: true, mode: types_1.SyncMode.USE_FEATURE_FLAG }) {
        this.options.log.info({ originalId, toMergeId }, 'Merging members!');
        let tx;
        try {
            const original = await memberRepository_1.default.findById(originalId, this.options);
            const toMerge = await memberRepository_1.default.findById(toMergeId, this.options);
            if (original.id === toMerge.id) {
                return {
                    status: 203,
                    mergedId: originalId,
                };
            }
            const repoOptions = await sequelizeRepository_1.default.createTransactionalRepositoryOptions(this.options);
            tx = repoOptions.transaction;
            const allIdentities = await memberRepository_1.default.getIdentities([originalId, toMergeId], repoOptions);
            const originalIdentities = allIdentities.get(originalId);
            const toMergeIdentities = allIdentities.get(toMergeId);
            const identitiesToMove = [];
            for (const identity of toMergeIdentities) {
                if (!originalIdentities.find((i) => i.platform === identity.platform && i.username === identity.username)) {
                    identitiesToMove.push(identity);
                }
            }
            await memberRepository_1.default.moveIdentitiesBetweenMembers(toMergeId, originalId, identitiesToMove, repoOptions);
            // Get tags as array of ids (findById returns them as models)
            original.tags = original.tags.map((i) => i.get({ plain: true }).id);
            toMerge.tags = toMerge.tags.map((i) => i.get({ plain: true }).id);
            // leave member activities alone - we will update them with a single query later
            delete original.activities;
            delete toMerge.activities;
            // Performs a merge and returns the fields that were changed so we can update
            const toUpdate = await MemberService.membersMerge(original, toMerge);
            // we will handle activities later manually
            delete toUpdate.activities;
            // we already handled identities
            delete toUpdate.username;
            // Update original member
            const txService = new MemberService(repoOptions);
            await txService.update(originalId, toUpdate, false);
            // update activities to belong to the originalId member
            await memberRepository_1.default.moveActivitiesBetweenMembers(toMergeId, originalId, repoOptions);
            // Remove toMerge from original member
            await memberRepository_1.default.removeToMerge(originalId, toMergeId, repoOptions);
            const secondMemberSegments = await memberRepository_1.default.getMemberSegments(toMergeId, repoOptions);
            await memberRepository_1.default.includeMemberToSegments(toMergeId, Object.assign(Object.assign({}, repoOptions), { currentSegments: secondMemberSegments }));
            // Delete toMerge member
            await memberRepository_1.default.destroy(toMergeId, repoOptions, true);
            await sequelizeRepository_1.default.commitTransaction(tx);
            if (syncOptions.doSync) {
                try {
                    const searchSyncService = new searchSyncService_1.default(this.options, syncOptions.mode);
                    await searchSyncService.triggerMemberSync(this.options.currentTenant.id, originalId);
                    await searchSyncService.triggerRemoveMember(this.options.currentTenant.id, toMergeId);
                }
                catch (emitError) {
                    this.log.error(emitError, {
                        tenantId: this.options.currentTenant.id,
                        originalId,
                        toMergeId,
                    }, 'Error while triggering member sync changes!');
                }
            }
            this.options.log.info({ originalId, toMergeId }, 'Members merged!');
            return { status: 200, mergedId: originalId };
        }
        catch (err) {
            this.options.log.error(err, 'Error while merging members!');
            if (tx) {
                await sequelizeRepository_1.default.rollbackTransaction(tx);
            }
            throw err;
        }
    }
    /**
     * Call the merge function with the special fields for members.
     * We want to always keep the earlies joinedAt date.
     * We always want the original displayName.
     * @param originalObject Original object to merge
     * @param toMergeObject Object to merge into the original object
     * @returns The updates to be performed on the original object
     */
    static membersMerge(originalObject, toMergeObject) {
        return (0, merge_1.default)(originalObject, toMergeObject, {
            joinedAt: (oldDate, newDate) => {
                // If either the new or the old date are earlier than 1970
                // it means they come from an activity without timestamp
                // and we want to keep the other one
                if ((0, moment_timezone_1.default)(oldDate).subtract(5, 'days').unix() < 0) {
                    return newDate;
                }
                if ((0, moment_timezone_1.default)(newDate).unix() < 0) {
                    return oldDate;
                }
                return moment_timezone_1.default
                    .min(moment_timezone_1.default.tz(oldDate, 'Europe/London'), moment_timezone_1.default.tz(newDate, 'Europe/London'))
                    .toDate();
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            displayName: (oldValue, _newValue) => oldValue,
            reach: (oldReach, newReach) => MemberService.calculateReach(oldReach, newReach),
            score: (oldScore, newScore) => Math.max(oldScore, newScore),
            emails: (oldEmails, newEmails) => {
                if (!oldEmails && !newEmails) {
                    return [];
                }
                oldEmails = oldEmails !== null && oldEmails !== void 0 ? oldEmails : [];
                newEmails = newEmails !== null && newEmails !== void 0 ? newEmails : [];
                const emailSet = new Set(oldEmails);
                newEmails.forEach((email) => emailSet.add(email));
                return Array.from(emailSet);
            },
            username: (oldUsernames, newUsernames) => {
                // we want to keep just the usernames that are not already in the oldUsernames
                const toKeep = {};
                const actualOld = (0, memberTypes_1.mapUsernameToIdentities)(oldUsernames);
                const actualNew = (0, memberTypes_1.mapUsernameToIdentities)(newUsernames);
                for (const [platform, identities] of Object.entries(actualNew)) {
                    const oldIdentities = actualOld[platform];
                    if (oldIdentities) {
                        const identitiesToKeep = [];
                        for (const newIdentity of identities) {
                            let keep = true;
                            for (const oldIdentity of oldIdentities) {
                                if (oldIdentity.username === newIdentity.username) {
                                    keep = false;
                                    break;
                                }
                            }
                            if (keep) {
                                identitiesToKeep.push(newIdentity);
                            }
                        }
                        if (identitiesToKeep.length > 0) {
                            toKeep[platform] = identitiesToKeep;
                        }
                    }
                    else {
                        toKeep[platform] = identities;
                    }
                }
                return toKeep;
            },
        });
    }
    /**
     * Given two members, add them to the toMerge fields of each other.
     * It will also update the tenant's toMerge list, removing any entry that contains
     * the pair.
     * @returns Success/Error message
     */
    async addToMerge(suggestions) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            const searchSyncService = new searchSyncService_1.default(this.options);
            await memberRepository_1.default.addToMerge(suggestions, Object.assign(Object.assign({}, this.options), { transaction }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            for (const suggestion of suggestions) {
                await searchSyncService.triggerMemberSync(this.options.currentTenant.id, suggestion.members[0]);
                await searchSyncService.triggerMemberSync(this.options.currentTenant.id, suggestion.members[1]);
            }
            return { status: 200 };
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            this.log.error(error, 'Error while adding members to merge');
            throw error;
        }
    }
    /**
     * Given two members, add them to the noMerge fields of each other.
     * @param memberOneId ID of the first member
     * @param memberTwoId ID of the second member
     * @returns Success/Error message
     */
    async addToNoMerge(memberOneId, memberTwoId) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        const searchSyncService = new searchSyncService_1.default(this.options);
        try {
            await memberRepository_1.default.addNoMerge(memberOneId, memberTwoId, Object.assign(Object.assign({}, this.options), { transaction }));
            await memberRepository_1.default.addNoMerge(memberTwoId, memberOneId, Object.assign(Object.assign({}, this.options), { transaction }));
            await memberRepository_1.default.removeToMerge(memberOneId, memberTwoId, Object.assign(Object.assign({}, this.options), { transaction }));
            await memberRepository_1.default.removeToMerge(memberTwoId, memberOneId, Object.assign(Object.assign({}, this.options), { transaction }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            await searchSyncService.triggerMemberSync(this.options.currentTenant.id, memberOneId);
            await searchSyncService.triggerMemberSync(this.options.currentTenant.id, memberTwoId);
            return { status: 200 };
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async getMergeSuggestions(type, numberOfHours = 1.2) {
        // Adding a transaction so it will use the write database
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            let out = [];
            if (type === memberTypes_1.IMemberMergeSuggestionsType.USERNAME) {
                out = await memberRepository_1.default.mergeSuggestionsByUsername(numberOfHours, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            if (type === memberTypes_1.IMemberMergeSuggestionsType.EMAIL) {
                out = await memberRepository_1.default.mergeSuggestionsByEmail(numberOfHours, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            if (type === memberTypes_1.IMemberMergeSuggestionsType.SIMILARITY) {
                out = await memberRepository_1.default.mergeSuggestionsBySimilarity(numberOfHours, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return out;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            this.log.error(error);
            throw error;
        }
    }
    async update(id, data, syncToOpensearch = true) {
        let transaction;
        const searchSyncService = new searchSyncService_1.default(this.options);
        try {
            const repoOptions = await sequelizeRepository_1.default.createTransactionalRepositoryOptions(this.options);
            transaction = repoOptions.transaction;
            if (data.activities) {
                data.activities = await activityRepository_1.default.filterIdsInTenant(data.activities, repoOptions);
            }
            if (data.tags) {
                data.tags = await tagRepository_1.default.filterIdsInTenant(data.tags, repoOptions);
            }
            if (data.noMerge) {
                data.noMerge = await memberRepository_1.default.filterIdsInTenant(data.noMerge.filter((i) => i !== id), repoOptions);
            }
            if (data.toMerge) {
                data.toMerge = await memberRepository_1.default.filterIdsInTenant(data.toMerge.filter((i) => i !== id), repoOptions);
            }
            if (data.username) {
                // need to filter out existing identities from the payload
                const existingIdentities = (await memberRepository_1.default.getIdentities([id], repoOptions)).get(id);
                data.username = (0, memberTypes_1.mapUsernameToIdentities)(data.username, data.platform);
                for (const identity of existingIdentities) {
                    if (identity.platform in data.username) {
                        // new username has this platform - we need to check if it also has the username
                        let found = false;
                        for (const newIdentity of data.username[identity.platform]) {
                            if (newIdentity.username === identity.username) {
                                found = true;
                                break;
                            }
                        }
                        if (found) {
                            // remove from data.username
                            data.username[identity.platform] = data.username[identity.platform].filter((i) => i.username !== identity.username);
                        }
                        else {
                            data.username[identity.platform].push(Object.assign(Object.assign({}, identity), { delete: true }));
                        }
                    }
                    else {
                        // new username doesn't have this platform - we can delete the existing identity
                        data.username[identity.platform] = Object.assign(Object.assign({}, identity), { delete: true });
                    }
                }
            }
            const record = await memberRepository_1.default.update(id, data, repoOptions);
            await sequelizeRepository_1.default.commitTransaction(transaction);
            if (syncToOpensearch) {
                try {
                    await searchSyncService.triggerMemberSync(this.options.currentTenant.id, record.id);
                }
                catch (emitErr) {
                    this.log.error(emitErr, { tenantId: this.options.currentTenant.id, memberId: record.id }, 'Error while triggering member sync changes!');
                }
            }
            return record;
        }
        catch (error) {
            if (error.name && error.name.includes('Sequelize')) {
                this.log.error(error, {
                    query: error.sql,
                    errorMessage: error.original.message,
                }, 'Error during member update!');
            }
            else {
                this.log.error(error, 'Error during member update!');
            }
            if (transaction) {
                await sequelizeRepository_1.default.rollbackTransaction(transaction);
            }
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'member');
            throw error;
        }
    }
    async destroyBulk(ids) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        const searchSyncService = new searchSyncService_1.default(this.options);
        try {
            await memberRepository_1.default.destroyBulk(ids, Object.assign(Object.assign({}, this.options), { transaction }), true);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
        for (const id of ids) {
            await searchSyncService.triggerRemoveMember(this.options.currentTenant.id, id);
        }
    }
    async destroyAll(ids) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        const searchSyncService = new searchSyncService_1.default(this.options);
        try {
            for (const id of ids) {
                await memberRepository_1.default.destroy(id, Object.assign(Object.assign({}, this.options), { transaction }), true);
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
        for (const id of ids) {
            await searchSyncService.triggerRemoveMember(this.options.currentTenant.id, id);
        }
    }
    async findById(id, returnPlain = true, doPopulateRelations = true) {
        return memberRepository_1.default.findById(id, this.options, returnPlain, doPopulateRelations);
    }
    async findAllAutocomplete(search, limit) {
        return memberRepository_1.default.findAllAutocomplete(search, limit, this.options);
    }
    async findAndCountActive(filters, offset, limit, orderBy, segments) {
        const memberAttributeSettings = (await memberAttributeSettingsRepository_1.default.findAndCountAll({}, this.options)).rows;
        return memberRepository_1.default.findAndCountActiveOpensearch(filters, limit, offset, orderBy, this.options, memberAttributeSettings, segments);
    }
    async findAndCountAll(args) {
        const memberAttributeSettings = (await memberAttributeSettingsRepository_1.default.findAndCountAll({}, this.options)).rows;
        return memberRepository_1.default.findAndCountAll(Object.assign(Object.assign({}, args), { attributesSettings: memberAttributeSettings }), this.options);
    }
    async queryV2(data) {
        var _a;
        const logger = this.options.log;
        logger.info('queryV2 called with data:', JSON.stringify(data, null, 2));
        if (await (0, isFeatureEnabled_1.default)(types_1.FeatureFlag.SEGMENTS, this.options)) {
            if (data.segments.length !== 1) {
                throw new common_1.Error400(`This operation can have exactly one segment. Found ${data.segments.length} segments.`);
            }
        }
        else {
            data.segments = [(await new segmentRepository_1.default(this.options).getDefaultSegment()).id];
        }
        const memberAttributeSettings = (await memberAttributeSettingsRepository_1.default.findAndCountAll({}, this.options)).rows;
        // PERMANENT FIX: Always check for manually created members first
        const manualMembersCheck = await this.options.database.sequelize.query(`SELECT COUNT(*) as count FROM members 
       WHERE "tenantId" = :tenantId 
       AND "deletedAt" IS NULL 
       AND "manuallyCreated" = true`, {
            replacements: { tenantId: this.options.currentTenant.id },
            type: this.options.database.Sequelize.QueryTypes.SELECT,
        });
        // ALWAYS use database query when manual members exist - ensures instant visibility
        const hasManualMembers = ((_a = manualMembersCheck[0]) === null || _a === void 0 ? void 0 : _a.count) > 0;
        if (hasManualMembers) {
            logger.info({ manualMembersCount: manualMembersCheck[0].count }, 'Manual members detected - using database query for guaranteed visibility');
        }
        // Try OpenSearch only if no manual members exist
        if (!hasManualMembers) {
            try {
                const result = await memberRepository_1.default.findAndCountAllOpensearch({
                    limit: data.limit,
                    offset: data.offset,
                    filter: data.filter,
                    orderBy: data.orderBy || undefined,
                    countOnly: data.countOnly || false,
                    attributesSettings: memberAttributeSettings,
                    segments: data.segments,
                }, this.options);
                return result;
            }
            catch (error) {
                logger.warn(error, 'OpenSearch query failed, falling back to database query');
            }
        }
        // PERMANENT DATABASE FALLBACK with proper count handling
        logger.info({ segments: data.segments, filter: data.filter, limit: data.limit, offset: data.offset }, 'Using database query');
        // Fetch segment objects for the options
        const segmentRepo = new segmentRepository_1.default(this.options);
        const segments = await Promise.all(data.segments.map(id => segmentRepo.findById(id)));
        // Create new options with currentSegments set
        const optionsWithSegments = Object.assign(Object.assign({}, this.options), { currentSegments: segments });
        // Use findAndCountAllv2 which supports segments
        const result = await memberRepository_1.default.findAndCountAllv2({
            filter: data.filter,
            limit: data.limit,
            offset: data.offset,
            orderBy: data.orderBy || 'joinedAt_DESC',
            countOnly: data.countOnly || false,
            attributesSettings: memberAttributeSettings,
        }, optionsWithSegments);
        logger.info({ count: result.count, rowsLength: result.rows.length }, 'Database query result');
        // PERMANENT FIX for count mismatch - ensure count matches actual rows
        if (result.count !== result.rows.length) {
            logger.warn({ originalCount: result.count, actualRows: result.rows.length }, 'Count mismatch detected - correcting to match actual data');
            result.count = result.rows.length;
        }
        return result;
    }
    async query(data, exportMode = false) {
        const memberAttributeSettings = (await memberAttributeSettingsRepository_1.default.findAndCountAll({}, this.options)).rows.filter((setting) => setting.type !== types_1.MemberAttributeType.SPECIAL);
        const advancedFilter = data.filter;
        const orderBy = data.orderBy;
        const limit = data.limit;
        const offset = data.offset;
        return memberRepository_1.default.findAndCountAll({
            advancedFilter,
            orderBy,
            limit,
            offset,
            attributesSettings: memberAttributeSettings,
            exportMode,
        }, this.options);
    }
    async queryForCsv(data) {
        var _a;
        data.limit = 10000000000000;
        const found = await this.query(data, true);
        const relations = [
            { relation: 'organizations', attributes: ['name'] },
            { relation: 'notes', attributes: ['body'] },
            { relation: 'tags', attributes: ['name'] },
        ];
        for (const relation of relations) {
            for (const member of found.rows) {
                member[relation.relation] = (_a = member[relation.relation]) === null || _a === void 0 ? void 0 : _a.map((i) => (Object.assign({ id: i.id }, lodash_1.default.pick(i, relation.attributes))));
            }
        }
        return found;
    }
    async export(data) {
        const result = await (0, nodeWorkerSQS_1.sendExportCSVNodeSQSMessage)(this.options.currentTenant.id, this.options.currentUser.id, messageTypes_1.ExportableEntity.MEMBERS, sequelizeRepository_1.default.getSegmentIds(this.options), data);
        return result;
    }
    async findMembersWithMergeSuggestions(args) {
        return memberRepository_1.default.findMembersWithMergeSuggestions(args, this.options);
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
        const count = await memberRepository_1.default.count({
            importHash,
        }, this.options);
        return count > 0;
    }
    /**
     *
     * @param oldReach The old reach object
     * @param newReach the new reach object
     * @returns The new reach object
     */
    static calculateReach(oldReach, newReach) {
        // Totals are recomputed, so we delete them first
        delete oldReach.total;
        delete newReach.total;
        const out = lodash_1.default.merge(oldReach, newReach);
        if (Object.keys(out).length === 0) {
            return { total: -1 };
        }
        // Total is the sum of all attributes
        out.total = lodash_1.default.sum(Object.values(out));
        return out;
    }
}
exports.default = MemberService;
//# sourceMappingURL=memberService.js.map