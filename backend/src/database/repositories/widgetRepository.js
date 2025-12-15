"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const sequelize_1 = __importDefault(require("sequelize"));
const common_1 = require("@gitmesh/common");
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
const auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
const sequelizeFilterUtils_1 = __importDefault(require("../utils/sequelizeFilterUtils"));
const queryParser_1 = __importDefault(require("./filters/queryParser"));
const { Op } = sequelize_1.default;
class WidgetRepository {
    static async create(data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const segment = sequelizeRepository_1.default.getStrictlySingleActiveSegment(options);
        const record = await options.database.widget.create(Object.assign(Object.assign({}, lodash_1.default.pick(data, ['cache', 'importHash', 'settings', 'title', 'type'])), { reportId: data.report || null, tenantId: tenant.id, segmentId: segment.id, createdById: currentUser.id, updatedById: currentUser.id }), {
            transaction,
        });
        await this._createAuditLog(auditLogRepository_1.default.CREATE, record, data, options);
        return this.findById(record.id, options);
    }
    /**
     * Find a widget by type
     * @param type Type of widget to find
     * @param options DB options
     * @returns Widget object
     */
    static async findByType(type, options) {
        const widgets = await this.findAndCountAll({ filter: { type } }, options);
        if (widgets.count === 0) {
            throw new common_1.Error404();
        }
        return widgets.rows[0];
    }
    static async update(id, data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        let record = await options.database.widget.findOne({
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
        record = await record.update(Object.assign(Object.assign({}, lodash_1.default.pick(data, ['cache', 'importHash', 'settings', 'title', 'type'])), { reportId: data.report || null, updatedById: currentUser.id }), {
            transaction,
        });
        await this._createAuditLog(auditLogRepository_1.default.UPDATE, record, data, options);
        return this.findById(record.id, options);
    }
    static async destroy(id, options, force = false) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.widget.findOne({
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
        await record.destroy({
            transaction,
            force,
        });
        await this._createAuditLog(auditLogRepository_1.default.DELETE, record, record, options);
    }
    static async findById(id, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const include = [
            {
                model: options.database.report,
                as: 'report',
            },
        ];
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.widget.findOne({
            where: {
                id,
                tenantId: currentTenant.id,
                segmentId: sequelizeRepository_1.default.getSegmentIds(options),
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
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const where = {
            id: {
                [Op.in]: ids,
            },
            tenantId: currentTenant.id,
        };
        const records = await options.database.widget.findAll({
            attributes: ['id'],
            where,
            transaction,
        });
        return records.map((record) => record.id);
    }
    static async count(filter, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        return options.database.widget.count({
            where: Object.assign(Object.assign({}, filter), { tenantId: tenant.id, segmentId: sequelizeRepository_1.default.getSegmentIds(options) }),
            transaction,
        });
    }
    static async findAndCountAll({ filter = {}, advancedFilter = null, limit = 0, offset = 0, orderBy = '' }, options) {
        const include = [
            {
                model: options.database.report,
                as: 'report',
            },
        ];
        // If the advanced filter is empty, we construct it from the query parameter filter
        if (!advancedFilter) {
            advancedFilter = { and: [] };
            if (filter.id) {
                advancedFilter.and.push({
                    id: filter.id,
                });
            }
            if (filter.type) {
                advancedFilter.and.push({
                    type: { textContains: filter.type },
                });
            }
            if (filter.title) {
                advancedFilter.and.push({
                    title: {
                        textContains: filter.title,
                    },
                });
            }
            if (filter.report) {
                advancedFilter.and.push({
                    reportId: filter.report,
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
        const parser = new queryParser_1.default({}, options);
        const parsed = parser.parse({
            filter: advancedFilter,
            orderBy: orderBy || ['createdAt_DESC'],
            limit,
            offset,
        });
        let { rows, count, // eslint-disable-line prefer-const
         } = await options.database.widget.findAndCountAll(Object.assign(Object.assign(Object.assign({}, (parsed.where ? { where: parsed.where } : {})), (parsed.having ? { having: parsed.having } : {})), { order: parsed.order, limit: parsed.limit, offset: parsed.offset, include, transaction: sequelizeRepository_1.default.getTransaction(options) }));
        rows = await this._populateRelationsForRows(rows);
        return { rows, count, limit: parsed.limit, offset: parsed.offset };
    }
    static async findAllAutocomplete(query, limit, options) {
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const whereAnd = [
            {
                tenantId: tenant.id,
            },
            {
                segmentId: sequelizeRepository_1.default.getSegmentIds(options),
            },
        ];
        if (query) {
            whereAnd.push({
                [Op.or]: [
                    { id: sequelizeFilterUtils_1.default.uuid(query) },
                    {
                        [Op.and]: sequelizeFilterUtils_1.default.ilikeIncludes('widget', 'type', query),
                    },
                ],
            });
        }
        const where = { [Op.and]: whereAnd };
        const records = await options.database.widget.findAll({
            attributes: ['id', 'type'],
            where,
            limit: limit ? Number(limit) : undefined,
            order: [['type', 'ASC']],
        });
        return records.map((record) => ({
            id: record.id,
            label: record.type,
        }));
    }
    static async _createAuditLog(action, record, data, options) {
        let values = {};
        if (data) {
            values = Object.assign({}, record.get({ plain: true }));
        }
        await auditLogRepository_1.default.log({
            entityName: 'widget',
            entityId: record.id,
            action,
            values,
        }, options);
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
exports.default = WidgetRepository;
//# sourceMappingURL=widgetRepository.js.map