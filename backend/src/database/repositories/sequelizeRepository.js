"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const sequelize_1 = require("sequelize");
const logging_1 = require("@gitmesh/logging");
const redis_1 = require("@gitmesh/redis");
const feature_flags_1 = require("@gitmesh/feature-flags");
const types_1 = require("@gitmesh/types");
const common_1 = require("@gitmesh/common");
const temporal_1 = require("@gitmesh/temporal");
const conf_1 = require("../../conf");
const databaseConnection_1 = require("../databaseConnection");
/**
 * Abstracts some basic Sequelize operations.
 * See https://sequelize.org/v5/index.html to learn how to customize it.
 */
class SequelizeRepository {
    /**
     * Cleans the database.
     */
    static async cleanDatabase(database) {
        if (!conf_1.IS_TEST_ENV) {
            throw new Error('Clean database only allowed for test!');
        }
        await database.sequelize.sync({ force: true });
    }
    static async getDefaultIRepositoryOptions(user, tenant, segments) {
        let unleash;
        if (conf_1.UNLEASH_CONFIG.url && conf_1.API_CONFIG.edition === types_1.Edition.HOSTED) {
            unleash = await (0, feature_flags_1.getUnleashClient)({
                url: conf_1.UNLEASH_CONFIG.url,
                apiKey: conf_1.UNLEASH_CONFIG.backendApiKey,
                appName: common_1.SERVICE,
            });
        }
        let temporal;
        if (conf_1.TEMPORAL_CONFIG.serverUrl) {
            temporal = await (0, temporal_1.getTemporalClient)(conf_1.TEMPORAL_CONFIG);
        }
        return {
            log: (0, logging_1.getServiceLogger)(),
            database: await (0, databaseConnection_1.databaseInit)(),
            currentTenant: tenant,
            currentUser: user,
            currentSegments: segments,
            bypassPermissionValidation: true,
            language: 'en',
            redis: await (0, redis_1.getRedisClient)(conf_1.REDIS_CONFIG, true),
            unleash,
            temporal,
        };
    }
    /**
     * Returns the currentUser if it exists on the options.
     */
    static getCurrentUser(options) {
        return (options && options.currentUser) || { id: null };
    }
    /**
     * Returns the tenant if it exists on the options.
     */
    static getCurrentTenant(options) {
        return (options && options.currentTenant) || { id: null };
    }
    static getCurrentSegments(options) {
        return (options && options.currentSegments) || [];
    }
    static getStrictlySingleActiveSegment(options) {
        if (options.currentSegments.length !== 1) {
            throw new common_1.Error400(`This operation can have exactly one segment. Found ${options.currentSegments.length} segments.`);
        }
        return options.currentSegments[0];
    }
    /**
     * Returns the transaction if it exists on the options.
     */
    static getTransaction(options) {
        return (options && options.transaction) || undefined;
    }
    /**
     * Creates a database transaction.
     */
    static async createTransaction(options) {
        if (options.transaction) {
            if (options.transaction.gitmeshNestedTransactions !== undefined) {
                options.transaction.gitmeshNestedTransactions++;
            }
            else {
                options.transaction.gitmeshNestedTransactions = 1;
            }
            return options.transaction;
        }
        return options.database.sequelize.transaction();
    }
    /**
     * Creates a transactional repository options instance
     */
    static async createTransactionalRepositoryOptions(options) {
        const transaction = await this.createTransaction(options);
        return Object.assign(Object.assign({}, options), { transaction });
    }
    /**
     * Commits a database transaction.
     */
    static async commitTransaction(transaction) {
        if (transaction.gitmeshNestedTransactions !== undefined &&
            transaction.gitmeshNestedTransactions > 0) {
            transaction.gitmeshNestedTransactions--;
            return Promise.resolve();
        }
        return transaction.commit();
    }
    /**
     * Rolls back a database transaction.
     */
    static async rollbackTransaction(transaction) {
        if (transaction.gitmeshNestedTransactions !== undefined &&
            transaction.gitmeshNestedTransactions > 0) {
            transaction.gitmeshNestedTransactions--;
            return Promise.resolve();
        }
        return transaction.rollback();
    }
    static handleUniqueFieldError(error, language, entityName) {
        if (!(error instanceof sequelize_1.UniqueConstraintError)) {
            return;
        }
        const fieldName = lodash_1.default.get(error, 'errors[0].path');
        throw new common_1.Error400(language, `entities.${entityName}.errors.unique.${fieldName}`);
    }
    static getSequelize(options) {
        return options.database.sequelize;
    }
    static getSegmentIds(options) {
        return options.currentSegments.map((s) => s.id);
    }
}
exports.default = SequelizeRepository;
//# sourceMappingURL=sequelizeRepository.js.map