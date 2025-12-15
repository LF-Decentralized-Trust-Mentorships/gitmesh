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
const types_1 = require("@gitmesh/types");
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
const nodeWorkerSQS_1 = require("../../serverless/utils/nodeWorkerSQS");
const nodeWorkerIntegrationProcessMessage_1 = require("../../types/mq/nodeWorkerIntegrationProcessMessage");
const integrationRunRepository_1 = __importDefault(require("../../database/repositories/integrationRunRepository"));
/* eslint-disable no-console */
const banner = fs.readFileSync(path_1.default.join(__dirname, 'banner.txt'), 'utf8');
const log = (0, logging_1.getServiceLogger)();
const options = [
    {
        name: 'run',
        alias: 'r',
        typeLabel: '{underline runId}',
        type: String,
        description: 'The unique ID of integration run that you would like to continue processing. Use comma delimiter when sending multiple integration runs.',
    },
    {
        name: 'disableFiringGitmeshWebhooks',
        alias: 'd',
        typeLabel: '{underline disableFiringGitmeshWebhooks}',
        type: Boolean,
        defaultOption: false,
        description: 'Should it disable firing outgoing gitmesh webhooks?',
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
        header: 'Continue Processing Integration Run',
        content: 'Trigger processing of integration run.',
    },
    {
        header: 'Options',
        optionList: options,
    },
];
const usage = (0, command_line_usage_1.default)(sections);
const parameters = (0, command_line_args_1.default)(options);
if (parameters.help && !parameters.run) {
    console.log(usage);
}
else {
    setImmediate(async () => {
        const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const fireGitmeshWebhooks = !parameters.disableFiringGitmeshWebhooks;
        const runRepo = new integrationRunRepository_1.default(options);
        const runIds = parameters.run.split(',');
        for (const runId of runIds) {
            const run = await runRepo.findById(runId);
            if (!run) {
                log.error({ runId }, 'Integration run not found!');
                process.exit(1);
            }
            else {
                await log.info({ runId }, 'Integration run found - triggering SQS message!');
                if (run.state !== types_1.IntegrationRunState.PENDING) {
                    log.warn({ currentState: run.state }, `Setting integration state to ${types_1.IntegrationRunState.PENDING}!`);
                    await runRepo.restart(run.id);
                }
                if (!fireGitmeshWebhooks) {
                    log.info('fireGitmeshWebhooks is false - This continue-run will not trigger outgoing gitmesh webhooks!');
                }
                await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(run.tenantId, new nodeWorkerIntegrationProcessMessage_1.NodeWorkerIntegrationProcessMessage(run.id, null, fireGitmeshWebhooks));
            }
        }
        process.exit(0);
    });
}
//# sourceMappingURL=continue-run.js.map