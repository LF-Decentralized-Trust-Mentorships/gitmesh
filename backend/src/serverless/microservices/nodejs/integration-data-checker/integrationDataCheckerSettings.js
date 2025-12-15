"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationDataCheckerSettings = exports.IntegrationDataCheckerSettingsType = void 0;
// Enum
var IntegrationDataCheckerSettingsType;
(function (IntegrationDataCheckerSettingsType) {
    IntegrationDataCheckerSettingsType["REGULAR"] = "regular";
    IntegrationDataCheckerSettingsType["PLATFORM_SPECIFIC"] = "platformSpecific";
})(IntegrationDataCheckerSettingsType = exports.IntegrationDataCheckerSettingsType || (exports.IntegrationDataCheckerSettingsType = {}));
exports.integrationDataCheckerSettings = [
    // Check that all new integrations received data in the first two hours
    {
        timeSinceLastData: '2 hours',
        onlyNewIntegrations: true,
        actions: { sendSlackAlert: true, changeStatus: false },
        // actions: { sendSlackAlert: true, changeStatus: true },
        type: IntegrationDataCheckerSettingsType.REGULAR,
    },
    // Check that Slack and Discord integrations have message activities in the first 2 hours
    {
        timeSinceLastData: '2 hours',
        onlyNewIntegrations: true,
        actions: { sendSlackAlert: true, changeStatus: false },
        // actions: { sendSlackAlert: true, changeStatus: true },
        type: IntegrationDataCheckerSettingsType.PLATFORM_SPECIFIC,
        activityPlatformsAndType: {
            platforms: ['slack', 'discord'],
            type: 'message',
        },
    },
    // Check that each integration is actually getting data every in the last 3 days
    // {
    //   timeSinceLastData: '3 days',
    //   onlyNewIntegrations: false,
    //   actions: {
    //     sendSlackAlert: true,
    //     changeStatus: false,
    //   },
    //   type: IntegrationDataCheckerSettingsType.REGULAR,
    // },
];
//# sourceMappingURL=integrationDataCheckerSettings.js.map