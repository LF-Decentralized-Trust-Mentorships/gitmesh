"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
const sequelize_1 = require("sequelize");
const types_1 = require("@gitmesh/types");
const repositoryBase_1 = require("./repositoryBase");
class AutomationExecutionRepository extends repositoryBase_1.RepositoryBase {
    constructor(options) {
        super(options, false);
    }
    async create(data) {
        const transaction = this.transaction;
        return this.database.automationExecution.create({
            automationId: data.automationId,
            type: data.type,
            tenantId: data.tenantId,
            trigger: data.trigger,
            state: data.state,
            error: data.error,
            executedAt: data.executedAt,
            eventId: data.eventId,
            payload: data.payload,
        }, { transaction });
    }
    async findAndCountAll(criteria) {
        // get current tenant that was used to make a request
        const currentTenant = this.currentTenant;
        // get plain sequelize object to use with a raw query
        const seq = this.seq;
        // construct a query with pagination
        const query = `
      select id,
             "automationId",
             state,
             error,
             "executedAt",
             "eventId",
             payload,
             count(*) over () as "paginatedItemsCount"
      from "automationExecutions"
      where "tenantId" = :tenantId
        and "automationId" = :automationId
      order by "executedAt" desc
      limit ${criteria.limit} offset ${criteria.offset}
      
    `;
        const results = await seq.query(query, {
            replacements: {
                tenantId: currentTenant.id,
                automationId: criteria.automationId,
            },
            type: sequelize_1.QueryTypes.SELECT,
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
                automationId: row.automationId,
                executedAt: row.executedAt,
                eventId: row.eventId,
                payload: row.payload,
                error: row.error,
                state: row.state,
            };
        });
        return {
            rows,
            count,
            offset: criteria.offset,
            limit: criteria.limit,
        };
    }
    async hasAlreadyBeenTriggered(automationId, eventId) {
        const seq = this.seq;
        const query = `
        select id
        from "automationExecutions"
        where "automationId" = :automationId
          and "eventId" = :eventId
          and state = '${types_1.AutomationExecutionState.SUCCESS}';
    `;
        const results = await seq.query(query, {
            replacements: {
                automationId,
                eventId,
            },
            type: sequelize_1.QueryTypes.SELECT,
        });
        return results.length > 0;
    }
    async update(id, data) {
        throw new Error('Method not implemented.');
    }
    async destroy(id) {
        throw new Error('Method not implemented.');
    }
    async destroyAllAutomation(automationIds) {
        const transaction = this.transaction;
        const seq = this.seq;
        const currentTenant = this.currentTenant;
        const query = `
    delete 
    from "automationExecutions"
    where "automationId" in (:automationIds)
      and "tenantId" = :tenantId;`;
        await seq.query(query, {
            replacements: {
                automationIds,
                tenantId: currentTenant.id,
            },
            type: sequelize_1.QueryTypes.DELETE,
            transaction,
        });
    }
    async destroyAll(ids) {
        throw new Error('Method not implemented.');
    }
    async findById(id) {
        throw new Error('Method not implemented.');
    }
}
exports.default = AutomationExecutionRepository;
//# sourceMappingURL=automationExecutionRepository.js.map