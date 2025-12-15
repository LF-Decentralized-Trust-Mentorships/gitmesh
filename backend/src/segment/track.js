"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const conf_1 = require("../conf");
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const addProductDataToGitmeshTenant_1 = require("./addProductDataToGitmeshTenant");
const trackHelper_1 = __importDefault(require("./trackHelper"));
const log = (0, logging_1.getServiceChildLogger)('segment');
async function identify(event, properties, options, userId = false, timestamp = false) {
    try {
        const userEmail = sequelizeRepository_1.default.getCurrentUser(Object.assign({}, options)).email;
        if (!conf_1.IS_TEST_ENV &&
            conf_1.SEGMENT_CONFIG.writeKey &&
            // This is only for events in the hosted version. Self-hosted has less telemetry.
            (conf_1.API_CONFIG.edition === types_1.Edition.HOSTED || conf_1.API_CONFIG.edition === types_1.Edition.LFX) &&
            userEmail !== 'support@gitmesh.dev') {
            if (properties &&
                (properties === null || properties === void 0 ? void 0 : properties.platform) &&
                (properties === null || properties === void 0 ? void 0 : properties.platform) === addProductDataToGitmeshTenant_1.ANALYTICS_PLATORM_NAME) {
                // no need to track gitmesh analytics events in segment
                // and this is also to ensure we don't get into an infinite loop
                return;
            }
            const Analytics = require('analytics-node');
            const analytics = new Analytics(conf_1.SEGMENT_CONFIG.writeKey);
            const { userIdOut, tenantIdOut } = (0, trackHelper_1.default)(userId, options);
            const payload = Object.assign({ userId: userIdOut, event,
                properties, context: {
                    groupId: tenantIdOut,
                } }, (timestamp && { timestamp }));
            analytics.track(payload);
            // send product analytics data to gitmesh tenant workspace
            // await addProductData({
            //   userId: userIdOut,
            //   tenantId: tenantIdOut,
            //   event,
            //   timestamp,
            //   properties,
            // })
        }
    }
    catch (error) {
        log.error(error, 'Could not send payload to Segment');
    }
}
exports.default = identify;
//# sourceMappingURL=track.js.map