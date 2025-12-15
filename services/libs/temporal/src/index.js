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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionCodec = exports.getDataConverter = exports.getTemporalClient = void 0;
const logging_1 = require("@gitmesh/logging");
const client_1 = require("@temporalio/client");
const data_converter_1 = require("./encryption/data-converter");
Object.defineProperty(exports, "getDataConverter", { enumerable: true, get: function () { return data_converter_1.getDataConverter; } });
const encryption_codec_1 = require("./encryption/encryption-codec");
Object.defineProperty(exports, "EncryptionCodec", { enumerable: true, get: function () { return encryption_codec_1.EncryptionCodec; } });
const log = (0, logging_1.getServiceChildLogger)('temporal');
let client;
const getTemporalClient = async (cfg) => {
    if (client) {
        return client;
    }
    log.info({
        serverUrl: cfg.serverUrl,
        namespace: cfg.namespace,
        identity: cfg.identity,
        certificate: cfg.certificate ? 'yes' : 'no',
        privateKey: cfg.privateKey ? 'yes' : 'no',
    }, 'Creating temporal client!');
    const connection = await client_1.Connection.connect({
        address: cfg.serverUrl,
        tls: cfg.certificate && cfg.privateKey
            ? {
                clientCertPair: {
                    crt: Buffer.from(cfg.certificate, 'base64'),
                    key: Buffer.from(cfg.privateKey, 'base64'),
                },
            }
            : undefined,
    });
    client = new client_1.Client({
        connection,
        namespace: cfg.namespace,
        identity: cfg.identity,
        dataConverter: await (0, data_converter_1.getDataConverter)(),
    });
    return client;
};
exports.getTemporalClient = getTemporalClient;
__exportStar(require("@temporalio/client"), exports);
//# sourceMappingURL=index.js.map