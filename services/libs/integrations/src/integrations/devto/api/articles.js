"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserArticles = exports.getOrganizationArticles = exports.getArticle = void 0;
const common_1 = require("@gitmesh/common");
const axios_1 = __importDefault(require("axios"));
const getArticle = async (id, apiKey) => {
    try {
        const result = await axios_1.default.get(`https://dev.to/api/articles/${encodeURIComponent(id.toString())}`, {
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
                    return (0, exports.getArticle)(id, apiKey);
                }
            }
        }
        throw err;
    }
};
exports.getArticle = getArticle;
const getOrganizationArticles = async (organizationName, page, perPage, apiKey) => {
    try {
        const result = await axios_1.default.get(`https://dev.to/api/organizations/${encodeURIComponent(organizationName)}/articles`, {
            params: {
                page,
                per_page: perPage,
            },
            headers: {
                Accept: 'application/vnd.forem.api-v1+json',
                'api-key': apiKey || '',
            },
        });
        return result.data;
    }
    catch (err) {
        if (err.response.status === 404) {
            return [];
        }
        // rate limit?
        if (err.response.status === 429) {
            const retryAfter = err.response.headers['retry-after'];
            if (retryAfter) {
                const retryAfterSeconds = parseInt(retryAfter, 10);
                if (retryAfterSeconds <= 2) {
                    await (0, common_1.timeout)(1000 * retryAfterSeconds);
                    return (0, exports.getOrganizationArticles)(organizationName, page, perPage, apiKey);
                }
            }
        }
        throw err;
    }
};
exports.getOrganizationArticles = getOrganizationArticles;
const getUserArticles = async (username, page, perPage, apiKey) => {
    try {
        const result = await axios_1.default.get(`https://dev.to/api/articles`, {
            params: {
                username,
                page,
                per_page: perPage,
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
                    return (0, exports.getUserArticles)(username, page, perPage, apiKey);
                }
            }
        }
        throw err;
    }
};
exports.getUserArticles = getUserArticles;
//# sourceMappingURL=articles.js.map