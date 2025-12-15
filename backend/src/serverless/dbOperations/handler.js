"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumer = void 0;
const logging_1 = require("@gitmesh/logging");
const index_1 = require("../../conf/index");
const operationsWorker_1 = __importDefault(require("./operationsWorker"));
const getUserContext_1 = __importDefault(require("../../database/utils/getUserContext"));
const segmentRepository_1 = __importDefault(require("../../database/repositories/segmentRepository"));
const log = (0, logging_1.getServiceChildLogger)('dbOperations.handler');
async function consumer(event) {
    if (!index_1.KUBE_MODE) {
        event = JSON.parse(event.Records[0].body);
    }
    log.debug({ event }, `DbOperations event!`);
    const tenantId = event.tenantId || event.tenant_id;
    if (!tenantId) {
        throw new Error('Tenant ID is required');
    }
    else if (!event.operation) {
        throw new Error('Operation is required');
    }
    else if (!event.records) {
        throw new Error('Records is required');
    }
    const context = await (0, getUserContext_1.default)(tenantId);
    const segmentRepository = new segmentRepository_1.default(context);
    if (event.segments && event.segments.length > 0) {
        context.currentSegments = [await segmentRepository.findById(event.segments[0])];
    }
    const result = await (0, operationsWorker_1.default)(event.operation, event.records, context);
    return result;
}
exports.consumer = consumer;
//# sourceMappingURL=handler.js.map