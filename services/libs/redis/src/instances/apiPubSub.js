"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiPubSubEmitter = void 0;
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const pubsub_1 = require("../pubsub");
class ApiPubSubEmitter extends logging_1.LoggerBase {
    constructor(redis, parentLog) {
        super(parentLog, {
            pubSubScope: 'api-pubsub',
        });
        this.pubsub = new pubsub_1.RedisPubSubEmitter('api-pubsub', redis, (err) => {
            this.log.error(err, 'Error in api-pubsub emitter!');
        }, this.log);
    }
    emitIntegrationCompleted(tenantId, integrationId, status) {
        this.pubsub.emit('user', new types_1.ApiWebsocketMessage('integration-completed', JSON.stringify({
            integrationId,
            status,
        }), undefined, tenantId));
    }
    emit(channel, data) {
        this.pubsub.emit(channel, data);
    }
}
exports.ApiPubSubEmitter = ApiPubSubEmitter;
//# sourceMappingURL=apiPubSub.js.map