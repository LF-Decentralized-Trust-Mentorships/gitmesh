"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcurrentRequestLimiter = exports.RateLimiter = void 0;
const types_1 = require("@gitmesh/types");
const common_1 = require("@gitmesh/common");
class RateLimiter {
    constructor(cache, maxRequests, timeWindowSeconds, counterKey) {
        this.cache = cache;
        this.maxRequests = maxRequests;
        this.timeWindowSeconds = timeWindowSeconds;
        this.counterKey = counterKey;
        this.cache = cache;
        this.maxRequests = maxRequests;
        this.timeWindowSeconds = timeWindowSeconds;
        this.counterKey = counterKey;
    }
    async checkRateLimit(endpoint) {
        const value = await this.cache.get(this.counterKey);
        const requestCount = value === null ? 0 : parseInt(value);
        const canMakeRequest = requestCount < this.maxRequests;
        if (requestCount === 0) {
            await this.cache.set(this.counterKey, '0', this.timeWindowSeconds);
        }
        if (!canMakeRequest) {
            const sleepTime = this.timeWindowSeconds + Math.floor(Math.random() * this.timeWindowSeconds);
            throw new types_1.RateLimitError(sleepTime, endpoint);
        }
    }
    async incrementRateLimit() {
        await this.cache.increment(this.counterKey, 1);
    }
}
exports.RateLimiter = RateLimiter;
class ConcurrentRequestLimiter {
    constructor(cache, 
    // max concurrent requests per integrationId
    maxConcurrentRequests, requestKey, 
    // cache key will be deleted after this time since last increment / decrement
    maxLockTimeSeconds = 50) {
        this.cache = cache;
        this.maxConcurrentRequests = maxConcurrentRequests;
        this.requestKey = requestKey;
        this.maxLockTimeSeconds = maxLockTimeSeconds;
        this.cache = cache;
        this.maxConcurrentRequests = maxConcurrentRequests;
        this.requestKey = requestKey;
        this.maxLockTimeSeconds = maxLockTimeSeconds;
    }
    async checkConcurrentRequestLimit(integrationId, retries = 1000, sleepTimeMs = 50) {
        const key = this.getRequestKey(integrationId);
        let currentRequests;
        let canMakeRequest;
        for (let i = 0; i < retries; i++) {
            const value = await this.cache.get(key);
            currentRequests = value === null ? 0 : parseInt(value);
            canMakeRequest = currentRequests < this.maxConcurrentRequests;
            if (!canMakeRequest) {
                const randomizedSleepTime = sleepTimeMs + Math.floor(Math.random() * sleepTimeMs);
                await (0, common_1.timeout)(randomizedSleepTime);
            }
            else {
                return;
            }
        }
        throw new Error(`Too many concurrent requests for integration ${integrationId}`);
    }
    async incrementConcurrentRequest(integrationId) {
        const key = this.getRequestKey(integrationId);
        await this.cache.increment(key, 1, this.maxLockTimeSeconds);
    }
    async decrementConcurrentRequest(integrationId) {
        const key = this.getRequestKey(integrationId);
        await this.cache.decrement(key, 1, this.maxLockTimeSeconds);
    }
    async processWithLimit(integrationId, func) {
        await this.checkConcurrentRequestLimit(integrationId);
        await this.incrementConcurrentRequest(integrationId);
        try {
            return await func();
        }
        finally {
            await this.decrementConcurrentRequest(integrationId);
        }
    }
    getRequestKey(integrationId) {
        return `${this.requestKey}:${integrationId}`;
    }
}
exports.ConcurrentRequestLimiter = ConcurrentRequestLimiter;
//# sourceMappingURL=rateLimiter.js.map