"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const reportRepository_1 = __importDefault(require("../database/repositories/reportRepository"));
const widgetRepository_1 = __importDefault(require("../database/repositories/widgetRepository"));
const track_1 = __importDefault(require("../segment/track"));
const conf_1 = require("../conf");
class ReportService {
    constructor(options) {
        this.options = options;
    }
    async create(data) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            if (data.widgets) {
                data.widgets = await widgetRepository_1.default.filterIdsInTenant(data.widgets, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            const record = await reportRepository_1.default.create(data, Object.assign(Object.assign({}, this.options), { transaction }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return record;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'report');
            throw error;
        }
    }
    async duplicate(id) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            const report = await reportRepository_1.default.findById(id, Object.assign(Object.assign({}, this.options), { transaction }));
            let duplicatedReport = await reportRepository_1.default.create({
                name: `${report.name} (copy)`,
                public: false,
                widgets: [],
            }, Object.assign(Object.assign({}, this.options), { transaction }));
            for (const widget of report.widgets) {
                await widgetRepository_1.default.create({
                    settings: widget.settings,
                    title: widget.title,
                    type: widget.type,
                    report: duplicatedReport.id,
                }, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            duplicatedReport = await reportRepository_1.default.findById(duplicatedReport.id, Object.assign(Object.assign({}, this.options), { transaction }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return duplicatedReport;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'report');
            throw error;
        }
    }
    async update(id, data) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            if (data.widgets) {
                data.widgets = await widgetRepository_1.default.filterIdsInTenant(data.widgets, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            const recordBeforeUpdate = await reportRepository_1.default.findById(id, Object.assign({}, this.options));
            const record = await reportRepository_1.default.update(id, data, Object.assign(Object.assign({}, this.options), { transaction }));
            if ((data.published === true || data.published === 'true') &&
                (record.published === true || record.published === 'true') &&
                recordBeforeUpdate.published !== record.published &&
                !conf_1.IS_TEST_ENV) {
                (0, track_1.default)('Report Published', { id: record.id }, Object.assign({}, this.options));
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return record;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'report');
            throw error;
        }
    }
    async destroyAll(ids) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            for (const id of ids) {
                await reportRepository_1.default.destroy(id, Object.assign(Object.assign({}, this.options), { transaction }), true);
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async findById(id) {
        return reportRepository_1.default.findById(id, this.options);
    }
    async findAllAutocomplete(search, limit) {
        return reportRepository_1.default.findAllAutocomplete(search, limit, this.options);
    }
    async findAndCountAll(args) {
        return reportRepository_1.default.findAndCountAll(args, this.options);
    }
    async query(data) {
        const advancedFilter = data.filter;
        const orderBy = data.orderBy;
        const limit = data.limit;
        const offset = data.offset;
        return reportRepository_1.default.findAndCountAll({ advancedFilter, orderBy, limit, offset }, this.options);
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
        const count = await reportRepository_1.default.count({
            importHash,
        }, this.options);
        return count > 0;
    }
}
exports.default = ReportService;
//# sourceMappingURL=reportService.js.map