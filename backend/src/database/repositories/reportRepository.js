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
class ReportRepository {
    static async create(data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const segmentId = data.noSegment
            ? null
            : sequelizeRepository_1.default.getStrictlySingleActiveSegment(options).id;
        const record = await options.database.report.create(Object.assign(Object.assign({}, lodash_1.default.pick(data, ['name', 'public', 'importHash', 'isTemplate', 'viewedBy'])), { tenantId: tenant.id, segmentId, createdById: currentUser.id, updatedById: currentUser.id }), {
            transaction,
        });
        await record.setWidgets(data.widgets || [], {
            transaction,
        });
        await this._createAuditLog(auditLogRepository_1.default.CREATE, record, data, options);
        return this.findById(record.id, options);
    }
    static async update(id, data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        let record = await options.database.report.findOne({
            where: Object.assign({ id, tenantId: currentTenant.id }, ReportRepository.prepareSegmentFilter(options)),
            transaction,
        });
        if (!record) {
            throw new common_1.Error404();
        }
        record = await record.update(Object.assign(Object.assign({}, lodash_1.default.pick(data, ['name', 'public', 'importHash', 'isTemplate', 'viewedBy'])), { updatedById: currentUser.id }), {
            transaction,
        });
        if (data.widgets) {
            await record.setWidgets(data.widgets || [], {
                transaction,
            });
        }
        await this._createAuditLog(auditLogRepository_1.default.UPDATE, record, data, options);
        return this.findById(record.id, options);
    }
    static async destroy(id, options, force = false) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.report.findOne({
            where: Object.assign({ id, tenantId: currentTenant.id }, ReportRepository.prepareSegmentFilter(options)),
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
        const include = [];
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.report.findOne({
            where: Object.assign({ id, tenantId: currentTenant.id }, ReportRepository.prepareSegmentFilter(options)),
            include,
            transaction,
        });
        if (!record) {
            throw new common_1.Error404();
        }
        return this._populateRelations(record, options);
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
        const records = await options.database.report.findAll({
            attributes: ['id'],
            where,
        });
        return records.map((record) => record.id);
    }
    static async count(filter, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        return options.database.report.count({
            where: Object.assign(Object.assign(Object.assign({}, filter), { tenantId: tenant.id }), ReportRepository.prepareSegmentFilter(options)),
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
            if (filter.name) {
                advancedFilter.and.push({
                    name: {
                        textContains: filter.name,
                    },
                });
            }
            if (filter.public !== undefined) {
                advancedFilter.and.push({
                    public: filter.public,
                });
            }
            if (filter.isTemplate !== undefined) {
                advancedFilter.and.push({
                    isTemplate: filter.isTemplate,
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
            segmentsNullable: true,
        }, options);
        const parsed = parser.parse({
            filter: advancedFilter,
            orderBy: orderBy || ['createdAt_DESC'],
            limit,
            offset,
        });
        let { rows, count, // eslint-disable-line prefer-const
         } = await options.database.report.findAndCountAll(Object.assign(Object.assign(Object.assign({}, (parsed.where ? { where: parsed.where } : {})), (parsed.having ? { having: parsed.having } : {})), { order: parsed.order, limit: parsed.limit, offset: parsed.offset, include, transaction: sequelizeRepository_1.default.getTransaction(options) }));
        rows = await this._populateRelationsForRows(rows, options);
        return { rows, count, limit: parsed.limit, offset: parsed.offset };
    }
    static async findAllAutocomplete(query, limit, options) {
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const whereAnd = [
            {
                tenantId: tenant.id,
            },
            Object.assign({}, ReportRepository.prepareSegmentFilter(options)),
        ];
        if (query) {
            whereAnd.push({
                [Op.or]: [{ id: sequelizeFilterUtils_1.default.uuid(query) }],
            });
        }
        const where = { [Op.and]: whereAnd };
        const records = await options.database.report.findAll({
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
            values = Object.assign(Object.assign({}, record.get({ plain: true })), { widgetsIds: data.widgets });
        }
        await auditLogRepository_1.default.log({
            entityName: 'report',
            entityId: record.id,
            action,
            values,
        }, options);
    }
    static async _populateRelationsForRows(rows, options) {
        if (!rows) {
            return rows;
        }
        return Promise.all(rows.map((record) => this._populateRelations(record, options)));
    }
    static async _populateRelations(record, options) {
        if (!record) {
            return record;
        }
        const output = record.get({ plain: true });
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        output.widgets = await record.getWidgets({
            transaction,
        });
        return output;
    }
    static prepareSegmentFilter(options) {
        return {
            [Op.or]: [
                {
                    segmentId: sequelizeRepository_1.default.getSegmentIds(options),
                },
                {
                    segmentId: {
                        [Op.is]: null,
                    },
                },
            ],
        };
    }
}
exports.default = ReportRepository;
//# sourceMappingURL=reportRepository.js.map