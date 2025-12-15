"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orgMergeWorker = void 0;
const redis_1 = require("@gitmesh/redis");
const types_1 = require("@gitmesh/types");
const conf_1 = require("../../../../conf");
const getUserContext_1 = __importDefault(require("../../../../database/utils/getUserContext"));
const organizationService_1 = __importDefault(require("../../../../services/organizationService"));
async function doNotifyFrontend({ log, success, tenantId, primaryOrgId, secondaryOrgId }) {
    const redis = await (0, redis_1.getRedisClient)(conf_1.REDIS_CONFIG, true);
    const apiPubSubEmitter = new redis_1.RedisPubSubEmitter('api-pubsub', redis, (err) => {
        log.error({ err }, 'Error in api-ws emitter!');
    }, log);
    apiPubSubEmitter.emit('user', new types_1.ApiWebsocketMessage('org-merge', JSON.stringify({
        success,
        tenantId,
        primaryOrgId,
        secondaryOrgId,
    }), undefined, tenantId));
}
async function orgMergeWorker(tenantId, primaryOrgId, secondaryOrgId, notifyFrontend) {
    const userContext = await (0, getUserContext_1.default)(tenantId);
    const organizationService = new organizationService_1.default(userContext);
    let success = true;
    try {
        await organizationService.mergeSync(primaryOrgId, secondaryOrgId);
    }
    catch (err) {
        userContext.log.error(err, 'Error merging orgs');
        success = false;
    }
    if (notifyFrontend) {
        await doNotifyFrontend({
            log: userContext.log,
            success,
            tenantId,
            primaryOrgId,
            secondaryOrgId,
        });
    }
}
exports.orgMergeWorker = orgMergeWorker;
//# sourceMappingURL=orgMergeWorker.js.map