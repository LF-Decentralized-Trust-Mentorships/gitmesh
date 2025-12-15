"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lockTableRow = exports.lockTable = void 0;
const logging_1 = require("@gitmesh/logging");
const utility_1 = require("./utility");
const log = (0, logging_1.getServiceChildLogger)('database.locking');
const lockTable = async (tx, table, lockLevel, withChildTables = false) => {
    try {
        const query = `lock table ${withChildTables ? '' : 'only'} ${(0, utility_1.escapeTableName)(table)} in ${lockLevel} mode`;
        log.debug({ table, lockLevel, withChildTables, query }, 'Locking table!');
        await tx.none(query);
        log.debug({ table, lockLevel, withChildTables, query }, 'Table locked!');
    }
    catch (err) {
        log.error(err, { table, lockLevel, withChildTables }, 'Error while locking table!');
        throw err;
    }
};
exports.lockTable = lockTable;
const lockTableRow = async (tx, table, idColumns, ids, lockStrength) => {
    try {
        const condition = idColumns
            .map((idColumn, index) => `"${idColumn}" = $${index + 1}`)
            .join(' and ');
        const query = `select 1 from ${(0, utility_1.escapeTableName)(table)} where ${condition} for ${lockStrength}`;
        log.debug({ table, idColumns, ids, lockStrength, query }, 'Locking table row!');
        const result = await tx.result(query, ids);
        if (result.rowCount === 0) {
            throw new Error('No rows were locked!');
        }
        log.debug({ table, idColumns, ids, lockStrength, query }, 'Table row locked!');
    }
    catch (err) {
        log.error(err, { table, idColumns, ids, lockStrength }, 'Error while locking table row!');
        throw err;
    }
};
exports.lockTableRow = lockTableRow;
//# sourceMappingURL=locking.js.map