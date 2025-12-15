"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const common_1 = require("@gitmesh/common");
const axios_1 = __importDefault(require("axios"));
const getUser = async (userId, apiKey) => {
    try {
        const result = await axios_1.default.get(`https://dev.to/api/users/${userId}`, {
            headers: {
                Accept: 'application/vnd.forem.api-v1+json',
                'api-key': apiKey || '',
            },
        });
        return result.data;
    }
    catch (err) {
        // rate limit?
        if (err.response.status === 429) {
            const retryAfter = err.response.headers['retry-after'];
            if (retryAfter) {
                const retryAfterSeconds = parseInt(retryAfter, 10);
                if (retryAfterSeconds <= 2) {
                    await (0, common_1.timeout)(1000 * retryAfterSeconds);
                    return (0, exports.getUser)(userId, apiKey);
                }
            }
        }
        else if (err.response.status === 404) {
            return null;
        }
        throw err;
    }
};
exports.getUser = getUser;
//# sourceMappingURL=user.js.map