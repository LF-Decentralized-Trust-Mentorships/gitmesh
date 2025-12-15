"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18n = exports.i18nExists = void 0;
const lodash_get_1 = __importDefault(require("lodash.get"));
const en_1 = __importDefault(require("./en"));
const pt_BR_1 = __importDefault(require("./pt-BR"));
const es_1 = __importDefault(require("./es"));
/**
 * Object with the languages available.
 */
const languages = {
    en: en_1.default,
    'pt-BR': pt_BR_1.default,
    es: es_1.default,
};
/**
 * Replaces the parameters of a message with the args.
 */
function format(message, args) {
    if (!message) {
        return null;
    }
    return message.replace(/{(\d+)}/g, (match, number) => typeof args[number] !== 'undefined' ? args[number] : match);
}
/**
 * Checks if the key exists on the language.
 */
const i18nExists = (languageCode, key) => {
    const dictionary = languages[languageCode] || languages.en;
    const message = (0, lodash_get_1.default)(dictionary, key);
    return Boolean(message);
};
exports.i18nExists = i18nExists;
/**
 * Returns the translation based on the key.
 */
const i18n = (languageCode, key, ...args) => {
    const dictionary = languages[languageCode] || languages.en;
    const message = (0, lodash_get_1.default)(dictionary, key);
    if (!message) {
        return key;
    }
    return format(message, args);
};
exports.i18n = i18n;
//# sourceMappingURL=index.js.map