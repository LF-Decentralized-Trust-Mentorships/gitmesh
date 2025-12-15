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
const sequelize_1 = __importStar(require("sequelize"));
const logging_1 = require("@gitmesh/logging");
const common_1 = require("@gitmesh/common");
const types_1 = require("@gitmesh/types");
const unleashContext_1 = require("../../types/unleashContext");
const conf_1 = require("../../conf");
const plans_1 = __importDefault(require("../../security/plans"));
const isFeatureEnabled_1 = require("../../feature-flags/isFeatureEnabled");
/* eslint-disable no-console */
const log = (0, logging_1.getServiceLogger)();
const constaintConfiguration = {
    [types_1.FeatureFlag.AUTOMATIONS]: [
        [
            {
                values: [plans_1.default.values.scale],
                inverted: false,
                operator: 'IN',
                contextName: 'plan',
                caseInsensitive: false,
            },
            {
                value: isFeatureEnabled_1.PLAN_LIMITS[plans_1.default.values.scale][types_1.FeatureFlag.AUTOMATIONS].toString(),
                values: [],
                inverted: false,
                operator: 'NUM_LT',
                contextName: 'automationCount',
                caseInsensitive: false,
            },
        ],
        [
            {
                values: [plans_1.default.values.growth],
                inverted: false,
                operator: 'IN',
                contextName: 'plan',
                caseInsensitive: false,
            },
            {
                value: isFeatureEnabled_1.PLAN_LIMITS[plans_1.default.values.growth][types_1.FeatureFlag.AUTOMATIONS].toString(),
                values: [],
                inverted: false,
                operator: 'NUM_LT',
                contextName: 'automationCount',
                caseInsensitive: false,
            },
        ],
        [
            {
                values: [plans_1.default.values.essential],
                inverted: false,
                operator: 'IN',
                contextName: 'plan',
                caseInsensitive: false,
            },
            {
                value: isFeatureEnabled_1.PLAN_LIMITS[plans_1.default.values.essential][types_1.FeatureFlag.AUTOMATIONS].toString(),
                values: [],
                inverted: false,
                operator: 'NUM_LT',
                contextName: 'automationCount',
                caseInsensitive: false,
            },
        ],
    ],
    [types_1.FeatureFlag.CSV_EXPORT]: [
        [
            {
                values: [plans_1.default.values.scale],
                inverted: false,
                operator: 'IN',
                contextName: 'plan',
                caseInsensitive: false,
            },
            {
                value: isFeatureEnabled_1.PLAN_LIMITS[plans_1.default.values.scale][types_1.FeatureFlag.CSV_EXPORT].toString(),
                values: [],
                inverted: false,
                operator: 'NUM_LT',
                contextName: 'csvExportCount',
                caseInsensitive: false,
            },
        ],
        [
            {
                values: [plans_1.default.values.growth],
                inverted: false,
                operator: 'IN',
                contextName: 'plan',
                caseInsensitive: false,
            },
            {
                value: isFeatureEnabled_1.PLAN_LIMITS[plans_1.default.values.growth][types_1.FeatureFlag.CSV_EXPORT].toString(),
                values: [],
                inverted: false,
                operator: 'NUM_LT',
                contextName: 'csvExportCount',
                caseInsensitive: false,
            },
        ],
        [
            {
                values: [plans_1.default.values.essential],
                inverted: false,
                operator: 'IN',
                contextName: 'plan',
                caseInsensitive: false,
            },
            {
                value: isFeatureEnabled_1.PLAN_LIMITS[plans_1.default.values.essential][types_1.FeatureFlag.CSV_EXPORT].toString(),
                values: [],
                inverted: false,
                operator: 'NUM_LT',
                contextName: 'csvExportCount',
                caseInsensitive: false,
            },
        ],
    ],
    [types_1.FeatureFlag.SIGNALS]: [
        [
            {
                values: [plans_1.default.values.growth, plans_1.default.values.signals, plans_1.default.values.scale, plans_1.default.values.enterprise],
                inverted: false,
                operator: 'IN',
                contextName: 'plan',
                caseInsensitive: false,
            },
        ],
    ],
    [types_1.FeatureFlag.LINKEDIN]: [
        [
            {
                values: [plans_1.default.values.growth, plans_1.default.values.scale, plans_1.default.values.enterprise],
                inverted: false,
                operator: 'IN',
                contextName: 'plan',
                caseInsensitive: false,
            },
        ],
    ],
    [types_1.FeatureFlag.HUBSPOT]: [
        [
            {
                values: [plans_1.default.values.scale, plans_1.default.values.enterprise],
                inverted: false,
                operator: 'IN',
                contextName: 'plan',
                caseInsensitive: false,
            },
        ],
    ],
    [types_1.FeatureFlag.MEMBER_ENRICHMENT]: [
        [
            {
                values: [plans_1.default.values.scale],
                inverted: false,
                operator: 'IN',
                contextName: 'plan',
                caseInsensitive: false,
            },
            {
                value: isFeatureEnabled_1.PLAN_LIMITS[plans_1.default.values.scale][types_1.FeatureFlag.MEMBER_ENRICHMENT].toString(),
                values: [],
                inverted: false,
                operator: 'NUM_LT',
                contextName: 'memberEnrichmentCount',
                caseInsensitive: false,
            },
        ],
        [
            {
                values: [plans_1.default.values.growth],
                inverted: false,
                operator: 'IN',
                contextName: 'plan',
                caseInsensitive: false,
            },
            {
                value: isFeatureEnabled_1.PLAN_LIMITS[plans_1.default.values.growth][types_1.FeatureFlag.MEMBER_ENRICHMENT].toString(),
                values: [],
                inverted: false,
                operator: 'NUM_LT',
                contextName: 'memberEnrichmentCount',
                caseInsensitive: false,
            },
        ],
    ],
    [types_1.FeatureFlag.ORGANIZATION_ENRICHMENT]: [
        [
            {
                values: [plans_1.default.values.scale],
                inverted: false,
                operator: 'IN',
                contextName: 'plan',
                caseInsensitive: false,
            },
            {
                value: isFeatureEnabled_1.PLAN_LIMITS[plans_1.default.values.scale][types_1.FeatureFlag.ORGANIZATION_ENRICHMENT].toString(),
                values: [],
                inverted: false,
                operator: 'NUM_LT',
                contextName: 'organizationEnrichmentCount',
                caseInsensitive: false,
            },
        ],
        [
            {
                values: [plans_1.default.values.growth],
                inverted: false,
                operator: 'IN',
                contextName: 'plan',
                caseInsensitive: false,
            },
            {
                value: isFeatureEnabled_1.PLAN_LIMITS[plans_1.default.values.growth][types_1.FeatureFlag.ORGANIZATION_ENRICHMENT].toString(),
                values: [],
                inverted: false,
                operator: 'NUM_LT',
                contextName: 'organizationEnrichmentCount',
                caseInsensitive: false,
            },
        ],
    ],
    [types_1.FeatureFlag.SEGMENTS]: [],
    // temporal
    [types_1.FeatureFlag.TEMPORAL_AUTOMATIONS]: [
        [
            {
                values: [
                    plans_1.default.values.scale,
                    plans_1.default.values.signals,
                    plans_1.default.values.enterprise,
                    plans_1.default.values.essential,
                    plans_1.default.values.growth,
                ],
                inverted: false,
                operator: 'IN',
                contextName: 'plan',
                caseInsensitive: false,
            },
        ],
    ],
    [types_1.FeatureFlag.TEMPORAL_EMAILS]: [
        [
            {
                values: [
                    plans_1.default.values.scale,
                    plans_1.default.values.signals,
                    plans_1.default.values.enterprise,
                    plans_1.default.values.essential,
                    plans_1.default.values.growth,
                ],
                inverted: false,
                operator: 'IN',
                contextName: 'plan',
                caseInsensitive: false,
            },
        ],
    ],
    [types_1.FeatureFlag.SYNCHRONOUS_OPENSEARCH_UPDATES]: [
        [
            {
                values: [
                    plans_1.default.values.scale,
                    plans_1.default.values.signals,
                    plans_1.default.values.enterprise,
                    plans_1.default.values.essential,
                    plans_1.default.values.growth,
                ],
                inverted: false,
                operator: 'IN',
                contextName: 'plan',
                caseInsensitive: false,
            },
        ],
    ],
};
let seq;
setImmediate(async () => {
    seq = new sequelize_1.default(conf_1.UNLEASH_CONFIG.db.database, conf_1.UNLEASH_CONFIG.db.username, conf_1.UNLEASH_CONFIG.db.password, {
        dialect: 'postgres',
        port: conf_1.UNLEASH_CONFIG.db.port,
        replication: {
            read: [{ host: conf_1.UNLEASH_CONFIG.db.host }],
            write: { host: conf_1.UNLEASH_CONFIG.db.host },
        },
        logging: false,
    });
    await createApiToken(conf_1.UNLEASH_CONFIG.adminApiKey, 'admin-token', 'admin');
    await createApiToken(conf_1.UNLEASH_CONFIG.frontendApiKey, 'frontend-token', 'frontend');
    await createApiToken(conf_1.UNLEASH_CONFIG.backendApiKey, 'backend-token', 'client');
    const allContextFields = Object.values(unleashContext_1.UnleashContextField);
    for (const field of allContextFields) {
        await createContextField(field);
    }
    const allFeatureFlags = Object.values(types_1.FeatureFlag);
    for (const flag of allFeatureFlags) {
        await createFeatureFlag(flag);
        await createStrategy(flag, constaintConfiguration[flag]);
    }
    process.exit(0);
});
async function createApiToken(token, name, type) {
    const results = await seq.query('select * from api_tokens where secret = :token and type = :type and username = :name;', {
        replacements: {
            token,
            name,
            type,
        },
        type: sequelize_1.QueryTypes.SELECT,
    });
    if (results.length === 0) {
        log.info(`${name} token not found - creating...`);
        await seq.query(`insert into api_tokens(secret, username, type, environment) values (:token, :name, :type, 'production')`, {
            replacements: {
                token,
                name,
                type,
            },
            type: sequelize_1.QueryTypes.INSERT,
        });
    }
    else {
        log.info(`${name} token found!`);
    }
}
async function createContextField(field) {
    const results = await seq.query(`select * from context_fields where name = :field`, {
        replacements: {
            field,
        },
        type: sequelize_1.QueryTypes.SELECT,
    });
    if (results.length === 0) {
        log.info(`Context field ${field} not found - creating...`);
        await seq.query(`insert into context_fields(name, stickiness) values (:field, true)`, {
            replacements: {
                field,
            },
            type: sequelize_1.QueryTypes.INSERT,
        });
    }
    else {
        log.info(`Context field ${field} found!`);
    }
}
async function createFeatureFlag(flag) {
    const results = await seq.query(`select * from features where name = :flag and type = 'permission'`, {
        replacements: {
            flag,
        },
        type: sequelize_1.QueryTypes.SELECT,
    });
    if (results.length === 0) {
        log.info(`Feature flag ${flag} not found - creating...`);
        await seq.query(`insert into features(name, description, type) values (:flag, '', 'permission')`, {
            replacements: {
                flag,
            },
            type: sequelize_1.QueryTypes.INSERT,
        });
        await seq.query(`insert into feature_environments(environment, feature_name, enabled) values ('production', :flag, true)`, {
            replacements: {
                flag,
            },
            type: sequelize_1.QueryTypes.INSERT,
        });
    }
    else {
        log.info(`Feature flag ${flag} found!`);
    }
}
async function createStrategy(flag, constraints) {
    const results = await seq.query(`select * from feature_strategies where feature_name = :flag and project_name = 'default' and environment = 'production' and strategy_name = 'default'`, {
        replacements: {
            flag,
        },
        type: sequelize_1.QueryTypes.SELECT,
    });
    if (results.length > 0) {
        log.warn(`Feature flag ${flag} constraints found - re-creating...`);
        await seq.query(`delete from feature_strategies where feature_name = :flag and project_name = 'default' and environment = 'production' and strategy_name = 'default'`, {
            replacements: {
                flag,
            },
            type: sequelize_1.QueryTypes.DELETE,
        });
    }
    log.info(`Feature flag ${flag} constraints not found - creating...`);
    // Handle cases where constraints is undefined or empty
    if (constraints && Array.isArray(constraints)) {
        for (const constraint of constraints) {
            const id = (0, common_1.generateUUIDv1)();
            await seq.query(`insert into feature_strategies(id, feature_name, project_name, environment, strategy_name, constraints) values (:id, :flag, 'default', 'production', 'default', :constraint)`, {
                replacements: {
                    flag,
                    id,
                    constraint: JSON.stringify(constraint),
                },
                type: sequelize_1.QueryTypes.INSERT,
            });
        }
    }
}
//# sourceMappingURL=unleash-init.js.map