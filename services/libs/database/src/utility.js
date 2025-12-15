"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arePrimitivesDbEqual = exports.escapeTableName = void 0;
const common_1 = require("@gitmesh/common");
const escapeTableName = (tableName) => {
    return `${tableName.schema !== undefined ? `"${tableName.schema.toLowerCase()}".` : ''}"${tableName.table.toLowerCase()}"`;
};
exports.escapeTableName = escapeTableName;
const arePrimitivesDbEqual = (a, b) => {
    if ((0, common_1.isNullOrUndefined)(a) && (0, common_1.isNullOrUndefined)(b)) {
        return true;
    }
    return a === b;
};
exports.arePrimitivesDbEqual = arePrimitivesDbEqual;
//# sourceMappingURL=utility.js.map