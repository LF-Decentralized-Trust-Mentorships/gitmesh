"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const logging_1 = require("@gitmesh/logging");
const sqs_1 = require("@gitmesh/sqs");
const tracing_1 = require("@gitmesh/tracing");
const moment_1 = __importDefault(require("moment"));
const conf_1 = require("../conf");
const workDispatcher_1 = require("../serverless/dbOperations/workDispatcher");
const workDispatcher_2 = require("../serverless/microservices/nodejs/workDispatcher");
const workerTypes_1 = require("../serverless/types/workerTypes");
const nodeWorkerSQS_1 = require("../serverless/utils/nodeWorkerSQS");
const integrations_1 = require("./worker/integrations");
const serviceSQS_1 = require("@/serverless/utils/serviceSQS");
/* eslint-disable no-constant-condition */
const tracer = (0, tracing_1.getServiceTracer)();
const serviceLogger = (0, logging_1.getServiceLogger)();
let exiting = false;
const messagesInProgress = new Map();
process.on('SIGTERM', async () => {
    serviceLogger.warn('Detected SIGTERM signal, started exiting!');
    exiting = true;
});
const receive = async (delayed) => {
    const params = {
        QueueUrl: delayed ? conf_1.SQS_CONFIG.nodejsWorkerDelayableQueue : conf_1.SQS_CONFIG.nodejsWorkerQueue,
        MessageAttributeNames: !delayed
            ? undefined
            : ['remainingDelaySeconds', 'tenantId', 'targetQueueUrl'],
    };
    const messages = await (0, sqs_1.receiveMessage)((0, serviceSQS_1.SQS_CLIENT)(), params);
    if (messages && messages.length === 1) {
        return messages[0];
    }
    return undefined;
};
const removeFromQueue = (receiptHandle, delayed) => {
    const params = {
        QueueUrl: delayed ? conf_1.SQS_CONFIG.nodejsWorkerDelayableQueue : conf_1.SQS_CONFIG.nodejsWorkerQueue,
        ReceiptHandle: receiptHandle,
    };
    return (0, sqs_1.deleteMessage)((0, serviceSQS_1.SQS_CLIENT)(), params);
};
async function handleDelayedMessages() {
    const delayedHandlerLogger = (0, logging_1.getChildLogger)('delayedMessages', serviceLogger, {
        queue: conf_1.SQS_CONFIG.nodejsWorkerDelayableQueue,
    });
    delayedHandlerLogger.info('Listing for delayed messages!');
    // noinspection InfiniteLoopJS
    while (!exiting) {
        const message = await receive(true);
        if (message) {
            await tracer.startActiveSpan('ProcessDelayedMessage', async (span) => {
                try {
                    const msg = JSON.parse(message.Body);
                    const messageLogger = (0, logging_1.getChildLogger)('messageHandler', serviceLogger, {
                        messageId: message.MessageId,
                        type: msg.type,
                    });
                    if (message.MessageAttributes && message.MessageAttributes.remainingDelaySeconds) {
                        // re-delay
                        const newDelay = parseInt(message.MessageAttributes.remainingDelaySeconds.StringValue, 10);
                        const tenantId = message.MessageAttributes.tenantId.StringValue;
                        messageLogger.debug({ newDelay, tenantId }, 'Re-delaying message!');
                        await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(tenantId, msg, newDelay);
                    }
                    else {
                        // just emit to the normal queue for processing
                        const tenantId = message.MessageAttributes.tenantId.StringValue;
                        if (message.MessageAttributes.targetQueueUrl) {
                            const targetQueueUrl = message.MessageAttributes.targetQueueUrl.StringValue;
                            messageLogger.debug({ tenantId, targetQueueUrl }, 'Successfully delayed a message!');
                            await (0, sqs_1.sendMessage)((0, serviceSQS_1.SQS_CLIENT)(), {
                                QueueUrl: targetQueueUrl,
                                MessageGroupId: tenantId,
                                MessageDeduplicationId: `${tenantId}-${(0, moment_1.default)().valueOf()}`,
                                MessageBody: JSON.stringify(msg),
                            });
                        }
                        else {
                            messageLogger.debug({ tenantId }, 'Successfully delayed a message!');
                            await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(tenantId, msg);
                        }
                    }
                    await removeFromQueue(message.ReceiptHandle, true);
                    span.setStatus({
                        code: tracing_1.SpanStatusCode.OK,
                    });
                }
                catch (err) {
                    span.setStatus({
                        code: tracing_1.SpanStatusCode.ERROR,
                        message: err,
                    });
                }
                finally {
                    span.end();
                }
            });
        }
        else {
            delayedHandlerLogger.trace('No message received!');
        }
    }
    delayedHandlerLogger.warn('Exiting!');
}
let processingMessages = 0;
const isWorkerAvailable = () => processingMessages <= 3;
const addWorkerJob = () => {
    processingMessages++;
};
const removeWorkerJob = () => {
    processingMessages--;
};
async function handleMessages() {
    const handlerLogger = (0, logging_1.getChildLogger)('messages', serviceLogger, {
        queue: conf_1.SQS_CONFIG.nodejsWorkerQueue,
    });
    handlerLogger.info('Listening for messages!');
    const processSingleMessage = async (message) => {
        await tracer.startActiveSpan('ProcessMessage', async (span) => {
            const msg = JSON.parse(message.Body);
            const messageLogger = (0, logging_1.getChildLogger)('messageHandler', serviceLogger, {
                messageId: message.MessageId,
                type: msg.type,
            });
            try {
                if (msg.type === workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE &&
                    msg.service === 'enrich_member_organizations') {
                    messageLogger.warn('Skipping enrich_member_organizations message! Purging the queue because they are not needed anymore!');
                    await removeFromQueue(message.ReceiptHandle);
                    return;
                }
                messageLogger.info({ messageType: msg.type, messagePayload: JSON.stringify(msg) }, 'Received a new queue message!');
                let processFunction;
                switch (msg.type) {
                    case workerTypes_1.NodeWorkerMessageType.INTEGRATION_PROCESS:
                        processFunction = integrations_1.processIntegration;
                        break;
                    case workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE:
                        processFunction = workDispatcher_2.processNodeMicroserviceMessage;
                        break;
                    case workerTypes_1.NodeWorkerMessageType.DB_OPERATIONS:
                        processFunction = workDispatcher_1.processDbOperationsMessage;
                        break;
                    case workerTypes_1.NodeWorkerMessageType.PROCESS_WEBHOOK:
                        processFunction = integrations_1.processWebhook;
                        break;
                    default:
                        messageLogger.error('Error while parsing queue message! Invalid type.');
                }
                if (processFunction) {
                    await (0, logging_1.logExecutionTimeV2)(async () => {
                        // remove the message from the queue as it's about to be processed
                        await removeFromQueue(message.ReceiptHandle);
                        messagesInProgress.set(message.MessageId, msg);
                        try {
                            await processFunction(msg, messageLogger);
                        }
                        catch (err) {
                            messageLogger.error(err, 'Error while processing queue message!');
                        }
                        finally {
                            messagesInProgress.delete(message.MessageId);
                        }
                    }, messageLogger, 'Processing queue message!');
                }
                span.setStatus({
                    code: tracing_1.SpanStatusCode.OK,
                });
            }
            catch (err) {
                span.setStatus({
                    code: tracing_1.SpanStatusCode.ERROR,
                    message: err,
                });
                messageLogger.error(err, { payload: msg }, 'Error while processing queue message!');
            }
            finally {
                span.end();
            }
        });
    };
    // noinspection InfiniteLoopJS
    while (!exiting) {
        if (isWorkerAvailable()) {
            const message = await receive();
            if (message) {
                addWorkerJob();
                processSingleMessage(message).then(removeWorkerJob).catch(removeWorkerJob);
            }
            else {
                serviceLogger.trace('No message received!');
            }
        }
        else {
            await (0, common_1.timeout)(200);
        }
    }
    // mark in flight messages as exiting
    for (const msg of messagesInProgress.values()) {
        ;
        msg.exiting = true;
    }
    while (messagesInProgress.size !== 0) {
        handlerLogger.warn(`Waiting for ${messagesInProgress.size} messages to finish!`);
        await (0, common_1.timeout)(500);
    }
    handlerLogger.warn('Exiting!');
}
setImmediate(async () => {
    const promises = [handleMessages(), handleDelayedMessages()];
    await Promise.all(promises);
});
//# sourceMappingURL=nodejs-worker.js.map