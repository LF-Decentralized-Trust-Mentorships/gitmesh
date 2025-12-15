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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing and initializing the tracer here allows to import and initialize
// OpenTelemetry instrumentations for Bunyan **before** importing the logging
// library. Otherwise, automatic instrumentation and correlation with the logger
// won't work. Since the logger is the first library imported on services, this
// also allows to leverage automatic instrumentation for other libraries such as
// Sequelize, Express, and SQS. Details:
// https://opentelemetry.io/blog/2022/troubleshooting-nodejs/#enable-before-require
const common_1 = require("@gitmesh/common");
const tracing_1 = require("@gitmesh/tracing");
if (!common_1.IS_TEST_ENV) {
    (0, tracing_1.getServiceTracer)();
}
__exportStar(require("./logError"), exports);
__exportStar(require("./logger"), exports);
__exportStar(require("./loggerBase"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./utility"), exports);
//# sourceMappingURL=index.js.map