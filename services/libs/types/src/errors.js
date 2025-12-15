"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitError = exports.BaseError = void 0;
class BaseError extends Error {
    constructor(message, originalError) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        this.originalError = originalError;
        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, BaseError.prototype);
    }
}
exports.BaseError = BaseError;
class RateLimitError extends BaseError {
    constructor(rateLimitResetSeconds, endpoint, origError) {
        super(`Endpoint: '${endpoint}' rate limit exceeded`, origError);
        this.rateLimitResetSeconds = rateLimitResetSeconds;
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}
exports.RateLimitError = RateLimitError;
//# sourceMappingURL=errors.js.map