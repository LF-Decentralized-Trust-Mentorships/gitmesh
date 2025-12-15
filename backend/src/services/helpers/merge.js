"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
/**
 * Deep diff between two object, using lodash
 * @param  {Object} newObject  Object obtained after loadash merge
 * @param  {Object} original   Original object
 * @return {Object}            Object with the fields from newObject that are different from original
 */
function difference(newObject, original) {
    const lodash = require('lodash');
    const differentFields = Object.keys(newObject)
        .map((field) => lodash.isEqual(newObject[field], original[field]) || newObject[field] === null ? null : field)
        .filter((field) => field !== null);
    return lodash.pick(newObject, differentFields);
}
/**
 * Customising the merge.
 * - If the field is an array, concatenate the arrays
 * - If the newField is null, keep the original field
 * - Else, return undefined, and lodash will do standard merge
 * @param originalField Original field
 * @param newField New field
 * @returns Customisations for the merge.
 */
function customizer(originalField, newField) {
    if (lodash_1.default.isArray(originalField)) {
        return lodash_1.default.unionWith(originalField, newField, lodash_1.default.isEqual);
    }
    if (newField == null) {
        return originalField;
    }
    return undefined;
}
/**
 * Given two object, perform a deepmerge. Then check if the deepMerged object
 * has any fields that are not in the original object.
 * Return an object with the merged fields that are different from the original object
 * @param {Object} originalObject
 * @param {Object} newObject
 * @param {Object} special: Fields that need special merging {field: (oldValue, newValue) => newValue}
 *  - To keep the earliest joinedAt:
 *      {joinedAt: (oldDate, newDate) => new Date(Math.min(newDate, oldDate))}
 *  - To always keep the original displayName:
 *      {displayName: (oldUsername, newUsername) => oldUsername}
 * @returns {Object} fields of the mergedObejct that are different from originalObject
 */
function merge(originalObject, newObject, special = {}) {
    const originalCopy = lodash_1.default.cloneDeep(originalObject);
    const merged = lodash_1.default.mergeWith({}, originalObject, newObject, customizer);
    for (const key in special) {
        if (Object.prototype.hasOwnProperty.call(special, key)) {
            lodash_1.default.set(merged, key, special[key](lodash_1.default.get(originalObject, key), lodash_1.default.get(merged, key)));
        }
    }
    return difference(merged, originalCopy);
}
exports.default = merge;
//# sourceMappingURL=merge.js.map