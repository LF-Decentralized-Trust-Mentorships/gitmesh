"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const conf_1 = require("../conf");
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const trackHelper_1 = __importDefault(require("./trackHelper"));
const addProductDataToGitmeshTenant_1 = require("./addProductDataToGitmeshTenant");
const log = (0, logging_1.getServiceChildLogger)('telemetryTrack');
function track(event, properties, options, userId = false, timestamp = false) {
    try {
        const email = sequelizeRepository_1.default.getCurrentUser(Object.assign({}, options))?.email;
        if (!conf_1.IS_TEST_ENV &&
            conf_1.SEGMENT_CONFIG.writeKey &&
            // This is only for events in the self-hosted version. Hosted has more telemetry.
            conf_1.API_CONFIG.edition === types_1.Edition.COMMUNITY &&
            email &&
            !email.includes('gitmesh.dev')) {
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
            if (event === 'Conversation created') {
                log.trace('Added conversation');
            }
            analytics.track(payload);
        }
    }
    catch (error) {
        log.error(error, 'ERROR: Could not send the following payload to Segment');
    }
}
exports.default = track;
//# sourceMappingURL=telemetryTrack.js.map