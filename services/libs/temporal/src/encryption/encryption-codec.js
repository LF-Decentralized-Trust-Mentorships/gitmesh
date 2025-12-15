"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionCodec = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@temporalio/common");
const proto_1 = require("@temporalio/proto");
const encoding_1 = require("@temporalio/common/lib/encoding");
const crypto_1 = require("./crypto");
const ENCODING = 'binary/encrypted';
const METADATA_ENCRYPTION_KEY_ID = 'encryption-key-id';
class EncryptionCodec {
    constructor(keys, defaultKeyId) {
        this.keys = keys;
        this.defaultKeyId = defaultKeyId;
    }
    static async create(keyId) {
        const keys = new Map();
        keys.set(keyId, await fetchKey(keyId));
        return new this(keys, keyId);
    }
    async encode(payloads) {
        return Promise.all(payloads.map(async (payload) => ({
            metadata: {
                [common_1.METADATA_ENCODING_KEY]: (0, encoding_1.encode)(ENCODING),
                [METADATA_ENCRYPTION_KEY_ID]: (0, encoding_1.encode)(this.defaultKeyId),
            },
            // Encrypt entire payload, preserving metadata
            data: await (0, crypto_1.encrypt)(proto_1.temporal.api.common.v1.Payload.encode(payload).finish(), this.keys.get(this.defaultKeyId)),
        })));
    }
    async decode(payloads) {
        return Promise.all(payloads.map(async (payload) => {
            if (!payload.metadata || (0, encoding_1.decode)(payload.metadata[common_1.METADATA_ENCODING_KEY]) !== ENCODING) {
                return payload;
            }
            if (!payload.data) {
                throw new common_1.ValueError('Payload data is missing');
            }
            const keyIdBytes = payload.metadata[METADATA_ENCRYPTION_KEY_ID];
            if (!keyIdBytes) {
                throw new common_1.ValueError('Unable to decrypt Payload without encryption key id');
            }
            const keyId = (0, encoding_1.decode)(keyIdBytes);
            let key = this.keys.get(keyId);
            if (!key) {
                key = await fetchKey(keyId);
                this.keys.set(keyId, key);
            }
            const decryptedPayloadBytes = await (0, crypto_1.decrypt)(payload.data, key);
            return proto_1.temporal.api.common.v1.Payload.decode(decryptedPayloadBytes);
        }));
    }
}
exports.EncryptionCodec = EncryptionCodec;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchKey(_keyId) {
    const key = Buffer.from(process.env['TEMPORAL_ENCRYPTION_KEY']);
    const cryptoKey = await node_crypto_1.webcrypto.subtle.importKey('raw', key, {
        name: 'AES-GCM',
    }, true, ['encrypt', 'decrypt']);
    return cryptoKey;
}
//# sourceMappingURL=encryption-codec.js.map