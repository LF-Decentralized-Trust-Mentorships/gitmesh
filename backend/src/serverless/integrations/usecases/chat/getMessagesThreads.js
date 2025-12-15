"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const cleanError_1 = require("../cleanError");
const isInvalid_1 = __importDefault(require("../isInvalid"));
const log = (0, logging_1.getServiceChildLogger)('getMessagesThreads');
async function getMessagesThreads(client, source, accessToken, stream, page, perPage = 100) {
    try {
        const threadInfo = stream.metadata;
        const input = {
            destination: threadInfo.channelId,
            threadId: threadInfo.threadId,
            limit: perPage,
            page: page || undefined,
        };
        const profile = await client.getProfile('chat/messages-threads');
        const provider = await client.getProvider(source);
        const result = await profile.getUseCase('GetMessagesThreads').perform(input, {
            provider,
            parameters: { accessToken },
        });
        if ((0, isInvalid_1.default)(result, 'messages')) {
            log.warn({ input, result }, 'Invalid request in usecase');
        }
        let limit;
        let timeUntilReset;
        if (result.value.rateLimit) {
            limit = result.value.rateLimit.limit;
            timeUntilReset = result.value.rateLimit.resetAfter;
        }
        else {
            limit = 100;
            timeUntilReset = 1;
        }
        return {
            records: result.value.messages,
            nextPage: result.value.messages.length < input.limit ? '' : result.value.nextPage,
            limit,
            timeUntilReset,
        };
    }
    catch (err) {
        throw (0, cleanError_1.cleanSuperfaceError)(err);
    }
}
exports.default = getMessagesThreads;
//# sourceMappingURL=getMessagesThreads.js.map