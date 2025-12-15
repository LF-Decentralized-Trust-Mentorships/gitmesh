"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerBase = void 0;
const logger_1 = require("./logger");
class LoggerBase {
    constructor(logOrProperties, logProperties) {
        if (typeof logOrProperties === 'undefined') {
            this.log = (0, logger_1.getServiceChildLogger)(this.constructor.name);
        }
        else {
            const results = ['trace', 'info', 'debug', 'warn', 'fatal']
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((method) => typeof logOrProperties[method])
                .filter((r) => r !== 'function');
            if (results.length > 0) {
                // not Logger
                this.log = (0, logger_1.getServiceChildLogger)(this.constructor.name, logOrProperties);
            }
            else {
                // ILogger
                this.log = (0, logger_1.getChildLogger)(this.constructor.name, logOrProperties, logProperties);
            }
        }
    }
}
exports.LoggerBase = LoggerBase;
//# sourceMappingURL=loggerBase.js.map