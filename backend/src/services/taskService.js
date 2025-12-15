"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const taskRepository_1 = __importDefault(require("../database/repositories/taskRepository"));
const memberRepository_1 = __importDefault(require("../database/repositories/memberRepository"));
const userRepository_1 = __importDefault(require("../database/repositories/userRepository"));
class TaskService {
    constructor(options) {
        this.options = options;
    }
    async create(data) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            if (data.members) {
                data.members = await memberRepository_1.default.filterIdsInTenant(data.members, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            const record = await taskRepository_1.default.create(data, Object.assign(Object.assign({}, this.options), { transaction }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return record;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'task');
            throw error;
        }
    }
    /**
     * Assign a task to a user
     * @param id Id of the task to assign
     * @param userId Id of the user to assign the task to. Send null for unassigning the task.
     */
    async assignTo(id, userIds) {
        if (userIds === null || userIds === undefined) {
            userIds = [];
        }
        const users = await userRepository_1.default.filterIdsInTenant(userIds, this.options);
        return this.update(id, {
            assignees: users,
        });
    }
    /**
     * Assign a task to a user by email
     * @param id Id of the task to assign
     * @param email Email of the user to assign the task to.
     */
    async assignToByEmail(id, email) {
        let userIds;
        if (email === null || email === undefined) {
            userIds = [];
        }
        else {
            userIds = [(await userRepository_1.default.findByEmail(email, this.options)).id];
        }
        return this.update(id, {
            assignees: userIds,
        });
    }
    /**
     * Update status of a task
     * @param id Id of the task to update
     * @param status New status of the task
     */
    async updateStatus(id, status) {
        if (status === null || status === undefined) {
            status = null;
        }
        return this.update(id, {
            status,
        });
    }
    async update(id, data) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            if (data.members) {
                data.members = await memberRepository_1.default.filterIdsInTenant(data.members, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            const record = await taskRepository_1.default.update(id, data, Object.assign(Object.assign({}, this.options), { transaction }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return record;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'task');
            throw error;
        }
    }
    async destroyAll(ids) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            for (const id of ids) {
                await taskRepository_1.default.destroy(id, Object.assign(Object.assign({}, this.options), { transaction }), true);
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async findById(id) {
        return taskRepository_1.default.findById(id, this.options);
    }
    async findAllAutocomplete(search, limit) {
        return taskRepository_1.default.findAllAutocomplete(search, limit, this.options);
    }
    async findAndUpdateAll(args) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            const tasks = await taskRepository_1.default.findAndCountAll({ filter: args.filter }, this.options);
            const bulkResult = await taskRepository_1.default.updateBulk(tasks.rows.map((i) => i.id), args.update, Object.assign(Object.assign({}, this.options), { transaction }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return bulkResult;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async findAndDeleteAll(args) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            const tasks = await taskRepository_1.default.findAndCountAll({ filter: args.filter }, this.options);
            for (const task of tasks.rows) {
                await taskRepository_1.default.destroy(task.id, this.options, true);
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return { rowsDeleted: tasks.count };
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async findAndCountAll(args) {
        return taskRepository_1.default.findAndCountAll(args, this.options);
    }
    async query(data) {
        const advancedFilter = data.filter;
        const orderBy = data.orderBy;
        const limit = data.limit;
        const offset = data.offset;
        return taskRepository_1.default.findAndCountAll({ advancedFilter, orderBy, limit, offset }, this.options);
    }
    async import(data, importHash) {
        if (!importHash) {
            throw new common_1.Error400(this.options.language, 'importer.errors.importHashRequired');
        }
        if (await this._isImportHashExistent(importHash)) {
            throw new common_1.Error400(this.options.language, 'importer.errors.importHashExistent');
        }
        const dataToCreate = Object.assign(Object.assign({}, data), { importHash });
        return this.create(dataToCreate);
    }
    async _isImportHashExistent(importHash) {
        const count = await taskRepository_1.default.count({
            importHash,
        }, this.options);
        return count > 0;
    }
}
exports.default = TaskService;
//# sourceMappingURL=taskService.js.map