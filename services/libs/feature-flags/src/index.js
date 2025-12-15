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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFeatureEnabled = exports.getUnleashClient = void 0;
const common_1 = require("@gitmesh/common");
const logging_1 = require("@gitmesh/logging");
const redis_1 = require("@gitmesh/redis");
const types_1 = require("@gitmesh/types");
const unleash_client_1 = require("unleash-client");
const log = (0, logging_1.getServiceChildLogger)('feature-flags');
let unleash;
const getUnleashClient = async (cfg) => {
    if (common_1.EDITION !== types_1.Edition.HOSTED) {
        return undefined;
    }
    if (unleash) {
        return unleash;
    }
    unleash = new unleash_client_1.Unleash({
        url: `${cfg.url}/api`,
        appName: cfg.appName,
        customHeaders: {
            Authorization: cfg.apiKey,
        },
    });
    unleash.on('error', (err) => {
        log.error(err, 'Unleash client error! Feature flags might not work correctly!');
    });
    let isReady = false;
    const interval = setInterval(async () => {
        if (!isReady) {
            log.error('Unleash client is not ready yet, exiting...');
            process.exit(1);
        }
    }, 60 * 1000);
    await new Promise((resolve) => {
        unleash.on('ready', () => {
            clearInterval(interval);
            log.info('Unleash client is ready!');
            isReady = true;
            resolve();
        });
    });
    return unleash;
};
exports.getUnleashClient = getUnleashClient;
const isFeatureEnabled = async (flag, contextLoader, client, redis, redisTimeoutSeconds, cacheKey) => {
    if (flag === types_1.FeatureFlag.SEGMENTS) {
        return false;
    }
    if (common_1.EDITION === types_1.Edition.COMMUNITY) {
        return true;
    }
    if (!client) {
        // For non-hosted editions, enable all features by default
        return true;
    }
    let cache;
    if (redis && redisTimeoutSeconds && cacheKey) {
        cache = new redis_1.RedisCache('feature-flags', redis, log);
        const result = await cache.get(`${flag}-${cacheKey}`);
        if (result) {
            return result === 'true';
        }
    }
    const enabled = unleash.isEnabled(flag, await contextLoader());
    if (cache) {
        await cache.set(`${flag}-${cacheKey}`, enabled.toString(), redisTimeoutSeconds || 60);
    }
    return enabled;
};
exports.isFeatureEnabled = isFeatureEnabled;
__exportStar(require("unleash-client"), exports);
//# sourceMappingURL=index.js.map