"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldTranslatorFactory = void 0;
const types_1 = require("@gitmesh/types");
const memberTranslator_1 = __importDefault(require("./memberTranslator"));
const organizationTranslator_1 = __importDefault(require("./organizationTranslator"));
class FieldTranslatorFactory {
    static getTranslator(index, attributes, availablePlatforms) {
        switch (index) {
            case types_1.OpenSearchIndex.MEMBERS:
                return new memberTranslator_1.default(attributes, availablePlatforms);
            case types_1.OpenSearchIndex.ORGANIZATIONS:
                return new organizationTranslator_1.default();
            default:
                throw new Error(`Field translator for index ${index} not found!`);
        }
    }
}
exports.FieldTranslatorFactory = FieldTranslatorFactory;
//# sourceMappingURL=fieldTranslatorFactory.js.map