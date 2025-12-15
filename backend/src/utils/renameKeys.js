"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameKeys = void 0;
const renameKeys = (obj, fieldMap) => Object.keys(obj).reduce((acc, key) => (Object.assign(Object.assign({}, acc), { [fieldMap[key] || key]: obj[key] })), {});
exports.renameKeys = renameKeys;
//# sourceMappingURL=renameKeys.js.map