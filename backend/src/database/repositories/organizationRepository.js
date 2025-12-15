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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importStar(require("lodash"));
const fast_levenshtein_1 = require("fast-levenshtein");
const validator_1 = __importDefault(require("validator"));
const opensearch_1 = require("@gitmesh/opensearch");
const common_1 = require("@gitmesh/common");
const types_1 = require("@gitmesh/types");
const sequelize_1 = __importStar(require("sequelize"));
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
const auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
const sequelizeFilterUtils_1 = __importDefault(require("../utils/sequelizeFilterUtils"));
const queryParser_1 = __importDefault(require("./filters/queryParser"));
const organizationSyncRemoteRepository_1 = __importDefault(require("./organizationSyncRemoteRepository"));
const isFeatureEnabled_1 = __importDefault(require("@/feature-flags/isFeatureEnabled"));
const segmentRepository_1 = __importDefault(require("./segmentRepository"));
const mergeActionsRepository_1 = require("./mergeActionsRepository");
const { Op } = sequelize_1.default;
class OrganizationRepository {
    static async filterByPayingTenant(tenantId, limit, options) {
        const database = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const query = `
    with org_activities as (select a."organizationId", count(a.id) as "orgActivityCount"
                        from activities a
                        where a."tenantId" = :tenantId
                          and a."deletedAt" is null
                        group by a."organizationId"
                        having count(id) > 0),
     identities as (select oi."organizationId", jsonb_agg(oi) as "identities"
                    from "organizationIdentities" oi
                    where oi."tenantId" = :tenantId
                    group by oi."organizationId")
    select org.id,
          i.identities,
          org."displayName",
          org."location",
          org."website",
          org."lastEnrichedAt",
          org."twitter",
          org."employees",
          org."size",
          org."founded",
          org."industry",
          org."naics",
          org."profiles",
          org."headline",
          org."ticker",
          org."type",
          org."address",
          org."geoLocation",
          org."employeeCountByCountry",
          org."twitter",
          org."linkedin",
          org."crunchbase",
          org."github",
          org."description",
          org."revenueRange",
          org."tags",
          org."affiliatedProfiles",
          org."allSubsidiaries",
          org."alternativeDomains",
          org."alternativeNames",
          org."averageEmployeeTenure",
          org."averageTenureByLevel",
          org."averageTenureByRole",
          org."directSubsidiaries",
          org."employeeChurnRate",
          org."employeeCountByMonth",
          org."employeeGrowthRate",
          org."employeeCountByMonthByLevel",
          org."employeeCountByMonthByRole",
          org."gicsSector",
          org."grossAdditionsByMonth",
          org."grossDeparturesByMonth",
          org."ultimateParent",
          org."immediateParent",
          activity."orgActivityCount"
    from "organizations" as org
            join org_activities activity on activity."organizationId" = org."id"
            join identities i on i."organizationId" = org.id
    where :tenantId = org."tenantId"
      and (org."lastEnrichedAt" is null or date_part('month', age(now(), org."lastEnrichedAt")) >= 6)
    order by org."lastEnrichedAt" asc, org."website", activity."orgActivityCount" desc, org."createdAt" desc
    limit :limit
    `;
        const orgs = await database.query(query, {
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
            replacements: {
                tenantId,
                limit,
            },
        });
        return orgs;
    }
    static async filterByActiveLastYear(tenantId, limit, options) {
        const database = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const query = `
    with org_activities as (select a."organizationId", count(a.id) as "orgActivityCount"
                        from activities a
                        where a."tenantId" = :tenantId
                          and a."deletedAt" is null
                          and a."createdAt" > (CURRENT_DATE - INTERVAL '1 year')
                        group by a."organizationId"
                        having count(id) > 0),
     identities as (select oi."organizationId", jsonb_agg(oi) as "identities"
                    from "organizationIdentities" oi
                    where oi."tenantId" = :tenantId
                    group by oi."organizationId")
    select org.id,
          i.identities,
          org."displayName",
          org."location",
          org."website",
          org."lastEnrichedAt",
          org."twitter",
          org."employees",
          org."size",
          org."founded",
          org."industry",
          org."naics",
          org."profiles",
          org."headline",
          org."ticker",
          org."type",
          org."address",
          org."geoLocation",
          org."employeeCountByCountry",
          org."twitter",
          org."linkedin",
          org."crunchbase",
          org."github",
          org."description",
          org."revenueRange",
          org."tags",
          org."affiliatedProfiles",
          org."allSubsidiaries",
          org."alternativeDomains",
          org."alternativeNames",
          org."averageEmployeeTenure",
          org."averageTenureByLevel",
          org."averageTenureByRole",
          org."directSubsidiaries",
          org."employeeChurnRate",
          org."employeeCountByMonth",
          org."employeeGrowthRate",
          org."employeeCountByMonthByLevel",
          org."employeeCountByMonthByRole",
          org."gicsSector",
          org."grossAdditionsByMonth",
          org."grossDeparturesByMonth",
          org."ultimateParent",
          org."immediateParent",
          activity."orgActivityCount"
    from "organizations" as org
            join org_activities activity on activity."organizationId" = org."id"
            join identities i on i."organizationId" = org.id
    where :tenantId = org."tenantId"
    order by org."lastEnrichedAt" asc, org."website", activity."orgActivityCount" desc, org."createdAt" desc
    limit :limit
    `;
        const orgs = await database.query(query, {
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
            replacements: {
                tenantId,
                limit,
            },
        });
        return orgs;
    }
    static async create(data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        if (!data.displayName) {
            data.displayName = data.identities[0].name;
        }
        const record = await options.database.organization.create(Object.assign(Object.assign({}, lodash_1.default.pick(data, [
            'displayName',
            'description',
            'emails',
            'phoneNumbers',
            'logo',
            'tags',
            'website',
            'location',
            'github',
            'twitter',
            'linkedin',
            'crunchbase',
            'employees',
            'revenueRange',
            'importHash',
            'isTeamOrganization',
            'employeeCountByCountry',
            'type',
            'ticker',
            'headline',
            'profiles',
            'naics',
            'industry',
            'founded',
            'size',
            'lastEnrichedAt',
            'manuallyCreated',
            'affiliatedProfiles',
            'allSubsidiaries',
            'alternativeDomains',
            'alternativeNames',
            'averageEmployeeTenure',
            'averageTenureByLevel',
            'averageTenureByRole',
            'directSubsidiaries',
            'employeeChurnRate',
            'employeeCountByMonth',
            'employeeGrowthRate',
            'employeeCountByMonthByLevel',
            'employeeCountByMonthByRole',
            'gicsSector',
            'grossAdditionsByMonth',
            'grossDeparturesByMonth',
            'ultimateParent',
            'immediateParent',
        ])), { tenantId: tenant.id, createdById: currentUser.id, updatedById: currentUser.id }), {
            transaction,
        });
        await record.setMembers(data.members || [], {
            transaction,
        });
        if (data.identities && data.identities.length > 0) {
            await OrganizationRepository.setIdentities(record.id, data.identities, options);
        }
        await OrganizationRepository.includeOrganizationToSegments(record.id, options);
        await this._createAuditLog(auditLogRepository_1.default.CREATE, record, data, options);
        return this.findById(record.id, options);
    }
    static async bulkUpdate(data, fields, options, isEnrichment = false) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        // Ensure every organization has a non-undefine primary ID
        const isValid = new Set(data.filter((org) => org.id).map((org) => org.id)).size !== data.length;
        if (isValid)
            return [];
        if (isEnrichment) {
            // Fetch existing organizations
            const existingOrgs = await options.database.organization.findAll({
                where: {
                    id: {
                        [options.database.Sequelize.Op.in]: data.map((org) => org.id),
                    },
                },
            });
            // Append new tags to existing tags instead of overwriting
            if (fields.includes('tags')) {
                // @ts-ignore
                data = data.map((org) => {
                    const existingOrg = existingOrgs.find((o) => o.id === org.id);
                    if (existingOrg && existingOrg.tags) {
                        // Merge existing and new tags without duplicates
                        const incomingTags = org.tags || [];
                        org.tags = lodash_1.default.uniq([...existingOrg.tags, ...incomingTags]);
                    }
                    return org;
                });
            }
        }
        // Using bulk insert to update on duplicate primary ID
        try {
            const orgs = await options.database.organization.bulkCreate(data, {
                fields: ['id', 'tenantId', ...fields],
                updateOnDuplicate: fields,
                returning: fields,
                transaction,
            });
            return orgs;
        }
        catch (error) {
            options.log.error('Error while bulk updating organizations!', error);
            throw error;
        }
    }
    static async checkIdentities(data, options, organizationId) {
        // convert non-existing weak identities to strong ones
        if (data.weakIdentities && data.weakIdentities.length > 0) {
            const strongNotOwnedIdentities = await OrganizationRepository.findIdentities(data.weakIdentities, options, organizationId);
            const strongIdentities = [];
            // find weak identities in the payload that doesn't exist as a strong identity yet
            for (const weakIdentity of data.weakIdentities) {
                if (!strongNotOwnedIdentities.has(`${weakIdentity.platform}:${weakIdentity.name}`)) {
                    strongIdentities.push(weakIdentity);
                }
            }
            // exclude identities that are converted to a strong one from weakIdentities
            if (strongIdentities.length > 0) {
                data.weakIdentities = data.weakIdentities.filter((i) => strongIdentities.find((s) => s.platform === i.platform && s.name === i.name) ===
                    undefined);
                // push new strong identities to the payload
                for (const identity of strongIdentities) {
                    if (data.identities.find((i) => i.platform === identity.platform && i.name === identity.name) === undefined) {
                        data.identities.push(identity);
                    }
                }
            }
        }
        // convert already existing strong identities to weak ones
        if (data.identities && data.identities.length > 0) {
            const strongNotOwnedIdentities = await OrganizationRepository.findIdentities(data.identities, options, organizationId);
            const weakIdentities = [];
            // find strong identities in payload that already exist in some other organization, and convert these to weak
            for (const identity of data.identities) {
                if (strongNotOwnedIdentities.has(`${identity.platform}:${identity.name}`)) {
                    weakIdentities.push(identity);
                }
            }
            // exclude identities that are converted to a weak one from strong identities
            if (weakIdentities.length > 0) {
                data.identities = data.identities.filter((i) => weakIdentities.find((w) => w.platform === i.platform && w.name === i.name) ===
                    undefined);
                // push new weak identities to the payload
                for (const weakIdentity of weakIdentities) {
                    if (!data.weakIdentities) {
                        data.weakIdentities = [];
                    }
                    if (data.weakIdentities.find((w) => w.platform === weakIdentity.platform && w.name === weakIdentity.name) === undefined) {
                        data.weakIdentities.push(weakIdentity);
                    }
                }
            }
        }
    }
    static async includeOrganizationToSegments(organizationId, options) {
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        let bulkInsertOrganizationSegments = `INSERT INTO "organizationSegments" ("organizationId","segmentId", "tenantId", "createdAt") VALUES `;
        const replacements = {
            organizationId,
            tenantId: options.currentTenant.id,
        };
        for (let idx = 0; idx < options.currentSegments.length; idx++) {
            bulkInsertOrganizationSegments += ` (:organizationId, :segmentId${idx}, :tenantId, now()) `;
            replacements[`segmentId${idx}`] = options.currentSegments[idx].id;
            if (idx !== options.currentSegments.length - 1) {
                bulkInsertOrganizationSegments += `,`;
            }
        }
        bulkInsertOrganizationSegments += ` ON CONFLICT DO NOTHING`;
        await seq.query(bulkInsertOrganizationSegments, {
            replacements,
            type: sequelize_1.QueryTypes.INSERT,
            transaction,
        });
    }
    static async excludeOrganizationsFromSegments(organizationIds, options) {
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const bulkDeleteOrganizationSegments = `DELETE FROM "organizationSegments" WHERE "organizationId" in (:organizationIds) and "segmentId" in (:segmentIds);`;
        await seq.query(bulkDeleteOrganizationSegments, {
            replacements: {
                organizationIds,
                segmentIds: sequelizeRepository_1.default.getSegmentIds(options),
            },
            type: sequelize_1.QueryTypes.DELETE,
            transaction,
        });
    }
    static async excludeOrganizationsFromAllSegments(organizationIds, options) {
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const bulkDeleteOrganizationSegments = `DELETE FROM "organizationSegments" WHERE "organizationId" in (:organizationIds);`;
        await seq.query(bulkDeleteOrganizationSegments, {
            replacements: {
                organizationIds,
            },
            type: sequelize_1.QueryTypes.DELETE,
            transaction,
        });
    }
    static async removeMemberRole(role, options) {
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        let deleteMemberRole = `DELETE FROM "memberOrganizations" 
                                            WHERE 
                                            "organizationId" = :organizationId and 
                                            "memberId" = :memberId`;
        const replacements = {
            organizationId: role.organizationId,
            memberId: role.memberId,
        };
        if (role.dateStart === null) {
            deleteMemberRole += ` and "dateStart" is null `;
        }
        else {
            deleteMemberRole += ` and "dateStart" = :dateStart `;
            replacements.dateStart = role.dateStart.toISOString();
        }
        if (role.dateEnd === null) {
            deleteMemberRole += ` and "dateEnd" is null `;
        }
        else {
            deleteMemberRole += ` and "dateEnd" = :dateEnd `;
            replacements.dateEnd = role.dateEnd.toISOString();
        }
        await seq.query(deleteMemberRole, {
            replacements,
            type: sequelize_1.QueryTypes.DELETE,
            transaction,
        });
    }
    static async addMemberRole(role, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const sequelize = sequelizeRepository_1.default.getSequelize(options);
        const query = `
          insert into "memberOrganizations" ("memberId", "organizationId", "createdAt", "updatedAt", "title", "dateStart", "dateEnd", "source")
          values (:memberId, :organizationId, NOW(), NOW(), :title, :dateStart, :dateEnd, :source)
          on conflict do nothing;
    `;
        await sequelize.query(query, {
            replacements: {
                memberId: role.memberId,
                organizationId: role.organizationId,
                title: role.title || null,
                dateStart: role.dateStart,
                dateEnd: role.dateEnd,
                source: role.source || null,
            },
            type: sequelize_1.QueryTypes.INSERT,
            transaction,
        });
    }
    static async update(id, data, options, overrideIdentities = false) {
        var _a;
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        let record = await options.database.organization.findOne({
            where: {
                id,
                tenantId: currentTenant.id,
            },
            transaction,
        });
        if (!record) {
            throw new common_1.Error404();
        }
        // exclude syncRemote attributes, since these are populated from organizationSyncRemote table
        if ((_a = data.attributes) === null || _a === void 0 ? void 0 : _a.syncRemote) {
            delete data.attributes.syncRemote;
        }
        record = await record.update(Object.assign(Object.assign({}, lodash_1.default.pick(data, [
            'displayName',
            'description',
            'emails',
            'phoneNumbers',
            'logo',
            'tags',
            'website',
            'location',
            'github',
            'twitter',
            'linkedin',
            'crunchbase',
            'employees',
            'revenueRange',
            'importHash',
            'isTeamOrganization',
            'employeeCountByCountry',
            'type',
            'ticker',
            'headline',
            'profiles',
            'naics',
            'industry',
            'founded',
            'size',
            'employees',
            'twitter',
            'lastEnrichedAt',
            'affiliatedProfiles',
            'allSubsidiaries',
            'alternativeDomains',
            'alternativeNames',
            'averageEmployeeTenure',
            'averageTenureByLevel',
            'averageTenureByRole',
            'directSubsidiaries',
            'employeeChurnRate',
            'employeeCountByMonth',
            'employeeGrowthRate',
            'employeeCountByMonthByLevel',
            'employeeCountByMonthByRole',
            'gicsSector',
            'grossAdditionsByMonth',
            'grossDeparturesByMonth',
            'ultimateParent',
            'immediateParent',
            'attributes',
            'weakIdentities',
        ])), { updatedById: currentUser.id }), {
            transaction,
        });
        if (data.members) {
            await record.setMembers(data.members || [], {
                transaction,
            });
        }
        if (data.isTeamOrganization === true ||
            data.isTeamOrganization === 'true' ||
            data.isTeamOrganization === false ||
            data.isTeamOrganization === 'false') {
            await this.setOrganizationIsTeam(record.id, data.isTeamOrganization, options);
        }
        if (data.segments) {
            await OrganizationRepository.includeOrganizationToSegments(record.id, options);
        }
        if (data.identities && data.identities.length > 0) {
            if (overrideIdentities) {
                await this.setIdentities(id, data.identities, options);
            }
            else {
                for (const identity of data.identities) {
                    await this.addIdentity(id, identity, options);
                }
            }
        }
        await this._createAuditLog(auditLogRepository_1.default.UPDATE, record, data, options);
        return this.findById(record.id, options);
    }
    /**
     * Marks/unmarks an organization's members as team members
     * @param organizationId
     * @param isTeam
     * @param options
     */
    static async setOrganizationIsTeam(organizationId, isTeam, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        await options.database.sequelize.query(`update members as m
      set attributes = jsonb_set("attributes", '{isTeamMember}', '{"default": ${isTeam}}'::jsonb)
      from "memberOrganizations" as mo
      where mo."memberId" = m.id
      and mo."organizationId" = :organizationId
      and mo."deletedAt" is null
      and m."tenantId" = :tenantId;
   `, {
            replacements: {
                isTeam,
                organizationId,
                tenantId: options.currentTenant.id,
            },
            type: sequelize_1.QueryTypes.UPDATE,
            transaction,
        });
    }
    static async destroy(id, options, force = false, destroyIfOnlyNoSegmentsLeft = true) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.organization.findOne({
            where: {
                id,
                tenantId: currentTenant.id,
            },
            transaction,
        });
        if (!record) {
            throw new common_1.Error404();
        }
        if (destroyIfOnlyNoSegmentsLeft) {
            await OrganizationRepository.excludeOrganizationsFromSegments([id], Object.assign(Object.assign({}, options), { transaction }));
            const org = await this.findById(id, options);
            if (org.segments.length === 0) {
                await record.destroy({
                    transaction,
                    force,
                });
            }
        }
        else {
            await OrganizationRepository.excludeOrganizationsFromAllSegments([id], Object.assign(Object.assign({}, options), { transaction }));
            await record.destroy({
                transaction,
                force,
            });
        }
        await this._createAuditLog(auditLogRepository_1.default.DELETE, record, record, options);
    }
    static async setIdentities(organizationId, identities, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const sequelize = sequelizeRepository_1.default.getSequelize(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        await sequelize.query(`delete from "organizationIdentities" where "organizationId" = :organizationId and "tenantId" = :tenantId`, {
            replacements: {
                organizationId,
                tenantId: currentTenant.id,
            },
            type: sequelize_1.QueryTypes.DELETE,
            transaction,
        });
        for (const identity of identities) {
            await OrganizationRepository.addIdentity(organizationId, identity, options);
        }
    }
    static async addIdentity(organizationId, identity, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const sequelize = sequelizeRepository_1.default.getSequelize(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const query = `
          insert into 
              "organizationIdentities"("organizationId", "platform", "name", "url", "sourceId", "tenantId", "integrationId", "createdAt")
          values 
              (:organizationId, :platform, :name, :url, :sourceId, :tenantId, :integrationId, now())
          on conflict do nothing;
    `;
        await sequelize.query(query, {
            replacements: {
                organizationId,
                platform: identity.platform,
                sourceId: identity.sourceId || null,
                url: identity.url || null,
                tenantId: currentTenant.id,
                integrationId: identity.integrationId || null,
                name: identity.name,
            },
            type: sequelize_1.QueryTypes.INSERT,
            transaction,
        });
    }
    static async getIdentities(organizationIds, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const sequelize = sequelizeRepository_1.default.getSequelize(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const results = await sequelize.query(`
      select "sourceId", "platform", "name", "integrationId", "organizationId" from "organizationIdentities"
      where "tenantId" = :tenantId and "organizationId" in (:organizationIds) 
    `, {
            replacements: {
                organizationIds,
                tenantId: currentTenant.id,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return results;
    }
    static async moveIdentitiesBetweenOrganizations(fromOrganizationId, toOrganizationId, identitiesToMove, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const query = `
      update "organizationIdentities" 
      set 
        "organizationId" = :newOrganizationId
      where 
        "tenantId" = :tenantId and 
        "organizationId" = :oldOrganizationId and 
        platform = :platform and 
        name = :name;
    `;
        for (const identity of identitiesToMove) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [_, count] = await seq.query(query, {
                replacements: {
                    tenantId: tenant.id,
                    oldOrganizationId: fromOrganizationId,
                    newOrganizationId: toOrganizationId,
                    platform: identity.platform,
                    name: identity.name,
                },
                type: sequelize_1.QueryTypes.UPDATE,
                transaction,
            });
            if (count !== 1) {
                throw new Error('One row should be updated!');
            }
        }
    }
    static async addNoMerge(organizationId, noMergeId, options) {
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const query = `
    insert into "organizationNoMerge" ("organizationId", "noMergeId", "createdAt", "updatedAt")
    values 
    (:organizationId, :noMergeId, now(), now()),
    (:noMergeId, :organizationId, now(), now())
    on conflict do nothing;
  `;
        try {
            await seq.query(query, {
                replacements: {
                    organizationId,
                    noMergeId,
                },
                type: sequelize_1.QueryTypes.INSERT,
                transaction,
            });
        }
        catch (error) {
            options.log.error('Error adding organizations no merge!', error);
            throw error;
        }
    }
    static async removeToMerge(organizationId, toMergeId, options) {
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const query = `
    delete from "organizationToMerge"
    where ("organizationId" = :organizationId and "toMergeId" = :toMergeId) or ("organizationId" = :toMergeId and "toMergeId" = :organizationId);
  `;
        try {
            await seq.query(query, {
                replacements: {
                    organizationId,
                    toMergeId,
                },
                type: sequelize_1.QueryTypes.DELETE,
                transaction,
            });
        }
        catch (error) {
            options.log.error('Error while removing organizations to merge!', error);
            throw error;
        }
    }
    static async findNonExistingIds(ids, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        let idValues = ``;
        for (let i = 0; i < ids.length; i++) {
            idValues += `('${ids[i]}'::uuid)`;
            if (i !== ids.length - 1) {
                idValues += ',';
            }
        }
        const query = `WITH id_list (id) AS (
      VALUES
          ${idValues}
        )
        SELECT id
        FROM id_list
        WHERE NOT EXISTS (
            SELECT 1
            FROM organizations o
            WHERE o.id = id_list.id
        );`;
        try {
            const results = await seq.query(query, {
                type: sequelize_1.QueryTypes.SELECT,
                transaction,
            });
            return results.map((r) => r.id);
        }
        catch (error) {
            options.log.error('error while getting non existing organizations from db', error);
            throw error;
        }
    }
    static async findNoMergeIds(id, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const query = `select onm."organizationId", onm."noMergeId" from "organizationNoMerge" onm
                  where onm."organizationId" = :id or onm."noMergeId" = :id;`;
        try {
            const results = await seq.query(query, {
                type: sequelize_1.QueryTypes.SELECT,
                replacements: {
                    id,
                },
                transaction,
            });
            return Array.from(results.reduce((acc, r) => {
                if (id === r.organizationId) {
                    acc.add(r.noMergeId);
                }
                else if (id === r.noMergeId) {
                    acc.add(r.organizationId);
                }
                return acc;
            }, new Set()));
        }
        catch (error) {
            options.log.error('error while getting non existing organizations from db', error);
            throw error;
        }
    }
    static async addToMerge(suggestions, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        // Remove possible duplicates
        suggestions = lodash_1.default.uniqWith(suggestions, (a, b) => lodash_1.default.isEqual(lodash_1.default.sortBy(a.organizations), lodash_1.default.sortBy(b.organizations)));
        // check all suggestion ids exists in the db
        const uniqueOrganizationIds = Array.from(suggestions.reduce((acc, suggestion) => {
            acc.add(suggestion.organizations[0]);
            acc.add(suggestion.organizations[1]);
            return acc;
        }, new Set()));
        // filter non existing org ids from suggestions
        const nonExistingIds = await OrganizationRepository.findNonExistingIds(uniqueOrganizationIds, options);
        suggestions = suggestions.filter((s) => !nonExistingIds.includes(s.organizations[0]) &&
            !nonExistingIds.includes(s.organizations[1]));
        // Process suggestions in chunks of 100 or less
        const suggestionChunks = (0, lodash_1.chunk)(suggestions, 100);
        const insertValues = (organizationId, toMergeId, similarity, index) => {
            const idPlaceholder = (key) => `${key}${index}`;
            return {
                query: `(:${idPlaceholder('organizationId')}, :${idPlaceholder('toMergeId')}, :${idPlaceholder('similarity')}, NOW(), NOW())`,
                replacements: {
                    [idPlaceholder('organizationId')]: organizationId,
                    [idPlaceholder('toMergeId')]: toMergeId,
                    [idPlaceholder('similarity')]: similarity === null ? null : similarity,
                },
            };
        };
        for (const suggestionChunk of suggestionChunks) {
            const placeholders = [];
            let replacements = {};
            suggestionChunk.forEach((suggestion, index) => {
                const { query, replacements: chunkReplacements } = insertValues(suggestion.organizations[0], suggestion.organizations[1], suggestion.similarity, index);
                placeholders.push(query);
                replacements = Object.assign(Object.assign({}, replacements), chunkReplacements);
            });
            const query = `
        INSERT INTO "organizationToMerge" ("organizationId", "toMergeId", "similarity", "createdAt", "updatedAt")
        VALUES ${placeholders.join(', ')}
        on conflict do nothing;
      `;
            try {
                await seq.query(query, {
                    replacements,
                    type: sequelize_1.QueryTypes.INSERT,
                    transaction,
                });
            }
            catch (error) {
                options.log.error('error adding organizations to merge', error);
                throw error;
            }
        }
    }
    static async findMembersBelongToBothOrganizations(organizationId1, organizationId2, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const sequelize = sequelizeRepository_1.default.getSequelize(options);
        const results = await sequelize.query(`
      SELECT  mo.*
      FROM "memberOrganizations" AS mo
      WHERE mo."deletedAt" is null and
         mo."memberId" IN (
          SELECT "memberId"
          FROM "memberOrganizations"
          WHERE "organizationId" = :organizationId1
      )
      AND mo."memberId" IN (
          SELECT "memberId"
          FROM "memberOrganizations"
          WHERE "organizationId" = :organizationId2);
    `, {
            replacements: {
                organizationId1,
                organizationId2,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return results;
    }
    static async moveActivitiesBetweenOrganizations(fromOrganizationId, toOrganizationId, options, batchSize = 10000) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        let updatedRowsCount = 0;
        do {
            options.log.info(`[Move Activities] - Moving maximum of ${batchSize} activities from ${fromOrganizationId} to ${toOrganizationId}.`);
            const query = `
        UPDATE "activities" 
        SET "organizationId" = :newOrganizationId
        WHERE id IN (
          SELECT id 
          FROM "activities" 
          WHERE "tenantId" = :tenantId 
            AND "organizationId" = :oldOrganizationId
          LIMIT :limit
        )
      `;
            const [, rowCount] = await seq.query(query, {
                replacements: {
                    tenantId: tenant.id,
                    oldOrganizationId: fromOrganizationId,
                    newOrganizationId: toOrganizationId,
                    limit: batchSize,
                },
                type: sequelize_1.QueryTypes.UPDATE,
                transaction,
            });
            updatedRowsCount = rowCount !== null && rowCount !== void 0 ? rowCount : 0;
        } while (updatedRowsCount === batchSize);
    }
    static getMergeSuggestions(options) {
        var _a, _b, _c, _d;
        return __asyncGenerator(this, arguments, function* getMergeSuggestions_1() {
            const BATCH_SIZE = 100;
            const YIELD_CHUNK_SIZE = 100;
            let yieldChunk = [];
            const prefixLength = (string) => {
                if (string.length > 5 && string.length < 8) {
                    return 6;
                }
                return 10;
            };
            const calculateSimilarity = (primaryOrganization, similarOrganization) => {
                let smallestEditDistance = null;
                let similarPrimaryIdentity = null;
                // find the smallest edit distance between both identity arrays
                for (const primaryIdentity of primaryOrganization._source.nested_identities) {
                    // similar organization has a weakIdentity as one of primary organization's strong identity, return score 95
                    if (similarOrganization._source.nested_weakIdentities.length > 0 &&
                        similarOrganization._source.nested_weakIdentities.some((weakIdentity) => weakIdentity.string_name === primaryIdentity.string_name &&
                            weakIdentity.string_platform === primaryIdentity.string_platform)) {
                        return 0.95;
                    }
                    for (const secondaryIdentity of similarOrganization._source.nested_identities) {
                        const currentLevenstheinDistance = (0, fast_levenshtein_1.get)(primaryIdentity.string_name, secondaryIdentity.string_name);
                        if (smallestEditDistance === null || smallestEditDistance > currentLevenstheinDistance) {
                            smallestEditDistance = currentLevenstheinDistance;
                            similarPrimaryIdentity = primaryIdentity;
                        }
                    }
                }
                // calculate similarity percentage
                const identityLength = similarPrimaryIdentity.string_name.length;
                if (identityLength < smallestEditDistance) {
                    // if levensthein distance is bigger than the word itself, it might be a prefix match, return medium similarity
                    return (Math.floor(Math.random() * 21) + 20) / 100;
                }
                return Math.floor(((identityLength - smallestEditDistance) / identityLength) * 100) / 100;
            };
            const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
            const queryBody = {
                from: 0,
                size: BATCH_SIZE,
                query: {},
                sort: {
                    [`uuid_organizationId`]: 'asc',
                },
                collapse: {
                    field: 'uuid_organizationId',
                },
                _source: ['uuid_organizationId', 'nested_identities', 'uuid_arr_noMergeIds'],
            };
            let organizations = [];
            let lastUuid;
            do {
                if (organizations.length > 0) {
                    queryBody.query = {
                        bool: {
                            filter: [
                                {
                                    bool: {
                                        should: [
                                            {
                                                range: {
                                                    int_activityCount: {
                                                        gt: 0,
                                                    },
                                                },
                                            },
                                            {
                                                term: {
                                                    bool_manuallyCreated: true,
                                                },
                                            },
                                        ],
                                        minimum_should_match: 1,
                                    },
                                },
                                {
                                    term: {
                                        uuid_tenantId: tenant.id,
                                    },
                                },
                                {
                                    range: {
                                        uuid_organizationId: {
                                            gt: lastUuid,
                                        },
                                    },
                                },
                            ],
                        },
                    };
                }
                else {
                    queryBody.query = {
                        bool: {
                            filter: [
                                {
                                    bool: {
                                        should: [
                                            {
                                                range: {
                                                    int_activityCount: {
                                                        gt: 0,
                                                    },
                                                },
                                            },
                                            {
                                                term: {
                                                    bool_manuallyCreated: true,
                                                },
                                            },
                                        ],
                                        minimum_should_match: 1,
                                    },
                                },
                                {
                                    term: {
                                        uuid_tenantId: tenant.id,
                                    },
                                },
                            ],
                        },
                    };
                }
                organizations =
                    ((_b = (_a = (yield __await(options.opensearch.search({
                        index: types_1.OpenSearchIndex.ORGANIZATIONS,
                        body: queryBody,
                    }))).body) === null || _a === void 0 ? void 0 : _a.hits) === null || _b === void 0 ? void 0 : _b.hits) || [];
                if (organizations.length > 0) {
                    lastUuid = organizations[organizations.length - 1]._source.uuid_organizationId;
                }
                for (const organization of organizations) {
                    if (organization._source.nested_identities &&
                        organization._source.nested_identities.length > 0) {
                        const identitiesPartialQuery = {
                            should: [
                                {
                                    nested: {
                                        path: 'nested_weakIdentities',
                                        query: {
                                            bool: {
                                                should: [],
                                                boost: 1000,
                                                minimum_should_match: 1,
                                            },
                                        },
                                    },
                                },
                                {
                                    nested: {
                                        path: 'nested_identities',
                                        query: {
                                            bool: {
                                                should: [],
                                                boost: 1,
                                                minimum_should_match: 1,
                                            },
                                        },
                                    },
                                },
                            ],
                            minimum_should_match: 1,
                            must_not: [
                                {
                                    term: {
                                        uuid_organizationId: organization._source.uuid_organizationId,
                                    },
                                },
                            ],
                            must: [
                                {
                                    term: {
                                        uuid_tenantId: tenant.id,
                                    },
                                },
                                {
                                    bool: {
                                        should: [
                                            {
                                                range: {
                                                    int_activityCount: {
                                                        gt: 0,
                                                    },
                                                },
                                            },
                                            {
                                                term: {
                                                    bool_manuallyCreated: true,
                                                },
                                            },
                                        ],
                                        minimum_should_match: 1,
                                    },
                                },
                            ],
                        };
                        let hasFuzzySearch = false;
                        for (const identity of organization._source.nested_identities) {
                            if (identity.string_name.length > 0) {
                                // weak identity search
                                identitiesPartialQuery.should[0].nested.query.bool.should.push({
                                    bool: {
                                        must: [
                                            { match: { [`nested_weakIdentities.keyword_name`]: identity.string_name } },
                                            {
                                                match: {
                                                    [`nested_weakIdentities.string_platform`]: identity.string_platform,
                                                },
                                            },
                                        ],
                                    },
                                });
                                // some identities have https? in the beginning, resulting in false positive suggestions
                                // remove these when making fuzzy, wildcard and prefix searches
                                const cleanedIdentityName = identity.string_name.replace(/^https?:\/\//, '');
                                // only do fuzzy/wildcard/partial search when identity name is not all numbers (like linkedin organization profiles)
                                if (Number.isNaN(Number(identity.string_name))) {
                                    hasFuzzySearch = true;
                                    // fuzzy search for identities
                                    identitiesPartialQuery.should[1].nested.query.bool.should.push({
                                        match: {
                                            [`nested_identities.keyword_name`]: {
                                                query: cleanedIdentityName,
                                                prefix_length: 1,
                                                fuzziness: 'auto',
                                            },
                                        },
                                    });
                                    // also check for prefix for identities that has more than 5 characters and no whitespace
                                    if (identity.string_name.length > 5 && identity.string_name.indexOf(' ') === -1) {
                                        identitiesPartialQuery.should[1].nested.query.bool.should.push({
                                            prefix: {
                                                [`nested_identities.keyword_name`]: {
                                                    value: cleanedIdentityName.slice(0, prefixLength(cleanedIdentityName)),
                                                },
                                            },
                                        });
                                    }
                                }
                            }
                        }
                        // check if we have any actual identity searches, if not remove it from the query
                        if (!hasFuzzySearch) {
                            identitiesPartialQuery.should.pop();
                        }
                        const noMergeIds = yield __await(OrganizationRepository.findNoMergeIds(organization._source.uuid_organizationId, options));
                        if (noMergeIds && noMergeIds.length > 0) {
                            for (const noMergeId of noMergeIds) {
                                identitiesPartialQuery.must_not.push({
                                    term: {
                                        uuid_organizationId: noMergeId,
                                    },
                                });
                            }
                        }
                        const sameOrganizationsQueryBody = {
                            query: {
                                bool: identitiesPartialQuery,
                            },
                            collapse: {
                                field: 'uuid_organizationId',
                            },
                            _source: ['uuid_organizationId', 'nested_identities', 'nested_weakIdentities'],
                        };
                        const organizationsToMerge = ((_d = (_c = (yield __await(options.opensearch.search({
                            index: types_1.OpenSearchIndex.ORGANIZATIONS,
                            body: sameOrganizationsQueryBody,
                        }))).body) === null || _c === void 0 ? void 0 : _c.hits) === null || _d === void 0 ? void 0 : _d.hits) || [];
                        for (const organizationToMerge of organizationsToMerge) {
                            yieldChunk.push({
                                similarity: calculateSimilarity(organization, organizationToMerge),
                                organizations: [
                                    organization._source.uuid_organizationId,
                                    organizationToMerge._source.uuid_organizationId,
                                ],
                            });
                        }
                        if (yieldChunk.length >= YIELD_CHUNK_SIZE) {
                            yield yield __await(yieldChunk);
                            yieldChunk = [];
                        }
                    }
                }
            } while (organizations.length > 0);
            if (yieldChunk.length > 0) {
                yield yield __await(yieldChunk);
            }
        });
    }
    static async findOrganizationsWithMergeSuggestions({ limit = 20, offset = 0 }, options) {
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const segmentIds = sequelizeRepository_1.default.getSegmentIds(options);
        const orgs = await options.database.sequelize.query(`WITH
      cte AS (
        SELECT
          Greatest(Hashtext(Concat(org.id, otm."toMergeId")), Hashtext(Concat(otm."toMergeId", org.id))) as hash,
          org.id,
          otm."toMergeId",
          org."createdAt",
          otm."similarity"
        FROM organizations org
        JOIN "organizationToMerge" otm ON org.id = otm."organizationId"
        JOIN "organizationSegments" os ON os."organizationId" = org.id
        JOIN "organizationSegments" to_merge_segments on to_merge_segments."organizationId" = otm."toMergeId"
        LEFT JOIN "mergeActions" ma
          ON ma.type = :mergeActionType
          AND ma."tenantId" = :tenantId
          AND (
            (ma."primaryId" = org.id AND ma."secondaryId" = otm."toMergeId")
            OR (ma."primaryId" = otm."toMergeId" AND ma."secondaryId" = org.id)
          )
        WHERE org."tenantId" = :tenantId
          AND os."segmentId" IN (:segmentIds)
          AND to_merge_segments."segmentId" IN (:segmentIds)
          AND (ma.id IS NULL OR ma.state = :mergeActionStatus)
      ),
      
      count_cte AS (
        SELECT COUNT(DISTINCT hash) AS total_count
        FROM cte
      ),
      
      final_select AS (
        SELECT DISTINCT ON (hash)
          id,
          "toMergeId",
          "createdAt",
          "similarity"
        FROM cte
        ORDER BY hash, id
      )
      
      SELECT
        "organizationsToMerge".id,
        "organizationsToMerge"."toMergeId",
        count_cte."total_count",
        "organizationsToMerge"."similarity"
      FROM
        final_select AS "organizationsToMerge",
        count_cte
      ORDER BY
        "organizationsToMerge"."similarity" DESC, "organizationsToMerge".id
      LIMIT :limit OFFSET :offset
    `, {
            replacements: {
                tenantId: currentTenant.id,
                segmentIds,
                limit,
                offset,
                mergeActionType: mergeActionsRepository_1.MergeActionType.ORG,
                mergeActionStatus: mergeActionsRepository_1.MergeActionState.ERROR,
            },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (orgs.length > 0) {
            const organizationPromises = [];
            const toMergePromises = [];
            for (const org of orgs) {
                organizationPromises.push(OrganizationRepository.findById(org.id, options));
                toMergePromises.push(OrganizationRepository.findById(org.toMergeId, options));
            }
            const organizationResults = await Promise.all(organizationPromises);
            const organizationToMergeResults = await Promise.all(toMergePromises);
            const result = organizationResults.map((i, idx) => ({
                organizations: [i, organizationToMergeResults[idx]],
                similarity: orgs[idx].similarity,
            }));
            return { rows: result, count: orgs[0].total_count, limit, offset };
        }
        return { rows: [{ organizations: [], similarity: 0 }], count: 0, limit, offset };
    }
    static async moveMembersBetweenOrganizations(fromOrganizationId, toOrganizationId, options) {
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        let removeRoles = [];
        let addRoles = [];
        // first, handle members that belong to both organizations,
        // then make a full update on remaining org2 members (that doesn't belong to o1)
        const memberRolesWithBothOrganizations = await this.findMembersBelongToBothOrganizations(fromOrganizationId, toOrganizationId, options);
        const primaryOrganizationMemberRoles = memberRolesWithBothOrganizations.filter((m) => m.organizationId === toOrganizationId);
        const secondaryOrganizationMemberRoles = memberRolesWithBothOrganizations.filter((m) => m.organizationId === fromOrganizationId);
        for (const memberOrganization of secondaryOrganizationMemberRoles) {
            // if dateEnd and dateStart isn't available, we don't need to move but delete it from org2
            if (memberOrganization.dateStart === null && memberOrganization.dateEnd === null) {
                removeRoles.push(memberOrganization);
            }
            // it's a current role, also check org1 to see which one starts earlier
            else if (memberOrganization.dateStart !== null && memberOrganization.dateEnd === null) {
                const currentRoles = primaryOrganizationMemberRoles.filter((mo) => mo.memberId === memberOrganization.memberId &&
                    mo.dateStart !== null &&
                    mo.dateEnd === null);
                if (currentRoles.length === 0) {
                    // no current role in org1, add the memberOrganization to org1
                    addRoles.push(memberOrganization);
                }
                else if (currentRoles.length === 1) {
                    const currentRole = currentRoles[0];
                    if (new Date(memberOrganization.dateStart) <= new Date(currentRoles[0].dateStart)) {
                        // add a new role with earlier dateStart
                        addRoles.push({
                            id: currentRole.id,
                            dateStart: memberOrganization.dateStart.toISOString(),
                            dateEnd: null,
                            memberId: currentRole.memberId,
                            organizationId: currentRole.organizationId,
                            title: currentRole.title,
                            source: currentRole.source,
                        });
                        // remove current role
                        removeRoles.push(currentRole);
                    }
                    // delete role from org2
                    removeRoles.push(memberOrganization);
                }
                else {
                    throw new Error(`Member ${memberOrganization.memberId} has more than one current roles.`);
                }
            }
            else if (memberOrganization.dateStart === null && memberOrganization.dateEnd !== null) {
                throw new Error(`Member organization with dateEnd and without dateStart!`);
            }
            else {
                // both dateStart and dateEnd exists
                const foundIntersectingRoles = primaryOrganizationMemberRoles.filter((mo) => {
                    const primaryStart = new Date(mo.dateStart);
                    const primaryEnd = new Date(mo.dateEnd);
                    const secondaryStart = new Date(memberOrganization.dateStart);
                    const secondaryEnd = new Date(memberOrganization.dateEnd);
                    return (mo.memberId === memberOrganization.memberId &&
                        mo.dateStart !== null &&
                        mo.dateEnd !== null &&
                        ((secondaryStart < primaryStart && secondaryEnd > primaryStart) ||
                            (primaryStart < secondaryStart && secondaryEnd < primaryEnd) ||
                            (secondaryStart < primaryStart && secondaryEnd > primaryEnd) ||
                            (primaryStart < secondaryStart && secondaryEnd > primaryEnd)));
                });
                // rebuild dateRanges using intersecting roles coming from primary and secondary organizations
                const startDates = [...foundIntersectingRoles, memberOrganization].map((org) => new Date(org.dateStart).getTime());
                const endDates = [...foundIntersectingRoles, memberOrganization].map((org) => new Date(org.dateEnd).getTime());
                addRoles.push({
                    dateStart: new Date(Math.min.apply(null, startDates)).toISOString(),
                    dateEnd: new Date(Math.max.apply(null, endDates)).toISOString(),
                    memberId: memberOrganization.memberId,
                    organizationId: toOrganizationId,
                    title: foundIntersectingRoles.length > 0
                        ? foundIntersectingRoles[0].title
                        : memberOrganization.title,
                    source: foundIntersectingRoles.length > 0
                        ? foundIntersectingRoles[0].source
                        : memberOrganization.source,
                });
                // we'll delete all roles that intersect with incoming org member roles and create a merged role
                for (const r of foundIntersectingRoles) {
                    removeRoles.push(r);
                }
            }
            for (const removeRole of removeRoles) {
                await this.removeMemberRole(removeRole, options);
            }
            for (const addRole of addRoles) {
                await this.addMemberRole(addRole, options);
            }
            addRoles = [];
            removeRoles = [];
        }
        // update rest of the o2 members
        const remainingRoles = (await seq.query(`
        SELECT *
        FROM "memberOrganizations"
        WHERE "organizationId" = :fromOrganizationId 
        AND "deletedAt" IS NULL
        AND "memberId" NOT IN (
            SELECT "memberId" 
            FROM "memberOrganizations" 
            WHERE "organizationId" = :toOrganizationId
            AND "deletedAt" IS NULL
        );
      `, {
            replacements: {
                toOrganizationId,
                fromOrganizationId,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        }));
        for (const role of remainingRoles) {
            await this.removeMemberRole(role, options);
            await this.addMemberRole({
                title: role.title,
                dateStart: role.dateStart,
                dateEnd: role.dateEnd,
                memberId: role.memberId,
                organizationId: toOrganizationId,
                source: role.source,
                deletedAt: role.deletedAt,
            }, options);
        }
    }
    static async getOrganizationSegments(organizationId, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const segmentRepository = new segmentRepository_1.default(options);
        const query = `
        SELECT "segmentId"
        FROM "organizationSegments"
        WHERE "organizationId" = :organizationId
        ORDER BY "createdAt";
    `;
        const data = await seq.query(query, {
            replacements: {
                organizationId,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        const segmentIds = data.map((item) => item.segmentId);
        const segments = await segmentRepository.findInIds(segmentIds);
        return segments;
    }
    static async findByIdentity(identity, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const sequelize = sequelizeRepository_1.default.getSequelize(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const results = await sequelize.query(`
      with
          "organizationsWithIdentity" as (
              select oi."organizationId"
              from "organizationIdentities" oi
              where 
                    oi.platform = :platform
                    and oi.name = :name
          )
          select o.id,
                  o.description,
                  o.emails,
                  o.logo,
                  o.tags,
                  o.github,
                  o.twitter,
                  o.linkedin,
                  o.crunchbase,
                  o.employees,
                  o.location,
                  o.website,
                  o.type,
                  o.size,
                  o.headline,
                  o.industry,
                  o.founded,
                  o.attributes
          from organizations o
          where o."tenantId" = :tenantId
          and o.id in (select "organizationId" from "organizationsWithIdentity");
      `, {
            replacements: {
                tenantId: currentTenant.id,
                name: identity.name,
                platform: identity.platform,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        if (results.length === 0) {
            return null;
        }
        const result = results[0];
        return result;
    }
    static async findByDomain(domain, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const sequelize = sequelizeRepository_1.default.getSequelize(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const results = await sequelize.query(`
      SELECT
      o.id,
      o.description,
      o.emails,
      o.logo,
      o.tags,
      o.github,
      o.twitter,
      o.linkedin,
      o.crunchbase,
      o.employees,
      o.location,
      o.website,
      o.type,
      o.size,
      o.headline,
      o.industry,
      o.founded,
      o.attributes,
      o."weakIdentities"
    FROM
      organizations o
    WHERE
      o."tenantId" = :tenantId AND 
      o.website = :domain
      `, {
            replacements: {
                tenantId: currentTenant.id,
                domain,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        if (results.length === 0) {
            return null;
        }
        const result = results[0];
        return result;
    }
    static async findIdentities(identities, options, organizationId) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const sequelize = sequelizeRepository_1.default.getSequelize(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params = {
            tenantId: currentTenant.id,
        };
        const condition = organizationId ? 'and "organizationId" <> :organizationId' : '';
        if (organizationId) {
            params.organizationId = organizationId;
        }
        const identityParams = identities
            .map((identity, index) => `(:platform${index}, :name${index})`)
            .join(', ');
        identities.forEach((identity, index) => {
            params[`platform${index}`] = identity.platform;
            params[`name${index}`] = identity.name;
        });
        const results = (await sequelize.query(`
      with input_identities (platform, name) as (
        values ${identityParams}
      )
      select "organizationId", i.platform, i.name
      from "organizationIdentities" oi
        inner join input_identities i on oi.platform = i.platform and oi.name = i.name
      where oi."tenantId" = :tenantId ${condition}
    `, {
            replacements: params,
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        }));
        const resultMap = new Map();
        results.forEach((row) => {
            resultMap.set(`${row.platform}:${row.name}`, row.organizationId);
        });
        return resultMap;
    }
    static async findById(id, options, segmentId) {
        var _a;
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const sequelize = sequelizeRepository_1.default.getSequelize(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const replacements = {
            id,
            tenantId: currentTenant.id,
        };
        // query for all leaf segment ids
        let extraCTEs = `
      leaf_segment_ids AS (
        select id
        from segments
        where "tenantId" = :tenantId and "parentSlug" is not null and "grandparentSlug" is not null
      ),
    `;
        if (segmentId) {
            // we load data for a specific segment (can be leaf, parent or grand parent id)
            replacements.segmentId = segmentId;
            extraCTEs = `
        input_segment AS (
          select
            id,
            slug,
            "parentSlug",
            "grandparentSlug"
          from segments
          where id = :segmentId
            and "tenantId" = :tenantId
        ),
        segment_level AS (
          select
            case
              when "parentSlug" is not null and "grandparentSlug" is not null
                  then 'child'
              when "parentSlug" is not null and "grandparentSlug" is null
                  then 'parent'
              when "parentSlug" is null and "grandparentSlug" is null
                  then 'grandparent'
              end as level,
            id,
            slug,
            "parentSlug",
            "grandparentSlug"
          from input_segment
        ),
        leaf_segment_ids AS (
          select s.id
          from segments s
          join segment_level sl on (sl.level = 'child' and s.id = sl.id)
              or (sl.level = 'parent' and s."parentSlug" = sl.slug and s."grandparentSlug" is not null)
              or (sl.level = 'grandparent' and s."grandparentSlug" = sl.slug)
        ),
      `;
        }
        const query = `
      WITH
        ${extraCTEs}
        member_data AS (
          select
            a."organizationId",
            count(distinct a."memberId")                                                        as "memberCount",
            count(distinct a.id)                                                        as "activityCount",
            case
                when array_agg(distinct a.platform::TEXT) = array [null] then array []::text[]
                else array_agg(distinct a.platform::TEXT) end                                 as "activeOn",
            max(a.timestamp)                                                            as "lastActive",
            min(a.timestamp) filter ( where a.timestamp <> '1970-01-01T00:00:00.000Z' ) as "joinedAt"
          from leaf_segment_ids ls
          join mv_activities_cube a on a."segmentId" = ls.id and a."organizationId" = :id
          group by a."organizationId"
        ),
        organization_segments as (
          select "organizationId", array_agg("segmentId") as "segments"
          from "organizationSegments"
          where "organizationId" = :id
          group by "organizationId"
        ),
        identities as (
          SELECT oi."organizationId", jsonb_agg(oi) AS "identities"
          FROM "organizationIdentities" oi
          WHERE oi."organizationId" = :id
          GROUP BY "organizationId"
        )
        select
          o.*,
          coalesce(md."activityCount", 0)::integer as "activityCount",
          coalesce(md."memberCount", 0)::integer   as "memberCount",
          coalesce(md."activeOn", '{}')            as "activeOn",
          coalesce(i.identities, '{}')            as identities,
          coalesce(os.segments, '{}')              as segments,
          md."lastActive",
          md."joinedAt"
        from organizations o
        left join member_data md on md."organizationId" = o.id
        left join organization_segments os on os."organizationId" = o.id
        left join identities i on i."organizationId" = o.id
        where o.id = :id
        and o."tenantId" = :tenantId;
    `;
        const results = await sequelize.query(query, {
            replacements,
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        if (results.length === 0) {
            throw new common_1.Error404();
        }
        const result = results[0];
        const manualSyncRemote = await new organizationSyncRemoteRepository_1.default(options).findOrganizationManualSync(result.id);
        for (const syncRemote of manualSyncRemote) {
            if ((_a = result.attributes) === null || _a === void 0 ? void 0 : _a.syncRemote) {
                result.attributes.syncRemote[syncRemote.platform] = syncRemote.status === types_1.SyncStatus.ACTIVE;
            }
            else {
                result.attributes.syncRemote = {
                    [syncRemote.platform]: syncRemote.status === types_1.SyncStatus.ACTIVE,
                };
            }
        }
        // compatibility issue
        delete result.searchSyncedAt;
        return result;
    }
    static async findByName(name, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const include = [];
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.organization.findOne({
            where: {
                name,
                tenantId: currentTenant.id,
            },
            include,
            transaction,
        });
        if (!record) {
            return null;
        }
        return record.get({ plain: true });
    }
    static async findByUrl(url, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const include = [];
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.organization.findOne({
            where: {
                url,
                tenantId: currentTenant.id,
            },
            include,
            transaction,
        });
        if (!record) {
            return null;
        }
        return record.get({ plain: true });
    }
    static async findOrCreateByDomain(domain, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        // Check if organization exists
        let organization = await options.database.organization.findOne({
            attributes: ['id'],
            where: {
                website: domain,
                tenantId: currentTenant.id,
            },
            transaction,
        });
        if (!organization) {
            const data = {
                displayName: domain,
                website: domain,
                identities: [
                    {
                        name: domain,
                        platform: 'email',
                    },
                ],
                tenantId: currentTenant.id,
            };
            organization = await this.create(data, options);
        }
        return organization.id;
    }
    static async filterIdInTenant(id, options) {
        return lodash_1.default.get(await this.filterIdsInTenant([id], options), '[0]', null);
    }
    static async filterIdsInTenant(ids, options) {
        if (!ids || !ids.length) {
            return [];
        }
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const where = {
            id: {
                [Op.in]: ids,
            },
            tenantId: currentTenant.id,
        };
        const records = await options.database.organization.findAll({
            attributes: ['id'],
            where,
        });
        return records.map((record) => record.id);
    }
    static async destroyBulk(ids, options, force = false) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        await OrganizationRepository.excludeOrganizationsFromSegments(ids, Object.assign(Object.assign({}, options), { transaction }));
        await options.database.organization.destroy({
            where: {
                id: ids,
                tenantId: currentTenant.id,
            },
            force,
            transaction,
        });
    }
    static async count(filter, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        return options.database.organization.count({
            where: Object.assign(Object.assign({}, filter), { tenantId: tenant.id }),
            transaction,
        });
    }
    static async findOrganizationActivities(organizationId, limit, offset, options) {
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const results = await seq.query(`select "id", "organizationId"
        from "activities"
        where "organizationId" = :organizationId
        order by "createdAt"
        limit :limit offset :offset`, {
            replacements: {
                organizationId,
                limit,
                offset,
            },
            type: sequelize_1.QueryTypes.SELECT,
        });
        return results;
    }
    static async findAndCountAllOpensearch({ filter = {}, limit = 20, offset = 0, orderBy = 'joinedAt_DESC', countOnly = false, segments = [], customSortFunction = undefined, }, options) {
        if (orderBy.length === 0) {
            orderBy = 'joinedAt_DESC';
        }
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const segmentsEnabled = await (0, isFeatureEnabled_1.default)(types_1.FeatureFlag.SEGMENTS, options);
        const segment = segments[0];
        const translator = opensearch_1.FieldTranslatorFactory.getTranslator(types_1.OpenSearchIndex.ORGANIZATIONS);
        if (filter.and) {
            filter.and.push({
                or: [
                    {
                        manuallyCreated: {
                            eq: true,
                        },
                    },
                    {
                        activityCount: {
                            gt: 0,
                        },
                    },
                ],
            });
        }
        const parsed = opensearch_1.OpensearchQueryParser.parse({ filter, limit, offset, orderBy }, types_1.OpenSearchIndex.ORGANIZATIONS, translator);
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
        // exclude empty filters if any
        parsed.query.bool.must = parsed.query.bool.must.filter((obj) => {
            // Check if the object has a non-empty 'term' property
            if (obj.term) {
                return Object.keys(obj.term).length !== 0;
            }
            return true;
        });
        if (customSortFunction) {
            parsed.sort = customSortFunction;
        }
        const countResponse = await options.opensearch.count({
            index: types_1.OpenSearchIndex.ORGANIZATIONS,
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
            index: types_1.OpenSearchIndex.ORGANIZATIONS,
            body: parsed,
        });
        const translatedRows = response.body.hits.hits.map((o) => translator.translateObjectToGitmesh(o._source));
        return { rows: translatedRows, count: countResponse.body.count, limit, offset };
    }
    static async findAndCountAll({ filter = {}, advancedFilter = null, limit = 0, offset = 0, orderBy = '', includeOrganizationsWithoutMembers = true, }, options) {
        let customOrderBy = [];
        const include = [
            {
                model: options.database.member,
                as: 'members',
                required: !includeOrganizationsWithoutMembers,
                attributes: [],
                through: {
                    attributes: [],
                    where: {
                        deletedAt: null,
                    },
                },
                include: [
                    {
                        model: options.database.activity,
                        as: 'activities',
                        attributes: [],
                    },
                    {
                        model: options.database.memberIdentity,
                        as: 'memberIdentities',
                        attributes: [],
                    },
                ],
            },
            {
                model: options.database.segment,
                as: 'segments',
                attributes: [],
                through: {
                    attributes: [],
                },
            },
        ];
        const activeOn = sequelize_1.default.literal(`array_agg( distinct  ("members->activities".platform) )  filter (where "members->activities".platform is not null)`);
        // TODO: member identitites FIX
        const identities = sequelize_1.default.literal(`array_agg( distinct "members->memberIdentities".platform)`);
        const lastActive = sequelize_1.default.literal(`MAX("members->activities".timestamp)`);
        const joinedAt = sequelize_1.default.literal(`
        MIN(
          CASE
            WHEN "members->activities".timestamp != '1970-01-01T00:00:00.000Z'
            THEN "members->activities".timestamp
          END
        )
      `);
        const memberCount = sequelize_1.default.literal(`COUNT(DISTINCT "members".id)::integer`);
        const activityCount = sequelize_1.default.literal(`COUNT("members->activities".id)::integer`);
        const segments = sequelize_1.default.literal(`ARRAY_AGG(DISTINCT "segments->organizationSegments"."segmentId")`);
        // If the advanced filter is empty, we construct it from the query parameter filter
        if (!advancedFilter) {
            advancedFilter = { and: [] };
            if (filter.id) {
                advancedFilter.and.push({
                    id: filter.id,
                });
            }
            if (filter.displayName) {
                advancedFilter.and.push({
                    displayName: {
                        textContains: filter.displayName,
                    },
                });
            }
            if (filter.description) {
                advancedFilter.and.push({
                    description: {
                        textContains: filter.description,
                    },
                });
            }
            if (filter.emails) {
                if (typeof filter.emails === 'string') {
                    filter.emails = filter.emails.split(',');
                }
                advancedFilter.and.push({
                    emails: {
                        overlap: filter.emails,
                    },
                });
            }
            if (filter.phoneNumbers) {
                if (typeof filter.phoneNumbers === 'string') {
                    filter.phoneNumbers = filter.phoneNumbers.split(',');
                }
                advancedFilter.and.push({
                    phoneNumbers: {
                        overlap: filter.phoneNumbers,
                    },
                });
            }
            if (filter.tags) {
                if (typeof filter.tags === 'string') {
                    filter.tags = filter.tags.split(',');
                }
                advancedFilter.and.push({
                    tags: {
                        overlap: filter.tags,
                    },
                });
            }
            if (filter.twitter) {
                advancedFilter.and.push({
                    twitter: {
                        textContains: filter.twitter,
                    },
                });
            }
            if (filter.linkedin) {
                advancedFilter.and.push({
                    linkedin: {
                        textContains: filter.linkedin,
                    },
                });
            }
            if (filter.crunchbase) {
                advancedFilter.and.push({
                    crunchbase: {
                        textContains: filter.crunchbase,
                    },
                });
            }
            if (filter.employeesRange) {
                const [start, end] = filter.employeesRange;
                if (start !== undefined && start !== null && start !== '') {
                    advancedFilter.and.push({
                        employees: {
                            gte: start,
                        },
                    });
                }
                if (end !== undefined && end !== null && end !== '') {
                    advancedFilter.and.push({
                        employees: {
                            lte: end,
                        },
                    });
                }
            }
            if (filter.revenueMin) {
                advancedFilter.and.push({
                    revenueMin: {
                        gte: filter.revenueMin,
                    },
                });
            }
            if (filter.revenueMax) {
                advancedFilter.and.push({
                    revenueMax: {
                        lte: filter.revenueMax,
                    },
                });
            }
            if (filter.members) {
                advancedFilter.and.push({
                    members: filter.members,
                });
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
        }
        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1.default.customOrderByIfExists('lastActive', orderBy));
        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1.default.customOrderByIfExists('joinedAt', orderBy));
        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1.default.customOrderByIfExists('activityCount', orderBy));
        customOrderBy = customOrderBy.concat(sequelizeFilterUtils_1.default.customOrderByIfExists('memberCount', orderBy));
        const parser = new queryParser_1.default({
            nestedFields: {
                twitter: 'twitter.handle',
                linkedin: 'linkedin.handle',
                crunchbase: 'crunchbase.handle',
                revenueMin: 'revenueRange.min',
                revenueMax: 'revenueRange.max',
                revenue: 'revenueRange.min',
            },
            aggregators: Object.assign(Object.assign({}, sequelizeFilterUtils_1.default.getNativeTableFieldAggregations([
                'id',
                'displayName',
                'description',
                'emails',
                'phoneNumbers',
                'logo',
                'tags',
                'website',
                'location',
                'github',
                'twitter',
                'linkedin',
                'crunchbase',
                'employees',
                'revenueRange',
                'importHash',
                'createdAt',
                'updatedAt',
                'deletedAt',
                'tenantId',
                'createdById',
                'updatedById',
                'isTeamOrganization',
                'type',
                'attributes',
                'manuallyCreated',
            ], 'organization')), { activeOn,
                identities,
                lastActive,
                joinedAt,
                memberCount,
                activityCount,
                segments }),
            manyToMany: {
                members: {
                    table: 'organizations',
                    model: 'organization',
                    relationTable: {
                        name: 'memberOrganizations',
                        from: 'organizationId',
                        to: 'memberId',
                    },
                },
                segments: {
                    table: 'organizations',
                    model: 'organization',
                    relationTable: {
                        name: 'organizationSegments',
                        from: 'organizationId',
                        to: 'segmentId',
                    },
                },
            },
        }, options);
        const parsed = parser.parse({
            filter: advancedFilter,
            orderBy: orderBy || ['createdAt_DESC'],
            limit,
            offset,
        });
        let order = parsed.order;
        if (customOrderBy.length > 0) {
            order = [customOrderBy];
        }
        else if (orderBy) {
            order = [orderBy.split('_')];
        }
        let { rows, count, // eslint-disable-line prefer-const
         } = await options.database.organization.findAndCountAll(Object.assign(Object.assign(Object.assign({}, (parsed.where ? { where: parsed.where } : {})), (parsed.having ? { having: parsed.having } : {})), { attributes: [
                ...sequelizeFilterUtils_1.default.getLiteralProjections([
                    'id',
                    'displayName',
                    'description',
                    'emails',
                    'phoneNumbers',
                    'logo',
                    'tags',
                    'website',
                    'location',
                    'github',
                    'twitter',
                    'linkedin',
                    'crunchbase',
                    'employees',
                    'revenueRange',
                    'importHash',
                    'createdAt',
                    'updatedAt',
                    'deletedAt',
                    'tenantId',
                    'createdById',
                    'updatedById',
                    'isTeamOrganization',
                    'type',
                    'ticker',
                    'size',
                    'naics',
                    'lastEnrichedAt',
                    'industry',
                    'headline',
                    'geoLocation',
                    'founded',
                    'employeeCountByCountry',
                    'address',
                    'profiles',
                    'attributes',
                    'manuallyCreated',
                    'affiliatedProfiles',
                    'allSubsidiaries',
                    'alternativeDomains',
                    'alternativeNames',
                    'averageEmployeeTenure',
                    'averageTenureByLevel',
                    'averageTenureByRole',
                    'directSubsidiaries',
                    'employeeChurnRate',
                    'employeeCountByMonth',
                    'employeeGrowthRate',
                    'employeeCountByMonthByLevel',
                    'employeeCountByMonthByRole',
                    'gicsSector',
                    'grossAdditionsByMonth',
                    'grossDeparturesByMonth',
                    'ultimateParent',
                    'immediateParent',
                ], 'organization'),
                [activeOn, 'activeOn'],
                [identities, 'identities'],
                [lastActive, 'lastActive'],
                [joinedAt, 'joinedAt'],
                [memberCount, 'memberCount'],
                [activityCount, 'activityCount'],
                [segments, 'segmentIds'],
            ], order, limit: parsed.limit, offset: parsed.offset, include, subQuery: false, group: ['organization.id'], transaction: sequelizeRepository_1.default.getTransaction(options) }));
        rows = await this._populateRelationsForRows(rows);
        return { rows, count: count.length, limit: parsed.limit, offset: parsed.offset };
    }
    static async findAllAutocomplete(query, limit, options) {
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const segmentIds = sequelizeRepository_1.default.getSegmentIds(options);
        const records = await options.database.sequelize.query(`
        SELECT
            DISTINCT
            o."id",
            o."displayName" AS label,
            o."logo",
            o."displayName" ILIKE :queryExact AS exact
        FROM "organizations" AS o
        JOIN "organizationSegments" os ON os."organizationId" = o.id
        WHERE o."deletedAt" IS NULL
          AND o."tenantId" = :tenantId
          AND (o."displayName" ILIKE :queryLike OR o.id = :uuid)
          AND os."segmentId" IN (:segmentIds)
          AND os."tenantId" = :tenantId
        ORDER BY o."displayName" ILIKE :queryExact DESC, o."displayName"
        LIMIT :limit;
      `, {
            replacements: {
                limit: limit ? Number(limit) : 20,
                tenantId: tenant.id,
                segmentIds,
                queryLike: `%${query}%`,
                queryExact: query,
                uuid: validator_1.default.isUUID(query) ? query : null,
            },
            type: sequelize_1.QueryTypes.SELECT,
            raw: true,
        });
        return records;
    }
    static async _createAuditLog(action, record, data, options) {
        let values = {};
        if (data) {
            values = Object.assign(Object.assign({}, record.get({ plain: true })), { memberIds: data.members });
        }
        await auditLogRepository_1.default.log({
            entityName: 'organization',
            entityId: record.id,
            action,
            values,
        }, options);
    }
    static async _populateRelationsForRows(rows) {
        if (!rows) {
            return rows;
        }
        return rows.map((record) => {
            var _a, _b;
            const rec = record.get({ plain: true });
            rec.activeOn = (_a = rec.activeOn) !== null && _a !== void 0 ? _a : [];
            rec.segments = (_b = rec.segmentIds) !== null && _b !== void 0 ? _b : [];
            delete rec.segmentIds;
            return rec;
        });
    }
}
exports.default = OrganizationRepository;
//# sourceMappingURL=organizationRepository.js.map