"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firstArrayContainsSecondArray = exports.areArraysEqual = exports.averageBy = exports.maxBy = exports.sumBy = exports.distinctBy = exports.distinct = exports.partition = exports.groupBy = exports.singleOrDefault = exports.single = void 0;
const object_1 = require("./object");
const single = (array, predicate) => {
    const result = (0, exports.singleOrDefault)(array, predicate);
    if (result === undefined) {
        throw new Error('Array contains no matching elements!');
    }
    return result;
};
exports.single = single;
const singleOrDefault = (array, predicate) => {
    const filtered = array.filter(predicate);
    if (filtered.length === 1) {
        return filtered[0];
    }
    if (filtered.length > 1) {
        throw new Error('Array contains more than one matching element!');
    }
    return undefined;
};
exports.singleOrDefault = singleOrDefault;
const groupBy = (array, selector) => {
    const isObjectKey = array.length > 0 && (0, object_1.isObject)(selector(array[0]));
    if (isObjectKey) {
        const map = new Map();
        array.forEach((value) => {
            const key = JSON.stringify(selector(value));
            if (map.has(key)) {
                ;
                map.get(key).push(value);
            }
            else {
                map.set(key, [value]);
            }
        });
        return map;
    }
    const map = new Map();
    array.forEach((value) => {
        const key = selector(value);
        if (map.has(key)) {
            ;
            map.get(key).push(value);
        }
        else {
            map.set(key, [value]);
        }
    });
    return map;
};
exports.groupBy = groupBy;
const partition = (array, partitionSize) => {
    if (array.length <= partitionSize) {
        return [array];
    }
    let index = 0;
    const results = [];
    while (index < array.length) {
        results.push(array.slice(index, index + partitionSize));
        index += partitionSize;
    }
    return results;
};
exports.partition = partition;
function uniqueFilter(value, index, array) {
    return array.indexOf(value) === index;
}
const distinct = (values) => {
    return values.filter(uniqueFilter);
};
exports.distinct = distinct;
const distinctBy = (values, selector) => {
    const grouped = (0, exports.groupBy)(values, selector);
    const keys = Array.from(grouped.keys());
    const results = [];
    for (const key of keys) {
        results.push(grouped.get(key)[0]);
    }
    return results;
};
exports.distinctBy = distinctBy;
const sumBy = (list, selector) => {
    if (list.length === 0)
        return 0;
    return list.reduce((total, entry) => total + selector(entry), 0);
};
exports.sumBy = sumBy;
const maxBy = (list, selector) => {
    if (list.length === 0)
        return 0;
    return Math.max(...list.map((entry) => selector(entry)));
};
exports.maxBy = maxBy;
const averageBy = (list, selector) => {
    if (list.length === 0)
        return 0;
    return (0, exports.sumBy)(list, selector) / list.length;
};
exports.averageBy = averageBy;
const areArraysEqual = (a, b) => {
    if (a.length !== b.length) {
        return false;
    }
    const sortedArr1 = a.slice().sort();
    const sortedArr2 = b.slice().sort();
    for (let i = 0; i < sortedArr1.length; i++) {
        if (sortedArr1[i] !== sortedArr2[i]) {
            return false;
        }
    }
    return true;
};
exports.areArraysEqual = areArraysEqual;
const firstArrayContainsSecondArray = (array1, array2) => {
    return array2.every((val) => array1.includes(val));
};
exports.firstArrayContainsSecondArray = firstArrayContainsSecondArray;
//# sourceMappingURL=array.js.map