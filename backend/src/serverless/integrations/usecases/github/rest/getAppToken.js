"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppToken = void 0;
const logging_1 = require("@gitmesh/logging");
const axios_1 = __importDefault(require("axios"));
const log = (0, logging_1.getServiceChildLogger)('getAppToken');
const getAppToken = async (jwt, installationId) => {
    try {
        const config = {
            method: 'post',
            url: `https://api.github.com/app/installations/${installationId}/access_tokens`,
            headers: {
                Authorization: `Bearer ${jwt}`,
                Accept: 'application/vnd.github+json',
            },
        };
        const response = await (0, axios_1.default)(config);
        const data = response.data;
        return {
            token: data.token,
            expiresAt: data.expires_at,
        };
    }
    catch (err) {
        log.error(err, { installationId }, 'Error fetching app token!');
        throw err;
    }
};
exports.getAppToken = getAppToken;
//# sourceMappingURL=getAppToken.js.map