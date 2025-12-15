"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const lodash_1 = __importDefault(require("lodash"));
const sequelize_1 = __importDefault(require("sequelize"));
const common_1 = require("@gitmesh/common");
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
const auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
const sequelizeFilterUtils_1 = __importDefault(require("../utils/sequelizeFilterUtils"));
const queryParser_1 = __importDefault(require("./filters/queryParser"));
const { Op } = sequelize_1.default;
class TaskRepository {
    static async create(data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const segment = sequelizeRepository_1.default.getStrictlySingleActiveSegment(options);
        if (data.body) {
            data.body = (0, sanitize_html_1.default)(data.body).trim();
        }
        const record = await options.database.task.create(Object.assign(Object.assign({}, lodash_1.default.pick(data, ['name', 'body', 'type', 'status', 'dueDate', 'importHash'])), { tenantId: tenant.id, segmentId: segment.id, createdById: currentUser.id, updatedById: currentUser.id }), {
            transaction,
        });
        await record.setMembers(data.members || [], {
            transaction,
        });
        await record.setActivities(data.activities || [], {
            transaction,
        });
        await record.setAssignees(data.assignees || [], {
            transaction,
        });
        await this._createAuditLog(auditLogRepository_1.default.CREATE, record, data, options);
        return this.findById(record.id, options);
    }
    static async createSuggestedTasks(options) {
        const fs = require('fs');
        const path = require('path');
        const suggestedTasks = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../initializers/suggested-tasks.json'), 'utf8'));
        for (const suggestedTask of suggestedTasks) {
            await TaskRepository.create(Object.assign(Object.assign({}, suggestedTask), { type: 'suggested' }), options);
        }
    }
    static async updateBulk(ids, data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const records = await options.database.task.update(Object.assign(Object.assign({}, data), { updatedById: currentUser.id }), {
            where: {
                id: ids,
                tenantId: currentTenant.id,
                segmentId: sequelizeRepository_1.default.getSegmentIds(options),
            },
            transaction,
        });
        return { rowsUpdated: records[0] };
    }
    static async update(id, data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        let record = await options.database.task.findOne({
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
        if (data.body) {
            data.body = (0, sanitize_html_1.default)(data.body).trim();
        }
        record = await record.update(Object.assign(Object.assign({}, lodash_1.default.pick(data, ['name', 'body', 'status', 'type', 'dueDate', 'importHash'])), { updatedById: currentUser.id }), {
            transaction,
        });
        if (data.members) {
            await record.setMembers(data.members, {
                transaction,
            });
        }
        if (data.activities) {
            await record.setActivities(data.activities, {
                transaction,
            });
        }
        if (data.assignees) {
            await record.setAssignees(data.assignees, {
                transaction,
            });
        }
        await this._createAuditLog(auditLogRepository_1.default.UPDATE, record, data, options);
        return this.findById(record.id, options);
    }
    static async destroy(id, options, force = false) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.task.findOne({
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
        const include = [];
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const record = await options.database.task.findOne({
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
        const records = await options.database.task.findAll({
            attributes: ['id'],
            where,
        });
        return records.map((record) => record.id);
    }
    static async count(filter, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        return options.database.task.count({
            where: Object.assign(Object.assign({}, filter), { tenantId: tenant.id, segmentId: sequelizeRepository_1.default.getSegmentIds(options) }),
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
            if (filter.body) {
                advancedFilter.and.push({
                    body: {
                        textContains: filter.body,
                    },
                });
            }
            if (filter.type) {
                advancedFilter.and.push({
                    type: {
                        textContains: filter.type,
                    },
                });
            }
            if (filter.status) {
                advancedFilter.and.push({
                    status: filter.status,
                });
            }
            if (filter.dueDateRange) {
                const [start, end] = filter.dueDateRange;
                if (start !== undefined && start !== null && start !== '') {
                    advancedFilter.and.push({
                        dueDate: {
                            gte: start,
                        },
                    });
                }
                if (end !== undefined && end !== null && end !== '') {
                    advancedFilter.and.push({
                        dueDate: {
                            lte: end,
                        },
                    });
                }
            }
            if (filter.assignees) {
                advancedFilter.and.push({
                    assignees: filter.assignees,
                });
            }
            if (filter.members) {
                advancedFilter.and.push({
                    members: filter.members,
                });
            }
            if (filter.activities) {
                advancedFilter.and.push({
                    activities: filter.activities,
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
            manyToMany: {
                members: {
                    table: 'tasks',
                    model: 'task',
                    relationTable: {
                        name: 'memberTasks',
                        from: 'taskId',
                        to: 'memberId',
                    },
                },
                assignees: {
                    table: 'tasks',
                    model: 'task',
                    relationTable: {
                        name: 'taskAssignees',
                        from: 'taskId',
                        to: 'userId',
                    },
                },
                activities: {
                    table: 'tasks',
                    model: 'task',
                    relationTable: {
                        name: 'activityTasks',
                        from: 'taskId',
                        to: 'activityId',
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
        let { rows, count, // eslint-disable-line prefer-const
         } = await options.database.task.findAndCountAll(Object.assign(Object.assign(Object.assign({}, (parsed.where ? { where: parsed.where } : {})), (parsed.having ? { having: parsed.having } : {})), { order: parsed.order, limit: parsed.limit, offset: parsed.offset, include, transaction: sequelizeRepository_1.default.getTransaction(options) }));
        rows = await this._populateRelationsForRows(rows, options);
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
                        [Op.and]: sequelizeFilterUtils_1.default.ilikeIncludes('task', 'name', query),
                    },
                ],
            });
        }
        const where = { [Op.and]: whereAnd };
        const records = await options.database.task.findAll({
            attributes: ['id', 'name'],
            where,
            limit: limit ? Number(limit) : undefined,
            order: [['name', 'ASC']],
        });
        return records.map((record) => ({
            id: record.id,
            label: record.name,
        }));
    }
    static async _createAuditLog(action, record, data, options) {
        let values = {};
        if (data) {
            values = Object.assign(Object.assign({}, record.get({ plain: true })), { memberIds: data.members });
        }
        await auditLogRepository_1.default.log({
            entityName: 'task',
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
        output.members = await record.getMembers({
            transaction,
            joinTableAttributes: [],
        });
        output.activities = await record.getActivities({
            transaction,
            joinTableAttributes: [],
        });
        output.assignees = (await record.getAssignees({
            transaction,
            joinTableAttributes: [],
            raw: true,
        })).map((a) => ({ id: a.id, avatarUrl: null, fullName: a.fullName, email: a.email }));
        return output;
    }
}
exports.default = TaskRepository;
//# sourceMappingURL=taskRepository.js.map