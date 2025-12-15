"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const memberService_1 = __importDefault(require("../../services/memberService"));
const operations_1 = __importDefault(require("./operations"));
const activityService_1 = __importDefault(require("../../services/activityService"));
const integrationService_1 = __importDefault(require("../../services/integrationService"));
const microserviceService_1 = __importDefault(require("../../services/microserviceService"));
/**
 * Update a bulk of members
 * @param records The records to perform the operation to
 * @returns Success/error message
 */
async function updateMembers(records, options) {
    const memberService = new memberService_1.default(options);
    while (records.length > 0) {
        const record = records.shift();
        await memberService.update(record.id, record.update);
    }
}
/**
 * Upsert a bulk of members
 * @param records The records to perform the operation to
 * @returns Success/error message
 */
async function upsertMembers(records, options) {
    const memberService = new memberService_1.default(options);
    while (records.length > 0) {
        const record = records.shift();
        await memberService.upsert(record);
    }
}
/**
 * Upsert a bulk of activities with members
 * @param records The records to perform the operation to
 * @returns Success/error message
 */
async function upsertActivityWithMembers(records, options, fireGitmeshWebhooks = true) {
    const activityService = new activityService_1.default(options);
    while (records.length > 0) {
        const record = records.shift();
        await activityService.createWithMember(record, fireGitmeshWebhooks);
    }
}
/**
 * Update a bulk of integrations
 * @param records The records to perform the operation to
 * @returns Success/error message
 */
async function updateIntegrations(records, options) {
    const integrationService = new integrationService_1.default(options);
    while (records.length > 0) {
        const record = records.shift();
        await integrationService.update(record.id, record.update);
    }
}
/**
 * Update a bulk of microservices
 * @param records The records to perform the operation to
 */
async function updateMicroservice(records, options) {
    const microserviceService = new microserviceService_1.default(options);
    while (records.length > 0) {
        const record = records.shift();
        await microserviceService.update(record.id, record.update);
    }
}
/**
 * Worker function to choose an operation to perform
 * @param operation Operation to perform, one in the list of Operations
 * @param records Records to perform the operation to
 * @returns
 */
async function bulkOperations(operation, records, options, fireGitmeshWebhooks = false) {
    switch (operation) {
        case operations_1.default.UPDATE_MEMBERS:
            return updateMembers(records, options);
        case operations_1.default.UPSERT_MEMBERS:
            return upsertMembers(records, options);
        case operations_1.default.UPSERT_ACTIVITIES_WITH_MEMBERS:
            return upsertActivityWithMembers(records, options, fireGitmeshWebhooks);
        case operations_1.default.UPDATE_INTEGRATIONS:
            return updateIntegrations(records, options);
        case operations_1.default.UPDATE_MICROSERVICE:
            return updateMicroservice(records, options);
        default:
            throw new Error(`Operation ${operation} not found`);
    }
}
exports.default = bulkOperations;
//# sourceMappingURL=operationsWorker.js.map