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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_line_args_1 = __importDefault(require("command-line-args"));
const command_line_usage_1 = __importDefault(require("command-line-usage"));
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const logging_1 = require("@gitmesh/logging");
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
const nodeWorkerSQS_1 = require("../../serverless/utils/nodeWorkerSQS");
const nodeWorkerIntegrationProcessMessage_1 = require("../../types/mq/nodeWorkerIntegrationProcessMessage");
const integrationRunRepository_1 = __importDefault(require("../../database/repositories/integrationRunRepository"));
const integrationStreamRepository_1 = __importDefault(require("../../database/repositories/integrationStreamRepository"));
/* eslint-disable no-console */
const banner = fs.readFileSync(path_1.default.join(__dirname, 'banner.txt'), 'utf8');
const log = (0, logging_1.getServiceLogger)();
const options = [
    {
        name: 'stream',
        alias: 's',
        typeLabel: '{underline streamId}',
        type: String,
        description: 'The unique ID of integration stream that you would like to process. Use comma delimiter when sending multiple integration streams.',
    },
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Print this usage guide.',
    },
];
const sections = [
    {
        content: banner,
        raw: true,
    },
    {
        header: 'Process integration stream',
        content: 'Trigger processing of integration stream.',
    },
    {
        header: 'Options',
        optionList: options,
    },
];
const usage = (0, command_line_usage_1.default)(sections);
const parameters = (0, command_line_args_1.default)(options);
if (parameters.help && !parameters.stream) {
    console.log(usage);
}
else {
    setImmediate(async () => {
        const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const streamRepo = new integrationStreamRepository_1.default(options);
        const runRepo = new integrationRunRepository_1.default(options);
        const streamIds = parameters.stream.split(',');
        for (const streamId of streamIds) {
            const stream = await streamRepo.findById(streamId);
            if (!stream) {
                log.error({ streamId }, 'Integration stream not found!');
                process.exit(1);
            }
            else {
                log.info({ streamId }, 'Integration stream found! Triggering SQS message!');
                const run = await runRepo.findById(stream.runId);
                await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(run.tenantId, new nodeWorkerIntegrationProcessMessage_1.NodeWorkerIntegrationProcessMessage(run.id, stream.id));
            }
        }
        process.exit(0);
    });
}
//# sourceMappingURL=process-stream.js.map