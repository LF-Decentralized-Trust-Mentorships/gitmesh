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
const types_1 = require("@gitmesh/types");
const sequelize_1 = __importStar(require("sequelize"));
const common_1 = require("@gitmesh/common");
const isFeatureEnabled_1 = require("@/feature-flags/isFeatureEnabled");
const auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
const repositoryBase_1 = require("./repositoryBase");
const { Op } = sequelize_1.default;
class AutomationRepository extends repositoryBase_1.RepositoryBase {
    constructor(options) {
        super(options, true);
    }
    async create(data) {
        const currentUser = this.currentUser;
        const tenant = this.currentTenant;
        const transaction = this.transaction;
        const existingActiveAutomations = await this.findAndCountAll({
            state: types_1.AutomationState.ACTIVE,
        });
        const record = await this.database.automation.create({
            name: data.name,
            type: data.type,
            trigger: data.trigger,
            settings: data.settings,
            state: existingActiveAutomations.count >= isFeatureEnabled_1.PLAN_LIMITS[tenant.plan][types_1.FeatureFlag.AUTOMATIONS]
                ? types_1.AutomationState.DISABLED
                : data.state,
            tenantId: tenant.id,
            createdById: currentUser.id,
            updatedById: currentUser.id,
        }, {
            transaction,
        });
        await this.createAuditLog('automation', auditLogRepository_1.default.CREATE, record, data);
        return this.findById(record.id);
    }
    async update(id, data) {
        const currentUser = this.currentUser;
        const currentTenant = this.currentTenant;
        const transaction = this.transaction;
        const existingActiveAutomations = await this.findAndCountAll({
            state: types_1.AutomationState.ACTIVE,
        });
        if (data.state === types_1.AutomationState.ACTIVE &&
            existingActiveAutomations.count >= isFeatureEnabled_1.PLAN_LIMITS[currentTenant.plan][types_1.FeatureFlag.AUTOMATIONS]) {
            throw new Error(`Maximum number of active automations reached for the plan!`);
        }
        let record = await this.database.automation.findOne({
            where: {
                id,
                tenantId: currentTenant.id,
            },
            transaction,
        });
        if (!record) {
            throw new common_1.Error404();
        }
        record = await record.update({
            name: data.name,
            trigger: data.trigger,
            settings: data.settings,
            state: data.state,
            updatedById: currentUser.id,
        }, {
            transaction,
        });
        await this.createAuditLog('automation', auditLogRepository_1.default.UPDATE, record, data);
        return this.findById(record.id);
    }
    async destroyAll(ids) {
        const transaction = this.transaction;
        const currentTenant = this.currentTenant;
        const records = await this.database.automation.findAll({
            where: {
                id: {
                    [Op.in]: ids,
                },
                tenantId: currentTenant.id,
            },
            transaction,
        });
        if (ids.some((id) => records.find((r) => r.id === id) === undefined)) {
            throw new common_1.Error404();
        }
        await Promise.all(records.flatMap((r) => [
            r.destroy({ transaction }),
            this.createAuditLog('automation', auditLogRepository_1.default.DELETE, r, r),
        ]));
    }
    async findById(id) {
        const results = await this.findAndCountAll({
            id,
            offset: 0,
            limit: 1,
        });
        if (results.count === 1) {
            return results.rows[0];
        }
        if (results.count === 0) {
            throw new common_1.Error404();
        }
        throw new Error('More than one row returned when fetching by automation unique ID!');
    }
    async findAndCountAll(criteria) {
        // get current tenant that was used to make a request
        const currentTenant = this.currentTenant;
        // we need transaction if there is one set because some records were perhaps created/updated in the same transaction
        const transaction = this.transaction;
        // get plain sequelize object to use with a raw query
        const seq = this.seq;
        // build a where condition based on tenant and other criteria passed as parameter
        const conditions = ['a."tenantId" = :tenantId'];
        const parameters = {
            tenantId: currentTenant.id,
        };
        if (criteria.id) {
            conditions.push('a.id = :id');
            parameters.id = criteria.id;
        }
        if (criteria.state) {
            conditions.push('a.state = :state');
            parameters.state = criteria.state;
        }
        if (criteria.type) {
            conditions.push('a.type = :type');
            parameters.type = criteria.type;
        }
        if (criteria.trigger) {
            conditions.push('a.trigger = :trigger');
            parameters.trigger = criteria.trigger;
        }
        const conditionsString = conditions.join(' and ');
        const query = `
    -- common table expression (CTE) to prepare the last execution information for each automationId
      with latest_executions as (select distinct on ("automationId") "automationId", "executedAt", state, error
                                from "automationExecutions"
                                order by "automationId", "executedAt" desc)
      select a.id,
            a.name,
            a.type,
            a."tenantId",
            a.trigger,
            a.settings,
            a.state,
            a."createdAt",
            a."updatedAt",
            le."executedAt" as "lastExecutionAt",
            le.state        as "lastExecutionState",
            le.error        as "lastExecutionError",
            count(*) over () as "paginatedItemsCount"
      from automations a
              left join latest_executions le on a.id = le."automationId"
      where ${conditionsString}
      order by "updatedAt" desc
      ${this.getPaginationString(criteria)}
    `;
        // fetch all automations for a tenant
        // and include the latest execution data if available
        const results = await seq.query(query, {
            replacements: parameters,
            type: sequelize_1.QueryTypes.SELECT,
            transaction,
        });
        if (results.length === 0) {
            return {
                rows: [],
                count: 0,
                offset: criteria.offset,
                limit: criteria.limit,
            };
        }
        const count = parseInt(results[0].paginatedItemsCount, 10);
        const rows = results.map((r) => {
            const row = r;
            return {
                id: row.id,
                name: row.name,
                type: row.type,
                tenantId: row.tenantId,
                trigger: row.trigger,
                settings: row.settings,
                state: row.state,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
                lastExecutionAt: row.lastExecutionAt,
                lastExecutionState: row.lastExecutionState,
                lastExecutionError: row.lastExecutionError,
            };
        });
        return {
            rows,
            count,
            offset: criteria.offset,
            limit: criteria.limit,
        };
    }
    static async countAllActive(database, tenantId) {
        const automationCount = await database.automation.count({
            where: {
                tenantId,
                state: types_1.AutomationState.ACTIVE,
            },
            useMaster: true,
        });
        return automationCount;
    }
    async findSyncAutomations(tenantId, platform) {
        const seq = this.seq;
        const transaction = this.transaction;
        const pageSize = 10;
        const syncAutomations = [];
        let results;
        let offset;
        do {
            offset = results ? pageSize + offset : 0;
            results = await seq.query(`select * from automations 
      where type = :platform and "tenantId" = :tenantId and trigger in (:syncAutomationTriggers)
      limit :limit offset :offset`, {
                replacements: {
                    tenantId,
                    platform,
                    syncAutomationTriggers: [
                        types_1.AutomationSyncTrigger.MEMBER_ATTRIBUTES_MATCH,
                        types_1.AutomationSyncTrigger.ORGANIZATION_ATTRIBUTES_MATCH,
                    ],
                    limit: pageSize,
                    offset,
                },
                type: sequelize_1.QueryTypes.SELECT,
                transaction,
            });
            syncAutomations.push(...results);
        } while (results.length > 0);
        return syncAutomations;
    }
}
exports.default = AutomationRepository;
//# sourceMappingURL=automationRepository.js.map