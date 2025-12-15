"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryBase = void 0;
const auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
class RepositoryBase {
    constructor(options, log = false) {
        this.options = options;
        this.log = log;
    }
    get currentUser() {
        return sequelizeRepository_1.default.getCurrentUser(this.options);
    }
    get currentTenant() {
        return sequelizeRepository_1.default.getCurrentTenant(this.options);
    }
    get transaction() {
        return sequelizeRepository_1.default.getTransaction(this.options);
    }
    get seq() {
        return sequelizeRepository_1.default.getSequelize(this.options);
    }
    get database() {
        return this.options.database;
    }
    async create(data) {
        throw new Error('Method not implemented.');
    }
    async update(id, data) {
        throw new Error('Method not implemented.');
    }
    async destroy(id) {
        return this.destroyAll([id]);
    }
    async destroyAll(ids) {
        throw new Error('Method not implemented.');
    }
    async findById(id) {
        throw new Error('Method not implemented.');
    }
    async findAndCountAll(criteria) {
        throw new Error('Method not implemented.');
    }
    async findAll(criteria) {
        const copy = Object.assign({}, criteria);
        // let's initially load just the first row in the db to see how many elements there are in total
        copy.offset = undefined;
        copy.limit = undefined;
        const page = await this.findAndCountAll(criteria);
        return page.rows;
    }
    async createAuditLog(entity, action, record, data) {
        if (this.log) {
            let values = {};
            if (data) {
                values = Object.assign({}, record.get({ plain: true }));
            }
            await auditLogRepository_1.default.log({
                entityName: entity,
                entityId: record.id,
                action,
                values,
            }, this.options);
        }
    }
    async populateRelationsForRows(rows) {
        return Promise.all(rows.map((r) => this.populateRelations(r)));
    }
    async populateRelations(record) {
        if (!record)
            return record;
        return record.get({ plain: true });
    }
    isPaginationValid(criteria) {
        if (criteria.limit !== undefined && criteria.offset !== undefined) {
            return criteria.limit > 0 && criteria.offset >= 0;
        }
        return false;
    }
    getPaginationString(criteria) {
        if (this.isPaginationValid(criteria)) {
            return `limit ${criteria.limit} offset ${criteria.offset}`;
        }
        return '';
    }
}
exports.RepositoryBase = RepositoryBase;
//# sourceMappingURL=repositoryBase.js.map