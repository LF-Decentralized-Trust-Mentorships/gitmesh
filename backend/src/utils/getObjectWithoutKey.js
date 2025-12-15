"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Utility functon that removes given key(s) from an object.
 * Returns a new object with given key(string) or keys(string[]) removed.
 * @param object object to be modified
 * @param key key to be removed / or keys string arrays to be removed
 * @returns the new object without given keys
 *
 */
exports.default = (object, key) => {
    let objectWithoutKeys;
    if (typeof key === 'string') {
        const _a = object, _b = key, _ = _a[_b], otherKeys = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
        objectWithoutKeys = otherKeys;
    }
    else if (Array.isArray(key)) {
        objectWithoutKeys = key.reduce((acc, i) => {
            const _a = acc, _b = i, _ = _a[_b], otherKeys = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
            acc = otherKeys;
            return acc;
        }, object);
    }
    return objectWithoutKeys;
};
//# sourceMappingURL=getObjectWithoutKey.js.map