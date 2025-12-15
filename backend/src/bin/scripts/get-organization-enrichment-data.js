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
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
const organizationEnrichmentService_1 = __importDefault(require("@/services/premium/enrichment/organizationEnrichmentService"));
const conf_1 = require("@/conf");
/* eslint-disable no-console */
const banner = fs.readFileSync(path_1.default.join(__dirname, 'banner.txt'), 'utf8');
const options = [
    {
        name: 'name',
        alias: 'n',
        type: String,
        description: 'Find organization by given name',
    },
    {
        name: 'website',
        alias: 'w',
        type: String,
        description: 'Find organization by given website',
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
        header: 'Get organization enrichment data from pdl',
        content: 'Get organization enrichment data from pdl',
    },
    {
        header: 'Options',
        optionList: options,
    },
];
const usage = (0, command_line_usage_1.default)(sections);
const parameters = (0, command_line_args_1.default)(options);
if (parameters.help || (!parameters.name && !parameters.website)) {
    console.log(usage);
}
else {
    setImmediate(async () => {
        const opts = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const srv = new organizationEnrichmentService_1.default({
            options: opts,
            apiKey: conf_1.ORGANIZATION_ENRICHMENT_CONFIG.apiKey,
            tenantId: null,
            limit: null,
        });
        const data = await srv.getEnrichment({ website: parameters.website, name: parameters.name });
        console.log(data);
        process.exit(0);
    });
}
//# sourceMappingURL=get-organization-enrichment-data.js.map