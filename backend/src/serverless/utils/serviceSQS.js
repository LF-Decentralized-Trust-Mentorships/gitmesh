"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataSinkWorkerEmitter = exports.getIntegrationSyncWorkerEmitter = exports.getSearchSyncWorkerEmitter = exports.getIntegrationStreamWorkerEmitter = exports.getIntegrationRunWorkerEmitter = exports.SQS_CLIENT = void 0;
const sqs_1 = require("@gitmesh/sqs");
const logging_1 = require("@gitmesh/logging");
const tracing_1 = require("@gitmesh/tracing");
const conf_1 = require("../../conf");
const tracer = (0, tracing_1.getServiceTracer)();
const log = (0, logging_1.getServiceChildLogger)('service.sqs');
let sqsClient;
const SQS_CLIENT = () => {
    if (sqsClient)
        return sqsClient;
    const config = conf_1.SQS_CONFIG;
    sqsClient = (0, sqs_1.getSqsClient)({
        region: config.aws.region,
        host: config.host,
        port: config.port,
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
    });
    return sqsClient;
};
exports.SQS_CLIENT = SQS_CLIENT;
let runWorkerEmitter;
const getIntegrationRunWorkerEmitter = async () => {
    if (runWorkerEmitter)
        return runWorkerEmitter;
    runWorkerEmitter = new sqs_1.IntegrationRunWorkerEmitter((0, exports.SQS_CLIENT)(), tracer, log);
    await runWorkerEmitter.init();
    return runWorkerEmitter;
};
exports.getIntegrationRunWorkerEmitter = getIntegrationRunWorkerEmitter;
let streamWorkerEmitter;
const getIntegrationStreamWorkerEmitter = async () => {
    if (streamWorkerEmitter)
        return streamWorkerEmitter;
    streamWorkerEmitter = new sqs_1.IntegrationStreamWorkerEmitter((0, exports.SQS_CLIENT)(), tracer, log);
    await streamWorkerEmitter.init();
    return streamWorkerEmitter;
};
exports.getIntegrationStreamWorkerEmitter = getIntegrationStreamWorkerEmitter;
let searchSyncWorkerEmitter;
const getSearchSyncWorkerEmitter = async () => {
    if (searchSyncWorkerEmitter)
        return searchSyncWorkerEmitter;
    searchSyncWorkerEmitter = new sqs_1.SearchSyncWorkerEmitter((0, exports.SQS_CLIENT)(), tracer, log);
    await searchSyncWorkerEmitter.init();
    return searchSyncWorkerEmitter;
};
exports.getSearchSyncWorkerEmitter = getSearchSyncWorkerEmitter;
let integrationSyncWorkerEmitter;
const getIntegrationSyncWorkerEmitter = async () => {
    if (integrationSyncWorkerEmitter)
        return integrationSyncWorkerEmitter;
    integrationSyncWorkerEmitter = new sqs_1.IntegrationSyncWorkerEmitter((0, exports.SQS_CLIENT)(), tracer, log);
    await integrationSyncWorkerEmitter.init();
    return integrationSyncWorkerEmitter;
};
exports.getIntegrationSyncWorkerEmitter = getIntegrationSyncWorkerEmitter;
let dataSinkWorkerEmitter;
const getDataSinkWorkerEmitter = async () => {
    if (dataSinkWorkerEmitter)
        return dataSinkWorkerEmitter;
    dataSinkWorkerEmitter = new sqs_1.DataSinkWorkerEmitter((0, exports.SQS_CLIENT)(), tracer, log);
    await dataSinkWorkerEmitter.init();
    return dataSinkWorkerEmitter;
};
exports.getDataSinkWorkerEmitter = getDataSinkWorkerEmitter;
//# sourceMappingURL=serviceSQS.js.map