"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.languageMiddleware = void 0;
function languageMiddleware(req, res, next) {
    req.language = req.headers['accept-language'] || 'en';
    return next();
}
exports.languageMiddleware = languageMiddleware;
//# sourceMappingURL=languageMiddleware.js.map