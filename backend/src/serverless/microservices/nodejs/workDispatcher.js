"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNodeMicroserviceMessage = void 0;
const workerFactory_1 = __importDefault(require("./workerFactory"));
const processNodeMicroserviceMessage = async (msg) => {
    const microserviceMsg = msg;
    await (0, workerFactory_1.default)(microserviceMsg);
};
exports.processNodeMicroserviceMessage = processNodeMicroserviceMessage;
//# sourceMappingURL=workDispatcher.js.map