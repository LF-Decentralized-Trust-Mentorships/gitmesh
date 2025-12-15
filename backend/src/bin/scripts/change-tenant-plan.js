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
/* eslint-disable no-console */
const banner = fs.readFileSync(path_1.default.join(__dirname, 'banner.txt'), 'utf8');
const log = (0, logging_1.getServiceLogger)();
const options = [
    {
        name: 'tenant',
        alias: 't',
        type: String,
        description: 'The unique ID of tenant that you would like to update.',
    },
    {
        name: 'plan',
        alias: 'p',
        type: String,
        description: `Plan that will be applied to the tenant. Accepted values are 'Growth' and 'Essential'.`,
    },
    {
        name: 'trialEndsAt',
        alias: 'x',
        description: 'YYYY-MM-dd format trial end date. If this value is ommited, isTrial will be set to false.',
        type: String,
        defaultValue: null,
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
        header: 'Update tenant plan',
        content: 'Updates tenant plan.',
    },
    {
        header: 'Options',
        optionList: options,
    },
];
const usage = (0, command_line_usage_1.default)(sections);
const parameters = (0, command_line_args_1.default)(options);
if (parameters.help || !parameters.tenant || !parameters.plan) {
    console.log(usage);
}
else if (parameters.plan !== 'Growth' && parameters.plan !== 'Essential') {
    console.log(usage);
    console.log(`Invalid plan ${parameters.plan}`);
}
else {
    setImmediate(async () => {
        const plan = parameters.plan;
        const isTrial = parameters.trialEndsAt !== null;
        const trialEndsAt = parameters.trialEndsAt;
        const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const tenantIds = parameters.tenant.split(',');
        for (const tenantId of tenantIds) {
            const tenant = await options.database.tenant.findByPk(tenantId);
            if (!tenant) {
                log.error({ tenantId }, 'Tenant not found!');
                process.exit(1);
            }
            else {
                log.info({ tenantId, isTrial }, `Tenant found - updating tenant plan to ${plan}!`);
                await tenant.update({
                    plan,
                    isTrialPlan: isTrial,
                    trialEndsAt,
                });
            }
        }
        process.exit(0);
    });
}
//# sourceMappingURL=change-tenant-plan.js.map