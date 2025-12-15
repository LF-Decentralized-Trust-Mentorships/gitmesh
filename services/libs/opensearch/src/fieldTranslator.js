"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@gitmesh/types");
class FieldTranslator {
    constructor() {
        this.gitmeshToOpensearchMap = new Map();
        this.opensearchToGitmeshMap = new Map();
    }
    gitmeshToOpensearch(gitmeshKey) {
        return this.gitmeshToOpensearchMap.get(gitmeshKey);
    }
    opensearchToGitmesh(opensearchKey) {
        return this.opensearchToGitmeshMap.get(opensearchKey);
    }
    setTranslationMaps() {
        for (const key of Object.keys(this.translations)) {
            if (this.model.fieldExists(key) && this.model.getField(key).customTranslation) {
                this.gitmeshToOpensearchMap.set(key, this.model.getField(key).customTranslation.toOpensearch);
                this.opensearchToGitmeshMap.set(this.model.getField(key).customTranslation.fromOpensearch, key);
            }
            else {
                this.gitmeshToOpensearchMap.set(key, this.translations[key]);
                this.opensearchToGitmeshMap.set(this.translations[key], key);
            }
        }
    }
    fieldExists(key) {
        return this.model.fieldExists(key);
    }
    convertIfInt(modelField, value) {
        if ((modelField === null || modelField === void 0 ? void 0 : modelField.type) === types_1.OpensearchFieldType.INT) {
            return parseInt(value, 10);
        }
        return value;
    }
    isNestedField(field) {
        return field.startsWith('nested_');
    }
    translateObjectToGitmesh(object) {
        const translated = {};
        if (typeof object !== 'object' || object === null) {
            return object;
        }
        if (Array.isArray(object)) {
            const translatedArray = [];
            for (const objItem of object) {
                translatedArray.push(this.translateObjectToGitmesh(objItem));
            }
            return translatedArray;
        }
        for (const key of Object.keys(object)) {
            const gitmeshKey = this.opensearchToGitmesh(key);
            if (gitmeshKey) {
                const modelField = this.model.getField(gitmeshKey);
                if (!modelField || !modelField.preventNestedFieldTranslation) {
                    translated[gitmeshKey] = this.convertIfInt(modelField, this.translateObjectToGitmesh(object[key]));
                }
                else {
                    translated[gitmeshKey] = object[key];
                }
            }
        }
        return translated;
    }
}
exports.default = FieldTranslator;
//# sourceMappingURL=fieldTranslator.js.map