"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serviceBase_1 = require("./serviceBase");
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const automationExecutionRepository_1 = __importDefault(require("../database/repositories/automationExecutionRepository"));
class AutomationExecutionService extends serviceBase_1.ServiceBase {
    constructor(options) {
        super(options);
    }
    /**
     * Method used by service that is processing automations as they are triggered
     * @param data {CreateAutomationExecutionRequest} all the necessary data to log a new automation execution
     */
    async create(data) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            const record = await new automationExecutionRepository_1.default(this.options).create({
                automationId: data.automation.id,
                type: data.automation.type,
                tenantId: data.automation.tenantId,
                trigger: data.automation.trigger,
                error: data.error !== undefined ? data.error : null,
                executedAt: new Date(),
                state: data.state,
                eventId: data.eventId,
                payload: data.payload,
            });
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return record;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    /**
     * Method used to fetch all automation executions.
     * @param criteria {AutomationExecutionCriteria} filters to be used when returning automation executions
     * @returns {PageData<AutomationExecution>>}
     */
    async findAndCountAll(criteria) {
        return new automationExecutionRepository_1.default(this.options).findAndCountAll(criteria);
    }
    async update(id, data) {
        throw new Error('Method not implemented.');
    }
    async destroyAll(ids) {
        throw new Error('Method not implemented.');
    }
    async findById(id) {
        throw new Error('Method not implemented.');
    }
}
exports.default = AutomationExecutionService;
//# sourceMappingURL=automationExecutionService.js.map