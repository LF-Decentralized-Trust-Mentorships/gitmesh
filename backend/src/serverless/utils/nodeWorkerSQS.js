"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOrgMergeMessage = exports.sendBulkEnrichMessage = exports.sendExportCSVNodeSQSMessage = exports.sendNewMemberNodeSQSMessage = exports.sendNewActivityNodeSQSMessage = exports.sendNodeWorkerMessage = void 0;
const logging_1 = require("@gitmesh/logging");
const sqs_1 = require("@gitmesh/sqs");
const types_1 = require("@gitmesh/types");
const moment_1 = __importDefault(require("moment"));
const conf_1 = require("../../conf");
const workerTypes_1 = require("../types/workerTypes");
const serviceSQS_1 = require("./serviceSQS");
const log = (0, logging_1.getServiceChildLogger)('nodeWorkerSQS');
// 15 minute limit for delaying is max for SQS
const limitSeconds = 15 * 60;
const sendNodeWorkerMessage = async (tenantId, body, delaySeconds, targetQueueUrl) => {
    if (conf_1.IS_TEST_ENV) {
        return;
    }
    // we can only delay for 15 minutes then we have to re-delay message
    let attributes;
    let delay;
    let delayed = false;
    if (delaySeconds) {
        if (delaySeconds > limitSeconds) {
            // delay for 15 minutes and add the remaineder to the attributes
            const remainedSeconds = delaySeconds - limitSeconds;
            attributes = {
                tenantId: {
                    DataType: 'String',
                    StringValue: tenantId,
                },
                remainingDelaySeconds: {
                    DataType: 'Number',
                    StringValue: `${remainedSeconds}`,
                },
            };
            if (targetQueueUrl) {
                attributes.targetQueueUrl = { DataType: 'String', StringValue: targetQueueUrl };
            }
            delay = limitSeconds;
        }
        else {
            attributes = {
                tenantId: {
                    DataType: 'String',
                    StringValue: tenantId,
                },
            };
            if (targetQueueUrl) {
                attributes.targetQueueUrl = { DataType: 'String', StringValue: targetQueueUrl };
            }
            delay = delaySeconds;
        }
        delayed = true;
    }
    const now = (0, moment_1.default)().valueOf();
    const params = {
        QueueUrl: delayed ? conf_1.SQS_CONFIG.nodejsWorkerDelayableQueue : conf_1.SQS_CONFIG.nodejsWorkerQueue,
        MessageGroupId: delayed ? undefined : `${now}`,
        MessageDeduplicationId: delayed ? undefined : `${tenantId}-${now}`,
        MessageBody: JSON.stringify(body),
        MessageAttributes: attributes,
        DelaySeconds: delay,
    };
    log.debug({
        messageType: body.type,
        body,
    }, 'Sending nodejs-worker sqs message!');
    await (0, sqs_1.sendMessage)((0, serviceSQS_1.SQS_CLIENT)(), params);
};
exports.sendNodeWorkerMessage = sendNodeWorkerMessage;
const sendNewActivityNodeSQSMessage = async (tenant, activityId, segmentId) => {
    const payload = {
        type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
        tenant,
        activityId,
        segmentId,
        trigger: types_1.AutomationTrigger.NEW_ACTIVITY,
        service: 'automation',
    };
    await (0, exports.sendNodeWorkerMessage)(tenant, payload);
};
exports.sendNewActivityNodeSQSMessage = sendNewActivityNodeSQSMessage;
const sendNewMemberNodeSQSMessage = async (tenant, memberId, segmentId) => {
    const payload = {
        type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
        tenant,
        memberId,
        segmentId,
        trigger: types_1.AutomationTrigger.NEW_MEMBER,
        service: 'automation',
    };
    await (0, exports.sendNodeWorkerMessage)(tenant, payload);
};
exports.sendNewMemberNodeSQSMessage = sendNewMemberNodeSQSMessage;
const sendExportCSVNodeSQSMessage = async (tenant, user, entity, segmentIds, criteria) => {
    const payload = {
        type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
        service: 'csv-export',
        user,
        tenant,
        entity,
        criteria,
        segmentIds,
    };
    await (0, exports.sendNodeWorkerMessage)(tenant, payload);
};
exports.sendExportCSVNodeSQSMessage = sendExportCSVNodeSQSMessage;
const sendBulkEnrichMessage = async (tenant, memberIds, segmentIds, notifyFrontend = true, skipCredits = false) => {
    const payload = {
        type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
        service: 'bulk-enrich',
        memberIds,
        tenant,
        segmentIds,
        notifyFrontend,
        skipCredits,
    };
    await (0, exports.sendNodeWorkerMessage)(tenant, payload);
};
exports.sendBulkEnrichMessage = sendBulkEnrichMessage;
const sendOrgMergeMessage = async (tenantId, primaryOrgId, secondaryOrgId, notifyFrontend = true) => {
    const payload = {
        type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
        service: 'org-merge',
        tenantId,
        primaryOrgId,
        secondaryOrgId,
        notifyFrontend,
    };
    await (0, exports.sendNodeWorkerMessage)(tenantId, payload);
};
exports.sendOrgMergeMessage = sendOrgMergeMessage;
//# sourceMappingURL=nodeWorkerSQS.js.map