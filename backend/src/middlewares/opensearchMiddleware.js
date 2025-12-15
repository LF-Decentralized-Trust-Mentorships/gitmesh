"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opensearchMiddleware = void 0;
function opensearchMiddleware(cli) {
    return async (req, res, next) => {
        req.opensearch = cli;
        next();
    };
}
exports.opensearchMiddleware = opensearchMiddleware;
//# sourceMappingURL=opensearchMiddleware.js.map