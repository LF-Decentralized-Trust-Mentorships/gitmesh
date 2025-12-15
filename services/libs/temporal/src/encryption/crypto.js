"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const node_crypto_1 = require("node:crypto");
const CIPHER = 'AES-GCM';
const IV_LENGTH_BYTES = 12;
const TAG_LENGTH_BYTES = 16;
async function encrypt(data, key) {
    const iv = node_crypto_1.webcrypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
    const encrypted = await node_crypto_1.webcrypto.subtle.encrypt({
        name: CIPHER,
        iv,
        tagLength: TAG_LENGTH_BYTES * 8,
    }, key, data);
    return Buffer.concat([iv, new Uint8Array(encrypted)]);
}
exports.encrypt = encrypt;
async function decrypt(encryptedData, key) {
    const iv = encryptedData.subarray(0, IV_LENGTH_BYTES);
    const ciphertext = encryptedData.subarray(IV_LENGTH_BYTES);
    const decrypted = await node_crypto_1.webcrypto.subtle.decrypt({
        name: CIPHER,
        iv,
        tagLength: TAG_LENGTH_BYTES * 8,
    }, key, ciphertext);
    return new Uint8Array(decrypted);
}
exports.decrypt = decrypt;
//# sourceMappingURL=crypto.js.map