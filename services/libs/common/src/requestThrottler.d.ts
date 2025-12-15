export declare class RequestThrottler {
    private requests;
    private totalRequests;
    private interval;
    private logger;
    private backoff;
    private backoffFactor;
    private backoffStart;
    private backoffRetries;
    private MAX_BACKOFF_RETRIES;
    constructor(totalRequests: number, interval: number, logger: any, backoffStart?: number, backOffFactor?: number);
    private replenish;
    private refreshBackoff;
    private advanceBackoff;
    throttle<T>(func: () => Promise<T>): Promise<T>;
}
