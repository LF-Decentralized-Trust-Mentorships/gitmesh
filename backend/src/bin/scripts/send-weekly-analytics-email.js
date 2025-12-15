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
const moment_1 = __importDefault(require("moment"));
const path_1 = __importDefault(require("path"));
const logging_1 = require("@gitmesh/logging");
const common_1 = require("@gitmesh/common");
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
const nodeWorkerSQS_1 = require("../../serverless/utils/nodeWorkerSQS");
const workerTypes_1 = require("../../serverless/types/workerTypes");
const recurringEmailsHistoryRepository_1 = __importDefault(require("../../database/repositories/recurringEmailsHistoryRepository"));
const recurringEmailsHistoryTypes_1 = require("../../types/recurringEmailsHistoryTypes");
const tenantService_1 = __importDefault(require("@/services/tenantService"));
/* eslint-disable no-console */
const banner = fs.readFileSync(path_1.default.join(__dirname, 'banner.txt'), 'utf8');
const log = (0, logging_1.getServiceLogger)();
const options = [
    {
        name: 'tenant',
        alias: 't',
        type: String,
        description: 'The unique ID of tenant that you would like to send weekly emails to.',
    },
    {
        name: 'sendToAllTenants',
        alias: 'a',
        type: Boolean,
        defaultValue: false,
        description: 'Set this flag to send the analytics e-mails to all tenants. Tenants that already got a weekly analytics e-mail for the previous week will be discarded.',
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
        header: 'Send weekly analytics email to given tenant.',
        content: 'Sends weekly analytics email to given tenant. The daterange will be from previous week.',
    },
    {
        header: 'Options',
        optionList: options,
    },
];
const usage = (0, command_line_usage_1.default)(sections);
const parameters = (0, command_line_args_1.default)(options);
if (parameters.help || (!parameters.tenant && !parameters.sendToAllTenants)) {
    console.log(usage);
}
else {
    setImmediate(async () => {
        const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        let tenantIds;
        if (parameters.sendToAllTenants) {
            tenantIds = (await tenantService_1.default._findAndCountAllForEveryUser({})).rows.map((t) => t.id);
        }
        else if (parameters.tenant) {
            tenantIds = parameters.tenant.split(',');
        }
        else {
            tenantIds = [];
        }
        const weekOfYear = (0, moment_1.default)().utc().startOf('isoWeek').subtract(7, 'days').isoWeek().toString();
        const rehRepository = new recurringEmailsHistoryRepository_1.default(options);
        for (const tenantId of tenantIds) {
            const tenant = await options.database.tenant.findByPk(tenantId);
            const isEmailAlreadySent = (await rehRepository.findByWeekOfYear(tenantId, weekOfYear, recurringEmailsHistoryTypes_1.RecurringEmailType.WEEKLY_ANALYTICS)) !== null;
            if (!tenant) {
                log.error({ tenantId }, 'Tenant not found! Skipping.');
            }
            else if (isEmailAlreadySent) {
                log.info({ tenantId }, 'Analytics email for this week is already sent to this tenant. Skipping.');
            }
            else {
                log.info({ tenantId }, `Tenant found - sending weekly email message!`);
                await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(tenant.id, {
                    type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
                    tenant: tenant.id,
                    service: 'weekly-analytics-emails',
                });
                if (tenantIds.length > 1) {
                    await (0, common_1.timeout)(1000);
                }
            }
        }
        process.exit(0);
    });
}
//# sourceMappingURL=send-weekly-analytics-email.js.map