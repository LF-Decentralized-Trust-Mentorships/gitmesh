"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDbOperationsMessage = void 0;
const handler_1 = require("./handler");
const processDbOperationsMessage = async (msg) => {
    await (0, handler_1.consumer)(msg);
};
exports.processDbOperationsMessage = processDbOperationsMessage;
//# sourceMappingURL=workDispatcher.js.map