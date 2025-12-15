"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Error500 extends Error {
    constructor(message) {
        message = message || 'Internal server error';
        super(message);
        this.code = 500;
    }
}
exports.default = Error500;
//# sourceMappingURL=Error500.js.map