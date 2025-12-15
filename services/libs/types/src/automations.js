"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationTrigger = exports.AutomationExecutionState = exports.AutomationState = exports.AutomationType = exports.AutomationSyncTrigger = void 0;
var AutomationSyncTrigger;
(function (AutomationSyncTrigger) {
    AutomationSyncTrigger["MEMBER_ATTRIBUTES_MATCH"] = "member_attributes_match";
    AutomationSyncTrigger["ORGANIZATION_ATTRIBUTES_MATCH"] = "organization_attributes_match";
})(AutomationSyncTrigger || (exports.AutomationSyncTrigger = AutomationSyncTrigger = {}));
/**
 * all automation types that we are currently supporting
 */
var AutomationType;
(function (AutomationType) {
    AutomationType["WEBHOOK"] = "webhook";
    AutomationType["SLACK"] = "slack";
    AutomationType["HUBSPOT"] = "hubspot";
})(AutomationType || (exports.AutomationType = AutomationType = {}));
/**
 * automation can either be active or disabled
 */
var AutomationState;
(function (AutomationState) {
    AutomationState["ACTIVE"] = "active";
    AutomationState["DISABLED"] = "disabled";
})(AutomationState || (exports.AutomationState = AutomationState = {}));
/**
 * To determine the result of the execution if state == error -> error column will also be available
 */
var AutomationExecutionState;
(function (AutomationExecutionState) {
    AutomationExecutionState["SUCCESS"] = "success";
    AutomationExecutionState["ERROR"] = "error";
})(AutomationExecutionState || (exports.AutomationExecutionState = AutomationExecutionState = {}));
/**
 * What can trigger this automation
 */
var AutomationTrigger;
(function (AutomationTrigger) {
    AutomationTrigger["NEW_ACTIVITY"] = "new_activity";
    AutomationTrigger["NEW_MEMBER"] = "new_member";
})(AutomationTrigger || (exports.AutomationTrigger = AutomationTrigger = {}));
//# sourceMappingURL=automations.js.map