"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const i18n_1 = require("../i18n");
class Error409 extends Error {
    constructor(language, messageCode) {
        let message;
        if (messageCode && (0, i18n_1.i18nExists)(language, messageCode)) {
            message = (0, i18n_1.i18n)(language, messageCode);
        }
        message = message || (0, i18n_1.i18n)(language, 'errors.notFound.message');
        super(message);
        this.code = 409;
    }
}
exports.default = Error409;
//# sourceMappingURL=Error409.js.map