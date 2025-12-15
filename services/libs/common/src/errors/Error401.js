"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const i18n_1 = require("../i18n");
class Error401 extends Error {
    constructor(language, messageCode, ...args) {
        let message;
        if (messageCode && (0, i18n_1.i18nExists)(language, messageCode)) {
            message = (0, i18n_1.i18n)(language, messageCode, ...args);
        }
        message = message || (0, i18n_1.i18n)(language, 'errors.validation.message');
        super(message);
        this.code = 401;
    }
}
exports.default = Error401;
//# sourceMappingURL=Error401.js.map