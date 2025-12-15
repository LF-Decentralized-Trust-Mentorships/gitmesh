"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSearchService = void 0;
const types_1 = require("../types");
const common_1 = require("@gitmesh/common");
const logging_1 = require("@gitmesh/logging");
const opensearch_1 = require("@opensearch-project/opensearch");
const aws_1 = require("@opensearch-project/opensearch/aws");
class OpenSearchService extends logging_1.LoggerBase {
    constructor(parentLog, config) {
        super(parentLog);
        this.indexVersionMap = new Map();
        this.config = config;
        const indexNames = Object.values(types_1.OpenSearchIndex);
        indexNames.forEach((name) => {
            const version = types_1.IndexVersions.get(name);
            this.indexVersionMap.set(name, `${name}_v${version}`);
        });
        if (this.config.region) {
            this.client = new opensearch_1.Client(Object.assign({ node: this.config.node }, (0, aws_1.AwsSigv4Signer)({
                region: this.config.region,
                service: 'es',
                getCredentials: async () => {
                    return {
                        accessKeyId: this.config.accessKeyId,
                        secretAccessKey: this.config.secretAccessKey,
                    };
                },
            })));
        }
        else {
            this.client = new opensearch_1.Client({
                node: this.config.node,
            });
        }
    }
    async doesIndexExist(indexName) {
        try {
            const exists = await this.client.indices.exists({ index: indexName });
            return exists.body;
        }
        catch (err) {
            this.log.error(err, { indexName }, 'Failed to check if index exists!');
            throw err;
        }
    }
    async doesAliasExist(aliasName) {
        try {
            const exists = await this.client.indices.existsAlias({
                name: aliasName,
            });
            return exists.body;
        }
        catch (err) {
            this.log.error(err, { aliasName }, 'Failed to check if alias exists!');
            throw err;
        }
    }
    async doesAliasPointToIndex(indexName, aliasName) {
        try {
            const exists = await this.client.indices.existsAlias({
                name: aliasName,
                index: indexName,
            });
            return exists.body;
        }
        catch (err) {
            this.log.error(err, { aliasName, indexName }, 'Failed to check if alias points to the index!');
            throw err;
        }
    }
    async createIndexWithVersion(indexName) {
        try {
            const settings = types_1.OPENSEARCH_INDEX_SETTINGS[indexName];
            const mappings = types_1.OPENSEARCH_INDEX_MAPPINGS[indexName];
            const versionedIndexName = this.indexVersionMap.get(indexName);
            await this.client.indices.create({
                index: versionedIndexName,
                body: {
                    settings,
                    mappings,
                },
            });
        }
        catch (err) {
            this.log.error(err, { indexName }, 'Failed to create versioned index!');
            throw err;
        }
    }
    async createAlias(indexName, aliasName) {
        try {
            await this.client.indices.putAlias({
                index: indexName,
                name: aliasName,
            });
        }
        catch (err) {
            this.log.error(err, { aliasName, indexName }, 'Failed to create alias!');
            throw err;
        }
    }
    async pointAliasToCorrectIndex(indexName, aliasName) {
        try {
            // Updates alias by removing existing references and points it to the new index
            await this.client.indices.updateAliases({
                body: {
                    actions: [
                        { remove: { index: '*', alias: aliasName } },
                        { add: { index: indexName, alias: aliasName } },
                    ],
                },
            });
            this.log.info('Alias successfully updated', { aliasName, indexName });
        }
        catch (err) {
            this.log.error(err, { aliasName, indexName }, 'Failed to update alias!');
        }
    }
    async reIndex(sourceIndex, targetIndex) {
        var _a, _b, _c, _d;
        try {
            const response = await this.client.reindex({
                wait_for_completion: false,
                refresh: true,
                body: {
                    source: {
                        index: sourceIndex,
                    },
                    dest: {
                        index: targetIndex,
                    },
                },
            });
            return (_a = response === null || response === void 0 ? void 0 : response.body) === null || _a === void 0 ? void 0 : _a.task;
        }
        catch (err) {
            (_d = (_c = (_b = err.meta) === null || _b === void 0 ? void 0 : _b.body) === null || _c === void 0 ? void 0 : _c.failures) === null || _d === void 0 ? void 0 : _d.forEach((failure) => this.log.error(failure, 'Reindex failure details!'));
            this.log.error(err, { sourceIndex, targetIndex }, 'Failed to reindex!');
            throw err;
        }
    }
    // Count of documents in the index
    async getDocumentCount(indexName) {
        try {
            const { body } = await this.client.count({
                index: indexName,
            });
            return body.count;
        }
        catch (err) {
            this.log.error(err, { indexName }, 'Failed to get document count!');
            throw err;
        }
    }
    async deleteIndex(indexName) {
        try {
            await this.client.indices.delete({
                index: indexName,
            });
        }
        catch (err) {
            this.log.error(err, { indexName }, 'Failed to delete index!');
            throw err;
        }
    }
    async getIndexSettings(indexName) {
        try {
            const indexNameWithVersion = this.indexVersionMap.get(indexName);
            const settings = await this.client.indices.getSettings({
                index: indexNameWithVersion,
            });
            return settings.body;
        }
        catch (err) {
            this.log.error(err, { indexName }, 'Failed to get index settings!');
            throw err;
        }
    }
    async getIndexMappings(indexName) {
        try {
            const indexNameWithVersion = this.indexVersionMap.get(indexName);
            const mappings = await this.client.indices.getMapping({
                index: indexNameWithVersion,
            });
            return mappings.body;
        }
        catch (err) {
            this.log.error(err, { indexName }, 'Failed to get index mappings!');
            throw err;
        }
    }
    async setIndexMappings(indexName) {
        try {
            const mappings = types_1.OPENSEARCH_INDEX_MAPPINGS[indexName];
            const indexNameWithVersion = this.indexVersionMap.get(indexName);
            await this.client.indices.putMapping({
                index: indexNameWithVersion,
                body: mappings,
            });
        }
        catch (err) {
            this.log.error(err, { indexName }, 'Failed to set index mappings!');
            throw err;
        }
    }
    async ensureIndexAndAliasExists(indexName) {
        const indexNameWithVersion = this.indexVersionMap.get(indexName);
        const aliasName = indexName; // index name is the alias name (without version)
        const indexExists = await this.doesIndexExist(indexNameWithVersion);
        const aliasExists = await this.doesAliasExist(aliasName);
        const aliasPointsToIndex = await this.doesAliasPointToIndex(indexNameWithVersion, aliasName);
        // create index and alias if they don't exist (only in dev environment)
        if (common_1.IS_DEV_ENV) {
            if (!indexExists) {
                this.log.info('Creating versioned index with settings and mappings!', {
                    indexNameWithVersion,
                });
                await this.createIndexWithVersion(indexName);
            }
            if (!aliasExists) {
                this.log.info('Creating alias for index!', { indexNameWithVersion, aliasName });
                await this.createAlias(indexNameWithVersion, aliasName);
            }
        }
        else {
            if (!indexExists || !aliasExists || !aliasPointsToIndex) {
                throw new Error('Index and alias are either missing or not properly configured!');
            }
        }
        // check if index and alias exist and alias points to the index
        if (indexExists && aliasExists && aliasPointsToIndex) {
            this.log.info('Index and alias already exist!', {
                indexNameWithVersion,
                aliasName,
            });
        }
    }
    async initialize() {
        await this.client.cluster.putSettings({
            body: {
                persistent: {
                    'action.auto_create_index': 'false',
                },
            },
        });
        await this.ensureIndexAndAliasExists(types_1.OpenSearchIndex.MEMBERS);
        await this.ensureIndexAndAliasExists(types_1.OpenSearchIndex.ACTIVITIES);
        await this.ensureIndexAndAliasExists(types_1.OpenSearchIndex.ORGANIZATIONS);
    }
    async removeFromIndex(id, index) {
        try {
            const indexName = this.indexVersionMap.get(index);
            await this.client.delete({
                id,
                index: indexName,
                refresh: true,
            });
        }
        catch (err) {
            if (err.meta.statusCode === 404) {
                this.log.debug(err, { id, index }, 'Document not found in index!');
                return;
            }
            this.log.error(err, { id, index }, 'Failed to remove document from index!');
            throw new Error(`Failed to remove document with id: ${id} from index ${index}!`);
        }
    }
    async index(id, index, body) {
        const indexName = this.indexVersionMap.get(index);
        try {
            await this.client.index({
                id,
                index: indexName,
                body,
                refresh: true,
            });
        }
        catch (err) {
            this.log.error(err, { id, index }, 'Failed to index document!');
            throw new Error(`Failed to index document with id: ${id} in index ${index}!`);
        }
    }
    async bulkIndex(index, batch) {
        try {
            const body = [];
            const indexName = this.indexVersionMap.get(index);
            for (const doc of batch) {
                body.push({
                    index: { _index: indexName, _id: doc.id },
                });
                body.push(Object.assign({}, doc.body));
            }
            const result = await this.client.bulk({
                body,
                refresh: true,
            });
            if (result.body.errors === true) {
                const errorItems = result.body.items
                    .filter((i) => i.index !== undefined && i.index.error !== undefined)
                    .map((i) => {
                    return {
                        error: i.index.error,
                        itemId: i.index._id,
                    };
                });
                this.log.error({ errorItems }, 'Failed to bulk index documents!');
                throw new Error(`Failed to bulk index documents in index ${index}!`);
            }
        }
        catch (err) {
            this.log.error(err, { index }, 'Failed to bulk index documents!');
            throw new Error(`Failed to bulk index documents in index ${index}!`);
        }
    }
    async search(index, query, aggs, size, sort, searchAfter, sourceIncludeFields, sourceExcludeFields) {
        try {
            const indexName = this.indexVersionMap.get(index);
            const payload = {
                index: indexName,
                _source_excludes: sourceExcludeFields,
                _source_includes: sourceIncludeFields,
                body: {
                    size: aggs ? 0 : undefined,
                    query,
                    aggs,
                    search_after: searchAfter ? [searchAfter] : undefined,
                    sort,
                },
                size,
            };
            const data = await this.client.search(payload);
            if (query) {
                return data.body.hits.hits;
            }
            else {
                return data.body.aggregations;
            }
        }
        catch (err) {
            this.log.error(err, { index, query }, 'Failed to search documents!');
            throw new Error('Failed to search documents!');
        }
    }
}
exports.OpenSearchService = OpenSearchService;
//# sourceMappingURL=opensearch.service.js.map