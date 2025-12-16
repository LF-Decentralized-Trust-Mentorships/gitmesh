"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceChildLogger = exports.getChildLogger = exports.getServiceLogger = void 0;
const bunyan_format_1 = __importDefault(require("bunyan-format"));
const Bunyan = __importStar(require("bunyan"));
const common_1 = require("@gitmesh/common");
const PRETTY_FORMAT = new bunyan_format_1.default({
    outputMode: 'short',
    levelInString: true,
});
const JSON_FORMAT = new bunyan_format_1.default({
    outputMode: 'bunyan',
    levelInString: true,
});
let serviceLoggerInstance;
const getServiceLogger = () => {
    if (serviceLoggerInstance)
        return serviceLoggerInstance;
    const options = {
        name: common_1.SERVICE,
        level: common_1.LOG_LEVEL,
        stream: common_1.IS_DEV_ENV || common_1.IS_TEST_ENV ? PRETTY_FORMAT : JSON_FORMAT,
    };
    serviceLoggerInstance = Bunyan.createLogger(options);
    return serviceLoggerInstance;
};
exports.getServiceLogger = getServiceLogger;
const getChildLogger = (name, parent, logProperties) => {
    const options = Object.assign({ component: name }, (logProperties || {}));
    return parent.child(options, true);
};
exports.getChildLogger = getChildLogger;
const serviceChildMap = new Map();
const getServiceChildLogger = (name, logProperties) => {
    if (serviceChildMap.has(name))
        return serviceChildMap.get(name);
    const logger = (0, exports.getChildLogger)(name, (0, exports.getServiceLogger)(), logProperties);
    serviceChildMap.set(name, logger);
    return logger;
};
exports.getServiceChildLogger = getServiceChildLogger;
//# sourceMappingURL=logger.js.map