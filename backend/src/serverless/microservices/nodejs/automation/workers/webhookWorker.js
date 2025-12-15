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
    const userContext = await (0, getUserContext_1.default)(tenantId);
    const automationExecutionService = new automationExecutionService_1.default(userContext);
    const automation = automationData !== undefined
        ? automationData
        : await new automationRepository_1.default(userContext).findById(automationId);
    const settings = automation.settings;
    const now = new Date();
    log.info(`Firing automation ${automation.id} for event ${eventId} to url '${settings.url}'!`);
    const eventPayload = {
        eventId,
        eventType: automation.trigger,
        eventExecutedAt: now.toISOString(),
        eventPayload: payload,
    };
    let success = false;
    try {
        const result = await superagent_1.default
            .post(settings.url)
            .send(eventPayload)
            .set('User-Agent', 'gitmesh.dev Automations Executor')
            .set('X-AlveoliApp-Event-Type', automation.trigger)
            .set('X-AlveoliApp-Event-ID', eventId);
        success = true;
        log.debug(`Webhook response code ${result.statusCode}!`);
    }
    catch (err) {
        log.warn(`Error while firing webhook automation ${automation.id} for event ${eventId} to url '${settings.url}'!`);
        let error;
        if (err.syscall && err.code) {
            error = {
                type: 'network',
                message: `Could not access ${settings.url}!`,
            };
        }
        else if (err.status) {
            error = {
                type: 'http_status',
                message: `POST @ ${settings.url} returned ${err.statusCode} - ${err.statusMessage}!`,
                body: err.res !== undefined ? err.res.body : undefined,
            };
        }
        else {
            error = {
                type: 'unknown',
                message: err.message,
                errorObject: err,
            };
        }
        await automationExecutionService.create({
            automation,
            eventId,
            payload: eventPayload,
            state: types_1.AutomationExecutionState.ERROR,
            error,
        });
        throw err;
    }
    if (success) {
        await automationExecutionService.create({
            automation,
            eventId,
            payload: eventPayload,
            state: types_1.AutomationExecutionState.SUCCESS,
        });
    }
};
//# sourceMappingURL=webhookWorker.js.map