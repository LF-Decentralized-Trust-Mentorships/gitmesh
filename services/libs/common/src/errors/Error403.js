"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const i18n_1 = require("../i18n");
class Error403 extends Error {
    constructor(language, messageCode, params) {
        let message;
        if (messageCode && (0, i18n_1.i18nExists)(language, messageCode)) {
            message = (0, i18n_1.i18n)(language, messageCode);
        }
        message = message || (0, i18n_1.i18n)(language, 'errors.forbidden.message');
        if (params && params.integration && params.scopes) {
            if (typeof params.scopes === 'string') {
                params.scopes = [params.scopes.join(', ')];
            }
            message = message.replace('{integration}', params.integration);
            message = message.replace('{scopes}', params.scopes);
        }
        super(message);
        this.code = 403;
    }
}
exports.default = Error403;
//# sourceMappingURL=Error403.js.map