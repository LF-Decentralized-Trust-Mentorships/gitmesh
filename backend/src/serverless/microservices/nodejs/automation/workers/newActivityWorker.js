"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareActivityPayload = exports.shouldProcessActivity = void 0;
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const getUserContext_1 = __importDefault(require("../../../../../database/utils/getUserContext"));
const activityRepository_1 = __importDefault(require("../../../../../database/repositories/activityRepository"));
const automationRepository_1 = __importDefault(require("../../../../../database/repositories/automationRepository"));
const util_1 = require("./util");
const newMemberWorker_1 = require("./newMemberWorker");
const automationExecutionRepository_1 = __importDefault(require("../../../../../database/repositories/automationExecutionRepository"));
const sequelizeRepository_1 = __importDefault(require("../../../../../database/repositories/sequelizeRepository"));
const memberRepository_1 = __importDefault(require("../../../../../database/repositories/memberRepository"));
const log = (0, logging_1.getServiceChildLogger)('newActivityWorker');
/**
 * Helper function to check whether a single activity should be processed by automation
 * @param activity Activity data
 * @param automation {AutomationData} Automation data
 */
const shouldProcessActivity = async (activity, automation) => {
    var _a, _b, _c, _d;
    const settings = automation.settings;
    let process = true;
    // check whether activity type matches
    if (settings.types && settings.types.length > 0) {
        if (!settings.types.includes(activity.type)) {
            log.warn(`Ignoring automation ${automation.id} - Activity ${activity.id} type '${activity.type}' does not match automation setting types: [${settings.types.join(', ')}]`);
            process = false;
        }
    }
    // check whether activity platform matches
    if (process && settings.platforms && settings.platforms.length > 0) {
        if (!settings.platforms.includes(activity.platform)) {
            log.warn(`Ignoring automation ${automation.id} - Activity ${activity.id} platform '${activity.platform}' does not match automation setting platforms: [${settings.platforms.join(', ')}]`);
            process = false;
        }
    }
    // check whether activity content contains any of the keywords
    if (process && settings.keywords && settings.keywords.length > 0) {
        const body = activity.body.toLowerCase();
        if (!settings.keywords.some((keyword) => body.includes(keyword.trim().toLowerCase()))) {
            log.warn(`Ignoring automation ${automation.id} - Activity ${activity.id} content does not match automation setting keywords: [${settings.keywords.join(', ')}]`);
            process = false;
        }
    }
    if (process &&
        !settings.teamMemberActivities &&
        activity.member.attributes.isTeamMember &&
        activity.member.attributes.isTeamMember.default) {
        log.warn(`Ignoring automation ${automation.id} - Activity ${activity.id} belongs to a team member!`);
        process = false;
    }
    if (((_b = (_a = activity === null || activity === void 0 ? void 0 : activity.member) === null || _a === void 0 ? void 0 : _a.attributes) === null || _b === void 0 ? void 0 : _b.isBot) && ((_d = (_c = activity === null || activity === void 0 ? void 0 : activity.member) === null || _c === void 0 ? void 0 : _c.attributes) === null || _d === void 0 ? void 0 : _d.isBot.default)) {
        log.warn(`Ignoring automation ${automation.id} - Activity ${activity.id} belongs to a bot, cannot be processed automaticaly!`);
        process = false;
    }
    if (process) {
        const userContext = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const repo = new automationExecutionRepository_1.default(userContext);
        const hasAlreadyBeenTriggered = await repo.hasAlreadyBeenTriggered(automation.id, activity.id);
        if (hasAlreadyBeenTriggered) {
            log.warn(`Ignoring automation ${automation.id} - Activity ${activity.id} was already processed!`);
            process = false;
        }
    }
    return process;
};
exports.shouldProcessActivity = shouldProcessActivity;
/**
 * Return a cleaned up copy of the activity that contains only data that is relevant for automation.
 *
 * @param activity Activity data as it came from the repository layer
 * @returns a cleaned up payload to use with automation
 */
const prepareActivityPayload = (activity) => {
    const copy = Object.assign({}, activity);
    delete copy.importHash;
    delete copy.updatedAt;
    delete copy.updatedById;
    delete copy.deletedAt;
    if (copy.member) {
        copy.member = (0, newMemberWorker_1.prepareMemberPayload)(copy.member);
    }
    if (copy.parent) {
        copy.parent = (0, exports.prepareActivityPayload)(copy.parent);
    }
    return copy;
};
exports.prepareActivityPayload = prepareActivityPayload;
/**
 * Check whether this activity matches any automations for tenant.
 * If so emit automation process messages to NodeJS microservices SQS queue.
 *
 * @param tenantId tenant unique ID
 * @param activityId activity unique ID
 * @param activityData activity data
 */
exports.default = async (tenantId, activityId, segmentId) => {
    var _a;
    const userContext = await (0, getUserContext_1.default)(tenantId, null, [segmentId]);
    try {
        // check if relevant automations exists in this tenant
        const automations = await new automationRepository_1.default(userContext).findAll({
            trigger: types_1.AutomationTrigger.NEW_ACTIVITY,
            state: types_1.AutomationState.ACTIVE,
        });
        if (automations.length > 0) {
            log.info(`Found ${automations.length} automations to process!`);
            let activity = await activityRepository_1.default.findById(activityId, userContext);
            if ((_a = activity.member) === null || _a === void 0 ? void 0 : _a.id) {
                const member = await memberRepository_1.default.findById(activity.member.id, userContext);
                activity = Object.assign(Object.assign({}, activity), { member, engagement: (member === null || member === void 0 ? void 0 : member.score) || 0 });
            }
            for (const automation of automations) {
                if (await (0, exports.shouldProcessActivity)(activity, automation)) {
                    log.info(`Activity ${activity.id} is being processed by automation ${automation.id}!`);
                    switch (automation.type) {
                        case types_1.AutomationType.WEBHOOK:
                            await (0, util_1.sendWebhookProcessRequest)(tenantId, automation, activity.id, (0, exports.prepareActivityPayload)(activity), types_1.AutomationType.WEBHOOK);
                            break;
                        case types_1.AutomationType.SLACK:
                            await (0, util_1.sendWebhookProcessRequest)(tenantId, automation, activity.id, (0, exports.prepareActivityPayload)(activity), types_1.AutomationType.SLACK);
                            break;
                        default:
                            log.error(`ERROR: Automation type '${automation.type}' is not supported!`);
                    }
                }
            }
        }
    }
    catch (error) {
        log.error(error, 'Error while processing new activity automation trigger!');
        throw error;
    }
};
//# sourceMappingURL=newActivityWorker.js.map