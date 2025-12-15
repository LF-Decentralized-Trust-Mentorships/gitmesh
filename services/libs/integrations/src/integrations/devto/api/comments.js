"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArticleComments = void 0;
const axios_1 = __importDefault(require("axios"));
const common_1 = require("@gitmesh/common");
const getArticleComments = async (articleId, apiKey) => {
    try {
        const result = await axios_1.default.get('https://dev.to/api/comments', {
            params: {
                a_id: articleId,
            },
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
                    return (0, exports.getArticleComments)(articleId, apiKey);
                }
            }
        }
        throw err;
    }
};
exports.getArticleComments = getArticleComments;
//# sourceMappingURL=comments.js.map