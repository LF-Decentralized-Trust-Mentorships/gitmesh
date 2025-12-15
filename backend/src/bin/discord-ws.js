"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const moment_1 = __importDefault(require("moment"));
const common_1 = require("@gitmesh/common");
const redis_1 = require("@gitmesh/redis");
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const tracing_1 = require("@gitmesh/tracing");
const conf_1 = require("../conf");
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const integrationRepository_1 = __importDefault(require("../database/repositories/integrationRepository"));
const incomingWebhookRepository_1 = __importDefault(require("../database/repositories/incomingWebhookRepository"));
const webhooks_1 = require("../types/webhooks");
const serviceSQS_1 = require("@/serverless/utils/serviceSQS");
const tracer = (0, tracing_1.getServiceTracer)();
const log = (0, logging_1.getServiceLogger)();
async function executeIfNotExists(key, cache, fn, delayMilliseconds) {
    if (delayMilliseconds) {
        await (0, common_1.timeout)(delayMilliseconds);
    }
    const exists = await cache.get(key);
    if (!exists) {
        await fn();
        await cache.set(key, '1', 2 * 60 * 60);
    }
}
async function spawnClient(name, token, cache, delayMilliseconds) {
    const logger = (0, logging_1.getChildLogger)('discord-ws', log, { clientName: name });
    const repoOptions = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
    const repo = new incomingWebhookRepository_1.default(repoOptions);
    const processPayload = async (event, data, guildId) => {
        const payload = {
            event,
            data,
        };
        logger.info({ payload }, 'Processing Discord WS Message!');
        await tracer.startActiveSpan('ProcessDiscordWSMessage', async (span) => {
            try {
                const integration = (await integrationRepository_1.default.findByIdentifier(guildId, types_1.PlatformType.DISCORD));
                const result = await repo.create({
                    tenantId: integration.tenantId,
                    integrationId: integration.id,
                    type: webhooks_1.WebhookType.DISCORD,
                    payload,
                });
                const streamEmitter = await (0, serviceSQS_1.getIntegrationStreamWorkerEmitter)();
                await streamEmitter.triggerWebhookProcessing(integration.tenantId, integration.platform, result.id);
                span.setStatus({
                    code: tracing_1.SpanStatusCode.OK,
                });
            }
            catch (err) {
                if (err.code === 404) {
                    logger.warn({ guildId }, 'No integration found for incoming Discord WS Message!');
                }
                else {
                    span.setStatus({
                        code: tracing_1.SpanStatusCode.ERROR,
                        message: err,
                    });
                    logger.error(err, {
                        discordPayload: JSON.stringify(payload),
                        guildId,
                    }, 'Error processing Discord WS Message!');
                }
            }
            finally {
                span.end();
            }
        });
    };
    const client = new discord_js_1.Client({
        intents: [
            discord_js_1.GatewayIntentBits.Guilds,
            discord_js_1.GatewayIntentBits.GuildMembers,
            discord_js_1.GatewayIntentBits.GuildMessages,
            discord_js_1.GatewayIntentBits.GuildMessageReactions,
            discord_js_1.GatewayIntentBits.DirectMessages,
            discord_js_1.GatewayIntentBits.DirectMessageReactions,
            discord_js_1.GatewayIntentBits.MessageContent,
        ],
    });
    // listen to client events
    client.on(discord_js_1.Events.ClientReady, () => {
        logger.info('Discord WS client is ready!');
    });
    client.on(discord_js_1.Events.Error, (err) => {
        logger.error(err, 'Discord WS client error! Exiting...');
        process.exit(1);
    });
    client.on(discord_js_1.Events.Debug, (message) => {
        logger.debug({ debugMsg: message }, 'Discord WS client debug message!');
    });
    client.on(discord_js_1.Events.Warn, (message) => {
        logger.warn({ warning: message }, 'Discord WS client warning!');
    });
    // listen to discord events
    client.on(discord_js_1.Events.GuildMemberAdd, async (m) => {
        const member = m;
        await executeIfNotExists(`member-${member.userId}`, cache, async () => {
            var _a, _b;
            logger.debug({
                member: member.displayName,
                guildId: (_a = member.guildId) !== null && _a !== void 0 ? _a : member.guild.id,
                userId: member.userId,
            }, 'Member joined guild!');
            await processPayload(webhooks_1.DiscordWebsocketEvent.MEMBER_ADDED, member, (_b = member.guildId) !== null && _b !== void 0 ? _b : member.guild.id);
        }, delayMilliseconds);
    });
    client.on(discord_js_1.Events.MessageCreate, async (message) => {
        if (message.type === discord_js_1.MessageType.Default || message.type === discord_js_1.MessageType.Reply) {
            await executeIfNotExists(`msg-${message.id}`, cache, async () => {
                logger.debug({
                    guildId: message.guildId,
                    channelId: message.channelId,
                    message: message.cleanContent,
                    authorId: message.author,
                }, 'Message created!');
                await processPayload(webhooks_1.DiscordWebsocketEvent.MESSAGE_CREATED, message, message.guildId);
            }, delayMilliseconds);
        }
    });
    client.on(discord_js_1.Events.MessageUpdate, async (oldMessage, newMessage) => {
        if (newMessage.type === discord_js_1.MessageType.Default && newMessage.editedTimestamp) {
            await executeIfNotExists(`msg-modified-${newMessage.id}-${newMessage.editedTimestamp}`, cache, async () => {
                logger.debug({
                    guildId: newMessage.guildId,
                    channelId: newMessage.channelId,
                    oldMessageId: oldMessage.id,
                    newMessage: newMessage.cleanContent,
                    authorId: newMessage.author,
                }, 'Message updated!');
                await processPayload(webhooks_1.DiscordWebsocketEvent.MESSAGE_UPDATED, {
                    message: newMessage,
                    oldMessage,
                }, newMessage.guildId);
            }, delayMilliseconds);
        }
    });
    await client.login(token);
    logger.info('Discord WS client logged in!');
}
setImmediate(async () => {
    // we are saving heartbeat timestamps in redis every 2 seconds
    // on boot if we detect that there has been a downtime we should trigger discord integration checks
    // so we don't miss anything
    const redis = await (0, redis_1.getRedisClient)(conf_1.REDIS_CONFIG, true);
    const cache = new redis_1.RedisCache('discord-ws', redis, log);
    const lastHeartbeat = await cache.get('heartbeat');
    let triggerCheck = false;
    if (!lastHeartbeat) {
        log.info('No heartbeat found, triggering check!');
        triggerCheck = true;
    }
    else {
        const diff = (0, moment_1.default)().diff(lastHeartbeat, 'seconds');
        // if we do rolling update deploys (kubernetes default)
        // we might catch a heartbeat without the need to trigger a check
        if (diff > 5) {
            log.warn('Heartbeat is stale, triggering check!');
            triggerCheck = true;
        }
    }
    if (triggerCheck) {
        const emitter = await (0, serviceSQS_1.getIntegrationRunWorkerEmitter)();
        await (0, common_1.processPaginated)(async (page) => integrationRepository_1.default.findAllActive(types_1.PlatformType.DISCORD, page, 10), async (integrations) => {
            log.warn(`Found ${integrations.length} integrations to trigger check for!`);
            for (const integration of integrations) {
                await emitter.triggerIntegrationRun(integration.tenantId, integration.platform, integration.id, false);
            }
        });
    }
    await spawnClient('first-app', conf_1.DISCORD_CONFIG.token, cache, conf_1.DISCORD_CONFIG.token2 ? 1000 : undefined);
    if (conf_1.DISCORD_CONFIG.token2) {
        await spawnClient('second-app', conf_1.DISCORD_CONFIG.token2, cache);
    }
    setInterval(async () => {
        await cache.set('heartbeat', new Date().toISOString());
    }, 2 * 1000);
});
//# sourceMappingURL=discord-ws.js.map