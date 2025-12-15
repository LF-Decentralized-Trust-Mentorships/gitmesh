"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestThrottler = void 0;
const timing_1 = require("./timing");
/* eslint-disable @typescript-eslint/no-explicit-any */
class RequestThrottler {
    constructor(totalRequests, interval, logger, backoffStart = 1, backOffFactor = 2) {
        this.MAX_BACKOFF_RETRIES = 4;
        this.totalRequests = totalRequests;
        this.requests = totalRequests;
        this.interval = interval;
        this.logger = logger;
        this.backoffStart = backoffStart;
        this.backoff = backoffStart;
        this.backoffFactor = backOffFactor;
        this.backoffRetries = 0;
        setInterval(() => this.replenish(), this.interval);
    }
    replenish() {
        this.requests = this.totalRequests; // Replenishes requests every interval
    }
    refreshBackoff() {
        this.backoff = this.backoffStart;
        this.backoffRetries = 0;
    }
    advanceBackoff() {
        this.backoff = this.backoff * this.backoffFactor;
        this.backoffRetries += 1;
    }
    async throttle(func) {
        if (this.requests > 0) {
            this.requests--;
            try {
                const value = await func();
                this.refreshBackoff();
                return value;
            }
            catch (error) {
                this.logger.warn(`Error while executing throttling function!`);
                if (error) {
                    this.logger.info(`Starting exponential backoff with: ${this.backoff} seconds and factor: ${this.backoffFactor}!`);
                    if (this.backoffRetries < this.MAX_BACKOFF_RETRIES) {
                        await (0, timing_1.timeout)(this.backoff * 1000);
                        this.advanceBackoff();
                        return this.throttle(func);
                    }
                    else {
                        this.logger.warn(`Request failed to resolve after ${this.MAX_BACKOFF_RETRIES} exponential backoff retries!`);
                    }
                    throw error;
                }
            }
        }
        else {
            // Delay by the replenishment interval if out of requests
            this.logger.debug(`Throttling api requests limit ${this.totalRequests}, waiting ${this.interval}ms`);
            await (0, timing_1.timeout)(this.interval);
            return this.throttle(func);
        }
    }
}
exports.RequestThrottler = RequestThrottler;
//# sourceMappingURL=requestThrottler.js.map