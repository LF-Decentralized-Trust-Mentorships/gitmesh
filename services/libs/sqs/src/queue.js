"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqsQueueEmitter = exports.SqsQueueReceiver = exports.SqsQueueBase = void 0;
const client_sqs_1 = require("@aws-sdk/client-sqs");
const common_1 = require("@gitmesh/common");
const logging_1 = require("@gitmesh/logging");
const client_1 = require("./client");
const types_1 = require("./types");
class SqsQueueBase extends logging_1.LoggerBase {
    constructor(sqsClient, queueConf, tracer, parentLog) {
        super(parentLog, {
            queueName: queueConf.name,
            type: queueConf.type,
        });
        this.sqsClient = sqsClient;
        this.queueConf = queueConf;
        this.tracer = tracer;
        this.isFifo = queueConf.type === types_1.SqsQueueType.FIFO;
        let env = '';
        if (common_1.IS_STAGING_ENV) {
            env = '-staging';
        }
        else if (common_1.IS_PROD_ENV) {
            env = '-production';
        }
        if (this.isFifo) {
            this.queueName = `${queueConf.name}${env}.fifo`;
        }
        else {
            this.queueName = `${queueConf.name}${env}`;
        }
    }
    isInitialized() {
        return this.queueUrl !== undefined;
    }
    getQueueUrl() {
        if (this.queueUrl) {
            return this.queueUrl;
        }
        throw new Error('Queue URL not set - please call init() first!');
    }
    async init() {
        try {
            const cmd = new client_sqs_1.GetQueueUrlCommand({
                QueueName: this.queueName,
            });
            const result = await this.sqsClient.send(cmd);
            this.log.info('Queue exists!');
            this.queueUrl = result.QueueUrl;
        }
        catch (err) {
            if (err.name === 'QueueDoesNotExist') {
                this.log.info('Queue does not exist, creating...');
                const createCommand = new client_sqs_1.CreateQueueCommand({
                    QueueName: this.queueName,
                    Attributes: Object.assign({ ReceiveMessageWaitTimeSeconds: `${this.queueConf.waitTimeSeconds}`, VisibilityTimeout: `${this.queueConf.visibilityTimeout}`, MessageRetentionPeriod: `${this.queueConf.messageRetentionPeriod}`, DelaySeconds: `${this.queueConf.deliveryDelay}` }, (this.queueConf.type === types_1.SqsQueueType.FIFO && {
                        FifoQueue: 'true',
                        ContentBasedDeduplication: 'false',
                        FifoThroughputLimit: this.queueConf.fifoThroughputLimit || 'perMessageGroupId',
                        DeduplicationScope: this.queueConf.deduplicationScope || 'messageGroup',
                    })),
                });
                const result = await this.sqsClient.send(createCommand);
                this.queueUrl = result.QueueUrl;
                this.log.info('Queue created!');
            }
            else {
                this.log.error(err, 'Error checking if queue exists!');
                throw err;
            }
        }
    }
}
exports.SqsQueueBase = SqsQueueBase;
class SqsQueueReceiver extends SqsQueueBase {
    constructor(sqsClient, queueConf, maxConcurrentMessageProcessing, tracer, parentLog, deleteMessageImmediately = false, visibilityTimeoutSeconds, receiveMessageCount) {
        super(sqsClient, queueConf, tracer, parentLog);
        this.maxConcurrentMessageProcessing = maxConcurrentMessageProcessing;
        this.deleteMessageImmediately = deleteMessageImmediately;
        this.visibilityTimeoutSeconds = visibilityTimeoutSeconds;
        this.receiveMessageCount = receiveMessageCount;
        this.processingMessages = 0;
        this.started = false;
    }
    isAvailable() {
        return this.processingMessages < this.maxConcurrentMessageProcessing;
    }
    addJob() {
        this.processingMessages++;
    }
    removeJob() {
        this.processingMessages--;
    }
    async start() {
        await this.init();
        this.started = true;
        this.log.info({ url: this.getQueueUrl() }, 'Starting listening to queue...');
        while (this.started) {
            if (this.isAvailable()) {
                // first receive the message
                const messages = await this.receiveMessage();
                if (messages.length > 0) {
                    for (const message of messages) {
                        if (this.isAvailable()) {
                            this.log.trace({ messageId: message.MessageId }, 'Received message from queue!');
                            this.addJob();
                            this.processMessage(JSON.parse(message.Body), message.ReceiptHandle)
                                // when the message is processed, delete it from the queue
                                .then(async () => {
                                this.log.trace({ messageReceiptHandle: message.ReceiptHandle }, 'Deleting message');
                                if (!this.deleteMessageImmediately) {
                                    await this.deleteMessage(message.ReceiptHandle);
                                }
                                this.removeJob();
                            })
                                // if error is detected don't delete the message from the queue
                                .catch(() => this.removeJob());
                            if (this.deleteMessageImmediately) {
                                await this.deleteMessage(message.ReceiptHandle);
                            }
                        }
                        else {
                            this.log.trace('Queue is busy, waiting...');
                            await (0, common_1.timeout)(100);
                        }
                    }
                }
            }
            else {
                this.log.trace('Queue is busy, waiting...');
                await (0, common_1.timeout)(200);
            }
        }
    }
    stop() {
        this.started = false;
    }
    async receiveMessage() {
        try {
            const params = {
                QueueUrl: this.getQueueUrl(),
            };
            return (0, client_1.receiveMessage)(this.sqsClient, params, this.visibilityTimeoutSeconds, this.receiveMessageCount);
        }
        catch (err) {
            if (err.message === 'Request is throttled.') {
                return [];
            }
            throw err;
        }
    }
    async deleteMessage(receiptHandle) {
        const params = {
            QueueUrl: this.getQueueUrl(),
            ReceiptHandle: receiptHandle,
        };
        return (0, client_1.deleteMessage)(this.sqsClient, params);
    }
}
exports.SqsQueueReceiver = SqsQueueReceiver;
class SqsQueueEmitter extends SqsQueueBase {
    constructor(sqsClient, queueConf, tracer, parentLog) {
        super(sqsClient, queueConf, tracer, parentLog);
    }
    async sendMessage(groupId, message, deduplicationId) {
        let MessageDeduplicationId;
        if (this.isFifo) {
            MessageDeduplicationId = deduplicationId || `${groupId}-${new Date().getTime()}`;
        }
        const params = {
            QueueUrl: this.getQueueUrl(),
            MessageGroupId: groupId,
            MessageDeduplicationId,
            MessageBody: JSON.stringify(message),
        };
        await (0, client_1.sendMessage)(this.sqsClient, params);
    }
    async sendMessages(messages) {
        if (messages.length > 10) {
            throw new Error('Maximum number of messages to send is 10!');
        }
        const time = new Date().getTime();
        const entries = messages.map((msg) => {
            return {
                Id: msg.id || (0, common_1.generateUUIDv1)(),
                MessageBody: JSON.stringify(msg.payload),
                MessageDeduplicationId: this.isFifo
                    ? msg.deduplicationId || `${msg.groupId}-${time}`
                    : undefined,
                MessageGroupId: msg.groupId,
            };
        });
        await (0, client_1.sendMessagesBulk)(this.sqsClient, {
            QueueUrl: this.getQueueUrl(),
            Entries: entries,
        });
    }
    async setMessageVisibilityTimeout(receiptHandle, newVisibility) {
        const params = {
            QueueUrl: this.getQueueUrl(),
            ReceiptHandle: receiptHandle,
            VisibilityTimeout: newVisibility,
        };
        await (0, client_1.changeMessageVisibility)(this.sqsClient, params);
    }
}
exports.SqsQueueEmitter = SqsQueueEmitter;
//# sourceMappingURL=queue.js.map