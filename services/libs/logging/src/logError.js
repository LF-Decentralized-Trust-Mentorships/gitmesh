"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = void 0;
const logError = (log, error) => {
    log.error(error, `Error: ${error.message}`);
    return error;
};
exports.logError = logError;
//# sourceMappingURL=logError.js.map