"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const cleanError_1 = require("../cleanError");
const isInvalid_1 = __importDefault(require("../isInvalid"));
const log = (0, logging_1.getServiceChildLogger)('getMembers');
async function getMembers(client, source, accessToken, server, page, perPage = 100) {
    try {
        const input = {
            limit: perPage,
            page: page || undefined,
        };
        if (server) {
            input.server = server;
        }
        const profile = await client.getProfile('chat/members');
        const provider = await client.getProvider(source);
        const result = await profile.getUseCase('GetMembers').perform(input, {
            provider,
            parameters: { accessToken },
        });
        if ((0, isInvalid_1.default)(result, 'members')) {
            log.warn({ input, result }, 'Invalid request in hashtag');
        }
        let limit;
        let timeUntilReset;
        if (result.value.rateLimit) {
            limit = result.value.rateLimit.remainingRequests;
            timeUntilReset = result.value.rateLimit.resetAfter;
        }
        else {
            limit = 100;
            timeUntilReset = 1;
        }
        return {
            records: result.value.members,
            nextPage: result.value.members.length < input.limit ? undefined : result.value.nextPage,
            limit,
            timeUntilReset,
        };
    }
    catch (err) {
        throw (0, cleanError_1.cleanSuperfaceError)(err);
    }
}
exports.default = getMembers;
//# sourceMappingURL=getMembers.js.map