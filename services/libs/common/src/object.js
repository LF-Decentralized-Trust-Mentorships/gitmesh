"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeIgnoreUndefined = exports.isObjectEmpty = exports.isNullOrUndefined = exports.isObject = void 0;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
exports.isObject = isObject;
const isNullOrUndefined = (val) => {
    return val === null || val === undefined;
};
exports.isNullOrUndefined = isNullOrUndefined;
const isObjectEmpty = (val) => {
    if (!(0, exports.isObject)(val)) {
        return false;
    }
    for (const key of Object.keys(val)) {
        const value = val[key];
        if (value !== undefined) {
            return false;
        }
    }
    return true;
};
exports.isObjectEmpty = isObjectEmpty;
const mergeIgnoreUndefined = (first, second) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = Object.assign({}, first);
    for (const key of Object.keys(second)) {
        const value = second[key];
        if (value !== undefined) {
            result[key] = value;
        }
    }
    return result;
};
exports.mergeIgnoreUndefined = mergeIgnoreUndefined;
//# sourceMappingURL=object.js.map