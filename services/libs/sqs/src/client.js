"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeMessageVisibility = exports.sendMessagesBulk = exports.sendMessage = exports.deleteMessage = exports.receiveMessage = exports.getSqsClient = void 0;
const client_sqs_1 = require("@aws-sdk/client-sqs");
const common_1 = require("@gitmesh/common");
const logging_1 = require("@gitmesh/logging");
const util_retry_1 = require("@smithy/util-retry");
const log = (0, logging_1.getServiceChildLogger)('sqs.client');
let client;
const getSqsClient = (config) => {
    if (client)
        return client;
    log.info({ host: config.host, port: config.port, region: config.region }, 'Creating new SQS client...');
    client = new client_sqs_1.SQSClient({
        region: config.region,
        endpoint: config.host ? `http://${config.host}:${config.port}` : undefined,
        credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
        },
        retryStrategy: new util_retry_1.ConfiguredRetryStrategy(10, 1000),
    });
    return client;
};
exports.getSqsClient = getSqsClient;
const receiveMessage = async (client, params, visibilityTimeoutSeconds, maxMessages) => {
    params.MaxNumberOfMessages = maxMessages || 1;
    params.WaitTimeSeconds = 15;
    if (visibilityTimeoutSeconds) {
        params.VisibilityTimeout = visibilityTimeoutSeconds;
    }
    else {
        params.VisibilityTimeout =
            common_1.IS_DEV_ENV || common_1.IS_STAGING_ENV
                ? 2 * 60 // 2 minutes for dev environments
                : 10 * 60; // 10 minutes for production environment
    }
    try {
        const result = await client.send(new client_sqs_1.ReceiveMessageCommand(params));
        if (result.Messages && result.Messages.length > 0) {
            return result.Messages;
        }
        return [];
    }
    catch (err) {
        if (err.message === 'We encountered an internal error. Please try again.' ||
            err.message === 'Request is throttled.' ||
            err.message === 'Queue Throttled' ||
            (err.code === 'EAI_AGAIN' && err.syscall === 'getaddrinfo')) {
            return [];
        }
        throw err;
    }
};
exports.receiveMessage = receiveMessage;
const deleteMessage = async (client, params, retry = 0) => {
    try {
        await client.send(new client_sqs_1.DeleteMessageCommand(params));
    }
    catch (err) {
        if ((err.message === 'Request is throttled.' ||
            err.message === 'Queue Throttled' ||
            (err.code === 'EAI_AGAIN' && err.syscall === 'getaddrinfo')) &&
            retry < 10) {
            await (0, common_1.timeout)(1000);
            return await (0, exports.deleteMessage)(client, params, retry + 1);
        }
        throw err;
    }
};
exports.deleteMessage = deleteMessage;
const sendMessage = async (client, params, retry = 0) => {
    try {
        return client.send(new client_sqs_1.SendMessageCommand(params));
    }
    catch (err) {
        if ((err.message === 'Request is throttled.' ||
            err.message === 'Queue Throttled' ||
            (err.code === 'EAI_AGAIN' && err.syscall === 'getaddrinfo')) &&
            retry < 10) {
            await (0, common_1.timeout)(1000);
            return await (0, exports.sendMessage)(client, params, retry + 1);
        }
        throw err;
    }
};
exports.sendMessage = sendMessage;
const sendMessagesBulk = async (client, params, retry = 0) => {
    try {
        return client.send(new client_sqs_1.SendMessageBatchCommand(params));
    }
    catch (err) {
        if ((err.message === 'Request is throttled.' ||
            err.message === 'Queue Throttled' ||
            (err.code === 'EAI_AGAIN' && err.syscall === 'getaddrinfo')) &&
            retry < 10) {
            await (0, common_1.timeout)(1000);
            return await (0, exports.sendMessagesBulk)(client, params, retry + 1);
        }
        throw err;
    }
};
exports.sendMessagesBulk = sendMessagesBulk;
const changeMessageVisibility = async (client, params, retry = 0) => {
    try {
        return client.send(new client_sqs_1.ChangeMessageVisibilityCommand(params));
    }
    catch (err) {
        if ((err.message === 'Request is throttled.' ||
            err.message === 'Queue Throttled' ||
            (err.code === 'EAI_AGAIN' && err.syscall === 'getaddrinfo')) &&
            retry < 10) {
            await (0, common_1.timeout)(1000);
            return await (0, exports.changeMessageVisibility)(client, params, retry + 1);
        }
        throw err;
    }
};
exports.changeMessageVisibility = changeMessageVisibility;
//# sourceMappingURL=client.js.map