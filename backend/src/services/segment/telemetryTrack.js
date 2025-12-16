"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var logging_1 = require("@gitmesh/logging");
var types_1 = require("@gitmesh/types");
var conf_1 = require("../conf");
var sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
var trackHelper_1 = __importDefault(require("./trackHelper"));
var addProductDataToGitmeshTenant_1 = require("./addProductDataToGitmeshTenant");
var log = (0, logging_1.getServiceChildLogger)('telemetryTrack');
function track(event, properties, options, userId, timestamp) {
    if (userId === void 0) { userId = false; }
    if (timestamp === void 0) { timestamp = false; }
    var email = sequelizeRepository_1["default"].getCurrentUser(__assign({}, options)).email;
    if (!conf_1.IS_TEST_ENV &&
        conf_1.SEGMENT_CONFIG.writeKey &&
        // This is only for events in the self-hosted version. Hosted has more telemetry.
        conf_1.API_CONFIG.edition === types_1.Edition.COMMUNITY &&
        !email.includes('gitmesh.dev')) {
        if (properties &&
            (properties === null || properties === void 0 ? void 0 : properties.platform) &&
            (properties === null || properties === void 0 ? void 0 : properties.platform) === addProductDataToGitmeshTenant_1.ANALYTICS_PLATORM_NAME) {
            // no need to track gitmesh analytics events in segment
            // and this is also to ensure we don't get into an infinite loop
            return;
        }
        var Analytics = require('analytics-node');
        var analytics = new Analytics(conf_1.SEGMENT_CONFIG.writeKey);
        var _a = (0, trackHelper_1["default"])(userId, options), userIdOut = _a.userIdOut, tenantIdOut = _a.tenantIdOut;
        var payload = __assign({ userId: userIdOut, event: event, properties: properties, context: {
                groupId: tenantIdOut
            } }, (timestamp && { timestamp: timestamp }));
        try {
            if (event === 'Conversation created') {
                log.trace('Added conversation');
            }
            analytics.track(payload);
        }
        catch (error) {
            log.error(error, { payload: payload }, 'ERROR: Could not send the following payload to Segment');
        }
    }
}
exports["default"] = track;
