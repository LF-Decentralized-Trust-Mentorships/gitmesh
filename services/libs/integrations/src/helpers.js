"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSourceIdHash = generateSourceIdHash;
exports.verifyWebhookSignature = verifyWebhookSignature;
const crypto_1 = __importDefault(require("crypto"));
const buffer = __importStar(require("buffer"));
/**
 * Some activities will not have a remote(API) counterparts so they will miss sourceIds.
 * Since we're using sourceIds to find out if an activity already exists in our DB,
 * sourceIds are required when creating an activity.
 * This function generates an md5 hash that can be used as a sourceId of an activity.
 * Prepends string `gen-` to the beginning so generated and remote sourceIds
 * can be distinguished.
 *
 * @param {string} uniqueRemoteId remote member id from an integration. This id needs to be unique in a platform
 * @param {string} type type of the activity
 * @param {string} timestamp unix timestamp of the activity
 * @param {string} platform platform of the activity
 * @returns 32 bit md5 hash generated from the given data, prepended with string `gen-`
 */
function generateSourceIdHash(uniqueRemoteId, type, timestamp, platform) {
    if (!uniqueRemoteId || !type || !timestamp || !platform) {
        throw new Error('Bad hash input');
    }
    const data = `${uniqueRemoteId}-${type}-${timestamp}-${platform}`;
    return `gen-${crypto_1.default.createHash('md5').update(data).digest('hex')}`;
}
function verifyWebhookSignature(payload, secret, signatureHeader) {
    const hmac = crypto_1.default.createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = `sha256=${hmac.digest('hex')}`;
    return crypto_1.default.timingSafeEqual(buffer.Buffer.from(signatureHeader), buffer.Buffer.from(expectedSignature));
}
//# sourceMappingURL=helpers.js.map