"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeNullByte = exports.BatchProcessor = exports.processPaginated = void 0;
const processPaginated = async (dataLoader, processor) => {
    let page = 1;
    let data = await dataLoader(page++);
    while (data.length > 0) {
        const result = await processor(data);
        if (result === true) {
            break;
        }
        data = await dataLoader(page++);
    }
};
exports.processPaginated = processPaginated;
class BatchProcessor {
    constructor(batchSize, timeoutSeconds, processor, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errorHandler) {
        this.batchSize = batchSize;
        this.timeoutSeconds = timeoutSeconds;
        this.processor = processor;
        this.errorHandler = errorHandler;
        this.batch = [];
    }
    async addToBatch(element) {
        this.batch.push(element);
        if (this.batch.length === 1) {
            this.startTimer();
        }
        if (this.batch.length >= this.batchSize) {
            await this.processBatch();
        }
    }
    startTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(async () => {
            await this.processBatch();
        }, this.timeoutSeconds * 1000);
    }
    async processBatch() {
        if (this.batch.length === 0)
            return;
        const clone = [...this.batch];
        this.batch = [];
        try {
            await this.processor(clone);
        }
        catch (error) {
            await this.errorHandler(clone, error);
        }
        finally {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = undefined;
            }
        }
    }
}
exports.BatchProcessor = BatchProcessor;
const escapeNullByte = (str) => str ? str.replace(/\0/g, 'u0000') : str;
exports.escapeNullByte = escapeNullByte;
//# sourceMappingURL=utils.js.map