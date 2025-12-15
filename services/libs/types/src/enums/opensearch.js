"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSearchIndex = exports.OpensearchFieldType = void 0;
var OpensearchFieldType;
(function (OpensearchFieldType) {
    OpensearchFieldType["UUID"] = "uuid";
    OpensearchFieldType["UUID_ARR"] = "uuid_arr";
    OpensearchFieldType["STRING"] = "string";
    OpensearchFieldType["STRING_ARR"] = "string_arr";
    OpensearchFieldType["INT"] = "int";
    OpensearchFieldType["DATE"] = "date";
    OpensearchFieldType["OBJECT"] = "obj";
    OpensearchFieldType["NESTED"] = "nested";
    OpensearchFieldType["FLOAT"] = "float";
    OpensearchFieldType["BOOL"] = "bool";
})(OpensearchFieldType || (exports.OpensearchFieldType = OpensearchFieldType = {}));
var OpenSearchIndex;
(function (OpenSearchIndex) {
    OpenSearchIndex["MEMBERS"] = "members";
    OpenSearchIndex["ACTIVITIES"] = "activities";
    OpenSearchIndex["ORGANIZATIONS"] = "organizations";
})(OpenSearchIndex || (exports.OpenSearchIndex = OpenSearchIndex = {}));
//# sourceMappingURL=opensearch.js.map