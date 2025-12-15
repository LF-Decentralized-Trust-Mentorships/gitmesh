"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@gitmesh/types");
const common_1 = require("@gitmesh/common");
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const automationRepository_1 = __importDefault(require("../database/repositories/automationRepository"));
const serviceBase_1 = require("./serviceBase");
const serviceSQS_1 = require("@/serverless/utils/serviceSQS");
const integrationRepository_1 = __importDefault(require("@/database/repositories/integrationRepository"));
const memberSyncRemoteRepository_1 = __importDefault(require("@/database/repositories/memberSyncRemoteRepository"));
const organizationSyncRemoteRepository_1 = __importDefault(require("@/database/repositories/organizationSyncRemoteRepository"));
const automationExecutionRepository_1 = __importDefault(require("@/database/repositories/automationExecutionRepository"));
class AutomationService extends serviceBase_1.ServiceBase {
    constructor(options) {
        super(options);
    }
    /**
     * Creates a new active automation
     * @param req {CreateAutomationRequest} data used to create a new automation
     * @returns {IAutomationData} object for frontend to use
     */
    async create(req) {
        const txOptions = await this.getTxRepositoryOptions();
        try {
            // create an automation
            const result = await new automationRepository_1.default(txOptions).create(Object.assign(Object.assign({}, req), { state: types_1.AutomationState.ACTIVE }));
            // check automation type, if hubspot trigger an automation onboard
            if (req.type === types_1.AutomationType.HUBSPOT) {
                let integration;
                try {
                    integration = await integrationRepository_1.default.findByPlatform(types_1.PlatformType.HUBSPOT, Object.assign({}, this.options));
                }
                catch (err) {
                    this.options.log.error(err, 'Error while fetching HubSpot integration from DB!');
                    throw new common_1.Error404();
                }
                // enable sync remote for integration
                integration = await integrationRepository_1.default.update(integration.id, {
                    settings: Object.assign(Object.assign({}, integration.settings), { syncRemoteEnabled: true }),
                }, txOptions);
                const integrationSyncWorkerEmitter = await (0, serviceSQS_1.getIntegrationSyncWorkerEmitter)();
                await integrationSyncWorkerEmitter.triggerOnboardAutomation(this.options.currentTenant.id, integration.id, result.id, req.trigger);
            }
            await sequelizeRepository_1.default.commitTransaction(txOptions.transaction);
            return result;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(txOptions.transaction);
            throw error;
        }
    }
    /**
     * Updates an existing automation.
     * Also used to change automation state - to enable or disable an automation.
     * It updates all the columns at once so all the properties in the request parameter
     * have to be filled.
     * @param id of the existing automation that is being updated
     * @param req {UpdateAutomationRequest} data used to update an existing automation
     * @returns {IAutomationData} object for frontend to use
     */
    async update(id, req) {
        const txOptions = await this.getTxRepositoryOptions();
        try {
            // update an existing automation including its state
            const result = await new automationRepository_1.default(txOptions).update(id, req);
            await sequelizeRepository_1.default.commitTransaction(txOptions.transaction);
            // check automation type, if hubspot trigger an automation onboard
            if (result.type === types_1.AutomationType.HUBSPOT) {
                let integration;
                try {
                    integration = await integrationRepository_1.default.findByPlatform(types_1.PlatformType.HUBSPOT, Object.assign({}, this.options));
                }
                catch (err) {
                    this.options.log.error(err, 'Error while fetching HubSpot integration from DB!');
                    throw new common_1.Error404();
                }
                if (result.trigger === types_1.AutomationSyncTrigger.MEMBER_ATTRIBUTES_MATCH ||
                    result.trigger === types_1.AutomationSyncTrigger.ORGANIZATION_ATTRIBUTES_MATCH) {
                    if (result.state === types_1.AutomationState.ACTIVE) {
                        const integrationSyncWorkerEmitter = await (0, serviceSQS_1.getIntegrationSyncWorkerEmitter)();
                        await integrationSyncWorkerEmitter.triggerOnboardAutomation(this.options.currentTenant.id, integration.id, result.id, result.trigger);
                    }
                    else if (result.trigger === types_1.AutomationSyncTrigger.MEMBER_ATTRIBUTES_MATCH) {
                        // disable memberSyncRemote for given automationId
                        const syncRepo = new memberSyncRemoteRepository_1.default(this.options);
                        await syncRepo.stopSyncingAutomation(result.id);
                    }
                    else if (result.trigger === types_1.AutomationSyncTrigger.ORGANIZATION_ATTRIBUTES_MATCH) {
                        // disable organizationSyncRemote for given automationId
                        const syncRepo = new organizationSyncRemoteRepository_1.default(this.options);
                        await syncRepo.stopSyncingAutomation(result.id);
                    }
                }
            }
            return result;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(txOptions.transaction);
            throw error;
        }
    }
    /**
     * Method used to fetch all tenants automation with filters available in the criteria parameter
     * @param criteria {AutomationCriteria} filters to be used when returning automations
     * @returns {PageData<IAutomationData>>}
     */
    async findAndCountAll(criteria) {
        return new automationRepository_1.default(this.options).findAndCountAll(criteria);
    }
    /**
     * Method used to fetch a single automation by its id
     * @param id automation id
     * @returns {IAutomationData}
     */
    async findById(id) {
        return new automationRepository_1.default(this.options).findById(id);
    }
    /**
     * Deletes existing automations by id
     * @param ids automation unique IDs to be deleted
     */
    async destroyAll(ids) {
        const txOptions = await this.getTxRepositoryOptions();
        try {
            // delete automation executions
            await new automationExecutionRepository_1.default(txOptions).destroyAllAutomation(ids);
            // delete syncRemote rows coming from automations
            await new memberSyncRemoteRepository_1.default(txOptions).destroyAllAutomation(ids);
            await new organizationSyncRemoteRepository_1.default(txOptions).destroyAllAutomation(ids);
            const result = await new automationRepository_1.default(txOptions).destroyAll(ids);
            await sequelizeRepository_1.default.commitTransaction(txOptions.transaction);
            return result;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(txOptions.transaction);
            throw error;
        }
    }
}
exports.default = AutomationService;
//# sourceMappingURL=automationService.js.map