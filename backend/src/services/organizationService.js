"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const common_1 = require("@gitmesh/common");
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const getObjectWithoutKey_1 = __importDefault(require("@/utils/getObjectWithoutKey"));
const memberRepository_1 = __importDefault(require("../database/repositories/memberRepository"));
const mergeActionsRepository_1 = require("../database/repositories/mergeActionsRepository");
const organizationCacheRepository_1 = __importDefault(require("../database/repositories/organizationCacheRepository"));
const organizationRepository_1 = __importDefault(require("../database/repositories/organizationRepository"));
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const telemetryTrack_1 = __importDefault(require("../segment/telemetryTrack"));
const nodeWorkerSQS_1 = require("../serverless/utils/nodeWorkerSQS");
const merge_1 = __importDefault(require("./helpers/merge"));
const mergeFunctions_1 = require("./helpers/mergeFunctions");
const searchSyncService_1 = __importDefault(require("./searchSyncService"));
class OrganizationService extends logging_1.LoggerBase {
    constructor(options) {
        super(options.log);
        this.options = options;
    }
    async mergeAsync(originalId, toMergeId) {
        const tenantId = this.options.currentTenant.id;
        await mergeActionsRepository_1.MergeActionsRepository.add(mergeActionsRepository_1.MergeActionType.ORG, originalId, toMergeId, this.options);
        await (0, nodeWorkerSQS_1.sendOrgMergeMessage)(tenantId, originalId, toMergeId);
    }
    async mergeSync(originalId, toMergeId) {
        this.options.log.info({ originalId, toMergeId }, 'Merging organizations!');
        const removeExtraFields = (organization) => (0, getObjectWithoutKey_1.default)(organization, [
            'activityCount',
            'memberCount',
            'activeOn',
            'segments',
            'lastActive',
            'joinedAt',
        ]);
        let tx;
        try {
            let original = await organizationRepository_1.default.findById(originalId, this.options);
            let toMerge = await organizationRepository_1.default.findById(toMergeId, this.options);
            if (original.id === toMerge.id) {
                return {
                    status: 203,
                    mergedId: originalId,
                };
            }
            const mergeStatusChanged = await mergeActionsRepository_1.MergeActionsRepository.setState(mergeActionsRepository_1.MergeActionType.ORG, originalId, toMergeId, mergeActionsRepository_1.MergeActionState.IN_PROGRESS, 
            // not using transaction here on purpose,
            // so this change is visible until we finish
            this.options);
            if (!mergeStatusChanged) {
                this.log.info('[Merge Organizations] - Merging already in progress!');
                return {
                    status: 203,
                    mergedId: originalId,
                };
            }
            const repoOptions = await sequelizeRepository_1.default.createTransactionalRepositoryOptions(this.options);
            tx = repoOptions.transaction;
            const allIdentities = await organizationRepository_1.default.getIdentities([originalId, toMergeId], repoOptions);
            const originalIdentities = allIdentities.filter((i) => i.organizationId === originalId);
            const toMergeIdentities = allIdentities.filter((i) => i.organizationId === toMergeId);
            const identitiesToMove = [];
            for (const identity of toMergeIdentities) {
                if (!originalIdentities.find((i) => i.platform === identity.platform && i.name === identity.name)) {
                    identitiesToMove.push(identity);
                }
            }
            await organizationRepository_1.default.moveIdentitiesBetweenOrganizations(toMergeId, originalId, identitiesToMove, repoOptions);
            // if toMerge has website - also add it as an identity to the original org
            // for identifying further organizations, and website information of toMerge is not lost
            if (toMerge.website) {
                await organizationRepository_1.default.addIdentity(originalId, {
                    name: toMerge.website,
                    platform: 'email',
                    integrationId: null,
                }, repoOptions);
            }
            // remove aggregate fields and relationships
            original = removeExtraFields(original);
            toMerge = removeExtraFields(toMerge);
            // Performs a merge and returns the fields that were changed so we can update
            const toUpdate = await OrganizationService.organizationsMerge(original, toMerge);
            const txService = new OrganizationService(repoOptions);
            // check if website is being updated, if yes we need to set toMerge.website to null before doing the update
            // because of website unique constraint
            if (toUpdate.website && toUpdate.website === toMerge.website) {
                await txService.update(toMergeId, { website: null }, false, false);
            }
            // Update original organization
            await txService.update(originalId, toUpdate, false, false);
            // update members that belong to source organization to destination org
            await organizationRepository_1.default.moveMembersBetweenOrganizations(toMergeId, originalId, repoOptions);
            // update activities that belong to source org to destination org
            await organizationRepository_1.default.moveActivitiesBetweenOrganizations(toMergeId, originalId, repoOptions);
            const secondMemberSegments = await organizationRepository_1.default.getOrganizationSegments(toMergeId, repoOptions);
            if (secondMemberSegments.length > 0) {
                await organizationRepository_1.default.includeOrganizationToSegments(originalId, Object.assign(Object.assign({}, repoOptions), { currentSegments: secondMemberSegments }));
            }
            // Delete toMerge organization
            await organizationRepository_1.default.destroy(toMergeId, repoOptions, true, false);
            await sequelizeRepository_1.default.commitTransaction(tx);
            await mergeActionsRepository_1.MergeActionsRepository.setState(mergeActionsRepository_1.MergeActionType.ORG, originalId, toMergeId, mergeActionsRepository_1.MergeActionState.DONE, this.options);
            const searchSyncService = new searchSyncService_1.default(this.options);
            await searchSyncService.triggerOrganizationSync(this.options.currentTenant.id, originalId);
            await searchSyncService.triggerRemoveOrganization(this.options.currentTenant.id, toMergeId);
            // sync organization members
            await searchSyncService.triggerOrganizationMembersSync(originalId);
            // sync organization activities
            await searchSyncService.triggerOrganizationActivitiesSync(originalId);
            this.options.log.info({ originalId, toMergeId }, 'Organizations merged!');
            return { status: 200, mergedId: originalId };
        }
        catch (err) {
            this.options.log.error(err, 'Error while merging organizations!', {
                originalId,
                toMergeId,
            });
            await mergeActionsRepository_1.MergeActionsRepository.setState(mergeActionsRepository_1.MergeActionType.ORG, originalId, toMergeId, mergeActionsRepository_1.MergeActionState.ERROR, this.options);
            if (tx) {
                await sequelizeRepository_1.default.rollbackTransaction(tx);
            }
            throw err;
        }
    }
    static organizationsMerge(originalObject, toMergeObject) {
        return (0, merge_1.default)(originalObject, toMergeObject, {
            description: mergeFunctions_1.keepPrimaryIfExists,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            emails: mergeFunctions_1.mergeUniqueStringArrayItems,
            phoneNumbers: mergeFunctions_1.mergeUniqueStringArrayItems,
            logo: mergeFunctions_1.keepPrimaryIfExists,
            tags: mergeFunctions_1.mergeUniqueStringArrayItems,
            twitter: mergeFunctions_1.keepPrimaryIfExists,
            linkedin: mergeFunctions_1.keepPrimaryIfExists,
            crunchbase: mergeFunctions_1.keepPrimaryIfExists,
            employees: mergeFunctions_1.keepPrimaryIfExists,
            revenueRange: mergeFunctions_1.keepPrimaryIfExists,
            importHash: mergeFunctions_1.keepPrimary,
            createdAt: mergeFunctions_1.keepPrimary,
            updatedAt: mergeFunctions_1.keepPrimary,
            deletedAt: mergeFunctions_1.keepPrimary,
            tenantId: mergeFunctions_1.keepPrimary,
            createdById: mergeFunctions_1.keepPrimary,
            updatedById: mergeFunctions_1.keepPrimary,
            location: mergeFunctions_1.keepPrimaryIfExists,
            github: mergeFunctions_1.keepPrimaryIfExists,
            website: mergeFunctions_1.keepPrimaryIfExists,
            isTeamOrganization: mergeFunctions_1.keepPrimaryIfExists,
            lastEnrichedAt: mergeFunctions_1.keepPrimary,
            employeeCounByCountry: mergeFunctions_1.keepPrimaryIfExists,
            type: mergeFunctions_1.keepPrimaryIfExists,
            geoLocation: mergeFunctions_1.keepPrimaryIfExists,
            size: mergeFunctions_1.keepPrimaryIfExists,
            ticker: mergeFunctions_1.keepPrimaryIfExists,
            headline: mergeFunctions_1.keepPrimaryIfExists,
            profiles: mergeFunctions_1.mergeUniqueStringArrayItems,
            naics: mergeFunctions_1.keepPrimaryIfExists,
            address: mergeFunctions_1.keepPrimaryIfExists,
            industry: mergeFunctions_1.keepPrimaryIfExists,
            founded: mergeFunctions_1.keepPrimaryIfExists,
            displayName: mergeFunctions_1.keepPrimary,
            attributes: mergeFunctions_1.keepPrimary,
            searchSyncedAt: mergeFunctions_1.keepPrimary,
            affiliatedProfiles: mergeFunctions_1.mergeUniqueStringArrayItems,
            allSubsidiaries: mergeFunctions_1.mergeUniqueStringArrayItems,
            alternativeDomains: mergeFunctions_1.mergeUniqueStringArrayItems,
            alternativeNames: mergeFunctions_1.mergeUniqueStringArrayItems,
            averageEmployeeTenure: mergeFunctions_1.keepPrimaryIfExists,
            averageTenureByLevel: mergeFunctions_1.keepPrimaryIfExists,
            averageTenureByRole: mergeFunctions_1.keepPrimaryIfExists,
            directSubsidiaries: mergeFunctions_1.mergeUniqueStringArrayItems,
            employeeChurnRate: mergeFunctions_1.keepPrimaryIfExists,
            employeeCountByMonth: mergeFunctions_1.keepPrimaryIfExists,
            employeeGrowthRate: mergeFunctions_1.keepPrimaryIfExists,
            employeeCountByMonthByLevel: mergeFunctions_1.keepPrimaryIfExists,
            employeeCountByMonthByRole: mergeFunctions_1.keepPrimaryIfExists,
            gicsSector: mergeFunctions_1.keepPrimaryIfExists,
            grossAdditionsByMonth: mergeFunctions_1.keepPrimaryIfExists,
            grossDeparturesByMonth: mergeFunctions_1.keepPrimaryIfExists,
            ultimateParent: mergeFunctions_1.keepPrimaryIfExists,
            immediateParent: mergeFunctions_1.keepPrimaryIfExists,
            manuallyCreated: mergeFunctions_1.keepPrimary,
            weakIdentities: (weakIdentitiesPrimary, weakIdentitiesSecondary) => {
                const uniqueMap = {};
                const createKey = (identity) => `${identity.platform}_${identity.name}`;
                [...weakIdentitiesPrimary, ...weakIdentitiesSecondary].forEach((identity) => {
                    const key = createKey(identity);
                    if (!uniqueMap[key]) {
                        uniqueMap[key] = identity;
                    }
                });
                return Object.values(uniqueMap);
            },
        });
    }
    async generateMergeSuggestions(type) {
        this.log.trace(`Generating merge suggestions for: ${this.options.currentTenant.id}`);
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            if (type === types_1.OrganizationMergeSuggestionType.BY_IDENTITY) {
                let mergeSuggestions;
                let hasSuggestions = false;
                const generator = organizationRepository_1.default.getMergeSuggestions(Object.assign(Object.assign({}, this.options), { transaction }));
                do {
                    mergeSuggestions = await generator.next();
                    if (mergeSuggestions.value) {
                        this.log.info(`[Organization Merge Suggestions] tenant: ${this.options.currentTenant.id}, adding ${mergeSuggestions.value.length} organizations to suggestions!`);
                        hasSuggestions = true;
                    }
                    else if (!hasSuggestions) {
                        this.log.info(`[Organization Merge Suggestions] tenant: ${this.options.currentTenant.id} doesn't have any merge suggestions`);
                    }
                    else {
                        this.log.info(`[Organization Merge Suggestions] tenant: ${this.options.currentTenant.id} Finished going tru all suggestions!`);
                    }
                    if (mergeSuggestions.value && mergeSuggestions.value.length > 0) {
                        await organizationRepository_1.default.addToMerge(mergeSuggestions.value, this.options);
                    }
                } while (!mergeSuggestions.done);
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            this.log.error(error);
            throw error;
        }
    }
    async addToNoMerge(organizationId, noMergeId) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        const searchSyncService = new searchSyncService_1.default(this.options);
        try {
            await organizationRepository_1.default.addNoMerge(organizationId, noMergeId, Object.assign(Object.assign({}, this.options), { transaction }));
            await organizationRepository_1.default.removeToMerge(organizationId, noMergeId, Object.assign(Object.assign({}, this.options), { transaction }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            await searchSyncService.triggerOrganizationSync(this.options.currentTenant.id, organizationId);
            await searchSyncService.triggerOrganizationSync(this.options.currentTenant.id, noMergeId);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async createOrUpdate(data, syncOptions = { doSync: true, mode: types_1.SyncMode.USE_FEATURE_FLAG }) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        if (data.name && (!data.identities || data.identities.length === 0)) {
            data.identities = [
                {
                    name: data.name,
                    platform: 'custom',
                },
            ];
            delete data.name;
        }
        if (!data.identities ||
            data.identities.length === 0 ||
            !data.identities[0].name ||
            !data.identities[0].platform) {
            const message = `Missing organization identity while creating/updating organization!`;
            this.log.error(data, message);
            throw new Error(message);
        }
        let record;
        try {
            const primaryIdentity = data.identities[0];
            const nameToCheckInCache = data.name || primaryIdentity.name;
            // check cache existing by name
            let cache = await organizationCacheRepository_1.default.findByName(nameToCheckInCache, Object.assign(Object.assign({}, this.options), { transaction }));
            // Normalize the website URL if it exists
            if (data.website) {
                data.website = (0, common_1.websiteNormalizer)(data.website);
            }
            // if cache exists, merge current data with cache data
            // if it doesn't exist, create it from incoming data
            if (cache) {
                // if exists in cache update it
                const updateData = {};
                const fields = [
                    'url',
                    'description',
                    'emails',
                    'logo',
                    'tags',
                    'github',
                    'twitter',
                    'linkedin',
                    'crunchbase',
                    'employees',
                    'location',
                    'website',
                    'type',
                    'size',
                    'headline',
                    'industry',
                    'founded',
                ];
                fields.forEach((field) => {
                    if (data[field] && !(0, lodash_1.isEqual)(data[field], cache[field])) {
                        updateData[field] = data[field];
                    }
                });
                if (Object.keys(updateData).length > 0) {
                    await organizationCacheRepository_1.default.update(cache.id, updateData, Object.assign(Object.assign({}, this.options), { transaction }));
                    cache = Object.assign(Object.assign({}, cache), updateData); // Update the cached data with the new data
                }
            }
            else {
                // save it to cache
                cache = await organizationCacheRepository_1.default.create(Object.assign(Object.assign({}, data), { name: primaryIdentity.name }), Object.assign(Object.assign({}, this.options), { transaction }));
            }
            if (data.members) {
                cache.members = await memberRepository_1.default.filterIdsInTenant(data.members, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            let existing;
            // check if organization already exists using website or primary identity
            if (cache.website) {
                existing = await organizationRepository_1.default.findByDomain(cache.website, this.options);
                // also check domain in identities
                if (!existing) {
                    existing = await organizationRepository_1.default.findByIdentity({
                        name: (0, common_1.websiteNormalizer)(cache.website),
                        platform: 'email',
                    }, this.options);
                }
            }
            if (!existing) {
                existing = await organizationRepository_1.default.findByIdentity(primaryIdentity, this.options);
            }
            if (existing) {
                await organizationRepository_1.default.checkIdentities(data, this.options, existing.id);
                // Set displayName if it doesn't exist
                if (!existing.displayName) {
                    data.displayName = cache.name;
                }
                // if it does exists update it
                const updateData = {};
                const fields = [
                    'displayName',
                    'description',
                    'emails',
                    'logo',
                    'tags',
                    'github',
                    'twitter',
                    'linkedin',
                    'crunchbase',
                    'employees',
                    'location',
                    'website',
                    'type',
                    'size',
                    'headline',
                    'industry',
                    'founded',
                    'attributes',
                    'weakIdentities',
                ];
                fields.forEach((field) => {
                    if (field === 'website' && !existing.website && cache.website) {
                        updateData[field] = cache[field];
                    }
                    else if (field !== 'website' &&
                        cache[field] &&
                        !(0, lodash_1.isEqual)(cache[field], existing[field])) {
                        updateData[field] = cache[field];
                    }
                });
                record = await organizationRepository_1.default.update(existing.id, updateData, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            else {
                await organizationRepository_1.default.checkIdentities(data, this.options);
                const organization = Object.assign(Object.assign(Object.assign({}, data), cache), { displayName: cache.name });
                record = await organizationRepository_1.default.create(organization, Object.assign(Object.assign({}, this.options), { transaction }));
                (0, telemetryTrack_1.default)('Organization created', {
                    id: record.id,
                    createdAt: record.createdAt,
                }, this.options);
            }
            const identities = await organizationRepository_1.default.getIdentities(record.id, Object.assign(Object.assign({}, this.options), { transaction }));
            if (data.identities && data.identities.length > 0) {
                for (const identity of data.identities) {
                    const identityExists = identities.find((i) => i.name === identity.name && i.platform === identity.platform);
                    if (!identityExists) {
                        // add the identity
                        await organizationRepository_1.default.addIdentity(record.id, identity, Object.assign(Object.assign({}, this.options), { transaction }));
                    }
                }
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'organization');
            throw error;
        }
        // Execute post-commit operations (not part of the transaction)
        if (syncOptions.doSync) {
            try {
                const searchSyncService = new searchSyncService_1.default(this.options, syncOptions.mode);
                await searchSyncService.triggerOrganizationSync(this.options.currentTenant.id, record.id);
            }
            catch (syncError) {
                // Log sync error but don't fail the organization creation
                this.log.warn(syncError, 'Search sync failed (organization still created)');
            }
        }
        return await this.findById(record.id);
    }
    async findOrganizationsWithMergeSuggestions(args) {
        return organizationRepository_1.default.findOrganizationsWithMergeSuggestions(args, this.options);
    }
    async update(id, data, overrideIdentities = false, syncToOpensearch = true) {
        let tx;
        try {
            const repoOptions = await sequelizeRepository_1.default.createTransactionalRepositoryOptions(this.options);
            tx = repoOptions.transaction;
            if (data.members) {
                data.members = await memberRepository_1.default.filterIdsInTenant(data.members, repoOptions);
            }
            // Normalize the website URL if it exists
            if (data.website) {
                data.website = (0, common_1.websiteNormalizer)(data.website);
            }
            if (data.identities) {
                const originalIdentities = data.identities;
                // check identities
                await organizationRepository_1.default.checkIdentities(data, repoOptions, id);
                // if we found any strong identities sent already existing in another organization
                // instead of making it a weak identity we throw an error here, because this function
                // is mainly used for doing manual updates through UI and possibly
                // we don't wanna do an auto-merge here or make strong identities sent by user as weak
                if (originalIdentities.length !== data.identities.length) {
                    const alreadyExistingStrongIdentities = originalIdentities.filter((oi) => !data.identities.some((di) => di.platform === oi.platform && di.name === oi.name));
                    throw new Error(`Organization identities ${JSON.stringify(alreadyExistingStrongIdentities)} already exist in another organization!`);
                }
            }
            const record = await organizationRepository_1.default.update(id, data, repoOptions, overrideIdentities);
            await sequelizeRepository_1.default.commitTransaction(tx);
            if (syncToOpensearch) {
                try {
                    const searchSyncService = new searchSyncService_1.default(this.options);
                    await searchSyncService.triggerOrganizationSync(this.options.currentTenant.id, record.id);
                }
                catch (emitErr) {
                    this.log.error(emitErr, { tenantId: this.options.currentTenant.id, organizationId: record.id }, 'Error while emitting organization sync!');
                }
            }
            return record;
        }
        catch (error) {
            if (tx) {
                await sequelizeRepository_1.default.rollbackTransaction(tx);
            }
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'organization');
            throw error;
        }
    }
    async destroyAll(ids) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            for (const id of ids) {
                await organizationRepository_1.default.destroy(id, Object.assign(Object.assign({}, this.options), { transaction }), true);
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
            const searchSyncService = new searchSyncService_1.default(this.options);
            for (const id of ids) {
                await searchSyncService.triggerRemoveOrganization(this.options.currentTenant.id, id);
            }
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async findById(id, segmentId) {
        return organizationRepository_1.default.findById(id, this.options, segmentId);
    }
    async findAllAutocomplete(search, limit) {
        return organizationRepository_1.default.findAllAutocomplete(search, limit, this.options);
    }
    async findAndCountAll(args) {
        return organizationRepository_1.default.findAndCountAll(args, this.options);
    }
    async findByUrl(url) {
        return organizationRepository_1.default.findByUrl(url, this.options);
    }
    async findOrCreateByDomain(domain) {
        return organizationRepository_1.default.findOrCreateByDomain(domain, this.options);
    }
    async query(data) {
        var _a;
        const advancedFilter = data.filter;
        const orderBy = data.orderBy;
        const limit = data.limit;
        const offset = data.offset;
        // PERMANENT FIX: Always check for manually created organizations first
        const manualOrgsCheck = await this.options.database.sequelize.query(`SELECT COUNT(*) as count FROM organizations 
       WHERE "tenantId" = :tenantId 
       AND "deletedAt" IS NULL 
       AND "manuallyCreated" = true`, {
            replacements: { tenantId: this.options.currentTenant.id },
            type: this.options.database.Sequelize.QueryTypes.SELECT,
        });
        // ALWAYS use database query when manual organizations exist - ensures instant visibility
        const hasManualOrganizations = ((_a = manualOrgsCheck[0]) === null || _a === void 0 ? void 0 : _a.count) > 0;
        if (hasManualOrganizations) {
            this.log.info({ manualOrganizationsCount: manualOrgsCheck[0].count }, 'Manual organizations detected - using database query for guaranteed visibility');
        }
        // Try OpenSearch only if no manual organizations exist
        if (!hasManualOrganizations) {
            try {
                const result = await organizationRepository_1.default.findAndCountAllOpensearch({ filter: advancedFilter, orderBy, limit, offset, segments: data.segments }, this.options);
                return result;
            }
            catch (searchError) {
                this.log.warn(searchError, 'OpenSearch query failed, falling back to database query');
            }
        }
        // PERMANENT DATABASE FALLBACK with proper count handling
        this.log.info({ filter: advancedFilter, limit, offset }, 'Using database query');
        const result = await organizationRepository_1.default.findAndCountAll({ filter: advancedFilter, orderBy, limit, offset }, this.options);
        this.log.info({ count: result.count, rowsLength: result.rows.length }, 'Database query result');
        // PERMANENT FIX for count mismatch - ensure count matches actual rows
        if (result.count !== result.rows.length) {
            this.log.warn({ originalCount: result.count, actualRows: result.rows.length }, 'Count mismatch detected - correcting to match actual data');
            result.count = result.rows.length;
        }
        return result;
    }
    async destroyBulk(ids) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            await organizationRepository_1.default.destroyBulk(ids, Object.assign(Object.assign({}, this.options), { transaction }), true);
            await sequelizeRepository_1.default.commitTransaction(transaction);
            const searchSyncService = new searchSyncService_1.default(this.options);
            for (const id of ids) {
                await searchSyncService.triggerRemoveOrganization(this.options.currentTenant.id, id);
            }
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async import(data, importHash) {
        if (!importHash) {
            throw new common_1.Error400(this.options.language, 'importer.errors.importHashRequired');
        }
        if (await this._isImportHashExistent(importHash)) {
            throw new common_1.Error400(this.options.language, 'importer.errors.importHashExistent');
        }
        const dataToCreate = Object.assign(Object.assign({}, data), { importHash });
        return this.createOrUpdate(dataToCreate);
    }
    async _isImportHashExistent(importHash) {
        const count = await organizationRepository_1.default.count({
            importHash,
        }, this.options);
        return count > 0;
    }
}
exports.default = OrganizationService;
//# sourceMappingURL=organizationService.js.map