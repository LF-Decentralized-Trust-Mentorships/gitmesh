"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@gitmesh/types");
const lodash_1 = __importStar(require("lodash"));
const moment_1 = __importDefault(require("moment"));
const sequelize_1 = __importStar(require("sequelize"));
const common_1 = require("@gitmesh/common");
const opensearch_1 = require("@gitmesh/opensearch");
const integrations_1 = require("@gitmesh/integrations");
const conf_1 = require("@/conf");
const configTypes_1 = require("../../conf/configTypes");
const isFeatureEnabled_1 = __importDefault(require("../../feature-flags/isFeatureEnabled"));
const sequelizeFilterUtils_1 = __importDefault(require("../utils/sequelizeFilterUtils"));
const auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
const queryParser_1 = __importDefault(require("./filters/queryParser"));
const rawQueryParser_1 = __importDefault(require("./filters/rawQueryParser"));
const memberSegmentAffiliationRepository_1 = __importDefault(require("./memberSegmentAffiliationRepository"));
const segmentRepository_1 = __importDefault(require("./segmentRepository"));
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
const tenantRepository_1 = __importDefault(require("./tenantRepository"));
const memberTypes_1 = require("./types/memberTypes");
const organizationRepository_1 = __importDefault(require("./organizationRepository"));
const memberSyncRemoteRepository_1 = __importDefault(require("./memberSyncRemoteRepository"));
const memberAffiliationRepository_1 = __importDefault(require("./memberAffiliationRepository"));
const { Op } = sequelize_1.default;
const log = false;
class MemberRepository {
    static async create(data, options, doPopulateRelations = true) {
        if (!data.username) {
            throw new Error('Username not set when creating member!');
        }
        const platforms = Object.keys(data.username);
        if (platforms.length === 0) {
            throw new Error('Username object does not have any platforms!');
        }
        data.username = (0, memberTypes_1.mapUsernameToIdentities)(data.username);
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const segment = sequelizeRepository_1.default.getStrictlySingleActiveSegment(options);
        const record = await options.database.member.create(Object.assign(Object.assign({}, lodash_1.default.pick(data, [
            'displayName',
            'attributes',
            'emails',
            'lastEnriched',
            'enrichedBy',
            'contributions',
            'score',
            'reach',
            'joinedAt',
            'manuallyCreated',
            'importHash',
        ])), { tenantId: tenant.id, createdById: currentUser.id, updatedById: currentUser.id, segmentId: segment.id }), {
            transaction,
        });
        const username = data.username;
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const query = `
      insert into "memberIdentities"("memberId", platform, username, "sourceId", "tenantId", "integrationId")
      values(:memberId, :platform, :username, :sourceId, :tenantId, :integrationId);
    `;
        for (const platform of Object.keys(username)) {
            const identities = username[platform];
            for (const identity of identities) {
                await seq.query(query, {
                    replacements: {
                        memberId: record.id,
                        platform,
                        username: identity.username,
                        sourceId: identity.sourceId || null,
                        integrationId: identity.integrationId || null,
                        tenantId: tenant.id,
                    },
                    type: sequelize_1.QueryTypes.INSERT,
                    transaction,
                });
            }
        }
        await MemberRepository.includeMemberToSegments(record.id, options);
        await record.setActivities(data.activities || [], {
            transaction,
        });
        await record.setTags(data.tags || [], {
            transaction,
        });
        await MemberRepository.updateMemberOrganizations(record, data.organizations, true, options);
        await record.setTasks(data.tasks || [], {
            transaction,
        });
        await record.setNotes(data.notes || [], {
            transaction,
        });
        await record.setNoMerge(data.noMerge || [], {
            transaction,
        });
        await record.setToMerge(data.toMerge || [], {
            transaction,
        });
        if (data.affiliations) {
            await this.setAffiliations(record.id, data.affiliations, options);
        }
        await this._createAuditLog(auditLogRepository_1.default.CREATE, record, data, options);
        return this.findById(record.id, options, true, doPopulateRelations);
    }
    static async includeMemberToSegments(memberId, options) {
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        let bulkInsertMemberSegments = `INSERT INTO "memberSegments" ("memberId","segmentId", "tenantId", "createdAt") VALUES `;
        const replacements = {
            memberId,
            tenantId: options.currentTenant.id,
        };
        for (let idx = 0; idx < options.currentSegments.length; idx++) {
            bulkInsertMemberSegments += ` (:memberId, :segmentId${idx}, :tenantId, now()) `;
            replacements[`segmentId${idx}`] = options.currentSegments[idx].id;
            if (idx !== options.currentSegments.length - 1) {
                bulkInsertMemberSegments += `,`;
            }
        }
        bulkInsertMemberSegments += ` ON CONFLICT DO NOTHING`;
        await seq.query(bulkInsertMemberSegments, {
            replacements,
            type: sequelize_1.QueryTypes.INSERT,
            transaction,
        });
    }
    static async excludeMembersFromSegments(memberIds, options) {
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const bulkDeleteMemberSegments = `DELETE FROM "memberSegments" WHERE "memberId" in (:memberIds) and "segmentId" in (:segmentIds);`;
        await seq.query(bulkDeleteMemberSegments, {
            replacements: {
                memberIds,
                segmentIds: sequelizeRepository_1.default.getSegmentIds(options),
            },
            type: sequelize_1.QueryTypes.DELETE,
            transaction,
        });
    }
    static async findSampleDataMemberIds(options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const sampleMemberIds = await options.database.sequelize.query(`select m.id from members m
      where (m.attributes->'sample'->'default')::boolean is true
      and m."tenantId" = :tenantId;
    `, {
            replacements: {
                tenantId: currentTenant.id,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return sampleMemberIds.map((i) => i.id);
    }
    static async findMembersWithMergeSuggestions({ limit = 20, offset = 0 }, options) {
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const segmentIds = sequelizeRepository_1.default.getSegmentIds(options);
        const mems = await options.database.sequelize.query(`SELECT 
        "membersToMerge".id, 
        "membersToMerge"."toMergeId",
        "membersToMerge"."total_count",
        "membersToMerge"."similarity"
      FROM 
      (
        SELECT DISTINCT ON (Greatest(Hashtext(Concat(mem.id, mtm."toMergeId")), Hashtext(Concat(mtm."toMergeId", mem.id)))) 
            mem.id, 
            mtm."toMergeId", 
            mem."joinedAt", 
            COUNT(*) OVER() AS total_count,
            mtm."similarity"
          FROM members mem
          INNER JOIN "memberToMerge" mtm ON mem.id = mtm."memberId"
          JOIN "memberSegments" ms ON ms."memberId" = mem.id
          WHERE mem."tenantId" = :tenantId
            AND ms."segmentId" IN (:segmentIds)
        ) AS "membersToMerge" 
      ORDER BY 
        "membersToMerge"."similarity" DESC 
      LIMIT :limit OFFSET :offset
    `, {
            replacements: {
                tenantId: currentTenant.id,
                segmentIds,
                limit,
                offset,
            },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (mems.length > 0) {
            const memberPromises = [];
            const toMergePromises = [];
            for (const mem of mems) {
                memberPromises.push(MemberRepository.findById(mem.id, options));
                toMergePromises.push(MemberRepository.findById(mem.toMergeId, options));
            }
            const memberResults = await Promise.all(memberPromises);
            const memberToMergeResults = await Promise.all(toMergePromises);
            const result = memberResults.map((i, idx) => ({
                members: [i, memberToMergeResults[idx]],
                similarity: mems[idx].similarity,
            }));
            return { rows: result, count: mems[0].total_count / 2, limit, offset };
        }
        return { rows: [{ members: [], similarity: 0 }], count: 0, limit, offset };
    }
    static async moveIdentitiesBetweenMembers(fromMemberId, toMemberId, identitiesToMove, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const query = `
      update "memberIdentities" 
      set 
        "memberId" = :newMemberId
      where 
        "tenantId" = :tenantId and 
        "memberId" = :oldMemberId and 
        platform = :platform and 
        username = :username;
    `;
        for (const identity of identitiesToMove) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, count] = await seq.query(query, {
                replacements: {
                    tenantId: tenant.id,
                    oldMemberId: fromMemberId,
                    newMemberId: toMemberId,
                    platform: identity.platform,
                    username: identity.username,
                },
                type: sequelize_1.QueryTypes.UPDATE,
                transaction,
            });
            if (count !== 1) {
                throw new Error('One row should be updated!');
            }
        }
    }
    static async moveActivitiesBetweenMembers(fromMemberId, toMemberId, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const query = `
      update activities set "memberId" = :toMemberId where "memberId" = :fromMemberId and "tenantId" = :tenantId;
    `;
        await seq.query(query, {
            replacements: {
                fromMemberId,
                toMemberId,
                tenantId: tenant.id,
            },
            type: sequelize_1.QueryTypes.UPDATE,
            transaction,
        });
    }
    static async addToMerge(suggestions, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        // Remove possible duplicates
        suggestions = lodash_1.default.uniqWith(suggestions, (a, b) => lodash_1.default.isEqual(lodash_1.default.sortBy(a.members), lodash_1.default.sortBy(b.members)));
        // Process suggestions in chunks of 100 or less
        const suggestionChunks = (0, lodash_1.chunk)(suggestions, 100);
        const insertValues = (memberId, toMergeId, similarity, index) => {
            const idPlaceholder = (key) => `${key}${index}`;
            return {
                query: `(:${idPlaceholder('memberId')}, :${idPlaceholder('toMergeId')}, :${idPlaceholder('similarity')}, NOW(), NOW())`,
                replacements: {
                    [idPlaceholder('memberId')]: memberId,
                    [idPlaceholder('toMergeId')]: toMergeId,
                    [idPlaceholder('similarity')]: similarity === null ? null : similarity,
                },
            };
        };
        for (const suggestionChunk of suggestionChunks) {
            const placeholders = [];
            let replacements = {};
            suggestionChunk.forEach((suggestion, index) => {
                const { query, replacements: chunkReplacements } = insertValues(suggestion.members[0], suggestion.members[1], suggestion.similarity, index);
                placeholders.push(query);
                replacements = Object.assign(Object.assign({}, replacements), chunkReplacements);
            });
            const query = `
        INSERT INTO "memberToMerge" ("memberId", "toMergeId", "similarity", "createdAt", "updatedAt")
        VALUES ${placeholders.join(', ')};
      `;
            try {
                await seq.query(query, {
                    replacements,
                    type: sequelize_1.QueryTypes.INSERT,
                    transaction,
                });
            }
            catch (error) {
                options.log.error('error adding members to merge', error);
                throw error;
            }
        }
    }
    static async removeToMerge(id, toMergeId, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const returnPlain = false;
        const member = await this.findById(id, options, returnPlain);
        const toMergeMember = await this.findById(toMergeId, options, returnPlain);
        await member.removeToMerge(toMergeMember, { transaction });
        return this.findById(id, options);
    }
    static async addNoMerge(id, toMergeId, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const returnPlain = false;
        const member = await this.findById(id, options, returnPlain);
        const toMergeMember = await this.findById(toMergeId, options, returnPlain);
        await member.addNoMerge(toMergeMember, { transaction });
        return this.findById(id, options);
    }
    static async removeNoMerge(id, toMergeId, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const returnPlain = false;
        const member = await this.findById(id, options, returnPlain);
        const toMergeMember = await this.findById(toMergeId, options, returnPlain);
        await member.removeNoMerge(toMergeMember, { transaction });
        return this.findById(id, options);
    }
    static async memberExists(username, platform, options, doPopulateRelations = true) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const usernames = [];
        if (typeof username === 'string') {
            usernames.push(username);
        }
        else if (Array.isArray(username)) {
            usernames.push(...username);
        }
        else {
            throw new Error('Unknown username format! Allowed formats are string or string[]. For example: "username" or ["username1", "username2"]');
        }
        // first find the id - we don't need the other bloat
        const results = await seq.query(`
    select mi."memberId"
    from "memberIdentities" mi
    where mi."tenantId" = :tenantId and
          mi.platform = :platform and
          mi.username in (:usernames) and
          exists (select 1 from "memberSegments" ms where ms."memberId" = mi."memberId")
  `, {
            type: sequelize_1.default.QueryTypes.SELECT,
            replacements: {
                tenantId: currentTenant.id,
                platform,
                usernames,
            },
            transaction,
        });
        const ids = results.map((r) => r.memberId);
        if (ids.length === 0) {
            return null;
        }
        if (doPopulateRelations) {
            return this.findById(ids[0], options);
        }
        // the if needed actualy query the db for the rest by primary/foreign key which is much faster
        const records = await seq.query(`
      with segment_ids as (
        select "memberId", array_agg("segmentId") as "segmentIds" from
        "memberSegments"
        where "memberId" = :memberId
        group by "memberId"
      ),
      identities as (select mi."memberId",
                            array_agg(distinct mi.platform)             as identities,
                            jsonb_object_agg(mi.platform, mi.usernames) as username
                      from (select "memberId",
                                  platform,
                                  array_agg(username) as usernames
                            from (select "memberId",
                                        platform,
                                        username,
                                        "createdAt",
                                        row_number() over (partition by "memberId", platform order by "createdAt" desc) =
                                        1 as is_latest
                                  from "memberIdentities" where "memberId" = :memberId) sub
                            group by "memberId", platform) mi
                      group by mi."memberId"),
        member_organizations as (
          select
            "memberId",
            JSONB_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                  'id', "organizationId",
                  'memberOrganizations',
                  JSONB_BUILD_OBJECT(
                    'memberId', "memberId",
                    'organizationId', "organizationId",
                    'dateStart', "dateStart",
                    'dateEnd', "dateEnd",
                    'createdAt', "createdAt",
                    'updatedAt', "updatedAt",
                    'title', title,
                    'source', source
                  )
                )
            ) AS orgs
          from "memberOrganizations"
          where "memberId" = :memberId
            and "deletedAt" is null
          group by "memberId"
        )
        select m."id",
              m."displayName",
              m."attributes",
              m."emails",
              m."score",
              m."lastEnriched",
              m."enrichedBy",
              m."contributions",
              m."reach",
              m."joinedAt",
              m."importHash",
              m."createdAt",
              m."updatedAt",
              m."deletedAt",
              m."tenantId",
              m."createdById",
              m."updatedById",
              i.username,
              si."segmentIds" as segments,
              coalesce(mo.orgs, '[]'::JSONB) as "organizations"
        from members m
                inner join identities i on i."memberId" = m.id
                inner join segment_ids si on si."memberId" = m.id
                left join member_organizations mo on mo."memberId" = m.id
        where m.id = :memberId;`, {
            type: sequelize_1.default.QueryTypes.SELECT,
            replacements: {
                memberId: ids[0],
            },
            transaction,
        });
        if (records.length !== 1) {
            throw new Error('Invalid number of records found!');
        }
        return records[0];
    }
    static async update(id, data, options, doPopulateRelations = true) {
        var _a;
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        let record = await options.database.member.findOne({
            where: {
                id,
                tenantId: currentTenant.id,
            },
            transaction,
        });
        if (!record) {
            throw new common_1.Error404();
        }
        // exclude syncRemote attributes, since these are populated from memberSyncRemote table
        if ((_a = data.attributes) === null || _a === void 0 ? void 0 : _a.syncRemote) {
            delete data.attributes.syncRemote;
        }
        record = await record.update(Object.assign(Object.assign({}, lodash_1.default.pick(data, [
            'displayName',
            'attributes',
            'emails',
            'lastEnriched',
            'enrichedBy',
            'contributions',
            'score',
            'reach',
            'joinedAt',
            'importHash',
        ])), { updatedById: currentUser.id }), {
            transaction,
        });
        if (data.activities) {
            await record.setActivities(data.activities || [], {
                transaction,
            });
        }
        if (data.tags) {
            await record.setTags(data.tags || [], {
                transaction,
            });
        }
        if (data.tasks) {
            await record.setTasks(data.tasks || [], {
                transaction,
            });
        }
        if (data.notes) {
            await record.setNotes(data.notes || [], {
                transaction,
            });
        }
        await MemberRepository.updateMemberOrganizations(record, data.organizations, data.organizationsReplace, options);
        if (data.noMerge) {
            await record.setNoMerge(data.noMerge || [], {
                transaction,
            });
        }
        if (data.toMerge) {
            await record.setToMerge(data.toMerge || [], {
                transaction,
            });
        }
        if (data.affiliations) {
            await MemberRepository.setAffiliations(id, data.affiliations, options);
        }
        if (options.currentSegments && options.currentSegments.length > 0) {
            await MemberRepository.includeMemberToSegments(record.id, options);
        }
        const seq = sequelizeRepository_1.default.getSequelize(options);
        if (data.username) {
            data.username = (0, memberTypes_1.mapUsernameToIdentities)(data.username);
            const platforms = Object.keys(data.username);
            if (platforms.length > 0) {
                const query = `
          insert into "memberIdentities"("memberId", platform, username, "sourceId", "tenantId", "integrationId")
          values (:memberId, :platform, :username, :sourceId, :tenantId, :integrationId);
          `;
                const deleteQuery = `
          delete from "memberIdentities"
          where ("memberId", "tenantId", "platform", "username") in
                (select mi."memberId", mi."tenantId", mi."platform", mi."username"
                from "memberIdentities" mi
                          join (select :memberId::uuid            as memberid,
                                      :tenantId::uuid            as tenantid,
                                      unnest(:platforms::text[]) as platform,
                                      unnest(:usernames::text[]) as username) as combinations
                              on mi."memberId" = combinations.memberid
                                  and mi."tenantId" = combinations.tenantid
                                  and mi."platform" = combinations.platform
                                  and mi."username" = combinations.username);`;
                const platformsToDelete = [];
                const usernamesToDelete = [];
                for (const platform of platforms) {
                    const identities = data.username[platform];
                    for (const identity of identities) {
                        if (identity.delete) {
                            platformsToDelete.push(identity.platform);
                            usernamesToDelete.push(identity.username);
                        }
                        else {
                            await seq.query(query, {
                                replacements: {
                                    memberId: record.id,
                                    platform,
                                    username: identity.username,
                                    sourceId: identity.sourceId || null,
                                    integrationId: identity.integrationId || null,
                                    tenantId: currentTenant.id,
                                },
                                type: sequelize_1.QueryTypes.INSERT,
                                transaction,
                            });
                        }
                    }
                }
                if (platformsToDelete.length > 0) {
                    await seq.query(deleteQuery, {
                        replacements: {
                            tenantId: currentTenant.id,
                            memberId: record.id,
                            platforms: `{${platformsToDelete.join(',')}}`,
                            usernames: `{${usernamesToDelete.join(',')}}`,
                        },
                        type: sequelize_1.QueryTypes.DELETE,
                        transaction,
                    });
                }
            }
        }
        await this._createAuditLog(auditLogRepository_1.default.UPDATE, record, data, options);
        return this.findById(record.id, options, true, doPopulateRelations);
    }
    static async destroy(id, options, force = false) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        await MemberRepository.excludeMembersFromSegments([id], Object.assign(Object.assign({}, options), { transaction }));
        const member = await this.findById(id, options, true, false);
        // if member doesn't belong to any other segment anymore, remove it
        if (member.segments.length === 0) {
            const record = await options.database.member.findOne({
                where: {
                    id,
                    tenantId: currentTenant.id,
                },
                transaction,
            });
            if (!record) {
                throw new common_1.Error404();
            }
            await record.destroy({
                force,
                transaction,
            });
            await this._createAuditLog(auditLogRepository_1.default.DELETE, record, record, options);
        }
    }
    static async destroyBulk(ids, options, force = false) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        await MemberRepository.excludeMembersFromSegments(ids, Object.assign(Object.assign({}, options), { transaction }));
        await options.database.member.destroy({
            where: {
                id: ids,
                tenantId: currentTenant.id,
            },
            force,
            transaction,
        });
    }
    static async getMemberSegments(memberId, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const segmentRepository = new segmentRepository_1.default(options);
        const query = `
        SELECT "segmentId"
        FROM "memberSegments"
        WHERE "memberId" = :memberId
        ORDER BY "createdAt";
    `;
        const data = await seq.query(query, {
            replacements: {
                memberId,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        const segmentIds = data.map((item) => item.segmentId);
        const segments = await segmentRepository.findInIds(segmentIds);
        return segments;
    }
    static async getActivityAggregates(memberId, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const query = `
        SELECT
        a."memberId",
        a."segmentId",
        count(a.id)::integer AS "activityCount",
        max(a.timestamp) AS "lastActive",
        array_agg(DISTINCT concat(a.platform, ':', a.type)) FILTER (WHERE a.platform IS NOT NULL) AS "activityTypes",
        array_agg(DISTINCT a.platform) FILTER (WHERE a.platform IS NOT NULL) AS "activeOn",
        count(DISTINCT a."timestamp"::date)::integer AS "activeDaysCount",
        round(avg(
            CASE WHEN (a.sentiment ->> 'sentiment'::text) IS NOT NULL THEN
                (a.sentiment ->> 'sentiment'::text)::double precision
            ELSE
                NULL::double precision
            END
        )::numeric, 2):: float AS "averageSentiment"
        FROM activities a
        WHERE a."memberId" = :memberId
        and a."tenantId" = :tenantId
        GROUP BY a."memberId", a."segmentId"
    `;
        const data = await seq.query(query, {
            replacements: {
                memberId,
                tenantId: currentTenant.id,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return (data === null || data === void 0 ? void 0 : data[0]) || null;
    }
    static async setAffiliations(memberId, data, options) {
        const affiliationRepository = new memberSegmentAffiliationRepository_1.default(options);
        await affiliationRepository.setForMember(memberId, data);
        await memberAffiliationRepository_1.default.update(memberId, options);
    }
    static async getAffiliations(memberId, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const query = `
      select 
        msa.id,
        s.id as "segmentId", 
        s.slug as "segmentSlug",
        s.name as "segmentName",
        s."parentName" as "segmentParentName", 
        o.id as "organizationId", 
        o."displayName" as "organizationName",
        o.logo as "organizationLogo",
        msa."dateStart" as "dateStart",
        msa."dateEnd" as "dateEnd"
      from "memberSegmentAffiliations" msa 
      left join organizations o on o.id = msa."organizationId"
      join segments s on s.id = msa."segmentId"
      where msa."memberId" = :memberId
    `;
        const data = await seq.query(query, {
            replacements: {
                memberId,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return data;
    }
    static async getIdentities(memberIds, options) {
        const results = new Map();
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const query = `
      select "memberId", platform, username, "sourceId", "integrationId", "createdAt" from "memberIdentities" where "memberId" in (:memberIds)
      order by "createdAt" asc;
    `;
        const data = await seq.query(query, {
            replacements: {
                memberIds,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        for (const id of memberIds) {
            results.set(id, []);
        }
        for (const res of data) {
            const { memberId, platform, username, sourceId, integrationId, createdAt } = res;
            const identities = results.get(memberId);
            identities.push({
                platform,
                username,
                sourceId,
                integrationId,
                createdAt,
            });
        }
        return results;
    }
    static async findById(id, options, returnPlain = true, doPopulateRelations = true, ignoreTenant = false) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const include = [
            {
                model: options.database.organization,
                attributes: ['id', 'displayName'],
                as: 'organizations',
                order: [['createdAt', 'ASC']],
                through: {
                    attributes: ['memberId', 'organizationId', 'dateStart', 'dateEnd', 'title', 'source'],
                    where: {
                        deletedAt: null,
                    },
                },
            },
            {
                model: options.database.segment,
                as: 'segments',
                through: {
                    attributes: [],
                },
            },
        ];
        const where = {
            id,
        };
        if (!ignoreTenant) {
            const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
            where.tenantId = currentTenant.id;
        }
        const record = await options.database.member.findOne({
            where,
            include,
            transaction,
        });
        if (!record) {
            throw new common_1.Error404();
        }
        if (doPopulateRelations) {
            return this._populateRelations(record, options, returnPlain);
        }
        const data = record.get({ plain: returnPlain });
        MemberRepository.sortOrganizations(data.organizations);
        const identities = (await this.getIdentities([data.id], options)).get(data.id);
        data.username = {};
        for (const identity of identities) {
            if (data.username[identity.platform]) {
                data.username[identity.platform].push(identity.username);
            }
            else {
                data.username[identity.platform] = [identity.username];
            }
        }
        data.affiliations = await MemberRepository.getAffiliations(id, options);
        return data;
    }
    static async filterIdInTenant(id, options) {
        return lodash_1.default.get(await this.filterIdsInTenant([id], options), '[0]', null);
    }
    static async filterIdsInTenant(ids, options) {
        if (!ids || !ids.length) {
            return [];
        }
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const where = {
            id: {
                [Op.in]: ids,
            },
            tenantId: currentTenant.id,
        };
        const records = await options.database.member.findAll({
            attributes: ['id'],
            where,
            transaction,
        });
        return records.map((record) => record.id);
    }
    static async count(filter, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        return options.database.member.count({
            where: Object.assign(Object.assign({}, filter), { tenantId: tenant.id }),
            transaction,
        });
    }
    static async findAndCountActiveOpensearch(filter, limit, offset, orderBy, options, attributesSettings = [], segments = []) {
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const segmentsEnabled = await (0, isFeatureEnabled_1.default)(types_1.FeatureFlag.SEGMENTS, options);
        let originalSegment;
        if (segmentsEnabled) {
            if (segments.length !== 1) {
                throw new common_1.Error400(`This operation can have exactly one segment. Found ${segments.length} segments.`);
            }
            originalSegment = segments[0];
            const segmentRepository = new segmentRepository_1.default(options);
            const segment = await segmentRepository.findById(originalSegment);
            if (segment === null) {
                return {
                    rows: [],
                    count: 0,
                    limit,
                    offset,
                };
            }
            if (segmentRepository_1.default.isProjectGroup(segment)) {
                segments = segment.projects.reduce((acc, p) => {
                    acc.push(...p.subprojects.map((sp) => sp.id));
                    return acc;
                }, []);
            }
            else if (segmentRepository_1.default.isProject(segment)) {
                segments = segment.subprojects.map((sp) => sp.id);
            }
            else {
                segments = [originalSegment];
            }
        }
        else {
            originalSegment = (await new segmentRepository_1.default(options).getDefaultSegment()).id;
        }
        const activityPageSize = 10000;
        let activityOffset = 0;
        const activityQuery = {
            query: {
                bool: {
                    must: [
                        {
                            range: {
                                date_timestamp: {
                                    gte: filter.activityTimestampFrom,
                                    lte: filter.activityTimestampTo,
                                },
                            },
                        },
                        {
                            term: {
                                uuid_tenantId: tenant.id,
                            },
                        },
                    ],
                },
            },
            aggs: {
                group_by_member: {
                    terms: {
                        field: 'uuid_memberId',
                        size: 10000000,
                    },
                    aggs: {
                        activity_count: {
                            value_count: {
                                field: 'uuid_id',
                            },
                        },
                        active_days_count: {
                            cardinality: {
                                field: 'date_timestamp',
                                script: {
                                    source: "doc['date_timestamp'].value.toInstant().toEpochMilli()/86400000",
                                },
                            },
                        },
                        active_members_bucket_sort: {
                            bucket_sort: {
                                sort: [{ activity_count: { order: 'desc' } }],
                                size: activityPageSize,
                                from: activityOffset,
                            },
                        },
                    },
                },
            },
            size: 0,
        };
        if (filter.platforms) {
            const subQueries = filter.platforms.map((p) => ({ match_phrase: { keyword_platform: p } }));
            activityQuery.query.bool.must.push({
                bool: {
                    should: subQueries,
                },
            });
        }
        if (filter.activityIsContribution === true) {
            activityQuery.query.bool.must.push({
                term: {
                    bool_isContribution: true,
                },
            });
        }
        if (segmentsEnabled) {
            const subQueries = segments.map((s) => ({ term: { uuid_segmentId: s } }));
            activityQuery.query.bool.must.push({
                bool: {
                    should: subQueries,
                },
            });
        }
        const direction = orderBy.split('_')[1].toLowerCase() === 'desc' ? 'desc' : 'asc';
        if (orderBy.startsWith('activityCount')) {
            activityQuery.aggs.group_by_member.aggs.active_members_bucket_sort.bucket_sort.sort = [
                { activity_count: { order: direction } },
            ];
        }
        else if (orderBy.startsWith('activeDaysCount')) {
            activityQuery.aggs.group_by_member.aggs.active_members_bucket_sort.bucket_sort.sort = [
                { active_days_count: { order: direction } },
            ];
        }
        else {
            throw new Error(`Invalid order by: ${orderBy}`);
        }
        const memberIds = [];
        let memberMap = {};
        let activities;
        do {
            activities = await options.opensearch.search({
                index: types_1.OpenSearchIndex.ACTIVITIES,
                body: activityQuery,
            });
            memberIds.push(...activities.body.aggregations.group_by_member.buckets.map((b) => b.key));
            memberMap = Object.assign(Object.assign({}, memberMap), activities.body.aggregations.group_by_member.buckets.reduce((acc, b) => {
                acc[b.key] = {
                    activityCount: b.activity_count,
                    activeDaysCount: b.active_days_count,
                };
                return acc;
            }, {}));
            activityOffset += activityPageSize;
            // update page
            activityQuery.aggs.group_by_member.aggs.active_members_bucket_sort.bucket_sort.from =
                activityOffset;
        } while (activities.body.aggregations.group_by_member.buckets.length === activityPageSize);
        if (memberIds.length === 0) {
            return {
                rows: [],
                count: 0,
                limit,
                offset,
            };
        }
        const memberQueryPayload = {
            and: [
                {
                    id: {
                        in: memberIds,
                    },
                },
            ],
        };
        if (filter.isBot === true) {
            memberQueryPayload.and.push({
                isBot: {
                    eq: true,
                },
            });
        }
        else if (filter.isBot === false) {
            memberQueryPayload.and.push({
                isBot: {
                    not: true,
                },
            });
        }
        if (filter.isTeamMember === true) {
            memberQueryPayload.and.push({
                isTeamMember: {
                    eq: true,
                },
            });
        }
        else if (filter.isTeamMember === false) {
            memberQueryPayload.and.push({
                isTeamMember: {
                    not: true,
                },
            });
        }
        if (filter.isOrganization === true) {
            memberQueryPayload.and.push({
                isOrganization: {
                    eq: true,
                },
            });
        }
        else if (filter.isOrganization === false) {
            memberQueryPayload.and.push({
                isOrganization: {
                    not: true,
                },
            });
        }
        // to retain the sort came from activity query
        const customSortFunction = {
            _script: {
                type: 'number',
                script: {
                    lang: 'painless',
                    source: `
              def memberId = doc['uuid_memberId'].value;
              return params.memberIds.indexOf(memberId);
            `,
                    params: {
                        memberIds: memberIds.map((i) => `${i}`),
                    },
                },
                order: 'asc',
            },
        };
        const members = await this.findAndCountAllOpensearch({
            filter: memberQueryPayload,
            attributesSettings,
            segments: [originalSegment],
            countOnly: false,
            limit,
            offset,
            customSortFunction,
        }, options);
        return {
            rows: members.rows.map((m) => {
                m.activityCount = memberMap[m.id].activityCount.value;
                m.activeDaysCount = memberMap[m.id].activeDaysCount.value;
                return m;
            }),
            count: members.count,
            offset,
            limit,
        };
    }
    static async findAndCountActive(filter, limit, offset, orderBy, options) {
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const segmentIds = sequelizeRepository_1.default.getSegmentIds(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const conditions = ['m."tenantId" = :tenantId', 'ms."segmentId" in (:segmentIds)'];
        const parameters = {
            tenantId: tenant.id,
            segmentIds,
            periodStart: filter.activityTimestampFrom,
            periodEnd: filter.activityTimestampTo,
        };
        if (filter.isTeamMember === true) {
            conditions.push("COALESCE((m.attributes->'isTeamMember'->'default')::boolean, false) = true");
        }
        else if (filter.isTeamMember === false) {
            conditions.push("COALESCE((m.attributes->'isTeamMember'->'default')::boolean, false) = false");
        }
        if (filter.isBot === true) {
            conditions.push("COALESCE((m.attributes->'isBot'->'default')::boolean, false) = true");
        }
        else if (filter.isBot === false) {
            conditions.push("COALESCE((m.attributes->'isBot'->'default')::boolean, false) = false");
        }
        if (filter.isOrganization === true) {
            conditions.push("COALESCE((m.attributes->'isOrganization'->'default')::boolean, false) = true");
        }
        else if (filter.isOrganization === false) {
            conditions.push("COALESCE((m.attributes->'isOrganization'->'default')::boolean, false) = false");
        }
        const activityConditions = ['1=1'];
        if (filter.platforms && filter.platforms.length > 0) {
            activityConditions.push('platform in (:platforms)');
            parameters.platforms = filter.platforms;
        }
        if (filter.activityIsContribution) {
            activityConditions.push('"isContribution" = (:isContribution)');
            parameters.isContribution = filter.activityIsContribution;
        }
        const conditionsString = conditions.join(' and ');
        const activityConditionsString = activityConditions.join(' and ');
        const direction = orderBy.split('_')[1].toLowerCase() === 'desc' ? 'desc' : 'asc';
        let orderString;
        if (orderBy.startsWith('activityCount')) {
            orderString = `ad."activityCount" ${direction}`;
        }
        else if (orderBy.startsWith('activeDaysCount')) {
            orderString = `ad."activeDaysCount" ${direction}`;
        }
        else {
            throw new Error(`Invalid order by: ${orderBy}`);
        }
        const limitCondition = `limit ${limit} offset ${offset}`;
        const query = `
        WITH
            orgs AS (
                SELECT mo."memberId", JSON_AGG(ROW_TO_JSON(o.*)) AS organizations
                FROM "memberOrganizations" mo
                INNER JOIN organizations o ON mo."organizationId" = o.id
                WHERE mo."deletedAt" IS NULL
                GROUP BY mo."memberId"
            ),
            activity_data AS (
                SELECT
                    "memberId",
                    COUNT(id) AS "activityCount",
                    COUNT(DISTINCT timestamp::DATE) AS "activeDaysCount"
                FROM activities
                WHERE ${activityConditionsString}
                  AND timestamp >= :periodStart
                  AND timestamp < :periodEnd
                GROUP BY "memberId"
            ),
            identities AS (
                SELECT
                    mi."memberId",
                    ARRAY_AGG(DISTINCT mi.platform) AS identities,
                    JSONB_OBJECT_AGG(mi.platform, mi.usernames) AS username
                FROM (
                    SELECT
                        "memberId",
                        platform,
                        ARRAY_AGG(username) AS usernames
                    FROM (
                        SELECT
                            "memberId",
                            platform,
                            username,
                            "createdAt",
                            ROW_NUMBER() OVER (PARTITION BY "memberId", platform ORDER BY "createdAt" DESC) =
                            1 AS is_latest
                        FROM "memberIdentities"
                        WHERE "tenantId" = :tenantId
                    ) sub
                    WHERE is_latest
                    GROUP BY "memberId", platform
                ) mi
                GROUP BY mi."memberId"
            )
        SELECT
            m.id,
            m."displayName",
            i.username,
            i.identities,
            m.attributes,
            ad."activityCount",
            ad."activeDaysCount",
            m."joinedAt",
            COALESCE(o.organizations, JSON_BUILD_ARRAY()) AS organizations,
            COUNT(*) OVER () AS "totalCount"
        FROM members m
        INNER JOIN activity_data ad ON ad."memberId" = m.id
        INNER JOIN identities i ON i."memberId" = m.id
        LEFT JOIN orgs o ON o."memberId" = m.id
        JOIN "memberSegments" ms ON ms."memberId" = m.id
        WHERE ${conditionsString}
        ORDER BY ${orderString}
                     ${limitCondition};
    `;
        options.log.debug({ query, filter, orderBy, limit, offset, test: orderBy.split('_')[1].toLowerCase() }, 'Active members query!');
        const results = await seq.query(query, {
            replacements: parameters,
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        if (results.length === 0) {
            return {
                rows: [],
                count: 0,
                offset,
                limit,
            };
        }
        const count = parseInt(results[0].totalCount, 10);
        const rows = results.map((r) => {
            const row = r;
            return {
                id: row.id,
                displayName: row.displayName,
                username: row.username,
                attributes: row.attributes,
                organizations: row.organizations,
                activityCount: parseInt(row.activityCount, 10),
                activeDaysCount: parseInt(row.activeDaysCount, 10),
                joinedAt: row.joinedAt,
            };
        });
        return {
            rows,
            count,
            offset,
            limit,
        };
    }
    static async countMembersPerSegment(options, segmentIds) {
        const countResults = await MemberRepository.countMembers(options, segmentIds);
        return countResults.reduce((acc, curr) => {
            acc[curr.segmentId] = parseInt(curr.totalCount, 10);
            return acc;
        }, {});
    }
    static async countMembers(options, segmentIds, filterString = '1=1', params = {}) {
        const countQuery = `
        WITH
            member_tags AS (
                SELECT
                    mt."memberId",
                    JSONB_AGG(t.id) AS all_ids
                FROM "memberTags" mt
                INNER JOIN members m ON mt."memberId" = m.id
                JOIN "memberSegments" ms ON ms."memberId" = m.id
                INNER JOIN tags t ON mt."tagId" = t.id
                WHERE m."tenantId" = :tenantId
                  AND m."deletedAt" IS NULL
                  AND ms."segmentId" IN (:segmentIds)
                  AND t."tenantId" = :tenantId
                  AND t."deletedAt" IS NULL
                GROUP BY mt."memberId"
            ),
            member_organizations AS (
                SELECT
                    mo."memberId",
                    JSONB_AGG(o.id) AS all_ids
                FROM "memberOrganizations" mo
                INNER JOIN members m ON mo."memberId" = m.id
                INNER JOIN organizations o ON mo."organizationId" = o.id
                JOIN "memberSegments" ms ON ms."memberId" = m.id
                JOIN "organizationSegments" os ON o.id = os."organizationId"
                WHERE m."tenantId" = :tenantId
                  AND m."deletedAt" IS NULL
                  AND ms."segmentId" IN (:segmentIds)
                  AND o."tenantId" = :tenantId
                  AND o."deletedAt" IS NULL
                  AND os."segmentId" IN (:segmentIds)
                  AND mo."deletedAt" IS NULL
                GROUP BY mo."memberId"
            )
        SELECT
            COUNT(m.id) AS "totalCount",
            ms."segmentId"
        FROM members m
        JOIN "memberSegments" ms ON ms."memberId" = m.id
        LEFT JOIN "memberActivityAggregatesMVs" aggs ON aggs.id = m.id AND aggs."segmentId" = ms."segmentId"
        LEFT JOIN member_tags mt ON m.id = mt."memberId"
        LEFT JOIN member_organizations mo ON m.id = mo."memberId"
        WHERE m."deletedAt" IS NULL
          AND m."tenantId" = :tenantId
          AND ms."segmentId" IN (:segmentIds)
          AND ${filterString}
        GROUP BY ms."segmentId";
    `;
        const seq = sequelizeRepository_1.default.getSequelize(options);
        return seq.query(countQuery, {
            replacements: Object.assign({ tenantId: options.currentTenant.id, segmentIds }, params),
            type: sequelize_1.QueryTypes.SELECT,
        });
    }
    static async findAndCountAllv2({ filter = {}, limit = 20, offset = 0, orderBy = 'joinedAt_DESC', countOnly = false, attributesSettings = [], }, options) {
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const segmentIds = sequelizeRepository_1.default.getSegmentIds(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const params = {
            tenantId: tenant.id,
            segmentIds,
            limit,
            offset,
        };
        let orderByString = '';
        const orderByParts = orderBy.split('_');
        const direction = orderByParts[1].toLowerCase();
        switch (orderByParts[0]) {
            case 'joinedAt':
                orderByString = 'm."joinedAt"';
                break;
            case 'displayName':
                orderByString = 'm."displayName"';
                break;
            case 'reach':
                orderByString = "(m.reach ->> 'total')::int";
                break;
            case 'score':
                orderByString = 'm.score';
                break;
            case 'lastActive':
                orderByString = 'aggs."lastActive"';
                break;
            case 'averageSentiment':
                orderByString = 'aggs."averageSentiment"';
                break;
            case 'activeDaysCount':
                orderByString = 'aggs."activeDaysCount"';
                break;
            case 'activityCount':
                orderByString = 'aggs."activityCount"';
                break;
            case 'numberOfOpenSourceContributions':
                orderByString = '"numberOfOpenSourceContributions"';
                break;
            default:
                throw new Error(`Invalid order by: ${orderBy}!`);
        }
        orderByString = `${orderByString} ${direction}`;
        const jsonColumnInfos = [
            {
                property: 'attributes',
                column: 'm.attributes',
                attributeInfos: attributesSettings,
            },
            {
                property: 'username',
                column: 'aggs.username',
                attributeInfos: types_1.ALL_PLATFORM_TYPES.map((p) => ({
                    name: p,
                    type: types_1.MemberAttributeType.STRING,
                })),
            },
            {
                property: 'tags',
                column: 'mt.all_ids',
                attributeInfos: [],
            },
            {
                property: 'organizations',
                column: 'mo.all_ids',
                attributeInfos: [],
            },
        ];
        let filterString = rawQueryParser_1.default.parseFilters(filter, MemberRepository.MEMBER_QUERY_FILTER_COLUMN_MAP, jsonColumnInfos, params);
        if (filterString.trim().length === 0) {
            filterString = '1=1';
        }
        const query = `
        WITH
            to_merge_data AS (
                SELECT mtm."memberId", STRING_AGG(DISTINCT mtm."toMergeId"::TEXT, ',') AS to_merge_ids
                FROM "memberToMerge" mtm
                INNER JOIN members m ON mtm."memberId" = m.id
                INNER JOIN members m2 ON mtm."toMergeId" = m2.id
                JOIN "memberSegments" ms ON m.id = ms."memberId"
                JOIN "memberSegments" ms2 ON m2.id = ms2."memberId"
                WHERE m."tenantId" = :tenantId
                  AND m2."deletedAt" IS NULL
                  AND ms."segmentId" IN (:segmentIds)
                  AND ms2."segmentId" IN (:segmentIds)
                GROUP BY mtm."memberId"
            ),
            no_merge_data AS (
                SELECT mnm."memberId", STRING_AGG(DISTINCT mnm."noMergeId"::TEXT, ',') AS no_merge_ids
                FROM "memberNoMerge" mnm
                INNER JOIN members m ON mnm."memberId" = m.id
                INNER JOIN members m2 ON mnm."noMergeId" = m2.id
                JOIN "memberSegments" ms ON m.id = ms."memberId"
                JOIN "memberSegments" ms2 ON m2.id = ms2."memberId"
                WHERE m."tenantId" = :tenantId
                  AND m2."deletedAt" IS NULL
                  AND ms."segmentId" IN (:segmentIds)
                  AND ms2."segmentId" IN (:segmentIds)
                GROUP BY mnm."memberId"
            ),
            member_tags AS (
                SELECT
                    mt."memberId",
                    JSON_AGG(
                            DISTINCT JSONB_BUILD_OBJECT(
                                    'id', t.id,
                                    'name', t.name
                                )
                        ) AS all_tags,
                    JSONB_AGG(t.id) AS all_ids
                FROM "memberTags" mt
                INNER JOIN members m ON mt."memberId" = m.id
                JOIN "memberSegments" ms ON ms."memberId" = m.id
                INNER JOIN tags t ON mt."tagId" = t.id
                WHERE m."tenantId" = :tenantId
                  AND m."deletedAt" IS NULL
                  AND ms."segmentId" IN (:segmentIds)
                  AND t."tenantId" = :tenantId
                  AND t."deletedAt" IS NULL
                GROUP BY mt."memberId"
            ),
            member_organizations AS (
                SELECT
                    mo."memberId",
                    JSON_AGG(
                            ROW_TO_JSON(o.*)
                        ) AS all_organizations,
                    JSONB_AGG(o.id) AS all_ids
                FROM "memberOrganizations" mo
                INNER JOIN members m ON mo."memberId" = m.id
                INNER JOIN organizations o ON mo."organizationId" = o.id
                JOIN "memberSegments" ms ON ms."memberId" = m.id
                JOIN "organizationSegments" os ON o.id = os."organizationId"
                WHERE m."tenantId" = :tenantId
                  AND m."deletedAt" IS NULL
                  AND ms."segmentId" IN (:segmentIds)
                  AND o."tenantId" = :tenantId
                  AND o."deletedAt" IS NULL
                  AND os."segmentId" IN (:segmentIds)
                  AND ms."segmentId" = os."segmentId"
                  AND mo."deletedAt" IS NULL
                GROUP BY mo."memberId"
            ),
            aggs AS (
                SELECT
                    id,
                    MAX("lastActive") AS "lastActive",
                    ARRAY(SELECT DISTINCT UNNEST(ARRAY_AGG(identities))) AS identities,
                    jsonb_merge_agg(username) AS username,
                    SUM("activityCount") AS "activityCount",
                    ARRAY(SELECT DISTINCT UNNEST(array_accum("activityTypes"))) AS "activityTypes",
                    ARRAY(SELECT DISTINCT UNNEST(array_accum("activeOn"))) AS "activeOn",
                    SUM("activeDaysCount") AS "activeDaysCount",
                    ROUND(SUM("averageSentiment" * "activityCount") / SUM("activityCount"), 2) AS "averageSentiment",
                    ARRAY_AGG(DISTINCT "segmentId") AS "segmentIds"
                FROM "memberActivityAggregatesMVs"
                WHERE "segmentId" IN (:segmentIds)
                GROUP BY id
            )
        SELECT
            m.id,
            m."displayName",
            m.attributes,
            m.emails,
            m."tenantId",
            m.score,
            m."lastEnriched",
            m.contributions,
            m."joinedAt",
            m."importHash",
            m."createdAt",
            m."updatedAt",
            m.reach,
            tmd.to_merge_ids AS "toMergeIds",
            nmd.no_merge_ids AS "noMergeIds",
            aggs.username,
            aggs.identities,
            aggs."activeOn",
            aggs."activityCount",
            aggs."activityTypes",
            aggs."activeDaysCount",
            aggs."lastActive",
            aggs."averageSentiment",
            aggs."segmentIds",
            COALESCE(mt.all_tags, JSON_BUILD_ARRAY()) AS tags,
            COALESCE(mo.all_organizations, JSON_BUILD_ARRAY()) AS organizations,
            COALESCE(JSONB_ARRAY_LENGTH(m.contributions), 0) AS "numberOfOpenSourceContributions"
        FROM members m
        JOIN "memberSegments" ms ON ms."memberId" = m.id
        LEFT JOIN aggs ON aggs.id = m.id
        LEFT JOIN to_merge_data tmd ON m.id = tmd."memberId"
        LEFT JOIN no_merge_data nmd ON m.id = nmd."memberId"
        LEFT JOIN member_tags mt ON m.id = mt."memberId"
        LEFT JOIN member_organizations mo ON m.id = mo."memberId"
        WHERE m."deletedAt" IS NULL
          AND m."tenantId" = :tenantId
          AND ms."segmentId" IN (:segmentIds)
          AND ${filterString}
        ORDER BY ${orderByString}
        LIMIT :limit OFFSET :offset;
    `;
        const sumMemberCount = (countResults) => countResults.map((row) => parseInt(row.totalCount, 10)).reduce((a, b) => a + b, 0);
        if (countOnly) {
            const countResults = await MemberRepository.countMembers(options, segmentIds, filterString, params);
            const count = sumMemberCount(countResults);
            return {
                rows: [],
                count,
                limit,
                offset,
            };
        }
        options.log.info({ sql: query, replacements: params, segmentIds }, 'findAndCountAllv2 - executing main query');
        const [results, countResults] = await Promise.all([
            seq.query(query, {
                replacements: params,
                type: sequelize_1.QueryTypes.SELECT,
            }),
            MemberRepository.countMembers(options, segmentIds, filterString, params),
        ]);
        const memberIds = results.map((r) => r.id);
        if (memberIds.length > 0) {
            const lastActivities = await seq.query(`
            WITH
                raw_data AS (
                    SELECT *, ROW_NUMBER() OVER (PARTITION BY "memberId" ORDER BY timestamp DESC) AS rn
                    FROM activities
                    WHERE "tenantId" = :tenantId
                      AND "memberId" IN (:memberIds)
                      AND "segmentId" IN (:segmentIds)
                )
            SELECT *
            FROM raw_data
            WHERE rn = 1;
        `, {
                replacements: {
                    tenantId: tenant.id,
                    segmentIds,
                    memberIds,
                },
                type: sequelize_1.QueryTypes.SELECT,
            });
            for (const row of results) {
                const r = row;
                r.lastActivity = lastActivities.find((a) => a.memberId === r.id);
                if (r.lastActivity) {
                    r.lastActivity.display = integrations_1.ActivityDisplayService.getDisplayOptions(r.lastActivity, segmentRepository_1.default.getActivityTypes(options), [types_1.ActivityDisplayVariant.SHORT, types_1.ActivityDisplayVariant.CHANNEL]);
                }
            }
        }
        const count = sumMemberCount(countResults);
        return {
            rows: results,
            count,
            limit,
            offset,
        };
    }
    static async findAndCountAllOpensearch({ filter = {}, limit = 20, offset = 0, orderBy = 'joinedAt_DESC', countOnly = false, attributesSettings = [], segments = [], customSortFunction = undefined, }, options) {
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const segmentsEnabled = await (0, isFeatureEnabled_1.default)(types_1.FeatureFlag.SEGMENTS, options);
        const segment = segments[0];
        const translator = opensearch_1.FieldTranslatorFactory.getTranslator(types_1.OpenSearchIndex.MEMBERS, attributesSettings, [
            'default',
            'custom',
            'gitmesh',
            'enrichment',
            ...(await tenantRepository_1.default.getAvailablePlatforms(options.currentTenant.id, options)).map((p) => p.platform),
        ]);
        const parsed = opensearch_1.OpensearchQueryParser.parse({ filter, limit, offset, orderBy }, types_1.OpenSearchIndex.MEMBERS, translator);
        // add tenant filter to parsed query
        parsed.query.bool.must.push({
            term: {
                uuid_tenantId: tenant.id,
            },
        });
        if (segmentsEnabled) {
            // add segment filter
            parsed.query.bool.must.push({
                term: {
                    uuid_segmentId: segment,
                },
            });
        }
        if (customSortFunction) {
            parsed.sort = customSortFunction;
        }
        if (filter.organizations && filter.organizations.length > 0) {
            parsed.query.bool.must = parsed.query.bool.must.filter((d) => { var _a, _b, _c; return ((_c = (_b = (_a = d.nested) === null || _a === void 0 ? void 0 : _a.query) === null || _b === void 0 ? void 0 : _b.term) === null || _c === void 0 ? void 0 : _c['nested_organizations.uuid_id']) === undefined; });
            // add organizations filter manually for now
            for (const organizationId of filter.organizations) {
                parsed.query.bool.must.push({
                    nested: {
                        path: 'nested_organizations',
                        query: {
                            bool: {
                                must: [
                                    {
                                        term: {
                                            'nested_organizations.uuid_id': organizationId,
                                        },
                                    },
                                    {
                                        bool: {
                                            must_not: {
                                                exists: {
                                                    field: 'nested_organizations.obj_memberOrganizations.date_dateEnd',
                                                },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                });
            }
        }
        const countResponse = await options.opensearch.count({
            index: types_1.OpenSearchIndex.MEMBERS,
            body: { query: parsed.query },
        });
        if (countOnly) {
            return {
                rows: [],
                count: countResponse.body.count,
                limit,
                offset,
            };
        }
        const response = await options.opensearch.search({
            index: types_1.OpenSearchIndex.MEMBERS,
            body: parsed,
        });
        const translatedRows = response.body.hits.hits.map((o) => translator.translateObjectToGitmesh(o._source));
        for (const row of translatedRows) {
            const identities = [];
            const username = {};
            for (const identity of row.identities) {
                identities.push(identity.platform);
                if (identity.platform in username) {
                    username[identity.platform].push(identity.username);
                }
                else {
                    username[identity.platform] = [identity.username];
                }
            }
            row.identities = identities;
            row.username = username;
            row.activeDaysCount = parseInt(row.activeDaysCount, 10);
            row.activityCount = parseInt(row.activityCount, 10);
        }
        const memberIds = translatedRows.map((r) => r.id);
        if (memberIds.length > 0) {
            const seq = sequelizeRepository_1.default.getSequelize(options);
            const segmentIds = segments;
            const lastActivities = await seq.query(`
            WITH
                raw_data AS (
                    SELECT *, ROW_NUMBER() OVER (PARTITION BY "memberId" ORDER BY timestamp DESC) AS rn
                    FROM activities
                    WHERE "tenantId" = :tenantId
                      AND "memberId" IN (:memberIds)
                      AND "segmentId" IN (:segmentIds)
                )
            SELECT *
            FROM raw_data
            WHERE rn = 1;
        `, {
                replacements: {
                    tenantId: tenant.id,
                    segmentIds,
                    memberIds,
                },
                type: sequelize_1.QueryTypes.SELECT,
            });
            for (const row of translatedRows) {
                const r = row;
                r.lastActivity = lastActivities.find((a) => a.memberId === r.id);
                if (r.lastActivity) {
                    r.lastActivity.display = integrations_1.ActivityDisplayService.getDisplayOptions(r.lastActivity, segmentRepository_1.default.getActivityTypes(options), [types_1.ActivityDisplayVariant.SHORT, types_1.ActivityDisplayVariant.CHANNEL]);
                }
            }
        }
        return { rows: translatedRows, count: countResponse.body.count, limit, offset };
    }
    static async findAndCountAll({ filter = {}, advancedFilter = null, limit = 0, offset = 0, orderBy = '', attributesSettings = [], exportMode = false, }, options) {
        let customOrderBy = [];
        const include = [
            {
                model: options.database.memberActivityAggregatesMV,
                attributes: [],
                required: false,
                as: 'memberActivityAggregatesMVs',
            },
            {
                model: options.database.member,
                as: 'toMerge',
                attributes: [],
                through: {
                    attributes: [],
                },
            },
            {
                model: options.database.member,
                as: 'noMerge',
                attributes: [],
                through: {
                    attributes: [],
                },
            },
        ];
        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1.default.customOrderByIfExists('activityCount', orderBy));
        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1.default.customOrderByIfExists('activeDaysCount', orderBy));
        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1.default.customOrderByIfExists('lastActive', orderBy));
        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1.default.customOrderByIfExists('averageSentiment', orderBy));
        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1.default.customOrderByIfExists('numberOfOpenSourceContributions', orderBy));
        if (orderBy.includes('reach')) {
            customOrderBy = customOrderBy.concat([
                sequelize_1.default.literal(`("member".reach->'total')::int`),
                orderBy.split('_')[1],
            ]);
        }
        if (!advancedFilter) {
            advancedFilter = { and: [] };
            if (filter) {
                if (filter.id) {
                    advancedFilter.and.push({ id: filter.id });
                }
                if (filter.platform) {
                    advancedFilter.and.push({
                        platform: {
                            jsonContains: filter.platform,
                        },
                    });
                }
                if (filter.tags) {
                    advancedFilter.and.push({
                        tags: filter.tags,
                    });
                }
                if (filter.organizations) {
                    advancedFilter.and.push({
                        organizations: filter.organizations,
                    });
                }
                // TODO: member identitites FIX
                if (filter.username) {
                    advancedFilter.and.push({ username: { jsonContains: filter.username } });
                }
                if (filter.displayName) {
                    advancedFilter.and.push({
                        displayName: {
                            textContains: filter.displayName,
                        },
                    });
                }
                if (filter.emails) {
                    advancedFilter.and.push({
                        emails: {
                            contains: filter.emails,
                        },
                    });
                }
                if (filter.scoreRange) {
                    const [start, end] = filter.scoreRange;
                    if (start !== undefined && start !== null && start !== '') {
                        advancedFilter.and.push({
                            score: {
                                gte: start,
                            },
                        });
                    }
                    if (end !== undefined && end !== null && end !== '') {
                        advancedFilter.and.push({
                            score: {
                                lte: end,
                            },
                        });
                    }
                }
                if (filter.createdAtRange) {
                    const [start, end] = filter.createdAtRange;
                    if (start !== undefined && start !== null && start !== '') {
                        advancedFilter.and.push({
                            createdAt: {
                                gte: start,
                            },
                        });
                    }
                    if (end !== undefined && end !== null && end !== '') {
                        advancedFilter.and.push({
                            createdAt: {
                                lte: end,
                            },
                        });
                    }
                }
                if (filter.reachRange) {
                    const [start, end] = filter.reachRange;
                    if (start !== undefined && start !== null && start !== '') {
                        advancedFilter.and.push({
                            reach: {
                                gte: start,
                            },
                        });
                    }
                    if (end !== undefined && end !== null && end !== '') {
                        advancedFilter.and.push({
                            reach: {
                                lte: end,
                            },
                        });
                    }
                }
                if (filter.activityCountRange) {
                    const [start, end] = filter.activityCountRange;
                    if (start !== undefined && start !== null && start !== '') {
                        advancedFilter.and.push({
                            activityCount: {
                                gte: start,
                            },
                        });
                    }
                    if (end !== undefined && end !== null && end !== '') {
                        advancedFilter.and.push({
                            activityCount: {
                                lte: end,
                            },
                        });
                    }
                }
                if (filter.activityTypes) {
                    advancedFilter.and.push({
                        activityTypes: {
                            overlap: filter.activityTypes.split(','),
                        },
                    });
                }
                if (filter.activeDaysCountRange) {
                    const [start, end] = filter.activeDaysCountRange;
                    if (start !== undefined && start !== null && start !== '') {
                        advancedFilter.and.push({
                            activeDaysCount: {
                                gte: start,
                            },
                        });
                    }
                    if (end !== undefined && end !== null && end !== '') {
                        advancedFilter.and.push({
                            activeDaysCount: {
                                lte: end,
                            },
                        });
                    }
                }
                if (filter.joinedAtRange) {
                    const [start, end] = filter.joinedAtRange;
                    if (start !== undefined && start !== null && start !== '') {
                        advancedFilter.and.push({
                            joinedAt: {
                                gte: start,
                            },
                        });
                    }
                    if (end !== undefined && end !== null && end !== '') {
                        advancedFilter.and.push({
                            joinedAt: {
                                lte: end,
                            },
                        });
                    }
                }
                if (filter.lastActiveRange) {
                    const [start, end] = filter.lastActiveRange;
                    if (start !== undefined && start !== null && start !== '') {
                        advancedFilter.and.push({
                            lastActive: {
                                gte: start,
                            },
                        });
                    }
                    if (end !== undefined && end !== null && end !== '') {
                        advancedFilter.and.push({
                            lastActive: {
                                lte: end,
                            },
                        });
                    }
                }
                if (filter.averageSentimentRange) {
                    const [start, end] = filter.averageSentimentRange;
                    if (start !== undefined && start !== null && start !== '') {
                        advancedFilter.and.push({
                            averageSentiment: {
                                gte: start,
                            },
                        });
                    }
                    if (end !== undefined && end !== null && end !== '') {
                        advancedFilter.and.push({
                            averageSentiment: {
                                lte: end,
                            },
                        });
                    }
                }
                if (filter.numberOfOpenSourceContributionsRange) {
                    const [start, end] = filter.numberOfOpenSourceContributionsRange;
                    if (start !== undefined && start !== null && start !== '') {
                        advancedFilter.and.push({
                            numberOfOpenSourceContributions: {
                                gte: start,
                            },
                        });
                    }
                    if (end !== undefined && end !== null && end !== '') {
                        advancedFilter.and.push({
                            numberOfOpenSourceContributions: {
                                lte: end,
                            },
                        });
                    }
                }
            }
        }
        const { dynamicAttributesDefaultNestedFields, dynamicAttributesPlatformNestedFields, dynamicAttributesProjection, } = await MemberRepository.getDynamicAttributesLiterals(attributesSettings, options);
        const activityCount = sequelize_1.default.literal(`"memberActivityAggregatesMVs"."activityCount"`);
        const activityTypes = sequelize_1.default.literal(`"memberActivityAggregatesMVs"."activityTypes"`);
        const activeDaysCount = sequelize_1.default.literal(`"memberActivityAggregatesMVs"."activeDaysCount"`);
        const lastActive = sequelize_1.default.literal(`"memberActivityAggregatesMVs"."lastActive"`);
        const activeOn = sequelize_1.default.literal(`"memberActivityAggregatesMVs"."activeOn"`);
        const averageSentiment = sequelize_1.default.literal(`"memberActivityAggregatesMVs"."averageSentiment"`);
        const identities = sequelize_1.default.literal(`"memberActivityAggregatesMVs"."identities"`);
        const username = sequelize_1.default.literal(`"memberActivityAggregatesMVs"."username"`);
        const toMergeArray = sequelize_1.default.literal(`STRING_AGG( distinct "toMerge"."id"::text, ',')`);
        const noMergeArray = sequelize_1.default.literal(`STRING_AGG( distinct "noMerge"."id"::text, ',')`);
        const numberOfOpenSourceContributions = sequelize_1.default.literal(`COALESCE(jsonb_array_length("member"."contributions"), 0)`);
        const parser = new queryParser_1.default({
            nestedFields: Object.assign(Object.assign({}, dynamicAttributesDefaultNestedFields), { reach: 'reach.total', username: 'username.asString' }),
            aggregators: Object.assign(Object.assign(Object.assign({ activityCount,
                activityTypes,
                activeDaysCount,
                lastActive,
                averageSentiment,
                activeOn,
                identities,
                username,
                numberOfOpenSourceContributions }, dynamicAttributesPlatformNestedFields), { 'reach.total': sequelize_1.default.literal(`("member".reach->'total')::int`), 'username.asString': sequelize_1.default.literal(`CAST("memberActivityAggregatesMVs"."username" AS TEXT)`) }), sequelizeFilterUtils_1.default.getNativeTableFieldAggregations([
                'id',
                'attributes',
                'displayName',
                'emails',
                'score',
                'lastEnriched',
                'enrichedBy',
                'contributions',
                'joinedAt',
                'importHash',
                'reach',
                'createdAt',
                'updatedAt',
                'createdById',
                'updatedById',
            ], 'member')),
            manyToMany: {
                tags: {
                    table: 'members',
                    model: 'member',
                    relationTable: {
                        name: 'memberTags',
                        from: 'memberId',
                        to: 'tagId',
                    },
                },
                organizations: {
                    table: 'members',
                    model: 'member',
                    relationTable: {
                        name: 'memberOrganizations',
                        from: 'memberId',
                        to: 'organizationId',
                    },
                },
                segments: {
                    table: 'members',
                    model: 'member',
                    relationTable: {
                        name: 'memberSegments',
                        from: 'memberId',
                        to: 'segmentId',
                    },
                },
            },
            // TODO: member identitites FIX
            // customOperators: {
            //   username: {
            //     model: 'member',
            //     column: 'username',
            //   },
            //   platform: {
            //     model: 'member',
            //     column: 'username',
            //   },
            // },
            exportMode,
        }, options);
        const parsed = parser.parse({
            filter: advancedFilter,
            orderBy: orderBy || ['joinedAt_DESC'],
            limit,
            offset,
        });
        let order = parsed.order;
        if (customOrderBy.length > 0) {
            order = [customOrderBy];
        }
        let { rows, count, // eslint-disable-line prefer-const
         } = await options.database.member.findAndCountAll({
            where: parsed.where ? parsed.where : {},
            having: parsed.having ? parsed.having : {},
            include,
            attributes: [
                ...sequelizeFilterUtils_1.default.getLiteralProjections([
                    'id',
                    'attributes',
                    'displayName',
                    'emails',
                    'tenantId',
                    'score',
                    'lastEnriched',
                    'enrichedBy',
                    'contributions',
                    'joinedAt',
                    'importHash',
                    'createdAt',
                    'updatedAt',
                    'createdById',
                    'updatedById',
                    'reach',
                ], 'member'),
                [activeOn, 'activeOn'],
                [identities, 'identities'],
                [username, 'username'],
                [activityCount, 'activityCount'],
                [activityTypes, 'activityTypes'],
                [activeDaysCount, 'activeDaysCount'],
                [lastActive, 'lastActive'],
                [averageSentiment, 'averageSentiment'],
                [toMergeArray, 'toMergeIds'],
                [noMergeArray, 'noMergeIds'],
                [numberOfOpenSourceContributions, 'numberOfOpenSourceContributions'],
                ...dynamicAttributesProjection,
            ],
            limit: parsed.limit || 50,
            offset: offset ? Number(offset) : 0,
            order,
            subQuery: false,
            group: [
                'member.id',
                'memberActivityAggregatesMVs.activeOn',
                'memberActivityAggregatesMVs.activityCount',
                'memberActivityAggregatesMVs.activityTypes',
                'memberActivityAggregatesMVs.activeDaysCount',
                'memberActivityAggregatesMVs.lastActive',
                'memberActivityAggregatesMVs.averageSentiment',
                'memberActivityAggregatesMVs.username',
                'memberActivityAggregatesMVs.identities',
                'toMerge.id',
            ],
            distinct: true,
        });
        rows = await this._populateRelationsForRows(rows, attributesSettings, exportMode);
        return {
            rows,
            count: count.length,
            limit: limit ? Number(limit) : 50,
            offset: offset ? Number(offset) : 0,
        };
    }
    /**
     * Returns sequelize literals for dynamic member attributes.
     * @param memberAttributeSettings
     * @param options
     * @returns
     */
    static async getDynamicAttributesLiterals(memberAttributeSettings, options) {
        // get possible platforms for a tenant
        const availableDynamicAttributePlatformKeys = [
            'default',
            'custom',
            ...(await tenantRepository_1.default.getAvailablePlatforms(options.currentTenant.id, options)).map((p) => p.platform),
        ];
        const dynamicAttributesDefaultNestedFields = memberAttributeSettings.reduce((acc, attribute) => {
            acc[attribute.name] = `attributes.${attribute.name}.default`;
            return acc;
        }, {});
        const dynamicAttributesPlatformNestedFields = memberAttributeSettings.reduce((acc, attribute) => {
            for (const key of availableDynamicAttributePlatformKeys) {
                if (attribute.type === types_1.MemberAttributeType.NUMBER) {
                    acc[`attributes.${attribute.name}.${key}`] = sequelize_1.default.literal(`("member"."attributes"#>>'{${attribute.name},${key}}')::integer`);
                }
                else if (attribute.type === types_1.MemberAttributeType.BOOLEAN) {
                    acc[`attributes.${attribute.name}.${key}`] = sequelize_1.default.literal(`("member"."attributes"#>>'{${attribute.name},${key}}')::boolean`);
                }
                else if (attribute.type === types_1.MemberAttributeType.MULTI_SELECT) {
                    acc[`attributes.${attribute.name}.${key}`] = sequelize_1.default.literal(`ARRAY( SELECT jsonb_array_elements_text("member"."attributes"#>'{${attribute.name},${key}}'))`);
                }
                else {
                    acc[`attributes.${attribute.name}.${key}`] = sequelize_1.default.literal(`"member"."attributes"#>>'{${attribute.name},${key}}'`);
                }
            }
            return acc;
        }, {});
        const dynamicAttributesProjection = memberAttributeSettings.reduce((acc, attribute) => {
            for (const key of availableDynamicAttributePlatformKeys) {
                if (key === 'default') {
                    acc.push([
                        sequelize_1.default.literal(`"member"."attributes"#>>'{${attribute.name},default}'`),
                        attribute.name,
                    ]);
                }
                else {
                    acc.push([
                        sequelize_1.default.literal(`"member"."attributes"#>>'{${attribute.name},${key}}'`),
                        `${attribute.name}.${key}`,
                    ]);
                }
            }
            return acc;
        }, []);
        return {
            dynamicAttributesDefaultNestedFields,
            dynamicAttributesPlatformNestedFields,
            availableDynamicAttributePlatformKeys,
            dynamicAttributesProjection,
        };
    }
    static async findAllAutocomplete(query, limit, options) {
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const whereAnd = [
            {
                tenantId: tenant.id,
            },
        ];
        if (query) {
            whereAnd.push({
                [Op.or]: [
                    {
                        displayName: {
                            [Op.iLike]: `${query}%`,
                        },
                    },
                ],
            });
        }
        const where = { [Op.and]: whereAnd };
        const records = await options.database.member.findAll({
            attributes: ['id', 'displayName', 'attributes', 'emails'],
            where,
            limit: limit ? Number(limit) : undefined,
            order: [['displayName', 'ASC']],
            include: [
                {
                    model: options.database.organization,
                    attributes: ['id', 'displayName'],
                    as: 'organizations',
                },
                {
                    model: options.database.segment,
                    as: 'segments',
                    where: {
                        id: sequelizeRepository_1.default.getSegmentIds(options),
                    },
                },
            ],
        });
        return records.map((record) => {
            var _a, _b;
            return ({
                id: record.id,
                label: record.displayName,
                email: record.emails.length > 0 ? record.emails[0] : null,
                avatar: ((_b = (_a = record.attributes) === null || _a === void 0 ? void 0 : _a.avatarUrl) === null || _b === void 0 ? void 0 : _b.default) || null,
                organizations: record.organizations.map((org) => ({
                    id: org.id,
                    name: org.name,
                })),
            });
        });
    }
    static async mergeSuggestionsByUsername(numberOfHours, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const segmentIds = sequelizeRepository_1.default.getSegmentIds(options);
        const query = `
    -- Define a CTE named "new_members" to get members created in the last 2 hours with a specific tenantId
    WITH new_members AS (
      SELECT m.id, m."tenantId"
      FROM members m
      JOIN "memberSegments" ms ON ms."memberId" = m.id
      WHERE m."createdAt" >= now() - INTERVAL :numberOfHours
      AND m."tenantId" = :tenantId
      AND ms."segmentId" IN (:segmentIds)
    ),
    -- Define a CTE named "identity_join" to find members with the same usernames across different platforms
    identity_join AS (
      SELECT
        m1.id AS m1_id,
        m2.id AS m2_id,
        i1.platform AS i1_platform,
        i2.platform AS i2_platform,
        i1.username AS i1_username,
        i2.username AS i2_username
      FROM new_members m1
      -- Join memberIdentities and members to get related records
      JOIN "memberIdentities" i1 ON m1.id = i1."memberId"
      JOIN "memberIdentities" i2 ON i1.username = i2.username AND i1.platform <> i2.platform
      JOIN members m2 ON m2.id = i2."memberId"
      -- Filter out records where tenantId is different and memberIds are the same
      WHERE m1."tenantId" = m2."tenantId"
      AND m1.id <> m2.id
      -- Filter out records present in memberToMerge table
      AND NOT EXISTS (
        SELECT 1
        FROM "memberToMerge"
        WHERE (
          "memberId" = m1.id
          AND "toMergeId" = m2.id
        ) OR (
          "memberId" = m2.id
          AND "toMergeId" = m1.id
        )
      )
      -- Filter out records present in memberNoMerge table
      AND NOT EXISTS (
        SELECT 1
        FROM "memberNoMerge"
        WHERE (
          "memberId" = m1.id
          AND "noMergeId" = m2.id
        ) OR (
          "memberId" = m2.id
          AND "noMergeId" = m1.id
        )
      )
    )
    -- Select everything from the final CTE "identity_join"
    SELECT *
    FROM identity_join;`;
        const suggestions = await seq.query(query, {
            replacements: {
                tenantId: tenant.id,
                segmentIds,
                numberOfHours: `${numberOfHours} hours`,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return suggestions.map((suggestion) => ({
            members: [suggestion.m1_id, suggestion.m2_id],
            // 100% confidence only from emails
            similarity: 0.95,
        }));
    }
    static async mergeSuggestionsByEmail(numberOfHours, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const segmentIds = sequelizeRepository_1.default.getSegmentIds(options);
        const query = `
    -- Define a CTE named "new_members" to get members created in the last 7 days with a specific tenantId and their emails
    WITH new_members AS (
      SELECT m.id, m."tenantId", m.emails
      FROM members m
      JOIN "memberSegments" ms ON ms."memberId" = m.id
      WHERE m."createdAt" >= now() - INTERVAL :numberOfHours
      AND m."tenantId" = :tenantId
      AND ms."segmentId" IN (:segmentIds)
    ),
    -- Define a CTE named "email_join" to find overlapping emails across different members
    email_join AS (
      SELECT
        m1.id AS m1_id,            -- Member 1 ID
        m2.id AS m2_id,            -- Member 2 ID
        m1.emails AS m1_emails,    -- Member 1 emails
        m2.emails AS m2_emails     -- Member 2 emails
      FROM new_members m1
      -- Join the members table on the tenantId field and ensuring the IDs are different
      JOIN members m2 ON m1."tenantId" = m2."tenantId"
        AND m1.id <> m2.id
      -- Filter for overlapping emails
      WHERE m1.emails && m2.emails
      -- Exclude pairs that are already in the memberToMerge table
      AND NOT EXISTS (
        SELECT 1
        FROM "memberToMerge"
        WHERE (
          "memberId" = m1.id
          AND "toMergeId" = m2.id
        ) OR (
          "memberId" = m2.id
          AND "toMergeId" = m1.id
        )
      )
      -- Exclude pairs that are in the memberNoMerge table
      AND NOT EXISTS (
        SELECT 1
        FROM "memberNoMerge"
        WHERE (
          "memberId" = m1.id
          AND "noMergeId" = m2.id
        ) OR (
          "memberId" = m2.id
          AND "noMergeId" = m1.id
        )
      )
    )
    -- Select all columns from the email_join CTE
    SELECT *
    FROM email_join;`;
        const suggestions = await seq.query(query, {
            replacements: {
                tenantId: tenant.id,
                segmentIds,
                numberOfHours: `${numberOfHours} hours`,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return suggestions.map((suggestion) => ({
            members: [suggestion.m1_id, suggestion.m2_id],
            similarity: 1,
        }));
    }
    static async mergeSuggestionsBySimilarity(numberOfHours, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const segmentIds = sequelizeRepository_1.default.getSegmentIds(options);
        const query = `
    -- Define a CTE named "new_members" to get members created in the last 7 days with a specific tenantId
    WITH new_members AS (
      SELECT m.*
      FROM members m
      JOIN "memberSegments" ms ON ms."memberId" = m.id
      WHERE m."createdAt" >= now() - INTERVAL :numberOfHours
      AND m."tenantId" = :tenantId
      AND ms."segmentId" IN (:segmentIds)
      LIMIT 1000
    ),
    -- Define a CTE named "identity_join" to find similar identities across platforms
    identity_join AS (
      -- Select distinct pairs of memberIds and relevant information, along with the similarity score
      SELECT DISTINCT ON(m1_id, m2_id)
        m1.id AS m1_id,
        m2.id AS m2_id,
        similarity(i1.username, i2.username) AS similarity
      FROM new_members m1
      -- Join memberIdentities and members to get related records
      JOIN "memberIdentities" i1 ON m1.id = i1."memberId"
      JOIN "memberIdentities" i2 ON i1.platform <> i2.platform
      JOIN members m2 ON m2.id = i2."memberId"
      -- Filter out records where tenantId is different and memberIds are the same
      WHERE m1."tenantId" = m2."tenantId"
      AND m1.id <> m2.id
      -- Consider only records with similarity > 0.5 (adjust this threshold as needed)
      AND similarity(i1.username, i2.username) > 0.5
      -- Order by similarity descending to get the most similar records first
      ORDER BY m1_id, m2_id, similarity DESC
    ),
    -- Define a CTE named "exclude_already_processed" to remove the already processed members
    exclude_already_processed AS (
      SELECT *
      FROM identity_join
      -- Filter out records present in memberToMerge table
      WHERE NOT EXISTS (
        SELECT 1
        FROM "memberToMerge"
        WHERE (
          "memberId" = identity_join.m1_id
          AND "toMergeId" = identity_join.m2_id
        ) OR (
          "memberId" = identity_join.m2_id
          AND "toMergeId" = identity_join.m1_id
        )
        -- Filter out records present in memberNoMerge table
      ) AND NOT EXISTS (
        SELECT 1
        FROM "memberNoMerge"
        WHERE (
          "memberId" = identity_join.m1_id
          AND "noMergeId" = identity_join.m2_id
        ) OR (
          "memberId" = identity_join.m2_id
          AND "noMergeId" = identity_join.m1_id
        )
      )
    )
    -- Select everything from the final CTE "exclude_already_processed"
    SELECT *
    FROM exclude_already_processed;`;
        const suggestions = await seq.query(query, {
            replacements: {
                tenantId: tenant.id,
                segmentIds,
                numberOfHours: `${numberOfHours} hours`,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return suggestions.map((suggestion) => ({
            members: [suggestion.m1_id, suggestion.m2_id],
            // 100% confidence only from emails
            similarity: suggestion.similarity > 0.95 ? 0.95 : suggestion.similarity,
        }));
    }
    static async addToWeakIdentities(memberIds, username, platform, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const query = `
    update members
    set "weakIdentities" = "weakIdentities" || jsonb_build_object('username', :username, 'platform', :platform)::jsonb
    where id in (:memberIds)
      and not exists (select 1
                      from jsonb_array_elements("weakIdentities") as wi
                      where wi ->> 'username' = :username
                        and wi ->> 'platform' = :platform);
    `;
        await seq.query(query, {
            replacements: {
                memberIds,
                username,
                platform,
                tenantId: tenant.id,
            },
            type: sequelize_1.QueryTypes.UPDATE,
            transaction,
        });
    }
    static async _createAuditLog(action, record, data, options) {
        if (log) {
            let values = {};
            if (data) {
                values = Object.assign(Object.assign({}, record.get({ plain: true })), { activitiesIds: data.activities, tagsIds: data.tags, noMergeIds: data.noMerge });
            }
            await auditLogRepository_1.default.log({
                entityName: 'member',
                entityId: record.id,
                action,
                values,
            }, options);
        }
    }
    static async _populateRelationsForRows(rows, attributesSettings, exportMode = false) {
        if (!rows) {
            return rows;
        }
        // No need for lazyloading tags for integrations or microservices
        if ((conf_1.KUBE_MODE &&
            (conf_1.SERVICE === configTypes_1.ServiceType.NODEJS_WORKER || conf_1.SERVICE === configTypes_1.ServiceType.JOB_GENERATOR) &&
            !exportMode) ||
            process.env.SERVICE === 'integrations' ||
            process.env.SERVICE === 'microservices-nodejs') {
            return rows.map((record) => {
                const plainRecord = record.get({ plain: true });
                plainRecord.noMerge = plainRecord.noMergeIds ? plainRecord.noMergeIds.split(',') : [];
                plainRecord.toMerge = plainRecord.toMergeIds ? plainRecord.toMergeIds.split(',') : [];
                delete plainRecord.toMergeIds;
                delete plainRecord.noMergeIds;
                return plainRecord;
            });
        }
        return Promise.all(rows.map(async (record) => {
            var _a;
            const plainRecord = record.get({ plain: true });
            plainRecord.noMerge = plainRecord.noMergeIds ? plainRecord.noMergeIds.split(',') : [];
            plainRecord.toMerge = plainRecord.toMergeIds ? plainRecord.toMergeIds.split(',') : [];
            plainRecord.lastActivity = plainRecord.lastActive
                ? (await record.getActivities({
                    order: [['timestamp', 'DESC']],
                    limit: 1,
                }))[0].get({ plain: true })
                : null;
            delete plainRecord.toMergeIds;
            delete plainRecord.noMergeIds;
            plainRecord.activeOn = (_a = plainRecord.activeOn) !== null && _a !== void 0 ? _a : [];
            for (const attribute of attributesSettings) {
                if (Object.prototype.hasOwnProperty.call(plainRecord, attribute.name)) {
                    delete plainRecord[attribute.name];
                }
            }
            for (const attributeName in plainRecord.attributes) {
                if (!lodash_1.default.find(attributesSettings, { name: attributeName })) {
                    delete plainRecord.attributes[attributeName];
                }
            }
            delete plainRecord.contributions;
            delete plainRecord.company;
            plainRecord.organizations = await record.getOrganizations({
                joinTableAttributes: [],
            });
            plainRecord.tags = await record.getTags({
                joinTableAttributes: [],
            });
            if (exportMode) {
                plainRecord.notes = await record.getNotes({
                    joinTableAttributes: [],
                });
            }
            return plainRecord;
        }));
    }
    /**
     * Fill a record with the relations and files (if any)
     * @param record Record to get relations and files for
     * @param options IRepository options
     * @param returnPlain If true: return object, otherwise  return model
     * @returns The model/object with filled relations and files
     */
    static async _populateRelations(record, options, returnPlain = true) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!record) {
            return record;
        }
        let output;
        if (returnPlain) {
            output = record.get({ plain: true });
        }
        else {
            output = record;
        }
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const activityAggregates = await MemberRepository.getActivityAggregates(output.id, options);
        output.activeOn = (activityAggregates === null || activityAggregates === void 0 ? void 0 : activityAggregates.activeOn) || [];
        output.activityCount = (activityAggregates === null || activityAggregates === void 0 ? void 0 : activityAggregates.activityCount) || 0;
        output.activityTypes = (activityAggregates === null || activityAggregates === void 0 ? void 0 : activityAggregates.activityTypes) || [];
        output.activeDaysCount = (activityAggregates === null || activityAggregates === void 0 ? void 0 : activityAggregates.activeDaysCount) || 0;
        output.averageSentiment = (activityAggregates === null || activityAggregates === void 0 ? void 0 : activityAggregates.averageSentiment) || 0;
        output.lastActivity =
            (_b = (_a = (await record.getActivities({
                order: [['timestamp', 'DESC']],
                limit: 1,
                transaction,
            }))[0]) === null || _a === void 0 ? void 0 : _a.get({ plain: true })) !== null && _b !== void 0 ? _b : null;
        output.lastActive = (_d = (_c = output.lastActivity) === null || _c === void 0 ? void 0 : _c.timestamp) !== null && _d !== void 0 ? _d : null;
        output.numberOfOpenSourceContributions = (_f = (_e = output.contributions) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0;
        output.tags = await record.getTags({
            transaction,
            order: [['createdAt', 'ASC']],
            joinTableAttributes: [],
        });
        output.organizations = await record.getOrganizations({
            transaction,
            order: [['createdAt', 'ASC']],
            joinTableAttributes: ['dateStart', 'dateEnd', 'title', 'source'],
            through: {
                where: {
                    deletedAt: null,
                },
            },
        });
        MemberRepository.sortOrganizations(output.organizations);
        output.tasks = await record.getTasks({
            transaction,
            order: [['createdAt', 'ASC']],
            joinTableAttributes: [],
        });
        output.notes = await record.getNotes({
            transaction,
            joinTableAttributes: [],
        });
        output.noMerge = (await record.getNoMerge({
            transaction,
        })).map((i) => i.id);
        output.toMerge = (await record.getToMerge({
            transaction,
        })).map((i) => i.id);
        const memberIdentities = (await this.getIdentities([record.id], options)).get(record.id);
        output.username = {};
        for (const identity of memberIdentities) {
            if (output.username[identity.platform]) {
                output.username[identity.platform].push(identity.username);
            }
            else {
                output.username[identity.platform] = [identity.username];
            }
        }
        output.identities = Object.keys(output.username);
        output.affiliations = await this.getAffiliations(record.id, options);
        const manualSyncRemote = await new memberSyncRemoteRepository_1.default(options).findMemberManualSync(record.id);
        for (const syncRemote of manualSyncRemote) {
            if ((_g = output.attributes) === null || _g === void 0 ? void 0 : _g.syncRemote) {
                output.attributes.syncRemote[syncRemote.platform] = syncRemote.status === types_1.SyncStatus.ACTIVE;
            }
            else {
                output.attributes.syncRemote = {
                    [syncRemote.platform]: syncRemote.status === types_1.SyncStatus.ACTIVE,
                };
            }
        }
        return output;
    }
    static async updateMemberOrganizations(record, organizations, replace, options) {
        if (!organizations) {
            return;
        }
        function iso(v) {
            return (0, moment_1.default)(v).toISOString();
        }
        if (replace) {
            const originalOrgs = await MemberRepository.fetchWorkExperiences(record.id, options);
            const toDelete = originalOrgs.filter((originalOrg) => !organizations.find((newOrg) => originalOrg.organizationId === newOrg.id &&
                originalOrg.title === (newOrg.title || null) &&
                iso(originalOrg.dateStart) === iso(newOrg.startDate || null) &&
                iso(originalOrg.dateEnd) === iso(newOrg.endDate || null)));
            for (const item of toDelete) {
                await MemberRepository.deleteWorkExperience(item.id, options);
            }
        }
        for (const item of organizations) {
            const org = typeof item === 'string' ? { id: item } : item;
            await MemberRepository.createOrUpdateWorkExperience({
                memberId: record.id,
                organizationId: org.id,
                title: org.title,
                dateStart: org.startDate,
                dateEnd: org.endDate,
                source: org.source,
            }, options);
            await organizationRepository_1.default.includeOrganizationToSegments(org.id, options);
        }
    }
    static async createOrUpdateWorkExperience({ memberId, organizationId, source, title = null, dateStart = null, dateEnd = null, updateAffiliation = true, }, options) {
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        if (dateStart) {
            // clean up organizations without dates if we're getting ones with dates
            await seq.query(`
          UPDATE "memberOrganizations"
          SET "deletedAt" = NOW()
          WHERE "memberId" = :memberId
          AND "organizationId" = :organizationId
          AND "dateStart" IS NULL
          AND "dateEnd" IS NULL
        `, {
                replacements: {
                    memberId,
                    organizationId,
                },
                type: sequelize_1.QueryTypes.UPDATE,
                transaction,
            });
        }
        else {
            const rows = await seq.query(`
          SELECT COUNT(*) AS count FROM "memberOrganizations"
          WHERE "memberId" = :memberId
          AND "organizationId" = :organizationId
          AND "dateStart" IS NOT NULL
          AND "deletedAt" IS NULL
        `, {
                replacements: {
                    memberId,
                    organizationId,
                },
                type: sequelize_1.QueryTypes.SELECT,
                transaction,
            });
            const row = rows[0];
            if (row.count > 0) {
                // if we're getting organization without dates, but there's already one with dates, don't insert
                return;
            }
        }
        let conflictCondition = `("memberId", "organizationId", "dateStart", "dateEnd")`;
        if (!dateEnd) {
            conflictCondition = `("memberId", "organizationId", "dateStart") WHERE "dateEnd" IS NULL`;
        }
        if (!dateStart) {
            conflictCondition = `("memberId", "organizationId") WHERE "dateStart" IS NULL AND "dateEnd" IS NULL`;
        }
        const onConflict = source === types_1.OrganizationSource.UI
            ? `ON CONFLICT ${conflictCondition} DO UPDATE SET "title" = :title, "dateStart" = :dateStart, "dateEnd" = :dateEnd, "deletedAt" = NULL, "source" = :source`
            : 'ON CONFLICT DO NOTHING';
        await seq.query(`
        INSERT INTO "memberOrganizations" ("memberId", "organizationId", "createdAt", "updatedAt", "title", "dateStart", "dateEnd", "source")
        VALUES (:memberId, :organizationId, NOW(), NOW(), :title, :dateStart, :dateEnd, :source)
        ${onConflict}
      `, {
            replacements: {
                memberId,
                organizationId,
                title: title || null,
                dateStart: dateStart || null,
                dateEnd: dateEnd || null,
                source: source || null,
            },
            type: sequelize_1.QueryTypes.INSERT,
            transaction,
        });
        if (updateAffiliation) {
            await memberAffiliationRepository_1.default.update(memberId, options);
        }
    }
    static async deleteWorkExperience(id, options) {
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        await seq.query(`
        UPDATE "memberOrganizations"
        SET "deletedAt" = NOW()
        WHERE "id" = :id
      `, {
            replacements: {
                id,
            },
            type: sequelize_1.QueryTypes.UPDATE,
            transaction,
        });
    }
    static async fetchWorkExperiences(memberId, options) {
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const query = `
      SELECT * FROM "memberOrganizations"
      WHERE "memberId" = :memberId
        AND "deletedAt" IS NULL
    `;
        const records = await seq.query(query, {
            replacements: {
                memberId,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return records;
    }
    static async findWorkExperience(memberId, timestamp, options) {
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const query = `
      SELECT * FROM "memberOrganizations"
      WHERE "memberId" = :memberId
        AND (
          ("dateStart" <= :timestamp AND "dateEnd" >= :timestamp)
          OR ("dateStart" <= :timestamp AND "dateEnd" IS NULL)
        )
        AND "deletedAt" IS NULL
      ORDER BY "dateStart" DESC, id
      LIMIT 1
    `;
        const records = await seq.query(query, {
            replacements: {
                memberId,
                timestamp,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        if (records.length === 0) {
            return null;
        }
        return records[0];
    }
    static async findMostRecentOrganization(memberId, timestamp, options) {
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const query = `
      SELECT * FROM "memberOrganizations"
      WHERE "memberId" = :memberId
        AND "dateStart" IS NULL
        AND "dateEnd" IS NULL
        AND "createdAt" <= :timestamp
        AND "deletedAt" IS NULL
      ORDER BY "createdAt" DESC, id
      LIMIT 1
    `;
        const records = await seq.query(query, {
            replacements: {
                memberId,
                timestamp,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        if (records.length === 0) {
            return null;
        }
        return records[0];
    }
    static async findMostRecentOrganizationEver(memberId, options) {
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const query = `
      SELECT * FROM "memberOrganizations"
      WHERE "memberId" = :memberId
        AND "dateStart" IS NULL
        AND "dateEnd" IS NULL
        AND "deletedAt" IS NULL
      ORDER BY "createdAt", id
      LIMIT 1
    `;
        const records = await seq.query(query, {
            replacements: {
                memberId,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        if (records.length === 0) {
            return null;
        }
        return records[0];
    }
    static sortOrganizations(organizations) {
        organizations.sort((a, b) => {
            var _a, _b, _c, _d;
            a = a.dataValues ? a.get({ plain: true }) : a;
            b = b.dataValues ? b.get({ plain: true }) : b;
            const aStart = (_a = a.memberOrganizations) === null || _a === void 0 ? void 0 : _a.dateStart;
            const bStart = (_b = b.memberOrganizations) === null || _b === void 0 ? void 0 : _b.dateStart;
            const aEnd = (_c = a.memberOrganizations) === null || _c === void 0 ? void 0 : _c.dateEnd;
            const bEnd = (_d = b.memberOrganizations) === null || _d === void 0 ? void 0 : _d.dateEnd;
            // Sorting:
            // 1. Those without dateEnd, but with dateStart should be at the top, orderd by dateStart
            // 2. Those with dateEnd and dateStart should be in the middle, ordered by dateEnd
            // 3. Those without dateEnd and dateStart should be at the bottom, ordered by name
            if (!aEnd && aStart) {
                if (!bEnd && bStart) {
                    return aStart > bStart ? -1 : 1;
                }
                if (bEnd && bStart) {
                    return -1;
                }
                return -1;
            }
            if (aEnd && aStart) {
                if (!bEnd && bStart) {
                    return 1;
                }
                if (bEnd && bStart) {
                    return aEnd > bEnd ? -1 : 1;
                }
                return -1;
            }
            if (!bEnd && bStart) {
                return 1;
            }
            if (bEnd && bStart) {
                return 1;
            }
            return a.name > b.name ? 1 : -1;
        });
    }
    static async getMemberIdsandCount({ limit = 20, offset = 0, orderBy = 'joinedAt_DESC', countOnly = false }, options) {
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const segmentIds = sequelizeRepository_1.default.getSegmentIds(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const params = {
            tenantId: tenant.id,
            segmentIds,
            limit,
            offset,
        };
        let orderByString = '';
        const orderByParts = orderBy.split('_');
        const direction = orderByParts[1].toLowerCase();
        switch (orderByParts[0]) {
            case 'joinedAt':
                orderByString = 'm."joinedAt"';
                break;
            case 'displayName':
                orderByString = 'm."displayName"';
                break;
            case 'reach':
                orderByString = "(m.reach ->> 'total')::int";
                break;
            case 'score':
                orderByString = 'm.score';
                break;
            default:
                throw new Error(`Invalid order by: ${orderBy}!`);
        }
        orderByString = `${orderByString} ${direction}`;
        const countQuery = `
    SELECT count(*) FROM (
      SELECT m.id
      FROM members m
      JOIN "memberSegments" ms ON ms."memberId" = m.id
      WHERE m."tenantId" = :tenantId
      AND ms."segmentId" IN (:segmentIds)
    ) as count
    `;
        const memberCount = await seq.query(countQuery, {
            replacements: params,
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (countOnly) {
            return {
                count: memberCount[0].count,
                ids: [],
            };
        }
        const members = await seq.query(`SELECT m.id FROM members m
      JOIN "memberSegments" ms ON ms."memberId" = m.id
      WHERE m."tenantId" = :tenantId and ms."segmentId" in (:segmentIds) 
      ORDER BY ${orderByString} 
      LIMIT :limit OFFSET :offset`, {
            replacements: params,
            type: sequelize_1.QueryTypes.SELECT,
        });
        return {
            count: memberCount[0].count,
            ids: members.map((i) => i.id),
        };
    }
}
MemberRepository.MEMBER_QUERY_FILTER_COLUMN_MAP = new Map([
    ['isOrganization', "coalesce((m.attributes -> 'isOrganization' -> 'default')::boolean, false)"],
    ['isTeamMember', "coalesce((m.attributes -> 'isTeamMember' -> 'default')::boolean, false)"],
    ['isBot', "coalesce((m.attributes -> 'isBot' -> 'default')::boolean, false)"],
    ['activeOn', 'aggs."activeOn"'],
    ['activityCount', 'aggs."activityCount"'],
    ['activityTypes', 'aggs."activityTypes"'],
    ['activeDaysCount', 'aggs."activeDaysCount"'],
    ['lastActive', 'aggs."lastActive"'],
    ['averageSentiment', 'aggs."averageSentiment"'],
    ['identities', 'aggs.identities'],
    ['reach', "(m.reach -> 'total')::integer"],
    ['numberOfOpenSourceContributions', 'coalesce(jsonb_array_length(m.contributions), 0)'],
    ['id', 'm.id'],
    ['displayName', 'm."displayName"'],
    ['tenantId', 'm."tenantId"'],
    ['score', 'm.score'],
    ['lastEnriched', 'm."lastEnriched"'],
    ['joinedAt', 'm."joinedAt"'],
    ['importHash', 'm."importHash"'],
    ['createdAt', 'm."createdAt"'],
    ['updatedAt', 'm."updatedAt"'],
    ['emails', 'm.emails'],
]);
exports.default = MemberRepository;
//# sourceMappingURL=memberRepository.js.map