"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Error542 extends Error {
    constructor(message) {
        message = message || 'Internal server error';
        super(message);
        this.code = 542;
    }
}
exports.default = Error542;
//# sourceMappingURL=Error542.js.map