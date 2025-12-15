"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importStar(require("sequelize"));
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
const sequelizeFilterUtils_1 = __importDefault(require("../utils/sequelizeFilterUtils"));
const { Op } = sequelize_1.default;
class AuditLogRepository {
    static get CREATE() {
        return 'create';
    }
    static get UPDATE() {
        return 'update';
    }
    static get DELETE() {
        return 'delete';
    }
    /**
     * Saves an Audit Log to the database.
     *
     * @param  {Object} log - The log being saved.
     * @param  {string} log.entityName - The name of the entity. Ex.: customer
     * @param  {string} log.entityId - The id of the entity.
     * @param  {string} log.action - The action [create, update or delete].
     * @param  {Object} log.values - The JSON log value with data of the entity.
     *
     * @param  {Object} options
     * @param  {Object} options.transaction - The current database transaction.
     * @param  {Object} options.currentUser - The current logged user.
     * @param  {Object} options.currentTenant - The current currentTenant.
     */
    static async log({ entityName, entityId, action, values }, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentTenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const log = await options.database.auditLog.create({
            entityName,
            tenantId: currentTenant.id,
            entityId,
            action,
            values,
            timestamp: new Date(),
            createdById: options && options.currentUser ? options.currentUser.id : null,
            createdByEmail: options && options.currentUser ? options.currentUser.email : null,
        }, { transaction });
        return log;
    }
    static async cleanUpOldAuditLogs(maxMonthsToKeep, options) {
        const seq = sequelizeRepository_1.default.getSequelize(options);
        await seq.query(`
      delete from "auditLogs" where timestamp < now() - interval '${maxMonthsToKeep} months'
      `, {
            type: sequelize_1.QueryTypes.DELETE,
        });
    }
    static async findAndCountAll({ filter, limit = 0, offset = 0, orderBy = '' }, options) {
        const tenant = sequelizeRepository_1.default.getCurrentTenant(options);
        const whereAnd = [];
        const include = [];
        whereAnd.push({
            tenantId: tenant.id,
        });
        if (filter) {
            if (filter.timestampRange) {
                const [start, end] = filter.timestampRange;
                if (start !== undefined && start !== null && start !== '') {
                    whereAnd.push({
                        timestamp: {
                            [Op.gte]: start,
                        },
                    });
                }
                if (end !== undefined && end !== null && end !== '') {
                    whereAnd.push({
                        timestamp: {
                            [Op.lte]: end,
                        },
                    });
                }
            }
            if (filter.action) {
                whereAnd.push({
                    action: filter.action,
                });
            }
            if (filter.entityId) {
                whereAnd.push({
                    entityId: filter.entityId,
                });
            }
            if (filter.createdByEmail) {
                whereAnd.push({
                    [Op.and]: sequelizeFilterUtils_1.default.ilikeIncludes('auditLog', 'createdByEmail', filter.createdByEmail),
                });
            }
            if (filter.entityNames && filter.entityNames.length) {
                whereAnd.push({
                    entityName: {
                        [Op.in]: filter.entityNames,
                    },
                });
            }
        }
        const where = { [Op.and]: whereAnd };
        return options.database.auditLog.findAndCountAll({
            where,
            include,
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
            order: orderBy ? [orderBy.split('_')] : [['timestamp', 'DESC']],
        });
    }
}
exports.default = AuditLogRepository;
//# sourceMappingURL=auditLogRepository.js.map