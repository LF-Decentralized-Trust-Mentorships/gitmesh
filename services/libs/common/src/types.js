"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeoutError = void 0;
class TimeoutError extends Error {
    constructor(timeout, unit) {
        super(`Process timeout after ${timeout} ${unit}!`);
        this.timeout = timeout;
        this.unit = unit;
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}
exports.TimeoutError = TimeoutError;
//# sourceMappingURL=types.js.map