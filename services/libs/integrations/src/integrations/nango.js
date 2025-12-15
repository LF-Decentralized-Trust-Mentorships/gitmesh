"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNangoToken = void 0;
const axios_1 = __importDefault(require("axios"));
const getNangoToken = async (connectionId, providerConfigKey, ctx, throttler) => {
    try {
        const url = `${ctx.serviceSettings.nangoUrl}/connection/${connectionId}`;
        const secretKey = ctx.serviceSettings.nangoSecretKey;
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
        };
        ctx.log.debug({ secretKey, connectionId, providerConfigKey }, 'Fetching Nango token!');
        const params = {
            provider_config_key: providerConfigKey,
        };
        let response;
        if (throttler) {
            response = await throttler.throttle(() => axios_1.default.get(url, { params, headers }));
        }
        else {
            response = await axios_1.default.get(url, { params, headers });
        }
        return response.data.credentials.access_token;
    }
    catch (err) {
        ctx.log.error({ err }, 'Error while getting token from Nango');
        throw err;
    }
};
exports.getNangoToken = getNangoToken;
//# sourceMappingURL=nango.js.map