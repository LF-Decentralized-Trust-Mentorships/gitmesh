"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cron_time_generator_1 = __importDefault(require("cron-time-generator"));
const pythonWorkerSQS_1 = require("../../serverless/utils/pythonWorkerSQS");
const workerTypes_1 = require("../../serverless/types/workerTypes");
const job = {
    name: 'Member Score Coordinator',
    cronTime: cron_time_generator_1.default.every(90).minutes(),
    onTrigger: async () => {
        await (0, pythonWorkerSQS_1.sendPythonWorkerMessage)('global', {
            type: workerTypes_1.PythonWorkerMessageType.MEMBERS_SCORE,
        });
    },
};
exports.default = job;
//# sourceMappingURL=memberScoreCoordinator.js.map