"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeWrap = exports.errorMiddleware = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
async function errorMiddleware(error, req, res, next) {
    await req.responseHandler.error(req, res, error);
}
exports.errorMiddleware = errorMiddleware;
const safeWrap = (handler) => async (req, res, next) => {
    try {
        await handler(req, res, next);
    }
    catch (err) {
        next(err);
    }
};
exports.safeWrap = safeWrap;
//# sourceMappingURL=errorMiddleware.js.map