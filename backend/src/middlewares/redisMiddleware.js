"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisMiddleware = void 0;
function redisMiddleware(redis) {
    return async (req, res, next) => {
        req.redis = redis;
        next();
    };
}
exports.redisMiddleware = redisMiddleware;
//# sourceMappingURL=redisMiddleware.js.map