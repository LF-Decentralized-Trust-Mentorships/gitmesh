"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryBase = void 0;
const logging_1 = require("@gitmesh/logging");
const common_1 = require("@gitmesh/common");
class RepositoryBase extends logging_1.LoggerBase {
    constructor(store, parentLog) {
        super(parentLog);
        this.store = store;
        this.database = store.connection();
        this.dbInstance = store.dbInstance;
        this.inTransaction = store.isTransaction();
    }
    db() {
        return this.database;
    }
    isTransactional() {
        return this.inTransaction;
    }
    ensureTransactional() {
        if (!this.isTransactional()) {
            throw new Error('Process should be run in transaction!');
        }
    }
    transactional(transaction) {
        if (this.isTransactional()) {
            throw new Error('Repository is already in transaction!');
        }
        const cloned = this.clone();
        cloned.database = transaction;
        cloned.inTransaction = true;
        return cloned;
    }
    async transactionally(process, transaction) {
        if (this.isTransactional() && transaction === undefined) {
            return process(this);
        }
        const cloned = this.clone();
        cloned.inTransaction = true;
        if (transaction !== undefined) {
            cloned.database = transaction;
            return process(cloned);
        }
        return this.store.transactionally(async (store) => {
            cloned.database = store.connection();
            return process(cloned);
        });
    }
    clone() {
        // clone prototype to get functions
        const cloned = Object.create(this);
        // clone properties to get a shallow copy
        return Object.assign(cloned, this);
    }
    batchInsert(entities, columnSet, prepare = true) {
        const prepared = prepare ? RepositoryBase.prepareBatch(entities, columnSet) : entities;
        return this.batchOperation(prepared, (batch) => this.dbInstance.helpers.insert(batch, columnSet));
    }
    async batchUpdate(entities, columnSet, prepare = true) {
        const prepared = prepare ? RepositoryBase.prepareBatch(entities, columnSet) : entities;
        return this.batchOperation(prepared, (batch) => this.dbInstance.helpers.update(batch, columnSet));
    }
    async batchOperation(preparedEntities, queryGenerator) {
        if (preparedEntities.length > 999) {
            const batches = (0, common_1.partition)(preparedEntities, 999);
            for (const batch of batches) {
                const query = queryGenerator(batch);
                const result = await this.db().result(query);
                if (result.rowCount !== batch.length) {
                    this.log.error({
                        entities: preparedEntities,
                        expectedRowCount: batch.length,
                        actualRowCount: result.rowCount,
                    }, 'Updated row count does not match the expected row count! Partitioned query!');
                    throw new Error('Updated row count does not match the expected row count! Partitioned query!');
                }
            }
        }
        else {
            const query = queryGenerator(preparedEntities);
            const result = await this.db().result(query);
            if (result.rowCount !== preparedEntities.length) {
                this.log.error({
                    entities: preparedEntities,
                    expectedRowCount: preparedEntities.length,
                    actualRowCount: result.rowCount,
                }, 'Updated row count does not match the expected row count!');
                throw new Error('Updated row count does not match the expected row count!');
            }
        }
    }
    static prepareBatch(entities, columnSet) {
        return entities.map((e) => this.prepare(e, columnSet));
    }
    static prepare(entity, columnSet) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const obj = {};
        for (const column of columnSet.columns) {
            const value = entity[column.name];
            if (value !== undefined) {
                obj[column.name] = value;
            }
            else {
                obj[column.name] = undefined;
            }
        }
        return obj;
    }
    checkUpdateRowCount(rowCount, expected) {
        if (rowCount !== expected) {
            throw (0, logging_1.logError)(this.log, new Error(`Updated number of rows (${rowCount}) not equal to expected number (${expected})!`));
        }
    }
    format(condition, params) {
        return this.dbInstance.as.format(condition, params);
    }
}
exports.RepositoryBase = RepositoryBase;
//# sourceMappingURL=repoBase.js.map