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
const lodash_1 = __importDefault(require("lodash"));
const sequelize_1 = __importStar(require("sequelize"));
const types_1 = require("@gitmesh/types");
const common_1 = require("@gitmesh/common");
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
const auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
const sequelizeFilterUtils_1 = __importDefault(require("../utils/sequelizeFilterUtils"));
const queryParser_1 = __importDefault(require("./filters/queryParser"));
const automationRepository_1 = __importDefault(require("./automationRepository"));
const automationExecutionRepository_1 = __importDefault(require("./automationExecutionRepository"));
const memberSyncRemoteRepository_1 = __importDefault(require("./memberSyncRemoteRepository"));
const organizationSyncRemoteRepository_1 = __importDefault(require("./organizationSyncRemoteRepository"));
const { Op } = sequelize_1.default;
const log = false;
class IntegrationRepository {
    static async create(data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const segment = sequelizeRepository_1.default.getStrictlySingleActiveSegment(options);
        const record = await options.database.integration.create(Object.assign(Object.assign({}, lodash_1.default.pick(data, [
            'platform',
            'status',
            'limitCount',
            'limitLastResetAt',
            'token',
            'refreshToken',
            'settings',
            'integrationIdentifier',
            'importHash',
            'emailSentAt',
        ])), { segmentId: segment.id, tenantId: tenant.id, createdById: currentUser.id, updatedById: currentUser.id }), {
            transaction,
        });
        await this._createAuditLog(auditLogRepository_1.default.CREATE, record, data, options);
        return this.findById(record.id, options);
    }
    static async update(id, data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        let record = await options.database.integration.findOne({
            where: {
                id,
                tenantId: currentTenant.id,
                segmentId: sequelizeRepository_1.default.getSegmentIds(options),
            },
            transaction,
        });
        if (!record) {
            throw new common_1.Error404();
        }
        record = await record.update(Object.assign(Object.assign({}, lodash_1.default.pick(data, [
            'platform',
            'status',
            'limitCount',
            'limitLastResetAt',
            'token',
            'refreshToken',
            'settings',
            'integrationIdentifier',
            'importHash',
            'emailSentAt',
        ])), { updatedById: currentUser.id }), {
            transaction,
        });
        await this._createAuditLog(auditLogRepository_1.default.UPDATE, record, data, options);
        return this.findById(record.id, options);
    }
    static async destroy(id, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.integration.findOne({
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
            transaction,
        });
        // also mark integration runs as deleted
        const seq = sequelizeRepository_1.default.getSequelize(options);
        await seq.query(`update "integrationRuns" set state = :newState
     where "integrationId" = :integrationId and state in (:delayed, :pending, :processing)
    `, {
            replacements: {
                newState: types_1.IntegrationRunState.INTEGRATION_DELETED,
                delayed: types_1.IntegrationRunState.DELAYED,
                pending: types_1.IntegrationRunState.PENDING,
                processing: types_1.IntegrationRunState.PROCESSING,
                integrationId: id,
            },
            transaction,
        });
        await seq.query(`update integration.runs set state = :newState
     where "integrationId" = :integrationId and state in (:delayed, :pending, :processing)`, {
            replacements: {
                newState: types_1.IntegrationRunState.INTEGRATION_DELETED,
                delayed: types_1.IntegrationRunState.DELAYED,
                pending: types_1.IntegrationRunState.PENDING,
                processing: types_1.IntegrationRunState.PROCESSING,
                integrationId: id,
            },
            transaction,
        });
        // delete syncRemote rows coming from integration
        await new memberSyncRemoteRepository_1.default(Object.assign(Object.assign({}, options), { transaction })).destroyAllIntegration([
            record.id,
        ]);
        await new organizationSyncRemoteRepository_1.default(Object.assign(Object.assign({}, options), { transaction })).destroyAllIntegration([
            record.id,
        ]);
        // destroy existing automations for outgoing integrations
        const syncAutomationIds = (await new automationRepository_1.default(Object.assign(Object.assign({}, options), { transaction })).findSyncAutomations(currentTenant.id, record.platform)).map((a) => a.id);
        if (syncAutomationIds.length > 0) {
            await new automationExecutionRepository_1.default(Object.assign(Object.assign({}, options), { transaction })).destroyAllAutomation(syncAutomationIds);
        }
        await new automationRepository_1.default(Object.assign(Object.assign({}, options), { transaction })).destroyAll(syncAutomationIds);
        await this._createAuditLog(auditLogRepository_1.default.DELETE, record, record, options);
    }
    static async findAllByPlatform(platform, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const include = [];
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const records = await options.database.integration.findAll({
            where: {
                platform,
                tenantId: currentTenant.id,
            },
            include,
            transaction,
        });
        return records.map((record) => record.get({ plain: true }));
    }
    static async findByPlatform(platform, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const segment = sequelizeRepository_1.default.getStrictlySingleActiveSegment(options);
        const include = [];
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.integration.findOne({
            where: {
                platform,
                tenantId: currentTenant.id,
                segmentId: segment.id,
            },
            include,
            transaction,
        });
        if (!record) {
            throw new common_1.Error404();
        }
        return this._populateRelations(record);
    }
    static async findActiveIntegrationByPlatform(platform, tenantId) {
        const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const record = await options.database.integration.findOne({
            where: {
                platform,
                tenantId,
            },
        });
        if (!record) {
            throw new common_1.Error404();
        }
        return this._populateRelations(record);
    }
    /**
     * Find all active integrations for a platform
     * @param platform The platform we want to find all active integrations for
     * @returns All active integrations for the platform
     */
    static async findAllActive(platform, page, perPage) {
        const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const records = await options.database.integration.findAll({
            where: {
                status: 'done',
                platform,
            },
            limit: perPage,
            offset: (page - 1) * perPage,
            order: [['id', 'ASC']],
        });
        if (!records) {
            throw new common_1.Error404();
        }
        return Promise.all(records.map((record) => this._populateRelations(record)));
    }
    static async findByStatus(status, page, perPage, options) {
        const query = `
      select * from integrations where status = :status
      limit ${perPage} offset ${(page - 1) * perPage}
    `;
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const integrations = await seq.query(query, {
            replacements: {
                status,
            },
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        return integrations;
    }
    /**
     * Find an integration using the integration identifier and a platform.
     * Tenant not needed.
     * @param identifier The integration identifier
     * @returns The integration object
     */
    // TODO: Test
    static async findByIdentifier(identifier, platform) {
        const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const record = await options.database.integration.findOne({
            where: {
                integrationIdentifier: identifier,
                platform,
                deletedAt: null,
            },
        });
        if (!record) {
            throw new common_1.Error404();
        }
        return this._populateRelations(record);
    }
    static async findById(id, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const include = [];
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.integration.findOne({
            where: {
                id,
                tenantId: currentTenant.id,
            },
            include,
            transaction,
        });
        if (!record) {
            throw new common_1.Error404();
        }
        return this._populateRelations(record);
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
        const records = await options.database.integration.findAll({
            attributes: ['id'],
            where,
        });
        return records.map((record) => record.id);
    }
    static async count(filter, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        return options.database.integration.count({
            where: Object.assign(Object.assign({}, filter), { tenantId: tenant.id }),
            transaction,
        });
    }
    static async findAndCountAll({ filter = {}, advancedFilter = null, limit = 0, offset = 0, orderBy = '' }, options) {
        const include = [];
        // If the advanced filter is empty, we construct it from the query parameter filter
        if (!advancedFilter) {
            advancedFilter = { and: [] };
            if (filter.id) {
                advancedFilter.and.push({
                    id: filter.id,
                });
            }
            if (filter.platform) {
                advancedFilter.and.push({
                    platform: filter.platform,
                });
            }
            if (filter.status) {
                advancedFilter.and.push({
                    status: filter.status,
                });
            }
            if (filter.limitCountRange) {
                const [start, end] = filter.limitCountRange;
                if (start !== undefined && start !== null && start !== '') {
                    advancedFilter.and.push({
                        limitCount: {
                            gte: start,
                        },
                    });
                }
                if (end !== undefined && end !== null && end !== '') {
                    advancedFilter.and.push({
                        limitCount: {
                            lte: end,
                        },
                    });
                }
            }
            if (filter.limitLastResetAtRange) {
                const [start, end] = filter.limitLastResetAtRange;
                if (start !== undefined && start !== null && start !== '') {
                    advancedFilter.and.push({
                        limitLastResetAt: {
                            gte: start,
                        },
                    });
                }
                if (end !== undefined && end !== null && end !== '') {
                    advancedFilter.and.push({
                        limitLastResetAt: {
                            lte: end,
                        },
                    });
                }
            }
            if (filter.integrationIdentifier) {
                advancedFilter.and.push({
                    integrationIdentifier: filter.integrationIdentifier,
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
        const parser = new queryParser_1.default({
            nestedFields: {
                sentiment: 'sentiment.sentiment',
            },
        }, options);
        const parsed = parser.parse({
            filter: advancedFilter,
            orderBy: orderBy || ['createdAt_DESC'],
            limit,
            offset,
        });
        let { rows, count, // eslint-disable-line prefer-const
         } = await options.database.integration.findAndCountAll(Object.assign(Object.assign(Object.assign({}, (parsed.where ? { where: parsed.where } : {})), (parsed.having ? { having: parsed.having } : {})), { order: parsed.order, limit: parsed.limit, offset: parsed.offset, include, transaction: sequelizeRepository_1.default.getTransaction(options) }));
        rows = await this._populateRelationsForRows(rows);
        // Some integrations (i.e GitHub, Discord, Discourse, Groupsio) receive new data via webhook post-onboarding.
        // We track their last processedAt separately, and not using updatedAt.
        const seq = sequelizeRepository_1.default.getSequelize(options);
        const integrationIds = rows.map((row) => row.id);
        let results = [];
        if (integrationIds.length > 0) {
            const query = `select "integrationId", max("processedAt") as "processedAt" from "incomingWebhooks" 
      where "integrationId" in (:integrationIds) and state = 'PROCESSED'
      group by "integrationId"`;
            results = await seq.query(query, {
                replacements: {
                    integrationIds,
                },
                type: sequelize_1.QueryTypes.SELECT,
                transaction: sequelizeRepository_1.default.getTransaction(options),
            });
        }
        const processedAtMap = results.reduce((map, item) => {
            map[item.integrationId] = item.processedAt;
            return map;
        }, {});
        rows.forEach((row) => {
            // Either use the last processedAt, or fall back updatedAt
            row.lastProcessedAt = processedAtMap[row.id] || row.updatedAt;
        });
        return { rows, count, limit: parsed.limit, offset: parsed.offset };
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
                    { id: sequelizeFilterUtils_1.default.uuid(query) },
                    {
                        [Op.and]: sequelizeFilterUtils_1.default.ilikeIncludes('integration', 'platform', query),
                    },
                ],
            });
        }
        const where = { [Op.and]: whereAnd };
        const records = await options.database.integration.findAll({
            attributes: ['id', 'platform'],
            where,
            limit: limit ? Number(limit) : undefined,
            order: [['platform', 'ASC']],
        });
        return records.map((record) => ({
            id: record.id,
            label: record.platform,
        }));
    }
    static async _createAuditLog(action, record, data, options) {
        if (log) {
            let values = {};
            if (data) {
                values = Object.assign({}, record.get({ plain: true }));
            }
            await auditLogRepository_1.default.log({
                entityName: 'integration',
                entityId: record.id,
                action,
                values,
            }, options);
        }
    }
    static async _populateRelationsForRows(rows) {
        if (!rows) {
            return rows;
        }
        return Promise.all(rows.map((record) => this._populateRelations(record)));
    }
    static async _populateRelations(record) {
        if (!record) {
            return record;
        }
        const output = record.get({ plain: true });
        return output;
    }
}
exports.default = IntegrationRepository;
//# sourceMappingURL=integrationRepository.js.map