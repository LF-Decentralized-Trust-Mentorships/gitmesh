"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OpensearchModelBase {
    getAllFields() {
        return this.fields;
    }
    getField(key) {
        return this.fields[key];
    }
    fieldExists(key) {
        return key in this.fields;
    }
}
exports.default = OpensearchModelBase;
//# sourceMappingURL=base.js.map