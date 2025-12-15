"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logExecutionTimeV2 = exports.logExecutionTime = void 0;
const perf_hooks_1 = require("perf_hooks");
const logExecutionTime = async (process, log, name) => {
    const start = perf_hooks_1.performance.now();
    try {
        log.info(`Starting timing process ${name}...`);
        return await process();
    }
    finally {
        const end = perf_hooks_1.performance.now();
        const duration = end - start;
        const durationInSeconds = duration / 1000;
        log.info(`Process ${name} took ${durationInSeconds.toFixed(2)} seconds!`);
    }
};
exports.logExecutionTime = logExecutionTime;
const logExecutionTimeV2 = async (process, log, name) => {
    const start = perf_hooks_1.performance.now();
    const end = () => {
        const end = perf_hooks_1.performance.now();
        const duration = end - start;
        const durationInSeconds = duration / 1000;
        return durationInSeconds.toFixed(2);
    };
    try {
        const result = await process();
        log.info(`Process ${name} took ${end()} seconds!`);
        return result;
    }
    catch (e) {
        log.info(`Process ${name} failed after ${end()} seconds!`);
        throw e;
    }
};
exports.logExecutionTimeV2 = logExecutionTimeV2;
//# sourceMappingURL=utility.js.map