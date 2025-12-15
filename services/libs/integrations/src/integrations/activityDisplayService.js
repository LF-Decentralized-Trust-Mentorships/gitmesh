"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityDisplayService = void 0;
const types_1 = require("@gitmesh/types");
const activityTypes_1 = require("./activityTypes");
const types_2 = require("./discord/types");
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
const logging_1 = require("@gitmesh/logging");
const log = (0, logging_1.getServiceChildLogger)('ActivityDisplayService');
class ActivityDisplayService {
    static getInterpolatableVariables(string, interpolatableVariables = []) {
        const interpolationStartIndex = string.indexOf('{');
        const interpolationEndIndex = string.indexOf('}');
        // we don't need processing if there's no opening/closing brackets, or when the string is empty
        if (interpolationStartIndex === -1 || interpolationEndIndex === -1 || string.length === 0) {
            return interpolatableVariables;
        }
        const interpolationVariable = string.slice(interpolationStartIndex + 1, interpolationEndIndex);
        interpolatableVariables.push(interpolationVariable);
        return this.getInterpolatableVariables(string.slice(interpolationEndIndex + 1), interpolatableVariables);
    }
    static interpolateVariables(displayOptions, activity, selectedDisplayVariants) {
        for (const key of Object.keys(displayOptions)) {
            if (typeof displayOptions[key] === 'string' && selectedDisplayVariants.includes(key)) {
                const displayVariables = this.getInterpolatableVariables(displayOptions[key]);
                for (const dv of displayVariables) {
                    const coalesceVariables = dv.split('|');
                    let replacement = '';
                    for (const variable of coalesceVariables) {
                        const attribute = this.getAttribute(variable.trim(), activity);
                        if (attribute) {
                            replacement = attribute;
                            break;
                        }
                    }
                    if (displayOptions.formatter && displayOptions.formatter[dv]) {
                        replacement = displayOptions.formatter[dv](replacement);
                    }
                    displayOptions[key] = displayOptions[key].replace(`{${dv}}`, replacement);
                }
            }
        }
        return displayOptions;
    }
    static getAttribute(key, activity) {
        if (key === 'self') {
            return activity;
        }
        const splitted = key.split('.');
        let attribute = activity;
        for (const key of splitted) {
            try {
                attribute = attribute[key];
            }
            catch (error) {
                return null;
            }
        }
        return attribute;
    }
    static getDisplayOptions(activity, activityTypes, selectedDisplayVariants = [
        types_1.ActivityDisplayVariant.DEFAULT,
        types_1.ActivityDisplayVariant.SHORT,
        types_1.ActivityDisplayVariant.CHANNEL,
    ]) {
        try {
            if (!activity || !activity.platform || !activity.type) {
                return activityTypes_1.UNKNOWN_ACTIVITY_TYPE_DISPLAY;
            }
            const allActivityTypes = (0, lodash_merge_1.default)(activityTypes.custom, activityTypes.default);
            if (activity.platform === types_1.PlatformType.DISCORD &&
                activity.type === types_2.DiscordActivityType.MESSAGE &&
                activity.attributes &&
                activity.attributes.thread === true) {
                activity.type = types_2.DiscordActivityType.THREAD_MESSAGE;
            }
            // we're cloning because we'll use the same object to do the interpolation
            const displayOptions = allActivityTypes[activity.platform] && allActivityTypes[activity.platform][activity.type]
                ? (0, lodash_clonedeep_1.default)(allActivityTypes[activity.platform][activity.type].display)
                : null;
            if (!displayOptions) {
                // return default display
                return activityTypes_1.UNKNOWN_ACTIVITY_TYPE_DISPLAY;
            }
            return this.interpolateVariables(displayOptions, activity, selectedDisplayVariants);
        }
        catch (error) {
            log.debug({ error }, 'Error while getting display options, falling back to UNKNOWN_ACTIVITY_TYPE_DISPLAY.');
            return activityTypes_1.UNKNOWN_ACTIVITY_TYPE_DISPLAY;
        }
    }
}
exports.ActivityDisplayService = ActivityDisplayService;
//# sourceMappingURL=activityDisplayService.js.map