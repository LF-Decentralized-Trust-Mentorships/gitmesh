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
const common_1 = require("@gitmesh/common");
const integrations_1 = require("@gitmesh/integrations");
const logging_1 = require("@gitmesh/logging");
const command_line_args_1 = __importDefault(require("command-line-args"));
const command_line_usage_1 = __importDefault(require("command-line-usage"));
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const types_1 = require("@gitmesh/types");
const integrationRepository_1 = __importDefault(require("../../database/repositories/integrationRepository"));
const integrationRunRepository_1 = __importDefault(require("../../database/repositories/integrationRunRepository"));
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
const serviceSQS_1 = require("../../serverless/utils/serviceSQS");
const nodeWorkerSQS_1 = require("../../serverless/utils/nodeWorkerSQS");
const nodeWorkerIntegrationProcessMessage_1 = require("../../types/mq/nodeWorkerIntegrationProcessMessage");
/* eslint-disable no-console */
const banner = fs.readFileSync(path_1.default.join(__dirname, 'banner.txt'), 'utf8');
const log = (0, logging_1.getServiceLogger)();
const options = [
    {
        name: 'integration',
        alias: 'i',
        typeLabel: '{underline integrationId}',
        type: String,
        description: 'The unique ID of integration that you would like to process. Use comma delimiter when sending multiple integrations.',
    },
    {
        name: 'onboarding',
        alias: 'o',
        description: 'Process integration as if it was onboarding.',
        type: Boolean,
        defaultValue: false,
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
        name: 'platform',
        alias: 'p',
        description: 'The platform for which we should run all integrations.',
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
        header: 'Process Integration',
        content: 'Trigger processing of integrations.',
    },
    {
        header: 'Options',
        optionList: options,
    },
];
const usage = (0, command_line_usage_1.default)(sections);
const parameters = (0, command_line_args_1.default)(options);
const triggerIntegrationRun = async (runRepo, tenantId, integrationId, onboarding, fireGitmeshWebhooks) => {
    const existingRun = await runRepo.findLastProcessingRun(integrationId);
    if (existingRun && existingRun.onboarding) {
        log.error('Integration is already processing, skipping!');
        return;
    }
    log.info({ integrationId, onboarding }, 'Integration found - creating a new run in the old framework!');
    const run = await runRepo.create({
        integrationId,
        tenantId,
        onboarding,
        state: types_1.IntegrationRunState.PENDING,
    });
    log.info({ integrationId, onboarding }, 'Triggering SQS message for the old framework integration!');
    await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(tenantId, new nodeWorkerIntegrationProcessMessage_1.NodeWorkerIntegrationProcessMessage(run.id, null, fireGitmeshWebhooks));
};
const triggerNewIntegrationRun = async (tenantId, integrationId, platform, onboarding) => {
    log.info({ integrationId, onboarding }, 'Triggering SQS message for the new framework integration!');
    const emitter = await (0, serviceSQS_1.getIntegrationRunWorkerEmitter)();
    await emitter.triggerIntegrationRun(tenantId, platform, integrationId, onboarding);
};
if (parameters.help || (!parameters.integration && !parameters.platform)) {
    console.log(usage);
}
else {
    setImmediate(async () => {
        const onboarding = parameters.onboarding;
        const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const fireGitmeshWebhooks = !parameters.disableFiringGitmeshWebhooks;
        const runRepo = new integrationRunRepository_1.default(options);
        if (parameters.platform) {
            let inNewFramework = false;
            if ((0, common_1.singleOrDefault)(integrations_1.INTEGRATION_SERVICES, (s) => s.type === parameters.platform)) {
                inNewFramework = true;
            }
            await (0, common_1.processPaginated)(async (page) => integrationRepository_1.default.findAllActive(parameters.platform, page, 10), async (integrations) => {
                for (const i of integrations) {
                    const integration = i;
                    if (inNewFramework) {
                        await triggerNewIntegrationRun(integration.tenantId, integration.id, integration.platform, onboarding);
                    }
                    else {
                        await triggerIntegrationRun(runRepo, integration.tenantId, integration.id, onboarding, fireGitmeshWebhooks);
                    }
                }
            });
        }
        else {
            const integrationIds = parameters.integration.split(',');
            for (const integrationId of integrationIds) {
                const integration = await options.database.integration.findOne({
                    where: { id: integrationId },
                });
                if (!integration) {
                    log.error({ integrationId }, 'Integration not found!');
                    process.exit(1);
                }
                else {
                    log.info({ integrationId, onboarding }, 'Integration found - triggering SQS message!');
                    let inNewFramework = false;
                    if ((0, common_1.singleOrDefault)(integrations_1.INTEGRATION_SERVICES, (s) => s.type === integration.platform)) {
                        inNewFramework = true;
                    }
                    if (inNewFramework) {
                        await triggerNewIntegrationRun(integration.tenantId, integration.id, integration.platform, onboarding);
                    }
                    else {
                        await triggerIntegrationRun(runRepo, integration.tenantId, integration.id, onboarding, fireGitmeshWebhooks);
                    }
                }
            }
        }
        process.exit(0);
    });
}
//# sourceMappingURL=process-integration.js.map