"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const microserviceRepository_1 = __importDefault(require("../database/repositories/microserviceRepository"));
const pythonWorkerSQS_1 = require("../serverless/utils/pythonWorkerSQS");
class MicroserviceService {
    constructor(options) {
        this.options = options;
    }
    /**
     * Creates microservice entity with given data
     * @param data object representation of the microservice entity
     * @param forceRunOnCreation if set to true, sqs message is sent
     * to start the created microservice immediately
     * @returns created plain microservice object
     */
    async create(data, forceRunOnCreation = false) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            const record = await microserviceRepository_1.default.create(data, Object.assign(Object.assign({}, this.options), { transaction }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            if (forceRunOnCreation) {
                await (0, pythonWorkerSQS_1.sendPythonWorkerMessage)(this.options.currentTenant.id, {
                    type: data.type,
                });
            }
            return record;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'microservice');
            throw error;
        }
    }
    /**
     * Create a microservice if it does not exist already. Otherwise, return it.
     * @param data Data for creating the microservice
     * @returns The microservice, either the existing or the created one
     */
    async createIfNotExists(data) {
        const type = data.type;
        const existing = await microserviceRepository_1.default.findAndCountAll({ filter: { type }, limit: 1 }, this.options);
        if (existing.count === 0) {
            return this.create(data);
        }
        return existing.rows[0];
    }
    async update(id, data) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            const record = await microserviceRepository_1.default.update(id, data, Object.assign(Object.assign({}, this.options), { transaction }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return record;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'microservice');
            throw error;
        }
    }
    async destroyAll(ids) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            for (const id of ids) {
                await microserviceRepository_1.default.destroy(id, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async findById(id) {
        return microserviceRepository_1.default.findById(id, this.options);
    }
    async findAllAutocomplete(search, limit) {
        return microserviceRepository_1.default.findAllAutocomplete(search, limit, this.options);
    }
    async findAndCountAll(args) {
        return microserviceRepository_1.default.findAndCountAll(args, this.options);
    }
    async query(data) {
        const advancedFilter = data.filter;
        const orderBy = data.orderBy;
        const limit = data.limit;
        const offset = data.offset;
        return microserviceRepository_1.default.findAndCountAll({ advancedFilter, orderBy, limit, offset }, this.options);
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
        const count = await microserviceRepository_1.default.count({
            importHash,
        }, this.options);
        return count > 0;
    }
}
exports.default = MicroserviceService;
//# sourceMappingURL=microserviceService.js.map