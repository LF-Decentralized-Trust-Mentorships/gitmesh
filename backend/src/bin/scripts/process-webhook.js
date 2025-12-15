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
const logging_1 = require("@gitmesh/logging");
const redis_1 = require("@gitmesh/redis");
const command_line_args_1 = __importDefault(require("command-line-args"));
const command_line_usage_1 = __importDefault(require("command-line-usage"));
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
const integrationProcessor_1 = require("@/serverless/integrations/services/integrationProcessor");
const conf_1 = require("../../conf");
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
/* eslint-disable no-console */
const banner = fs.readFileSync(path_1.default.join(__dirname, 'banner.txt'), 'utf8');
const log = (0, logging_1.getServiceLogger)();
const options = [
    {
        name: 'webhook',
        alias: 'w',
        typeLabel: '{underline webhookId}',
        type: String,
        description: 'The unique ID of webhook that you would like to process. Use comma delimiter when sending multiple webhooks.',
    },
    {
        name: 'tenant',
        alias: 't',
        typeLabel: '{underline tenantId}',
        type: String,
        description: 'The unique ID of tenant that you would like to process. Use in combination with type.',
    },
    {
        name: 'type',
        alias: 'p',
        typeLabel: '{underline type}',
        type: String,
        description: 'The webhook type to process. Use in combination with tenant.',
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
        header: 'Process Webhook',
        content: 'Trigger processing of webhooks.',
    },
    {
        header: 'Options',
        optionList: options,
    },
];
const usage = (0, command_line_usage_1.default)(sections);
const parameters = (0, command_line_args_1.default)(options);
if (parameters.help || (!parameters.webhook && (!parameters.tenant || !parameters.type))) {
    console.log(usage);
}
else {
    setImmediate(async () => {
        const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const redisEmitter = await (0, redis_1.getRedisClient)(conf_1.REDIS_CONFIG);
        const integrationProcessorInstance = new integrationProcessor_1.IntegrationProcessor(options, redisEmitter);
        if (parameters.webhook) {
            const webhookIds = parameters.webhook.split(',');
            for (const webhookId of webhookIds) {
                log.info({ webhookId }, 'Webhook found - processing!');
                await integrationProcessorInstance.processWebhook(webhookId, true, true);
            }
        }
        else if (parameters.tenant && parameters.type) {
            const seq = sequelizeRepository_1.default.getSequelize(options);
            let ids = (await seq.query(`
        select id from "incomingWebhooks"
        where state in ('PENDING', 'ERROR')
        and "tenantId" = :tenantId and type = :type
        order by id
        limit 100
      `, {
                type: sequelize_1.QueryTypes.SELECT,
                replacements: {
                    tenantId: parameters.tenant,
                    type: parameters.type,
                },
            })).map((r) => r.id);
            while (ids.length > 0) {
                for (const webhookId of ids) {
                    log.info({ webhookId }, 'Webhook found - processing!');
                    await integrationProcessorInstance.processWebhook(webhookId, true, true);
                }
                ids = (await seq.query(`
          select id from "incomingWebhooks"
          where state in ('PENDING', 'ERROR')
          and "tenantId" = :tenantId and type = :type
          and id > :id
          order by id
          limit 100
        `, {
                    type: sequelize_1.QueryTypes.SELECT,
                    replacements: {
                        tenantId: parameters.tenant,
                        type: parameters.type,
                        id: ids[ids.length - 1],
                    },
                })).map((r) => r.id);
            }
        }
        process.exit(0);
    });
}
//# sourceMappingURL=process-webhook.js.map