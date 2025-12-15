"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPythonWorkerMessage = void 0;
const sqs_1 = require("@gitmesh/sqs");
const moment_1 = __importDefault(require("moment"));
const conf_1 = require("../../conf");
const serviceSQS_1 = require("./serviceSQS");
const sendPythonWorkerMessage = async (tenantId, body) => {
    if (conf_1.IS_TEST_ENV) {
        return;
    }
    // TODO-kube
    if (!conf_1.KUBE_MODE) {
        throw new Error("Can't send python-worker SQS message when not in kube mode!");
    }
    await (0, sqs_1.sendMessage)((0, serviceSQS_1.SQS_CLIENT)(), {
        QueueUrl: conf_1.SQS_CONFIG.pythonWorkerQueue,
        MessageGroupId: tenantId,
        MessageDeduplicationId: `${tenantId}-${(0, moment_1.default)().valueOf()}`,
        MessageBody: JSON.stringify(body),
    });
};
exports.sendPythonWorkerMessage = sendPythonWorkerMessage;
//# sourceMappingURL=pythonWorkerSQS.js.map