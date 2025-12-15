"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const widgetRepository_1 = __importDefault(require("../database/repositories/widgetRepository"));
const reportRepository_1 = __importDefault(require("../database/repositories/reportRepository"));
class WidgetService {
    constructor(options) {
        this.options = options;
    }
    async create(data) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            if (data.report) {
                data.report = await reportRepository_1.default.filterIdInTenant(data.report, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            const record = await widgetRepository_1.default.create(data, Object.assign(Object.assign({}, this.options), { transaction }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return record;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'widget');
            throw error;
        }
    }
    async update(id, data) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            if (data.report) {
                data.report = await reportRepository_1.default.filterIdInTenant(data.report, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            const record = await widgetRepository_1.default.update(id, data, Object.assign(Object.assign({}, this.options), { transaction }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return record;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'widget');
            throw error;
        }
    }
    async destroyAll(ids) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            for (const id of ids) {
                await widgetRepository_1.default.destroy(id, Object.assign(Object.assign({}, this.options), { transaction }), true);
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async findById(id) {
        return widgetRepository_1.default.findById(id, this.options);
    }
    async findAllAutocomplete(search, limit) {
        return widgetRepository_1.default.findAllAutocomplete(search, limit, this.options);
    }
    async findAndCountAll(args) {
        return widgetRepository_1.default.findAndCountAll(args, this.options);
    }
    async query(data) {
        const advancedFilter = data.filter;
        const orderBy = data.orderBy;
        const limit = data.limit;
        const offset = data.offset;
        return widgetRepository_1.default.findAndCountAll({ advancedFilter, orderBy, limit, offset }, this.options);
    }
    async findByType(type) {
        return widgetRepository_1.default.findByType(type, this.options);
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
        const count = await widgetRepository_1.default.count({
            importHash,
        }, this.options);
        return count > 0;
    }
}
exports.default = WidgetService;
//# sourceMappingURL=widgetService.js.map