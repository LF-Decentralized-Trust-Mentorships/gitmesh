"use strict";
/* eslint-disable class-methods-use-this */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fieldTranslator_1 = __importDefault(require("./fieldTranslator"));
const organizations_1 = require("./models/organizations");
class OrganizationTranslator extends fieldTranslator_1.default {
    constructor() {
        super();
        this.model = new organizations_1.OrganizationsOpensearch();
        const fields = this.model.getAllFields();
        // set translations for static fields
        this.translations = Object.keys(fields).reduce((acc, f) => {
            acc[f] = `${fields[f].type}_${f}`;
            return acc;
        }, {});
        // identities
        this.translations.platform = 'string_platform';
        this.translations.name = 'string_name';
        this.translations.url = 'string_url';
        this.setTranslationMaps();
    }
    gitmeshToOpensearch(gitmeshKey) {
        if (this.model.fieldExists(gitmeshKey)) {
            return super.gitmeshToOpensearch(gitmeshKey);
        }
        throw new Error(`Unknown filter key: ${gitmeshKey}`);
    }
}
exports.default = OrganizationTranslator;
//# sourceMappingURL=organizationTranslator.js.map