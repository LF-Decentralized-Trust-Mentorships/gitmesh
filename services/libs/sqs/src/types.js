"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqsFifoThroughputLimitType = exports.SqsQueueDeduplicationType = exports.SqsQueueType = void 0;
var SqsQueueType;
(function (SqsQueueType) {
    SqsQueueType["STANDARD"] = "STANDARD";
    SqsQueueType["FIFO"] = "FIFO";
})(SqsQueueType = exports.SqsQueueType || (exports.SqsQueueType = {}));
var SqsQueueDeduplicationType;
(function (SqsQueueDeduplicationType) {
    SqsQueueDeduplicationType["MESSAGE_GROUP"] = "messageGroup";
})(SqsQueueDeduplicationType = exports.SqsQueueDeduplicationType || (exports.SqsQueueDeduplicationType = {}));
var SqsFifoThroughputLimitType;
(function (SqsFifoThroughputLimitType) {
    SqsFifoThroughputLimitType["PER_MESSAGE_GROUP_ID"] = "perMessageGroupId";
})(SqsFifoThroughputLimitType = exports.SqsFifoThroughputLimitType || (exports.SqsFifoThroughputLimitType = {}));
//# sourceMappingURL=types.js.map