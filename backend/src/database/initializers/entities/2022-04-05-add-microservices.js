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
const types_1 = require("@gitmesh/types");
const tenantService_1 = __importDefault(require("../../../services/tenantService"));
const microserviceService_1 = __importDefault(require("../../../services/microserviceService"));
const widgetService_1 = __importDefault(require("../../../services/widgetService"));
const integrationService_1 = __importDefault(require("../../../services/integrationService"));
const getUserContext_1 = __importDefault(require("../../utils/getUserContext"));
const microserviceTypes = __importStar(require("../../utils/keys/microserviceTypes"));
exports.default = async () => {
    const tenants = (await tenantService_1.default._findAndCountAllForEveryUser({ filter: {} })).rows;
    for (const tenant of tenants) {
        const userContext = await (0, getUserContext_1.default)(tenant.id);
        const ms = new microserviceService_1.default(userContext);
        const ws = new widgetService_1.default(userContext);
        const is = new integrationService_1.default(userContext);
        // add members_score microservice
        const membersScoreMicroservice = {
            init: true,
            type: microserviceTypes.membersScore,
        };
        await ms.create(membersScoreMicroservice);
        // if tenant has a benchmark widget set
        // add github_lookalike microservice to the tenant
        const benchmarkWidget = await ws.findAndCountAll({ filter: { type: 'benchmark' } });
        if (benchmarkWidget.count > 0) {
            const githubLookalikeMicroservice = {
                init: true,
                type: microserviceTypes.githubLookalike,
            };
            await ms.create(githubLookalikeMicroservice);
        }
        // if tenant has an active twitter integration set
        // add twitter_followers microservice to the tenant
        const twitterIntegration = await is.findAndCountAll({
            filter: { platform: types_1.PlatformType.TWITTER, status: 'done' },
        });
        if (twitterIntegration.count > 0) {
            const twitterFollowersMicroservice = {
                init: true,
                type: microserviceTypes.twitterFollowers,
            };
            await ms.create(twitterFollowersMicroservice);
        }
    }
};
//# sourceMappingURL=2022-04-05-add-microservices.js.map