"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataConverter = getDataConverter;
const encryption_codec_1 = require("./encryption-codec");
let dataConverterPromise;
async function getDataConverter() {
    if (!dataConverterPromise) {
        dataConverterPromise = createDataConverter();
    }
    return await dataConverterPromise;
}
async function createDataConverter() {
    const keyId = process.env['TEMPORAL_ENCRYPTION_KEY_ID'];
    return {
        payloadCodecs: [await encryption_codec_1.EncryptionCodec.create(keyId)],
    };
}
//# sourceMappingURL=data-converter.js.map