"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const common_1 = require("@gitmesh/common");
const cleanError_1 = require("../cleanError");
const isInvalid_1 = __importDefault(require("../isInvalid"));
const log = (0, logging_1.getServiceChildLogger)('getChannels');
/**
 * Try if a channel is readable
 * @param accessToken Discord bot token
 * @param channel Channel ID
 * @returns Limit if the channel is readable, false otherwise
 */
async function tryChannel(client, source, accessToken, channel) {
    try {
        const input = {
            destination: channel.id,
            limit: 1,
        };
        const profile = await client.getProfile('chat/messages');
        const provider = await client.getProvider(source);
        const result = await profile.getUseCase('GetMessages').perform(input, {
            provider,
            parameters: { accessToken },
        });
        if (result.value) {
            if ('rateLimit' in result.value) {
                return result.value.rateLimit.remainingRequests;
            }
            return 10;
        }
        return false;
    }
    catch (err) {
        return false;
    }
}
async function getChannels(client, source, input, accessToken, tryChannels = true) {
    try {
        const profile = await client.getProfile('chat/channels');
        const provider = await client.getProvider(source);
        const parameters = { accessToken };
        const result = await profile
            .getUseCase('GetChannels')
            .perform(input, { provider, parameters });
        if ((0, isInvalid_1.default)(result, 'channels')) {
            log.warn({ input, result }, 'Invalid request in getChannels');
        }
        if (tryChannels) {
            const out = [];
            for (const channel of result.value.channels) {
                const limit = await tryChannel(client, source, accessToken, channel);
                if (limit) {
                    const toOut = {
                        name: channel.name,
                        id: channel.id,
                    };
                    out.push(toOut);
                    if (limit <= 1 && limit !== false) {
                        await (0, common_1.timeout)(5 * 1000);
                    }
                }
            }
            return out;
        }
        return result.value.channels.map((c) => ({
            name: c.name,
            id: c.id,
        }));
    }
    catch (err) {
        throw (0, cleanError_1.cleanSuperfaceError)(err);
    }
}
exports.default = getChannels;
//# sourceMappingURL=getChannels.js.map