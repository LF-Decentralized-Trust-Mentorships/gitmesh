"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowLockStrength = exports.TableLockLevel = void 0;
var TableLockLevel;
(function (TableLockLevel) {
    TableLockLevel["AccessShare"] = "access share";
    TableLockLevel["RowShare"] = "row share";
    TableLockLevel["RowExclusive"] = "row exclusive";
    TableLockLevel["ShareUpdateExclusive"] = "share update exclusive";
    TableLockLevel["Share"] = "share";
    TableLockLevel["ShareRowExclusive"] = "share row exclusive";
    TableLockLevel["Exclusive"] = "exclusive";
    TableLockLevel["AccessExclusive"] = "access exclusive";
})(TableLockLevel = exports.TableLockLevel || (exports.TableLockLevel = {}));
var RowLockStrength;
(function (RowLockStrength) {
    RowLockStrength["Update"] = "update";
    RowLockStrength["NoKeyUpdate"] = "no key update";
    RowLockStrength["Share"] = "share";
    RowLockStrength["KeyShare"] = "key share";
})(RowLockStrength = exports.RowLockStrength || (exports.RowLockStrength = {}));
//# sourceMappingURL=types.js.map