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
const sequelizeRepository_1 = __importDefault(require("@/database/repositories/sequelizeRepository"));
const memberRepository_1 = __importDefault(require("@/database/repositories/memberRepository"));
const nodeWorkerSQS_1 = require("@/serverless/utils/nodeWorkerSQS");
const organizationRepository_1 = __importDefault(require("@/database/repositories/organizationRepository"));
const workerTypes_1 = require("@/serverless/types/workerTypes");
const getUserContext_1 = __importDefault(require("@/database/utils/getUserContext"));
const segmentService_1 = __importDefault(require("@/services/segmentService"));
/* eslint-disable no-console */
const banner = fs.readFileSync(path_1.default.join(__dirname, 'banner.txt'), 'utf8');
const log = (0, logging_1.getServiceLogger)();
const options = [
    {
        name: 'tenant',
        alias: 't',
        type: String,
        description: 'The unique ID of tenant that you would like to enrich.',
    },
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Print this usage guide.',
    },
    {
        name: 'organization',
        alias: 'o',
        type: Boolean,
        defaultValue: false,
        description: 'Enrich organizations of the tenant',
    },
    {
        name: 'member',
        alias: 'm',
        type: Boolean,
        defaultValue: false,
        description: 'Enrich members of the tenant',
    },
    {
        name: 'memberIds',
        alias: 'i',
        type: String,
        description: 'Comma separated member ids that you would like to enrich - If this option is not present, script will enrich all members given limit.',
    },
];
const sections = [
    {
        content: banner,
        raw: true,
    },
    {
        header: 'Enrich members, organizations or both of the tenant',
        content: 'Enrich all enrichable members, organizations or both of the tenant',
    },
    {
        header: 'Options',
        optionList: options,
    },
];
const usage = (0, command_line_usage_1.default)(sections);
const parameters = (0, command_line_args_1.default)(options);
if (parameters.help || (!parameters.tenant && (!parameters.organization || !parameters.member))) {
    console.log(usage);
}
else {
    setImmediate(async () => {
        const tenantIds = parameters.tenant.split(',');
        const enrichMembers = parameters.member;
        const enrichOrganizations = parameters.organization;
        const limit = 1000;
        for (const tenantId of tenantIds) {
            const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
            const tenant = await options.database.tenant.findByPk(tenantId);
            if (!tenant) {
                log.error({ tenantId }, 'Tenant not found!');
                process.exit(1);
            }
            else {
                log.info({ tenantId }, `Tenant found - starting enrichment operation for tenant ${tenantId}`);
                const userContext = await (0, getUserContext_1.default)(tenantId);
                const segmentService = new segmentService_1.default(userContext);
                const { rows: segments } = await segmentService.querySubprojects({});
                log.info({ tenantId }, `Total segments found in the tenant: ${segments.length}`);
                // get all segment ids for the tenant
                const segmentIds = segments.map((segment) => segment.id);
                const optionsWithTenant = await sequelizeRepository_1.default.getDefaultIRepositoryOptions(userContext, tenant, segments);
                if (enrichMembers) {
                    if (parameters.memberIds) {
                        const memberIds = parameters.memberIds.split(',');
                        await (0, nodeWorkerSQS_1.sendBulkEnrichMessage)(tenantId, memberIds, segmentIds, false, true);
                        log.info({ tenantId }, `Enrichment message for ${memberIds.length} sent to nodejs-worker!`);
                    }
                    else {
                        let offset = 0;
                        let totalMembers = 0;
                        do {
                            let memberIds;
                            let membersCount;
                            if (parameters.memberIds) {
                                memberIds = parameters.memberIds.split(',');
                                membersCount = memberIds.length;
                            }
                            else {
                                const { ids, count } = await memberRepository_1.default.getMemberIdsandCount({ limit, offset, countOnly: false }, optionsWithTenant);
                                memberIds = ids;
                                membersCount = count;
                            }
                            totalMembers = membersCount;
                            log.info({ tenantId }, `Total members found in the tenant: ${membersCount}`);
                            await (0, nodeWorkerSQS_1.sendBulkEnrichMessage)(tenantId, memberIds, segmentIds, false, true);
                            offset += limit;
                        } while (totalMembers > offset);
                    }
                    log.info({ tenantId }, `Members enrichment operation finished for tenant ${tenantId}`);
                }
                if (enrichOrganizations) {
                    const organizations = await organizationRepository_1.default.findAndCountAll({}, optionsWithTenant);
                    const totalOrganizations = organizations.count;
                    log.info({ tenantId }, `Total organizations found in the tenant: ${totalOrganizations}`);
                    const payload = {
                        type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
                        service: 'enrich-organizations',
                        tenantId,
                        // Since there is no pagination implemented for the organizations enrichment,
                        // we set a limit of 10,000 to ensure all organizations are included when enriched in bulk.
                        maxEnrichLimit: 10000,
                    };
                    await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(tenantId, payload);
                    log.info({ tenantId }, `Organizations enrichment operation finished for tenant ${tenantId}`);
                }
            }
        }
        process.exit(0);
    });
}
//# sourceMappingURL=enrich-members-and-organizations.js.map