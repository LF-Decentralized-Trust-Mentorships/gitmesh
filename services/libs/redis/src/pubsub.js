"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisPubSubBus = exports.RedisPubSubEmitter = exports.RedisPubSubReceiver = void 0;
const logging_1 = require("@gitmesh/logging");
const common_1 = require("@gitmesh/common");
class RedisPubSubBase extends logging_1.LoggerBase {
    constructor(scope, parentLog) {
        super(parentLog, {
            pubSubScope: scope,
        });
        this.prefix = `${scope}:`;
    }
}
class RedisPubSubReceiver extends RedisPubSubBase {
    constructor(scope, receiver, errorHandler, parentLog) {
        super(scope, parentLog);
        this.receiver = receiver;
        this.subscriptionMap = new Map();
        receiver.on('error', (err) => {
            this.log.error({ err }, 'Redis sub client error!');
            errorHandler(err);
        });
        this.receiver.pSubscribe(`${this.prefix}*`, (message, channel) => {
            const data = JSON.parse(message);
            this.log.debug({ channel, data }, 'Received Redis Pub/Sub message!');
            const infos = this.subscriptionMap.get(channel);
            if (infos) {
                for (const info of infos) {
                    info.handler(data).catch(() => {
                        // ignore errors
                    });
                }
            }
        });
        this.log.info({ scope: `${this.prefix}*` }, 'Redis Pub/Sub receiver initialized!');
    }
    subscribe(channel, handler) {
        const id = (0, common_1.generateUUIDv1)();
        const info = { id, handler };
        const infos = this.subscriptionMap.get(`${this.prefix}${channel}`) || [];
        infos.push(info);
        this.subscriptionMap.set(`${this.prefix}${channel}`, infos);
        return id;
    }
    unsubscribe(id) {
        for (const [channel, infos] of this.subscriptionMap.entries()) {
            const index = infos.findIndex((info) => info.id === id);
            if (index >= 0) {
                infos.splice(index, 1);
                if (infos.length === 0) {
                    this.subscriptionMap.delete(channel);
                }
                return;
            }
        }
    }
}
exports.RedisPubSubReceiver = RedisPubSubReceiver;
class RedisPubSubEmitter extends RedisPubSubBase {
    constructor(scope, sender, errorHandler, parentLog) {
        super(scope, parentLog);
        this.sender = sender;
        sender.on('error', (err) => {
            this.log.error({ err }, 'Redis pub client error!');
            errorHandler(err);
        });
    }
    emit(channel, data) {
        this.log.debug({ channel: `${this.prefix}${channel}`, data }, 'Emitting Redis Pub/Sub message!');
        this.sender.publish(`${this.prefix}${channel}`, JSON.stringify(data));
    }
}
exports.RedisPubSubEmitter = RedisPubSubEmitter;
class RedisPubSubBus extends RedisPubSubBase {
    constructor(scope, redisPair, errorHandler, parentLog) {
        super(scope, parentLog);
        this.emitter = new RedisPubSubEmitter(scope, redisPair.pubClient, errorHandler, this.log);
        this.receiver = new RedisPubSubReceiver(scope, redisPair.subClient, errorHandler, this.log);
    }
    emit(channel, data) {
        this.emitter.emit(channel, data);
    }
    subscribe(channel, listener) {
        return this.receiver.subscribe(channel, listener);
    }
    unsubscribe(id) {
        this.receiver.unsubscribe(id);
    }
}
exports.RedisPubSubBus = RedisPubSubBus;
//# sourceMappingURL=pubsub.js.map