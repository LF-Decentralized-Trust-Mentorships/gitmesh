"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopPubSubPair = exports.getRedisPubSubPair = exports.flushRedisContent = exports.stopClient = exports.getRedisClient = void 0;
const common_1 = require("@gitmesh/common");
const logging_1 = require("@gitmesh/logging");
const redis_1 = require("redis");
const log = (0, logging_1.getServiceChildLogger)('redis');
let client;
const getRedisClient = async (config, exitOnError) => {
    if (config.host) {
        if (client)
            return client;
        const host = config.host;
        const port = config.port;
        log.info(`Creating new Redis client instance for Redis Server: ${host}:${port}!`);
        client = (0, redis_1.createClient)({
            url: `redis://${config.username}:${config.password}@${host}:${port}`,
        });
        if (exitOnError) {
            client.on('error', async (err) => {
                log.error(err, { host, port }, 'Redis client error!');
                if ([
                    'ECONNRESET',
                    'ECONNREFUSED',
                    'UNCERTAIN_STATE',
                    'NR_CLOSED',
                    'CONNECTION_BROKEN',
                    'NOAUTH',
                ].includes(err.code)) {
                    log.fatal(err, { host, port }, 'Fatal redis client connection error - exiting process!');
                    await (0, common_1.timeout)(100);
                    process.nextTick(() => process.exit());
                }
            });
        }
        await client.connect();
        await client.ping();
        log.info('Redis client connected!');
        return client;
    }
    throw new Error('Redis client not configured!');
};
exports.getRedisClient = getRedisClient;
const stopClient = async (client) => client.quit();
exports.stopClient = stopClient;
const flushRedisContent = async (client) => {
    if (common_1.IS_DEV_ENV || common_1.IS_TEST_ENV) {
        log.warn('Flushing and entire redis!');
        await client.flushAll();
    }
    log.warn('Not development or test environment - nothing will be flushed!');
};
exports.flushRedisContent = flushRedisContent;
let pair;
const getRedisPubSubPair = async (config) => {
    if (config.host) {
        if (pair)
            return pair;
        const host = config.host;
        const port = config.port;
        log.info(`Creating new Redis pub/sub client instances for Redis Server: ${host}:${port}!`);
        const pubClient = (0, redis_1.createClient)({
            url: `redis://${config.username}:${config.password}@${host}:${port}`,
        });
        const subClient = pubClient.duplicate();
        await pubClient.connect();
        await pubClient.ping();
        await subClient.connect();
        await subClient.ping();
        pair = {
            pubClient,
            subClient,
        };
        return pair;
    }
    throw new Error('Redis client not configured!');
};
exports.getRedisPubSubPair = getRedisPubSubPair;
const stopPubSubPair = async (pair) => {
    await (0, exports.stopClient)(pair.pubClient);
    await (0, exports.stopClient)(pair.subClient);
};
exports.stopPubSubPair = stopPubSubPair;
//# sourceMappingURL=client.js.map