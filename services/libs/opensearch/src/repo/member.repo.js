"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberRepository = void 0;
const database_1 = require("@gitmesh/database");
const redis_1 = require("@gitmesh/redis");
class MemberRepository extends database_1.RepositoryBase {
    constructor(redisClient, dbStore, parentLog) {
        super(dbStore, parentLog);
        this.cache = new redis_1.RedisCache('memberAttributes', redisClient, this.log);
    }
    async getTenantIds() {
        const results = await this.db().any(`select distinct "tenantId" from members;`);
        return results.map((r) => r.tenantId);
    }
    async getTenantMemberAttributes(tenantId) {
        const cachedString = await this.cache.get(tenantId);
        if (cachedString) {
            return JSON.parse(cachedString);
        }
        const results = await this.db().any(`select type, "canDelete", show, label, name, options from "memberAttributeSettings" where "tenantId" = $(tenantId)`, {
            tenantId,
        });
        await this.cache.set(tenantId, JSON.stringify(results));
        return results;
    }
    async getTenantMembersForSync(tenantId, perPage, lastId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let results;
        if (lastId) {
            results = await this.db().any(`
          select m.id
          from members m
          where m."tenantId" = $(tenantId) and 
                m."deletedAt" is null and
                m.id > $(lastId) and
                (
                  exists (select 1 from activities where "memberId" = m.id) or
                  m."manuallyCreated"
                ) and
                exists (select 1 from "memberIdentities" where "memberId" = m.id)
          order by m.id
          limit ${perPage};`, {
                tenantId,
                lastId,
            });
        }
        else {
            results = await this.db().any(`
          select m.id
          from members m
          where m."tenantId" = $(tenantId) and 
                m."deletedAt" is null and
                (
                  exists (select 1 from activities where "memberId" = m.id) or
                  m."manuallyCreated"
                ) and
                exists (select 1 from "memberIdentities" where "memberId" = m.id)
          order by m.id
          limit ${perPage};`, {
                tenantId,
            });
        }
        return results.map((r) => r.id);
    }
    async getOrganizationMembersForSync(organizationId, perPage, lastId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let results;
        if (lastId) {
            results = await this.db().any(`
        select distinct mo."memberId"
        from "memberOrganizations" mo
        where mo."organizationId" = $(organizationId) and
              mo."deletedAt" is null and
              mo."memberId" > $(lastId) and
              (
                exists (select 1 from activities where "memberId" = mo."memberId") or
                exists (select 1 from members where "memberId" = mo."memberId" and "manuallyCreated")
              ) and
              exists (select 1 from "memberIdentities" where "memberId" = mo."memberId")
        order by mo."memberId"
        limit ${perPage};`, {
                organizationId,
                lastId,
            });
        }
        else {
            results = await this.db().any(`
        select distinct mo."memberId"
        from "memberOrganizations" mo
        where mo."organizationId" = $(organizationId) and
              mo."deletedAt" is null and
              (
                exists (select 1 from activities where "memberId" = mo."memberId") or
                exists (select 1 from members where "memberId" = mo."memberId" and "manuallyCreated")
              ) and
              exists (select 1 from "memberIdentities" where "memberId" = mo."memberId")
        order by mo."memberId"
        limit ${perPage};`, {
                organizationId,
            });
        }
        return results.map((r) => r.memberId);
    }
    async getRemainingTenantMembersForSync(tenantId, page, perPage, cutoffDate) {
        const results = await this.db().any(`
      select id from members m
      where m."tenantId" = $(tenantId) and m."deletedAt" is null
       and (
        m."searchSyncedAt" is null or
        m."searchSyncedAt" < $(cutoffDate)
       ) and
       (
        exists (select 1 from activities where "memberId" = m.id) or
          m."manuallyCreated"
       )
      limit ${perPage} offset ${(page - 1) * perPage};
      `, {
            tenantId,
            cutoffDate,
        });
        return results.map((r) => r.id);
    }
    async getMemberData(ids) {
        const results = await this.db().any(`
      with to_merge_data as (select mtm."memberId",
                                      array_agg(distinct mtm."toMergeId"::text) as to_merge_ids
                              from "memberToMerge" mtm
                                        inner join members m2 on mtm."toMergeId" = m2.id
                              where mtm."memberId" in ($(ids:csv))
                                and m2."deletedAt" is null
                              group by mtm."memberId"),
            no_merge_data as (select mnm."memberId",
                                      array_agg(distinct mnm."noMergeId"::text) as no_merge_ids
                              from "memberNoMerge" mnm
                                        inner join members m2 on mnm."noMergeId" = m2.id
                              where mnm."memberId" in ($(ids:csv))
                                and m2."deletedAt" is null
                              group by mnm."memberId"),
            member_tags as (select mt."memberId",
                                    json_agg(
                                            json_build_object(
                                                    'id', t.id,
                                                    'name', t.name
                                                )
                                        )           as all_tags,
                                    jsonb_agg(t.id) as all_ids
                            from "memberTags" mt
                                      inner join tags t on mt."tagId" = t.id
                            where mt."memberId" in ($(ids:csv))
                              and t."deletedAt" is null
                            group by mt."memberId"),
            member_organizations as (select mo."memberId",
                                            os."segmentId",
                                            json_agg(
                                                    json_build_object(
                                                            'id', o.id,
                                                            'logo', o.logo,
                                                            'displayName', o."displayName",
                                                            'memberOrganizations', json_build_object(
                                                                          'dateStart', mo."dateStart",
                                                                          'dateEnd', mo."dateEnd",
                                                                          'title', mo.title
                                                            )
                                                        )
                                                )           as all_organizations,
                                            jsonb_agg(o.id) as all_ids
                                      from "memberOrganizations" mo
                                              inner join organizations o on mo."organizationId" = o.id
                                              inner join "organizationSegments" os on o.id = os."organizationId"
                                      where mo."memberId" in ($(ids:csv))
                                        and mo."deletedAt" is null
                                        and o."deletedAt" is null
                                        and exists (select 1
                                          from activities a
                                          where a."memberId" = mo."memberId"
                                            and a."organizationId" = mo."organizationId"
                                            and a."segmentId" = os."segmentId")
                                      group by mo."memberId", os."segmentId"),
            identities as (select mi."memberId",
                                  json_agg(
                                          json_build_object(
                                                  'platform', mi.platform,
                                                  'username', mi.username
                                              )
                                      ) as identities
                            from "memberIdentities" mi
                            where mi."memberId" in ($(ids:csv))
                            group by mi."memberId"),
            activity_data as (select a."memberId",
                                      a."segmentId",
                                      count(a.id)                                                          as "activityCount",
                                      max(a.timestamp)                                                     as "lastActive",
                                      array_agg(distinct concat(a.platform, ':', a.type))
                                      filter (where a.platform is not null)                                as "activityTypes",
                                      array_agg(distinct a.platform) filter (where a.platform is not null) as "activeOn",
                                      count(distinct a."timestamp"::date)                                  as "activeDaysCount",
                                      round(avg(
                                                    case
                                                        when (a.sentiment ->> 'sentiment'::text) is not null
                                                            then (a.sentiment ->> 'sentiment'::text)::double precision
                                                        else null::double precision
                                                        end)::numeric, 2)                                  as "averageSentiment"
                              from activities a
                              where a."memberId" in ($(ids:csv))
                              group by a."memberId", a."segmentId")
        select m.id,
              m."tenantId",
              ms."segmentId",
              m."displayName",
              m.attributes,
              m.emails,
              m.score,
              m."lastEnriched",
              m."joinedAt",
              m."manuallyCreated",
              m."createdAt",
              (m.reach -> 'total')::integer                      as "totalReach",
              coalesce(jsonb_array_length(m.contributions), 0)   as "numberOfOpenSourceContributions",

              ad."activeOn",
              ad."activityCount",
              ad."activityTypes",
              ad."activeDaysCount",
              ad."lastActive",
              ad."averageSentiment",

              i.identities,
              coalesce(mo.all_organizations, json_build_array()) as organizations,
              coalesce(mt.all_tags, json_build_array())          as tags,
              coalesce(tmd.to_merge_ids, array []::text[])       as "toMergeIds",
              coalesce(nmd.no_merge_ids, array []::text[])       as "noMergeIds"
        from "memberSegments" ms
                inner join members m on ms."memberId" = m.id
                inner join identities i on m.id = i."memberId"
                left join activity_data ad on ms."memberId" = ad."memberId" and ms."segmentId" = ad."segmentId"
                left join to_merge_data tmd on m.id = tmd."memberId"
                left join no_merge_data nmd on m.id = nmd."memberId"
                left join member_tags mt on ms."memberId" = mt."memberId"
                left join member_organizations mo on ms."memberId" = mo."memberId" and ms."segmentId" = mo."segmentId"
        where ms."memberId" in ($(ids:csv))
          and m."deletedAt" is null
          and (ad."memberId" is not null or m."manuallyCreated");`, {
            ids,
        });
        return results;
    }
    async markSynced(memberIds) {
        await this.db().none(`update members set "searchSyncedAt" = now() where id in ($(memberIds:csv))`, {
            memberIds,
        });
    }
    async checkMembersExists(tenantId, memberIds) {
        const results = await this.db().any(`
      select m.id
      from members m
      where m."tenantId" = $(tenantId ) and 
            m.id in ($(memberIds:csv)) and
            (
              exists (select 1 from activities where "memberId" = m.id) or
              m."manuallyCreated"
            ) and
            exists(select 1 from "memberIdentities" mi where mi."memberId" = m.id)
      `, {
            tenantId,
            memberIds,
        });
        return results.map((r) => r.id);
    }
}
exports.MemberRepository = MemberRepository;
//# sourceMappingURL=member.repo.js.map