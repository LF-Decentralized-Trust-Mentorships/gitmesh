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
const memberEnrichmentService_1 = __importDefault(require("../../services/premium/enrichment/memberEnrichmentService"));
/* eslint-disable no-console */
const banner = fs.readFileSync(path_1.default.join(__dirname, 'banner.txt'), 'utf8');
const options = [
    {
        name: 'email',
        alias: 'e',
        type: String,
        description: 'Find member by given email',
    },
    {
        name: 'github_handle',
        alias: 'g',
        type: String,
        description: 'Find member by given github handle',
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
        header: 'Get member enrichment data from progai',
        content: 'Get member enrichment data from progai',
    },
    {
        header: 'Options',
        optionList: options,
    },
];
const usage = (0, command_line_usage_1.default)(sections);
const parameters = (0, command_line_args_1.default)(options);
if (parameters.help || (!parameters.github_handle && !parameters.email)) {
    console.log(usage);
}
else {
    setImmediate(async () => {
        const opts = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        if (parameters.github_handle) {
            const srv = new memberEnrichmentService_1.default(opts);
            const data = await srv.getEnrichmentByGithubHandle(parameters.github_handle);
            console.log(data);
        }
        if (parameters.email) {
            const srv = new memberEnrichmentService_1.default(opts);
            const data = await srv.getEnrichmentByEmail(parameters.email);
            console.log(data);
        }
        process.exit(0);
    });
}
//# sourceMappingURL=get-member-enrichment-data.js.map