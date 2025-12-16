"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberSyncService = void 0;
const member_repo_1 = require("../repo/member.repo");
const segment_repo_1 = require("../repo/segment.repo");
const types_1 = require("../types");
const common_1 = require("@gitmesh/common");
const logging_1 = require("@gitmesh/logging");
const types_2 = require("@gitmesh/types");
class MemberSyncService {
    constructor(redisClient, store, openSearchService, parentLog, serviceConfig) {
        this.openSearchService = openSearchService;
        this.log = (0, logging_1.getChildLogger)('member-sync-service', parentLog);
        this.serviceConfig = serviceConfig;
        this.memberRepo = new member_repo_1.MemberRepository(redisClient, store, this.log);
        this.segmentRepo = new segment_repo_1.SegmentRepository(store, this.log);
    }
    async getAllIndexedTenantIds(pageSize = 500, afterKey) {
        var _a;
        const include = ['uuid_tenantId'];
        const results = await this.openSearchService.search(types_1.OpenSearchIndex.MEMBERS, undefined, {
            uuid_tenantId_buckets: {
                composite: {
                    size: pageSize,
                    sources: [
                        {
                            uuid_tenantId: {
                                terms: {
                                    field: 'uuid_tenantId',
                                },
                            },
                        },
                    ],
                    after: afterKey
                        ? {
                            uuid_tenantId: afterKey,
                        }
                        : undefined,
                },
            },
        }, undefined, undefined, undefined, include);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = results.uuid_tenantId_buckets;
        const newAfterKey = (_a = data.after_key) === null || _a === void 0 ? void 0 : _a.uuid_tenantId;
        const ids = data.buckets.map((b) => b.key.uuid_tenantId);
        return {
            data: ids,
            afterKey: newAfterKey,
        };
    }
    async cleanupMemberIndex(tenantId) {
        this.log.warn({ tenantId }, 'Cleaning up member index!');
        const query = {
            bool: {
                filter: {
                    term: {
                        uuid_tenantId: tenantId,
                    },
                },
            },
        };
        const sort = [{ date_joinedAt: 'asc' }];
        const include = ['date_joinedAt', 'uuid_memberId'];
        const pageSize = 500;
        let lastJoinedAt;
        let results = (await this.openSearchService.search(types_1.OpenSearchIndex.MEMBERS, query, undefined, pageSize, sort, undefined, include));
        let processed = 0;
        while (results.length > 0) {
            // check every member if they exists in the database and if not remove them from the index
            const dbIds = await this.memberRepo.checkMembersExists(tenantId, results.map((r) => r._source.uuid_memberId));
            const toRemove = results
                .filter((r) => !dbIds.includes(r._source.uuid_memberId))
                .map((r) => r._id);
            if (toRemove.length > 0) {
                this.log.warn({ tenantId, toRemove }, 'Removing members from index!');
                for (const id of toRemove) {
                    await this.openSearchService.removeFromIndex(id, types_1.OpenSearchIndex.MEMBERS);
                }
            }
            processed += results.length;
            this.log.warn({ tenantId }, `Processed ${processed} members while cleaning up tenant!`);
            // use last joinedAt to get the next page
            lastJoinedAt = results[results.length - 1]._source.date_joinedAt;
            results = (await this.openSearchService.search(types_1.OpenSearchIndex.MEMBERS, query, undefined, pageSize, sort, lastJoinedAt, include));
        }
        this.log.warn({ tenantId }, `Processed total of ${processed} members while cleaning up tenant!`);
    }
    async removeMember(memberId) {
        this.log.debug({ memberId }, 'Removing member from index!');
        const query = {
            bool: {
                filter: {
                    term: {
                        uuid_memberId: memberId,
                    },
                },
            },
        };
        const sort = [{ date_joinedAt: 'asc' }];
        const include = ['date_joinedAt'];
        const pageSize = 10;
        let lastJoinedAt;
        let results = (await this.openSearchService.search(types_1.OpenSearchIndex.MEMBERS, query, undefined, pageSize, sort, undefined, include));
        while (results.length > 0) {
            const ids = results.map((r) => r._id);
            for (const id of ids) {
                await this.openSearchService.removeFromIndex(id, types_1.OpenSearchIndex.MEMBERS);
            }
            // use last joinedAt to get the next page
            lastJoinedAt = results[results.length - 1]._source.date_joinedAt;
            results = (await this.openSearchService.search(types_1.OpenSearchIndex.MEMBERS, query, undefined, pageSize, sort, lastJoinedAt, include));
        }
    }
    async syncTenantMembers(tenantId, batchSize = 200) {
        this.log.debug({ tenantId }, 'Syncing all tenant members!');
        let docCount = 0;
        let memberCount = 0;
        const now = new Date();
        const cutoffDate = now.toISOString();
        await (0, logging_1.logExecutionTime)(async () => {
            let memberIds = await this.memberRepo.getTenantMembersForSync(tenantId, batchSize);
            while (memberIds.length > 0) {
                const { membersSynced, documentsIndexed } = await this.syncMembers(memberIds);
                docCount += documentsIndexed;
                memberCount += membersSynced;
                const diffInSeconds = (new Date().getTime() - now.getTime()) / 1000;
                this.log.info({ tenantId }, `Synced ${memberCount} members! Speed: ${Math.round(memberCount / diffInSeconds)} members/second!`);
                memberIds = await this.memberRepo.getTenantMembersForSync(tenantId, batchSize, memberIds[memberIds.length - 1]);
            }
            memberIds = await this.memberRepo.getRemainingTenantMembersForSync(tenantId, 1, batchSize, cutoffDate);
            while (memberIds.length > 0) {
                const { membersSynced, documentsIndexed } = await this.syncMembers(memberIds);
                memberCount += membersSynced;
                docCount += documentsIndexed;
                const diffInSeconds = (new Date().getTime() - now.getTime()) / 1000;
                this.log.info({ tenantId }, `Synced ${memberCount} members! Speed: ${Math.round(memberCount / diffInSeconds)} members/second!`);
                memberIds = await this.memberRepo.getRemainingTenantMembersForSync(tenantId, 1, batchSize, cutoffDate);
            }
        }, this.log, 'sync-tenant-members');
        this.log.info({ tenantId }, `Synced total of ${memberCount} members with ${docCount} documents!`);
    }
    async syncOrganizationMembers(organizationId, batchSize = 200) {
        this.log.debug({ organizationId }, 'Syncing all organization members!');
        let docCount = 0;
        let memberCount = 0;
        const now = new Date();
        await (0, logging_1.logExecutionTime)(async () => {
            let memberIds = await this.memberRepo.getOrganizationMembersForSync(organizationId, batchSize);
            while (memberIds.length > 0) {
                const { membersSynced, documentsIndexed } = await this.syncMembers(memberIds);
                docCount += documentsIndexed;
                memberCount += membersSynced;
                const diffInSeconds = (new Date().getTime() - now.getTime()) / 1000;
                this.log.info({ organizationId }, `Synced ${memberCount} members! Speed: ${Math.round(memberCount / diffInSeconds)} members/second!`);
                memberIds = await this.memberRepo.getOrganizationMembersForSync(organizationId, batchSize, memberIds[memberIds.length - 1]);
            }
        }, this.log, 'sync-organization-members');
        this.log.info({ organizationId }, `Synced total of ${memberCount} members with ${docCount} documents!`);
    }
    async syncMembers(memberIds) {
        this.log.debug({ memberIds }, 'Syncing members!');
        const isMultiSegment = false;
        let docCount = 0;
        let memberCount = 0;
        const members = await this.memberRepo.getMemberData(memberIds);
        if (members.length > 0) {
            const attributes = await this.memberRepo.getTenantMemberAttributes(members[0].tenantId);
            let childSegmentIds;
            let segmentInfos;
            if (isMultiSegment) {
                childSegmentIds = (0, common_1.distinct)(members.map((m) => m.segmentId));
                segmentInfos = await this.segmentRepo.getParentSegmentIds(childSegmentIds);
            }
            const grouped = (0, common_1.groupBy)(members, (m) => m.id);
            const memberIds = Array.from(grouped.keys());
            const forSync = [];
            for (const memberId of memberIds) {
                const memberDocs = grouped.get(memberId);
                if (isMultiSegment) {
                    // index each of them individually
                    for (const member of memberDocs) {
                        const prepared = MemberSyncService.prefixData(member, attributes);
                        forSync.push({
                            id: `${memberId}-${member.segmentId}`,
                            body: prepared,
                        });
                        const relevantSegmentInfos = segmentInfos.filter((s) => s.id === member.segmentId);
                        // and for each parent and grandparent
                        const parentIds = (0, common_1.distinct)(relevantSegmentInfos.map((s) => s.parentId));
                        for (const parentId of parentIds) {
                            const aggregated = MemberSyncService.aggregateData(memberDocs, relevantSegmentInfos, parentId);
                            const prepared = MemberSyncService.prefixData(aggregated, attributes);
                            forSync.push({
                                id: `${memberId}-${parentId}`,
                                body: prepared,
                            });
                        }
                        const grandParentIds = (0, common_1.distinct)(relevantSegmentInfos.map((s) => s.grandParentId));
                        for (const grandParentId of grandParentIds) {
                            const aggregated = MemberSyncService.aggregateData(memberDocs, relevantSegmentInfos, undefined, grandParentId);
                            const prepared = MemberSyncService.prefixData(aggregated, attributes);
                            forSync.push({
                                id: `${memberId}-${grandParentId}`,
                                body: prepared,
                            });
                        }
                    }
                }
                else {
                    if (memberDocs.length > 1) {
                        throw new Error('More than one member found - this can not be the case in single segment edition!');
                    }
                    const member = memberDocs[0];
                    const prepared = MemberSyncService.prefixData(member, attributes);
                    forSync.push({
                        id: `${memberId}-${member.segmentId}`,
                        body: prepared,
                    });
                }
            }
            await this.openSearchService.bulkIndex(types_1.OpenSearchIndex.MEMBERS, forSync);
            docCount += forSync.length;
            memberCount += memberIds.length;
        }
        await this.memberRepo.markSynced(memberIds);
        return {
            membersSynced: memberCount,
            documentsIndexed: docCount,
        };
    }
    static aggregateData(segmentMembers, segmentInfos, parentId, grandParentId) {
        if (!parentId && !grandParentId) {
            throw new Error('Either parentId or grandParentId must be provided!');
        }
        const relevantSubchildIds = [];
        for (const si of segmentInfos) {
            if (parentId && si.parentId === parentId) {
                relevantSubchildIds.push(si.id);
            }
            else if (grandParentId && si.grandParentId === grandParentId) {
                relevantSubchildIds.push(si.id);
            }
        }
        const members = segmentMembers.filter((m) => relevantSubchildIds.includes(m.segmentId));
        if (members.length === 0) {
            throw new Error('No members found for given parent or grandParent segment id!');
        }
        // aggregate data
        const member = Object.assign({}, members[0]);
        // use corrent id as segmentId
        if (parentId) {
            member.segmentId = parentId;
        }
        else {
            member.segmentId = grandParentId;
        }
        // reset aggregates
        member.activeOn = [];
        member.activityCount = 0;
        member.activityTypes = [];
        member.activeDaysCount = 0;
        member.lastActive = undefined;
        member.averageSentiment = null;
        member.tags = [];
        member.organizations = [];
        for (const m of members) {
            member.activeOn.push(...m.activeOn);
            member.activityCount += m.activityCount;
            member.activityTypes.push(...m.activityTypes);
            member.activeDaysCount += m.activeDaysCount;
            if (!member.lastActive) {
                member.lastActive = m.lastActive;
            }
            else if (m.lastActive) {
                const d1 = new Date(member.lastActive);
                const d2 = new Date(m.lastActive);
                if (d1 < d2) {
                    member.lastActive = m.lastActive;
                }
            }
            if (!member.averageSentiment) {
                member.averageSentiment = m.averageSentiment;
            }
            else if (m.averageSentiment) {
                member.averageSentiment += m.averageSentiment;
            }
            member.tags.push(...m.tags);
            member.organizations.push(...m.organizations);
        }
        // average sentiment with the total number of members that have sentiment set
        if (member.averageSentiment) {
            member.averageSentiment = Number((member.averageSentiment / members.filter((m) => m.averageSentiment !== null).length).toFixed(2));
        }
        // gather only uniques
        member.activeOn = (0, common_1.distinct)(member.activeOn);
        member.activityTypes = (0, common_1.distinct)(member.activityTypes);
        member.tags = (0, common_1.distinctBy)(member.tags, (t) => t.id);
        member.organizations = (0, common_1.distinctBy)(member.organizations, (o) => o.id);
        return member;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static prefixData(data, attributes) {
        var _a, _b, _c;
        const p = {};
        p.uuid_memberId = data.id;
        p.uuid_tenantId = data.tenantId;
        p.uuid_segmentId = data.segmentId;
        p.string_displayName = data.displayName;
        p.keyword_displayName = data.displayName;
        const p_attributes = {};
        for (const attribute of attributes) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const attData = data.attributes;
            if (attribute.name in attData) {
                if (attribute.type === types_2.MemberAttributeType.SPECIAL) {
                    let data = JSON.stringify(attData[attribute.name]);
                    data = (0, common_1.trimUtf8ToMaxByteLength)(data, MemberSyncService.MAX_BYTE_LENGTH);
                    p_attributes[`string_${attribute.name}`] = data;
                }
                else {
                    const p_data = {};
                    const defValue = attData[attribute.name].default;
                    const prefix = this.attributeTypeToOpenSearchPrefix(defValue, attribute.type);
                    for (const key of Object.keys(attData[attribute.name])) {
                        let value = attData[attribute.name][key];
                        if (attribute.type === types_2.MemberAttributeType.STRING) {
                            value = (0, common_1.trimUtf8ToMaxByteLength)(value, MemberSyncService.MAX_BYTE_LENGTH);
                        }
                        p_data[`${prefix}_${key}`] = value;
                    }
                    p_attributes[`obj_${attribute.name}`] = p_data;
                }
            }
        }
        p.obj_attributes = p_attributes;
        p.string_arr_emails = data.emails || [];
        p.int_score = data.score;
        p.date_lastEnriched = data.lastEnriched ? new Date(data.lastEnriched).toISOString() : null;
        p.date_joinedAt = new Date(data.joinedAt).toISOString();
        p.date_createdAt = new Date(data.createdAt).toISOString();
        p.bool_manuallyCreated = data.manuallyCreated ? data.manuallyCreated : false;
        p.int_totalReach = data.totalReach;
        p.int_numberOfOpenSourceContributions = data.numberOfOpenSourceContributions;
        p.string_arr_activeOn = data.activeOn;
        p.int_activityCount = data.activityCount;
        p.string_arr_activityTypes = data.activityTypes;
        p.int_activeDaysCount = data.activeDaysCount;
        p.date_lastActive = data.lastActive ? new Date(data.lastActive).toISOString() : null;
        p.float_averageSentiment = data.averageSentiment;
        const p_identities = [];
        for (const identity of data.identities) {
            p_identities.push({
                string_platform: identity.platform,
                string_username: identity.username,
            });
        }
        p.nested_identities = p_identities;
        const p_organizations = [];
        for (const organization of data.organizations) {
            p_organizations.push({
                uuid_id: organization.id,
                string_logo: organization.logo,
                string_displayName: organization.displayName,
                obj_memberOrganizations: {
                    string_title: ((_a = organization.memberOrganizations) === null || _a === void 0 ? void 0 : _a.title) || null,
                    date_dateStart: ((_b = organization.memberOrganizations) === null || _b === void 0 ? void 0 : _b.dateStart) || null,
                    date_dateEnd: ((_c = organization.memberOrganizations) === null || _c === void 0 ? void 0 : _c.dateEnd) || null,
                },
            });
        }
        p.nested_organizations = p_organizations;
        const p_tags = [];
        for (const tag of data.tags) {
            p_tags.push({
                uuid_id: tag.id,
                string_name: tag.name,
            });
        }
        p.nested_tags = p_tags;
        p.uuid_arr_toMergeIds = data.toMergeIds;
        p.uuid_arr_noMergeIds = data.noMergeIds;
        return p;
    }
    static attributeTypeToOpenSearchPrefix(defValue, type) {
        switch (type) {
            case types_2.MemberAttributeType.BOOLEAN:
                return 'bool';
            case types_2.MemberAttributeType.NUMBER: {
                if (defValue % 1 === 0) {
                    return 'int';
                }
                else {
                    return 'float';
                }
            }
            case types_2.MemberAttributeType.EMAIL:
                return 'string';
            case types_2.MemberAttributeType.STRING:
                return 'string';
            case types_2.MemberAttributeType.URL:
                return 'string';
            case types_2.MemberAttributeType.DATE:
                return 'date';
            case types_2.MemberAttributeType.MULTI_SELECT:
                return 'string_arr';
            case types_2.MemberAttributeType.SPECIAL:
                return 'string';
            default:
                throw new Error(`Could not map attribute type: ${type} to OpenSearch type!`);
        }
    }
}
exports.MemberSyncService = MemberSyncService;
MemberSyncService.MAX_BYTE_LENGTH = 25000;
//# sourceMappingURL=member.sync.service.js.map