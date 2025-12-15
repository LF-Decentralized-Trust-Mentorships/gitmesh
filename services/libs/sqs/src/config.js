"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTEGRATION_SYNC_WORKER_QUEUE_SETTINGS = exports.SEARCH_SYNC_WORKER_QUEUE_SETTINGS = exports.NODEJS_WORKER_QUEUE_SETTINGS = exports.DATA_SINK_WORKER_QUEUE_SETTINGS = exports.INTEGRATION_DATA_WORKER_QUEUE_SETTINGS = exports.INTEGRATION_STREAM_WORKER_QUEUE_SETTINGS = exports.INTEGRATION_RUN_WORKER_QUEUE_SETTINGS = void 0;
const types_1 = require("./types");
exports.INTEGRATION_RUN_WORKER_QUEUE_SETTINGS = {
    name: 'integration-run-worker',
    type: types_1.SqsQueueType.FIFO,
    waitTimeSeconds: 20,
    visibilityTimeout: 30,
    messageRetentionPeriod: 345600,
    deliveryDelay: 0,
    deduplicationScope: types_1.SqsQueueDeduplicationType.MESSAGE_GROUP,
    fifoThroughputLimit: types_1.SqsFifoThroughputLimitType.PER_MESSAGE_GROUP_ID,
};
exports.INTEGRATION_STREAM_WORKER_QUEUE_SETTINGS = {
    name: 'integration-stream-worker',
    type: types_1.SqsQueueType.FIFO,
    waitTimeSeconds: 20,
    visibilityTimeout: 30,
    messageRetentionPeriod: 345600,
    deliveryDelay: 0,
    deduplicationScope: types_1.SqsQueueDeduplicationType.MESSAGE_GROUP,
    fifoThroughputLimit: types_1.SqsFifoThroughputLimitType.PER_MESSAGE_GROUP_ID,
};
exports.INTEGRATION_DATA_WORKER_QUEUE_SETTINGS = {
    name: 'integration-data-worker',
    type: types_1.SqsQueueType.FIFO,
    waitTimeSeconds: 20,
    visibilityTimeout: 30,
    messageRetentionPeriod: 345600,
    deliveryDelay: 0,
    deduplicationScope: types_1.SqsQueueDeduplicationType.MESSAGE_GROUP,
    fifoThroughputLimit: types_1.SqsFifoThroughputLimitType.PER_MESSAGE_GROUP_ID,
};
exports.DATA_SINK_WORKER_QUEUE_SETTINGS = {
    name: 'data-sink-worker',
    type: types_1.SqsQueueType.FIFO,
    waitTimeSeconds: 20,
    visibilityTimeout: 30,
    messageRetentionPeriod: 345600,
    deliveryDelay: 0,
    deduplicationScope: types_1.SqsQueueDeduplicationType.MESSAGE_GROUP,
    fifoThroughputLimit: types_1.SqsFifoThroughputLimitType.PER_MESSAGE_GROUP_ID,
};
exports.NODEJS_WORKER_QUEUE_SETTINGS = {
    name: 'nodejs-worker',
    type: types_1.SqsQueueType.FIFO,
    waitTimeSeconds: 20,
    visibilityTimeout: 30,
    messageRetentionPeriod: 345600,
    deliveryDelay: 0,
    deduplicationScope: types_1.SqsQueueDeduplicationType.MESSAGE_GROUP,
    fifoThroughputLimit: types_1.SqsFifoThroughputLimitType.PER_MESSAGE_GROUP_ID,
};
exports.SEARCH_SYNC_WORKER_QUEUE_SETTINGS = {
    name: 'search-sync-worker',
    type: types_1.SqsQueueType.FIFO,
    waitTimeSeconds: 20,
    visibilityTimeout: 30,
    messageRetentionPeriod: 345600,
    deliveryDelay: 0,
    deduplicationScope: types_1.SqsQueueDeduplicationType.MESSAGE_GROUP,
    fifoThroughputLimit: types_1.SqsFifoThroughputLimitType.PER_MESSAGE_GROUP_ID,
};
exports.INTEGRATION_SYNC_WORKER_QUEUE_SETTINGS = {
    name: 'integration-sync-worker',
    type: types_1.SqsQueueType.FIFO,
    waitTimeSeconds: 20,
    visibilityTimeout: 30,
    messageRetentionPeriod: 345600,
    deliveryDelay: 0,
    deduplicationScope: types_1.SqsQueueDeduplicationType.MESSAGE_GROUP,
    fifoThroughputLimit: types_1.SqsFifoThroughputLimitType.PER_MESSAGE_GROUP_ID,
};
//# sourceMappingURL=config.js.map