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
const Op = sequelize_1.default.Op;
class MicroserviceRepository {
    static async create(data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const record = await options.database.microservice.create(Object.assign(Object.assign({}, lodash_1.default.pick(data, ['init', 'running', 'type', 'variant', 'settings', 'importHash'])), { tenantId: tenant.id, createdById: currentUser.id, updatedById: currentUser.id }), {
            transaction,
        });
        await this._createAuditLog(auditLogRepository_1.default.CREATE, record, data, options);
        return this.findById(record.id, options);
    }
    /**
     * Find all microservices available for a type
     * @param type The microservice type to filter
     * @returns All active integrations for the platform
     */
    static async findAllByType(type, page, perPage) {
        const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const records = await options.database.microservice.findAll({
            where: {
                running: false,
                type,
            },
            limit: perPage,
            offset: (page - 1) * perPage,
        });
        if (!records) {
            throw new common_1.Error404();
        }
        return Promise.all(records.map((record) => this._populateRelations(record)));
    }
    static async update(id, data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        let record = await options.database.microservice.findOne({
            where: {
                id,
                tenantId: currentTenant.id,
            },
            transaction,
        });
        if (!record) {
            throw new common_1.Error404();
        }
        record = await record.update(Object.assign(Object.assign({}, lodash_1.default.pick(data, ['init', 'running', 'type', 'variant', 'settings', 'importHash'])), { updatedById: currentUser.id }), {
            transaction,
        });
        await this._createAuditLog(auditLogRepository_1.default.UPDATE, record, data, options);
        return this.findById(record.id, options);
    }
    static async destroy(id, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.microservice.findOne({
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
        await this._createAuditLog(auditLogRepository_1.default.DELETE, record, record, options);
    }
    static async findById(id, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const include = [];
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.microservice.findOne({
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
        const records = await options.database.microservice.findAll({
            attributes: ['id'],
            where,
        });
        return records.map((record) => record.id);
    }
    static async count(filter, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        return options.database.microservice.count({
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
                    id: sequelizeFilterUtils_1.default.uuid(filter.id),
                });
            }
            if (filter.init === true ||
                filter.init === 'true' ||
                filter.init === false ||
                filter.init === 'false') {
                advancedFilter.and.push({
                    init: filter.init === true || filter.init === 'true',
                });
            }
            if (filter.running === true ||
                filter.running === 'true' ||
                filter.running === false ||
                filter.running === 'false') {
                advancedFilter.and.push({
                    running: filter.running === true || filter.running === 'true',
                });
            }
            if (filter.type) {
                advancedFilter.and.push({
                    type: filter.type,
                });
            }
            if (filter.variant) {
                advancedFilter.and.push({
                    variant: filter.variant,
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
            withSegments: false,
        }, options);
        const parsed = parser.parse({
            filter: advancedFilter,
            orderBy: orderBy || ['createdAt_DESC'],
            limit,
            offset,
        });
        // eslint-disable-next-line prefer-const
        let { rows, count } = await options.database.microservice.findAndCountAll(Object.assign(Object.assign(Object.assign({}, (parsed.where ? { where: parsed.where } : {})), (parsed.having ? { having: parsed.having } : {})), { order: parsed.order, limit: parsed.limit, offset: parsed.offset, include, transaction: sequelizeRepository_1.default.getTransaction(options) }));
        rows = await this._populateRelationsForRows(rows);
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
                [Op.or]: [{ id: sequelizeFilterUtils_1.default.uuid(query) }],
            });
        }
        const where = { [Op.and]: whereAnd };
        const records = await options.database.microservice.findAll({
            attributes: ['id', 'id'],
            where,
            limit: limit ? Number(limit) : undefined,
            order: [['id', 'ASC']],
        });
        return records.map((record) => ({
            id: record.id,
            label: record.id,
        }));
    }
    static async _createAuditLog(action, record, data, options) {
        let values = {};
        if (data) {
            values = Object.assign({}, record.get({ plain: true }));
        }
        await auditLogRepository_1.default.log({
            entityName: 'microservice',
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
exports.default = MicroserviceRepository;
//# sourceMappingURL=microserviceRepository.js.map