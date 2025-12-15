"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbStore = void 0;
const logging_1 = require("@gitmesh/logging");
const connection_1 = require("./connection");
const locking_1 = require("./locking");
class DbStore extends logging_1.LoggerBase {
    constructor(parentLog, dbConnection, dbTransaction, withTransactions = true) {
        super(parentLog, { transactional: dbTransaction !== undefined });
        this.dbConnection = dbConnection;
        this.dbTransaction = dbTransaction;
        this.withTransactions = withTransactions;
        this.dbInstance = (0, connection_1.getDbInstance)();
    }
    checkValid() {
        if (this.dbConnection === undefined && this.dbTransaction === undefined) {
            throw (0, logging_1.logError)(this.log, new Error('Store is not valid! No valid connection found!'));
        }
    }
    isTransaction() {
        return this.dbTransaction !== undefined;
    }
    connection() {
        this.checkValid();
        return this.isTransaction()
            ? this.dbTransaction
            : this.dbConnection;
    }
    transaction() {
        this.checkValid();
        if (this.isTransaction()) {
            return this.dbTransaction;
        }
        throw (0, logging_1.logError)(this.log, new Error('Store is not in transaction!'));
    }
    transactionally(inTransaction) {
        this.checkValid();
        if (!this.withTransactions) {
            return inTransaction(this);
        }
        if (this.isTransaction()) {
            this.log.debug('Using an existing transaction!');
            return inTransaction(this);
        }
        if (this.dbConnection !== undefined) {
            this.log.debug('Creating a new transaction!');
            return this.dbConnection.tx((t) => {
                return inTransaction(new DbStore(this.log, undefined, t));
            });
        }
        throw (0, logging_1.logError)(this.log, new Error('Store does not have a valid database connection!'));
    }
    async lockTable(tableName, lockLevel, withChildTables = false) {
        if (this.isTransaction()) {
            await (0, locking_1.lockTable)(this.connection(), tableName, lockLevel, withChildTables);
        }
        else {
            throw (0, logging_1.logError)(this.log, new Error(`Could not lock table '${tableName.schema || 'public'}.${tableName.table}' because store is not in transaction!`));
        }
    }
    async lockTableRow(tableName, idColumns, ids, lockStrength) {
        if (this.isTransaction()) {
            await (0, locking_1.lockTableRow)(this.connection(), tableName, idColumns, ids, lockStrength);
        }
        else {
            throw (0, logging_1.logError)(this.log, new Error(`Could not lock table '${tableName.schema || 'public'}.${tableName.table}' row with ids [${ids.join(',')}] because store is not in transaction!`));
        }
    }
}
exports.DbStore = DbStore;
//# sourceMappingURL=dbStore.js.map