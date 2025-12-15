"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANALYTICS_PLATORM_NAME = void 0;
const axios_1 = __importDefault(require("axios"));
const logging_1 = require("@gitmesh/logging");
const conf_1 = require("../conf");
const userRepository_1 = __importDefault(require("../database/repositories/userRepository"));
const tenantRepository_1 = __importDefault(require("../database/repositories/tenantRepository"));
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const IS_ANALYTICS_ENABLED = conf_1.ANALYTICS_CONFIG.isEnabled === 'true';
const ANALYTICS_TENANT_ID = conf_1.ANALYTICS_CONFIG.tenantId;
const ANALYTICS_BASE_URL = conf_1.ANALYTICS_CONFIG.baseUrl;
const ANALYTICS_TOKEN = conf_1.ANALYTICS_CONFIG.apiToken;
exports.ANALYTICS_PLATORM_NAME = 'gitmesh.dev-analytics';
const log = (0, logging_1.getServiceChildLogger)('segment');
const expandAttributes = (attributes) => {
    const obj = {};
    Object.keys(attributes).forEach((key) => {
        obj[key.toLowerCase()] = {
            [exports.ANALYTICS_PLATORM_NAME]: attributes[key],
        };
    });
    return obj;
};
async function addProductData(data) {
    var _a, _b, _c, _d;
    if (!IS_ANALYTICS_ENABLED) {
        return;
    }
    if (!ANALYTICS_TENANT_ID) {
        return;
    }
    if (!ANALYTICS_BASE_URL) {
        return;
    }
    if (!ANALYTICS_TOKEN) {
        return;
    }
    if (!(data === null || data === void 0 ? void 0 : data.userId)) {
        // we can't send data without a user id
        return;
    }
    if (!(data === null || data === void 0 ? void 0 : data.tenantId)) {
        // we can't send data without a tenant id
        return;
    }
    try {
        const repositoryOptions = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const user = await userRepository_1.default.findById(data.userId, repositoryOptions);
        // this is an array of one tenant
        const tenant = await tenantRepository_1.default.getTenantInfo(data.tenantId, repositoryOptions);
        const timestamp = data.timestamp || new Date().toISOString();
        const obj = {
            member: {
                username: {
                    [exports.ANALYTICS_PLATORM_NAME]: user.email,
                },
                emails: [user.email],
                displayName: user.fullName,
                attributes: Object.assign({}, expandAttributes({
                    email: user.email,
                    createdAnAccount: true,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    plan: (_a = tenant[0]) === null || _a === void 0 ? void 0 : _a.plan,
                    isTrialPlan: (_b = tenant[0]) === null || _b === void 0 ? void 0 : _b.isTrialPlan,
                    trialEndsAt: (_c = tenant[0]) === null || _c === void 0 ? void 0 : _c.trialEndsAt,
                })),
                organizations: [
                    {
                        name: (_d = tenant[0]) === null || _d === void 0 ? void 0 : _d.name,
                    },
                ],
            },
            type: data.event,
            timestamp,
            platform: exports.ANALYTICS_PLATORM_NAME,
            sourceId: `${data.userId}-${timestamp}-${data.event}`,
        };
        const endpoint = `${ANALYTICS_BASE_URL}/tenant/${ANALYTICS_TENANT_ID}/activity/with-member`;
        await axios_1.default.post(endpoint, obj, {
            headers: {
                Authorization: `Bearer ${ANALYTICS_TOKEN}`,
            },
        });
    }
    catch (error) {
        log.error(error, { data }, 'ERROR: Could not send the following payload to Gitmesh Analytics');
    }
}
exports.default = addProductData;
//# sourceMappingURL=addProductDataToGitmeshTenant.js.map