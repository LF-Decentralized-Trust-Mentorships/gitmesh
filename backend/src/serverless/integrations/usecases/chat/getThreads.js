"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const cleanError_1 = require("../cleanError");
const isInvalid_1 = __importDefault(require("../isInvalid"));
const log = (0, logging_1.getServiceChildLogger)('getThreads');
async function getChannels(client, serverId, accessToken) {
    try {
        const input = { server: serverId.toString() };
        const profile = await client.getProfile('chat/threads');
        const provider = await client.getProvider(types_1.PlatformType.DISCORD);
        const result = await profile.getUseCase('GetThreads').perform(input, {
            provider,
            parameters: { accessToken },
        });
        if ((0, isInvalid_1.default)(result, 'threads')) {
            log.warn({ input, result }, 'Invalid request in getChannels');
        }
        return result.value.threads.map((thread) => ({
            name: thread.name,
            id: thread.id,
            thread: true,
        }));
    }
    catch (err) {
        throw (0, cleanError_1.cleanSuperfaceError)(err);
    }
}
exports.default = getChannels;
//# sourceMappingURL=getThreads.js.map