"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const uuid_1 = require("uuid");
const sequelize_1 = require("sequelize");
const integrations_1 = require("@gitmesh/integrations");
const types_1 = require("@gitmesh/types");
const common_1 = require("@gitmesh/common");
const repositoryBase_1 = require("./repositoryBase");
const getObjectWithoutKey_1 = __importDefault(require("../../utils/getObjectWithoutKey"));
const integrationRepository_1 = __importDefault(require("./integrationRepository"));
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
class SegmentRepository extends repositoryBase_1.RepositoryBase {
    constructor(options) {
        super(options, true);
    }
    /**
     * Insert a segment.
     * @param data segment data
     * @returns
     */
    async create(data) {
        const transaction = this.transaction;
        const segmentInsertResult = await this.options.database.sequelize.query(`INSERT INTO "segments" ("id", "url", "name", "slug", "parentSlug", "grandparentSlug", "status", "parentName", "sourceId", "sourceParentId", "tenantId", "grandparentName")
          VALUES
              (:id, :url, :name, :slug, :parentSlug, :grandparentSlug, :status, :parentName, :sourceId, :sourceParentId, :tenantId, :grandparentName)
          RETURNING "id"
        `, {
            replacements: {
                id: (0, uuid_1.v4)(),
                url: data.url || null,
                name: data.name,
                parentName: data.parentName || null,
                grandparentName: data.grandparentName || null,
                slug: data.slug,
                parentSlug: data.parentSlug || null,
                grandparentSlug: data.grandparentSlug || null,
                status: data.status || types_1.SegmentStatus.ACTIVE,
                sourceId: data.sourceId || null,
                sourceParentId: data.sourceParentId || null,
                tenantId: this.options.currentTenant.id,
            },
            type: sequelize_1.QueryTypes.INSERT,
            transaction,
        });
        const segment = await this.findById(segmentInsertResult[0][0].id);
        return segment;
    }
    /**
     * Updates:
     * parent slugs of children => parentSlug, grandparentSlug
     * parent names of children => parentName, grandparentName
     * @param id
     * @param slug
     * @param name
     */
    async updateChildrenBulk(segment, data) {
        if (SegmentRepository.isProjectGroup(segment)) {
            // update projects
            await this.updateBulk(segment.projects.map((p) => p.id), {
                parentName: data.name,
                parentSlug: data.slug,
            });
            const subprojectIds = segment.projects.reduce((acc, p) => {
                acc.push(...p.subprojects.map((sp) => sp.id));
                return acc;
            }, []);
            await this.updateBulk(subprojectIds, {
                grandparentSlug: data.slug,
                grandparentName: data.name,
            });
        }
        else if (SegmentRepository.isProject(segment)) {
            // update subprojects
            await this.updateBulk(segment.subprojects.map((sp) => sp.id), {
                parentName: data.name,
                parentSlug: data.slug,
            });
        }
        return this.findById(segment.id);
    }
    async updateBulk(ids, data) {
        const transaction = this.transaction;
        // strip arbitrary fields
        const updateFields = Object.keys(data).filter((key) => data[key] &&
            [
                'name',
                'slug',
                'parentSlug',
                'grandparentSlug',
                'status',
                'parentName',
                'sourceId',
                'sourceParentId',
                'grandparentName',
            ].includes(key));
        let segmentUpdateQuery = `UPDATE segments SET `;
        const replacements = {};
        for (const field of updateFields) {
            segmentUpdateQuery += ` "${field}" = :${field} `;
            replacements[field] = data[field];
            if (updateFields[updateFields.length - 1] !== field) {
                segmentUpdateQuery += ', ';
            }
        }
        segmentUpdateQuery += ` WHERE id in (:ids) and "tenantId" = :tenantId returning id`;
        replacements.tenantId = this.options.currentTenant.id;
        replacements.ids = ids;
        const idsUpdated = await this.options.database.sequelize.query(segmentUpdateQuery, {
            replacements,
            type: sequelize_1.QueryTypes.UPDATE,
            transaction,
        });
        return idsUpdated;
    }
    async update(id, data) {
        const transaction = this.transaction;
        const segment = await this.findById(id);
        if (!segment) {
            throw new common_1.Error404();
        }
        // strip arbitrary fields
        const updateFields = Object.keys(data).filter((key) => [
            'name',
            'url',
            'slug',
            'parentSlug',
            'grandparentSlug',
            'status',
            'parentName',
            'sourceId',
            'sourceParentId',
            'customActivityTypes',
        ].includes(key));
        if (updateFields.length > 0) {
            let segmentUpdateQuery = `UPDATE segments SET `;
            const replacements = {};
            for (const field of updateFields) {
                segmentUpdateQuery += ` "${field}" = :${field} `;
                replacements[field] = data[field];
                if (updateFields[updateFields.length - 1] !== field) {
                    segmentUpdateQuery += ', ';
                }
            }
            segmentUpdateQuery += ` WHERE id = :id and "tenantId" = :tenantId `;
            replacements.tenantId = this.options.currentTenant.id;
            replacements.id = id;
            if (replacements.customActivityTypes) {
                replacements.customActivityTypes = JSON.stringify(replacements.customActivityTypes);
            }
            await this.options.database.sequelize.query(segmentUpdateQuery, {
                replacements,
                type: sequelize_1.QueryTypes.UPDATE,
                transaction,
            });
        }
        return this.findById(id);
    }
    async addActivityChannel(segmentId, platform, channel) {
        const transaction = this.transaction;
        await this.options.database.sequelize.query(`
        INSERT INTO "segmentActivityChannels" ("tenantId", "segmentId", "platform", "channel")
        VALUES (:tenantId, :segmentId, :platform, :channel)
        ON CONFLICT DO NOTHING;
      `, {
            replacements: {
                tenantId: this.options.currentTenant.id,
                segmentId,
                platform,
                channel,
            },
            type: sequelize_1.QueryTypes.INSERT,
            transaction,
        });
    }
    async fetchActivityChannels(segmentId) {
        const transaction = this.transaction;
        const records = await this.options.database.sequelize.query(`
        SELECT
          "platform",
          json_agg(DISTINCT "channel") AS "channels"
        FROM "segmentActivityChannels"
        WHERE "tenantId" = :tenantId
          AND "segmentId" = :segmentId
        GROUP BY "platform";
      `, {
            replacements: {
                tenantId: this.options.currentTenant.id,
                segmentId,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return records.reduce((acc, r) => {
            acc[r.platform] = r.channels;
            return acc;
        }, {});
    }
    async fetchTenantActivityChannels() {
        const transaction = this.transaction;
        const records = await this.options.database.sequelize.query(`
        SELECT
          "platform",
          json_agg(DISTINCT "channel") AS "channels"
        FROM "segmentActivityChannels"
        WHERE "tenantId" = :tenantId
        GROUP BY "platform";
      `, {
            replacements: {
                tenantId: this.options.currentTenant.id,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return records.reduce((acc, r) => {
            acc[r.platform] = r.channels;
            return acc;
        }, {});
    }
    async getChildrenOfProjectGroups(segment) {
        const transaction = this.transaction;
        const records = await this.options.database.sequelize.query(`
          SELECT *
          FROM segments s
          WHERE (s."grandparentSlug" = :slug OR
                 (s."parentSlug" = :slug AND s."grandparentSlug" IS NULL))
            AND s."tenantId" = :tenantId
          ORDER BY "grandparentSlug" DESC, "parentSlug" DESC, slug DESC;
      `, {
            replacements: {
                slug: segment.slug,
                tenantId: this.options.currentTenant.id,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return records;
    }
    async getChildrenOfProjects(segment) {
        const records = await this.options.database.sequelize.query(`
                select * from segments s
                where s."parentSlug" = :slug
                  AND s."grandparentSlug" = :parentSlug
                and s."tenantId" = :tenantId;
            `, {
            replacements: {
                slug: segment.slug,
                parentSlug: segment.parentSlug,
                tenantId: this.options.currentTenant.id,
            },
            type: sequelize_1.QueryTypes.SELECT,
        });
        return records;
    }
    async findBySlug(slug, level) {
        const transaction = this.transaction;
        let findBySlugQuery = `SELECT * FROM segments WHERE slug = :slug AND "tenantId" = :tenantId`;
        if (level === types_1.SegmentLevel.SUB_PROJECT) {
            findBySlugQuery += ` and "parentSlug" is not null and "grandparentSlug" is not null`;
        }
        else if (level === types_1.SegmentLevel.PROJECT) {
            findBySlugQuery += ` and "parentSlug" is not null and "grandparentSlug" is null`;
        }
        else if (level === types_1.SegmentLevel.PROJECT_GROUP) {
            findBySlugQuery += ` and "parentSlug" is null and "grandparentSlug" is null`;
        }
        const records = await this.options.database.sequelize.query(findBySlugQuery, {
            replacements: {
                slug,
                tenantId: this.options.currentTenant.id,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        if (records.length === 0) {
            return null;
        }
        return this.findById(records[0].id);
    }
    async findInIds(ids) {
        if (ids.length === 0) {
            return [];
        }
        const transaction = this.transaction;
        const records = await this.options.database.sequelize.query(`
        SELECT
          s.*
        FROM segments s
        WHERE id in (:ids)
        AND s."tenantId" = :tenantId
        GROUP BY s.id;
      `, {
            replacements: {
                ids,
                tenantId: this.options.currentTenant.id,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return records.map((sr) => SegmentRepository.populateRelations(sr));
    }
    static populateRelations(record) {
        const segmentData = Object.assign(Object.assign({}, record), { activityTypes: null });
        if (SegmentRepository.isSubproject(record)) {
            segmentData.activityTypes = SegmentRepository.buildActivityTypes(record);
        }
        return segmentData;
    }
    async findById(id) {
        const transaction = this.transaction;
        const records = await this.options.database.sequelize.query(`
        SELECT
          s.*
        FROM segments s
        WHERE s.id = :id
        AND s."tenantId" = :tenantId
        GROUP BY s.id;
      `, {
            replacements: {
                id,
                tenantId: this.options.currentTenant.id,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        if (records.length === 0) {
            return null;
        }
        const record = records[0];
        if (SegmentRepository.isProjectGroup(record)) {
            // find projects
            // TODO: Check sorting - parent should come first
            const children = await this.getChildrenOfProjectGroups(record);
            const projects = children.reduce((acc, child) => {
                if (SegmentRepository.isProject(child)) {
                    acc.push(child);
                }
                else if (SegmentRepository.isSubproject(child)) {
                    // find project index
                    const projectIndex = acc.findIndex((project) => project.slug === child.parentSlug);
                    if (!acc[projectIndex].subprojects) {
                        acc[projectIndex].subprojects = [child];
                    }
                    else {
                        acc[projectIndex].subprojects.push(child);
                    }
                }
                return acc;
            }, []);
            record.projects = projects;
        }
        else if (SegmentRepository.isProject(record)) {
            const children = await this.getChildrenOfProjects(record);
            record.subprojects = children;
        }
        return SegmentRepository.populateRelations(record);
    }
    static isProjectGroup(segment) {
        return segment.slug && segment.parentSlug === null && segment.grandparentSlug === null;
    }
    static isProject(segment) {
        return segment.slug && segment.parentSlug && segment.grandparentSlug === null;
    }
    static isSubproject(segment) {
        return segment.slug != null && segment.parentSlug != null && segment.grandparentSlug != null;
    }
    /**
     * Query project groups with their children
     * @returns
     */
    async queryProjectGroups(criteria) {
        var _a, _b, _c, _d;
        let searchQuery = 'WHERE 1=1';
        if ((_a = criteria.filter) === null || _a === void 0 ? void 0 : _a.status) {
            searchQuery += `AND s.status = :status`;
        }
        if ((_b = criteria.filter) === null || _b === void 0 ? void 0 : _b.name) {
            searchQuery += `AND s.name ilike :name`;
        }
        const projectGroups = await this.options.database.sequelize.query(`
          WITH
              foundations AS (
                  SELECT
                      f.id AS foundation_id,
                      f.name AS foundation_name,
                      f.status,
                      f."createdAt",
                      f."updatedAt",
                      f."sourceId",
                      f."sourceParentId",
                      f.slug,
                      p.name AS project_name,
                      p.id AS project_id,
                      p.status AS project_status,
                      p.slug AS project_slug,
                      COUNT(DISTINCT sp.id) AS subproject_count,
                      JSONB_AGG(JSONB_BUILD_OBJECT(
                          'id', sp.id,
                          'name', sp.name,
                          'status', sp.status,
                          'slug', sp.slug
                          )) AS subprojects
                  FROM segments f
                  JOIN segments p
                      ON p."parentSlug" = f."slug"
                             AND p."grandparentSlug" IS NULL
                             AND p."tenantId" = f."tenantId"
                  JOIN segments sp
                      ON sp."parentSlug" = p."slug"
                             AND sp."grandparentSlug" = f.slug
                             AND sp."tenantId" = f."tenantId"
                  WHERE f."parentSlug" IS NULL
                    AND f."tenantId" = :tenantId
                  GROUP BY f."id", p.id
              )
          SELECT
              s.*,
              COUNT(*) OVER () AS "totalCount",
              JSONB_AGG(JSONB_BUILD_OBJECT(
                      'id', f.project_id,
                      'name', f.project_name,
                      'status', f.project_status,
                      'slug', f.project_slug,
                      'subprojects', f.subprojects
                  )) AS projects
          FROM segments s
          JOIN foundations f ON s.id = f.foundation_id
          ${searchQuery}
          GROUP BY s.id, f.foundation_name
          ORDER BY f.foundation_name
          ${this.getPaginationString(criteria)};
      `, {
            replacements: {
                tenantId: this.currentTenant.id,
                name: `%${(_c = criteria.filter) === null || _c === void 0 ? void 0 : _c.name}%`,
                status: (_d = criteria.filter) === null || _d === void 0 ? void 0 : _d.status,
            },
            type: sequelize_1.QueryTypes.SELECT,
        });
        const count = projectGroups.length > 0 ? Number.parseInt(projectGroups[0].totalCount, 10) : 0;
        const rows = projectGroups.map((i) => (0, getObjectWithoutKey_1.default)(i, 'totalCount'));
        return { count, rows, limit: criteria.limit, offset: criteria.offset };
    }
    async queryProjects(criteria) {
        var _a, _b, _c, _d, _e, _f;
        let searchQuery = '';
        if ((_a = criteria.filter) === null || _a === void 0 ? void 0 : _a.status) {
            searchQuery += ` AND s.status = :status`;
        }
        if ((_b = criteria.filter) === null || _b === void 0 ? void 0 : _b.name) {
            searchQuery += ` AND s.name ilike :name`;
        }
        if ((_c = criteria.filter) === null || _c === void 0 ? void 0 : _c.parentSlug) {
            searchQuery += ` AND s."parentSlug" = :parent_slug `;
        }
        const projects = await this.options.database.sequelize.query(`
            SELECT 
                s.*,
                COUNT(DISTINCT sp.id)                                       AS subproject_count,
                jsonb_agg(jsonb_build_object('id', sp.id, 'name', sp.name, 'status', sp.status)) as subprojects,
                count(*) over () as "totalCount"
            FROM segments s
                JOIN segments sp ON sp."parentSlug" = s."slug" and sp."grandparentSlug" is not null
                AND sp."tenantId" = s."tenantId"
            WHERE 
                s."grandparentSlug" IS NULL
            and s."parentSlug" is not null
            and s."tenantId" = :tenantId
            ${searchQuery}
            GROUP BY s."id"
            ORDER BY s."name"
            ${this.getPaginationString(criteria)};
            `, {
            replacements: {
                tenantId: this.currentTenant.id,
                name: `%${(_d = criteria.filter) === null || _d === void 0 ? void 0 : _d.name}%`,
                status: (_e = criteria.filter) === null || _e === void 0 ? void 0 : _e.status,
                parent_slug: `${(_f = criteria.filter) === null || _f === void 0 ? void 0 : _f.parentSlug}`,
            },
            type: sequelize_1.QueryTypes.SELECT,
        });
        const subprojects = projects.map((p) => p.subprojects).flat();
        const integrationsBySegments = await this.queryIntegrationsForSubprojects(subprojects);
        const count = projects.length > 0 ? Number.parseInt(projects[0].totalCount, 10) : 0;
        const rows = projects.map((i) => (0, getObjectWithoutKey_1.default)(i, 'totalCount'));
        // assign integrations to subprojects
        rows.forEach((row) => {
            row.subprojects.forEach((subproject) => {
                subproject.integrations = integrationsBySegments[subproject.id] || [];
            });
        });
        return { count, rows, limit: criteria.limit, offset: criteria.offset };
    }
    async getDefaultSegment() {
        const segments = await this.querySubprojects({ limit: 1, offset: 0 });
        return segments.rows[0] || null;
    }
    async querySubprojects(criteria) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let searchQuery = '';
        if ((_a = criteria.filter) === null || _a === void 0 ? void 0 : _a.status) {
            searchQuery += ` AND s.status = :status`;
        }
        if ((_b = criteria.filter) === null || _b === void 0 ? void 0 : _b.name) {
            searchQuery += ` AND s.name ilike :name`;
        }
        if ((_c = criteria.filter) === null || _c === void 0 ? void 0 : _c.parentSlug) {
            searchQuery += ` AND s."parentSlug" = :parent_slug `;
        }
        if ((_d = criteria.filter) === null || _d === void 0 ? void 0 : _d.grandparentSlug) {
            searchQuery += ` AND s."grandparentSlug" = :grandparent_slug `;
        }
        const subprojects = await this.options.database.sequelize.query(`
        SELECT
          s.*
        FROM segments s
        WHERE s."grandparentSlug" IS NOT NULL
          AND s."parentSlug" IS NOT NULL
          AND s."tenantId" = :tenantId
          ${searchQuery}
        ORDER BY s.name
        ${this.getPaginationString(criteria)};
      `, {
            replacements: {
                tenantId: this.currentTenant.id,
                name: `%${(_e = criteria.filter) === null || _e === void 0 ? void 0 : _e.name}%`,
                status: (_f = criteria.filter) === null || _f === void 0 ? void 0 : _f.status,
                parent_slug: `${(_g = criteria.filter) === null || _g === void 0 ? void 0 : _g.parentSlug}`,
                grandparent_slug: `${(_h = criteria.filter) === null || _h === void 0 ? void 0 : _h.grandparentSlug}`,
            },
            type: sequelize_1.QueryTypes.SELECT,
        });
        const rows = subprojects;
        return {
            count: 1,
            rows: rows.map((sr) => SegmentRepository.populateRelations(sr)),
            limit: criteria.limit,
            offset: criteria.offset,
        };
    }
    async queryIntegrationsForSubprojects(subprojects) {
        const segmentIds = subprojects.map((i) => i.id);
        let { rows: integrations } = await integrationRepository_1.default.findAndCountAll({
            advancedFilter: {
                segmentId: segmentIds,
            },
        }, Object.assign(Object.assign({}, this.options), { currentSegments: subprojects }));
        integrations = integrations.map(({ platform, id, status, segmentId }) => ({
            platform,
            id,
            status,
            segmentId,
        }));
        return lodash_1.default.groupBy(integrations, 'segmentId');
    }
    /**
     * Builds activity types object with both default and custom activity types
     * @param record
     * @returns
     */
    static buildActivityTypes(record) {
        const activityTypes = {};
        activityTypes.default = lodash_1.default.cloneDeep(integrations_1.DEFAULT_ACTIVITY_TYPE_SETTINGS);
        activityTypes.custom = {};
        const customActivityTypes = record.customActivityTypes || {};
        if (Object.keys(customActivityTypes).length > 0) {
            activityTypes.custom = customActivityTypes;
        }
        return activityTypes;
    }
    static getActivityTypes(options) {
        return options.currentSegments.reduce((acc, s) => lodash_1.default.merge(acc, s.activityTypes), {});
    }
    static async fetchTenantActivityTypes(options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const [record] = await options.database.sequelize.query(`
        SELECT
            jsonb_merge_agg(s."customActivityTypes") AS "customActivityTypes"
        FROM segments s
        WHERE s."grandparentSlug" IS NOT NULL
          AND s."parentSlug" IS NOT NULL
          AND s."tenantId" = :tenantId
          AND s."customActivityTypes" != '{}'
      `, {
            replacements: {
                tenantId: options.currentTenant.id,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return SegmentRepository.buildActivityTypes(record);
    }
    static activityTypeExists(platform, key, options) {
        const activityTypes = this.getActivityTypes(options);
        if ((activityTypes.default[platform] && activityTypes.default[platform][key]) ||
            (activityTypes.custom[platform] && activityTypes.custom[platform][key])) {
            return true;
        }
        return false;
    }
}
exports.default = SegmentRepository;
//# sourceMappingURL=segmentRepository.js.map