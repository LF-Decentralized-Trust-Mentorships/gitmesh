"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const common_1 = require("@gitmesh/common");
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
const auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
class OrganizationCacheRepository {
    static async create(data, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const record = await options.database.organizationCache.create(Object.assign({}, lodash_1.default.pick(data, [
            'name',
            'url',
            'description',
            'emails',
            'phoneNumbers',
            'logo',
            'tags',
            'twitter',
            'linkedin',
            'crunchbase',
            'employees',
            'revenueRange',
            'importHash',
            'enriched',
            'website',
            'github',
            'location',
            'employeeCountByCountry',
            'type',
            'ticker',
            'headline',
            'profiles',
            'naics',
            'industry',
            'founded',
            'address',
            'size',
            'lastEnrichedAt',
            'manuallyCreated',
        ])), {
            transaction,
        });
        await this._createAuditLog(auditLogRepository_1.default.CREATE, record, data, options);
        return this.findById(record.id, options);
    }
    static async update(id, data, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        let record = await options.database.organizationCache.findOne({
            where: {
                id,
            },
            transaction,
        });
        if (!record) {
            throw new common_1.Error404();
        }
        record = await record.update(Object.assign({}, lodash_1.default.pick(data, [
            'name',
            'url',
            'description',
            'emails',
            'phoneNumbers',
            'logo',
            'tags',
            'twitter',
            'linkedin',
            'crunchbase',
            'employees',
            'revenueRange',
            'importHash',
            'enriched',
            'website',
            'github',
            'location',
            'geoLocation',
            'employeeCountByCountry',
            'geoLocation',
            'address',
            'type',
            'ticker',
            'headline',
            'profiles',
            'naics',
            'industry',
            'founded',
            'size',
            'employees',
            'twitter',
            'lastEnrichedAt',
        ])), {
            transaction,
        });
        if (!record) {
            throw new common_1.Error404();
        }
        await this._createAuditLog(auditLogRepository_1.default.UPDATE, record, data, options);
        return this.findById(record.id, options);
    }
    static async bulkUpdate(data, options, isEnrichment = false) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        if (isEnrichment) {
            // Fetch existing organizations
            const existingRecords = await options.database.organizationCache.findAll({
                where: {
                    id: {
                        [options.database.Sequelize.Op.in]: data.map((x) => x.id),
                    },
                },
                transaction,
            });
            // Merge existing tags with new tags instead of overwriting
            data = data.map((org) => {
                const existingOrg = existingRecords.find((record) => record.id === org.id);
                if (existingOrg && existingOrg.tags) {
                    // Merge existing and new tags without duplicates
                    org.tags = lodash_1.default.uniq([...org.tags, ...existingOrg.tags]);
                }
                return org;
            });
        }
        for (const org of data) {
            this.update(org.id, org, options);
        }
    }
    static async destroy(id, options, force = false) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const record = await options.database.organizationCache.findOne({
            where: {
                id,
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
        const record = await options.database.organizationCache.findOne({
            where: {
                id,
            },
            include,
            transaction,
        });
        if (!record) {
            throw new common_1.Error404();
        }
        const output = record.get({ plain: true });
        return output;
    }
    static async findByUrl(url, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const include = [];
        const record = await options.database.organizationCache.findOne({
            where: {
                url,
            },
            include,
            transaction,
        });
        if (!record) {
            return undefined;
        }
        const output = record.get({ plain: true });
        return output;
    }
    static async findByName(name, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const include = [];
        const record = await options.database.organizationCache.findOne({
            where: {
                name,
            },
            include,
            transaction,
        });
        if (!record) {
            return undefined;
        }
        const output = record.get({ plain: true });
        return output;
    }
    static async _createAuditLog(action, record, data, options) {
        let values = {};
        if (data) {
            values = Object.assign({}, record.get({ plain: true }));
        }
        await auditLogRepository_1.default.log({
            entityName: 'organizationCache',
            entityId: record.id,
            action,
            values,
        }, options);
    }
}
exports.default = OrganizationCacheRepository;
//# sourceMappingURL=organizationCacheRepository.js.map