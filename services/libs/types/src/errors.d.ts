export declare class BaseError extends Error {
    name: string;
    message: string;
    stack?: string;
    originalError?: unknown;
    constructor(message: string, originalError?: unknown);
}
export declare class RateLimitError extends BaseError {
    rateLimitResetSeconds: number;
    constructor(rateLimitResetSeconds: number, endpoint: string, origError?: unknown);
}
