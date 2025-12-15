"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpensearchClient = void 0;
const opensearch_1 = require("@opensearch-project/opensearch");
const aws_1 = require("@opensearch-project/opensearch/aws");
const getOpensearchClient = (config) => {
    if (config.node) {
        if (config.region && config.accessKeyId && config.secretAccessKey) {
            return new opensearch_1.Client(Object.assign({ node: config.node }, (0, aws_1.AwsSigv4Signer)({
                region: config.region,
                service: 'es',
                getCredentials: async () => ({
                    accessKeyId: config.accessKeyId,
                    secretAccessKey: config.secretAccessKey,
                }),
            })));
        }
        return new opensearch_1.Client({
            node: config.node,
        });
    }
    throw new Error('Missing node url while initializing opensearch!');
};
exports.getOpensearchClient = getOpensearchClient;
//# sourceMappingURL=client.js.map