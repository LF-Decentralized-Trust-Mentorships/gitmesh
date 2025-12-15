"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const superagent_1 = __importDefault(require("superagent"));
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const getUserContext_1 = __importDefault(require("../../../../../database/utils/getUserContext"));
const automationRepository_1 = __importDefault(require("../../../../../database/repositories/automationRepository"));
const automationExecutionService_1 = __importDefault(require("../../../../../services/automationExecutionService"));
const sequelizeRepository_1 = __importDefault(require("../../../../../database/repositories/sequelizeRepository"));
const settingsRepository_1 = __importDefault(require("../../../../../database/repositories/settingsRepository"));
const newMemberBlocks_1 = require("./slack/newMemberBlocks");
const newActivityBlocks_1 = require("./slack/newActivityBlocks");
const log = (0, logging_1.getServiceChildLogger)('webhookWorker');
/**
 * Actually fire the webhook with the relevant payload
 *
 * @param tenantId tenant unique ID
 * @param automationId automation unique ID (or undefined)
 * @param automationData automation data (or undefined)
 * @param eventId trigger event unique ID
 * @param payload payload to send
 */
exports.default = async (tenantId, automationId, automationData, eventId, payload) => {
    const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
    const tenantSettings = await settingsRepository_1.default.getTenantSettings(tenantId, options);
    const userContext = await (0, getUserContext_1.default)(tenantId);
    const automationExecutionService = new automationExecutionService_1.default(userContext);
    const automation = automationData !== undefined
        ? automationData
        : await new automationRepository_1.default(userContext).findById(automationId);
    log.info(`Firing slack automation ${automation.id} for event ${eventId}!`);
    let slackMessage = null;
    let success = false;
    try {
        if (automation.trigger === 'new_member') {
            slackMessage = Object.assign({ text: `${payload.displayName} has joined your community!` }, (0, newMemberBlocks_1.newMemberBlocks)(payload));
        }
        else if (automation.trigger === 'new_activity') {
            slackMessage = Object.assign({ text: ':satellite_antenna: New activity' }, (0, newActivityBlocks_1.newActivityBlocks)(payload));
        }
        else {
            log.warn(`Error no slack handler for automation trigger ${automation.trigger}!`);
            return;
        }
        const result = await superagent_1.default.post(tenantSettings.dataValues.slackWebHook).send(slackMessage);
        success = true;
        log.debug(`Slack response code ${result.statusCode}!`);
    }
    catch (err) {
        log.warn(`Error while firing slack automation ${automation.id} for event ${eventId}!`);
        let error;
        if (err.status === 404) {
            error = {
                type: 'connect',
                message: `Could not access slack workspace!`,
            };
        }
        else {
            error = {
                type: 'connect',
            };
        }
        await automationExecutionService.create({
            automation,
            eventId,
            payload: slackMessage,
            state: types_1.AutomationExecutionState.ERROR,
            error,
        });
        throw err;
    }
    if (success) {
        await automationExecutionService.create({
            automation,
            eventId,
            payload: slackMessage,
            state: types_1.AutomationExecutionState.SUCCESS,
        });
    }
};
//# sourceMappingURL=slackWorker.js.map