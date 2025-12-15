"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonWorkerMessageType = exports.NodeWorkerMessageType = void 0;
var NodeWorkerMessageType;
(function (NodeWorkerMessageType) {
    NodeWorkerMessageType["INTEGRATION_CHECK"] = "integration_check";
    NodeWorkerMessageType["INTEGRATION_PROCESS"] = "integration_process";
    NodeWorkerMessageType["NODE_MICROSERVICE"] = "node_microservice";
    NodeWorkerMessageType["DB_OPERATIONS"] = "db_operations";
    NodeWorkerMessageType["PROCESS_WEBHOOK"] = "process_webhook";
})(NodeWorkerMessageType = exports.NodeWorkerMessageType || (exports.NodeWorkerMessageType = {}));
var PythonWorkerMessageType;
(function (PythonWorkerMessageType) {
    PythonWorkerMessageType["MEMBERS_SCORE"] = "members_score";
})(PythonWorkerMessageType = exports.PythonWorkerMessageType || (exports.PythonWorkerMessageType = {}));
//# sourceMappingURL=workerTypes.js.map