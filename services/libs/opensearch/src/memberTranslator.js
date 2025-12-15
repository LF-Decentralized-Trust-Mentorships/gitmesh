"use strict";
/* eslint-disable class-methods-use-this */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@gitmesh/types");
const fieldTranslator_1 = __importDefault(require("./fieldTranslator"));
const members_1 = require("./models/members");
class MemberTranslator extends fieldTranslator_1.default {
    constructor(attributes, availablePlatforms) {
        super();
        this.model = new members_1.MembersOpensearch();
        this.memberAttributes = attributes;
        const fields = this.model.getAllFields();
        // set translations for static fields
        this.translations = Object.keys(fields).reduce((acc, f) => {
            acc[f] = `${fields[f].type}_${f}`;
            return acc;
        }, {});
        // set translations for dynamic attributes
        for (const attribute of attributes) {
            if (attribute.type === types_1.MemberAttributeType.SPECIAL) {
                this.translations[attribute.name] = `string_${attribute.name}`;
                this.model.fields[attribute.name] = { type: `string` };
            }
            else {
                this.translations[attribute.name] = `obj_${attribute.name}`;
                this.model.fields[attribute.name] = {
                    type: `obj`,
                    dynamic: true,
                    realType: this.attributeTypeToOpenSearchPrefix(attribute.type),
                };
            }
            // also set reverse translations for platform specific keys
            // like string_github, int_discord etc
            for (const platform of availablePlatforms) {
                const prefix = this.attributeTypeToOpenSearchPrefix(attribute.type);
                this.opensearchToGitmeshMap.set(`${prefix}_${platform}`, platform);
            }
        }
        // set translations for joined entity fields that doesn't exist in member model already
        // tags
        this.translations.name = 'string_name';
        // organizations
        this.translations.logo = 'string_logo';
        this.translations.memberOrganizations = 'obj_memberOrganizations';
        this.translations.title = 'string_title';
        this.translations.dateStart = 'date_dateStart';
        this.translations.dateEnd = 'date_dateEnd';
        // identities
        this.translations.platform = 'string_platform';
        this.translations.username = 'string_username';
        this.setTranslationMaps();
        // fix for colliding translations of id -> uuid_memberId (members) and id -> uuid_id (organizations, tags)
        this.opensearchToGitmeshMap.set('uuid_id', 'id');
        // backwards compatibility for reach.total
        this.gitmeshToOpensearchMap.set('reach.total', 'int_totalReach');
    }
    attributeTypeToOpenSearchPrefix(type) {
        switch (type) {
            case types_1.MemberAttributeType.BOOLEAN:
                return 'bool';
            case types_1.MemberAttributeType.NUMBER:
                return 'int';
            case types_1.MemberAttributeType.EMAIL:
                return 'string';
            case types_1.MemberAttributeType.STRING:
                return 'string';
            case types_1.MemberAttributeType.URL:
                return 'string';
            case types_1.MemberAttributeType.DATE:
                return 'date';
            case types_1.MemberAttributeType.MULTI_SELECT:
                return 'string_arr';
            case types_1.MemberAttributeType.SPECIAL:
                return 'string';
            default:
                throw new Error(`Could not map attribute type: ${type} to OpenSearch type!`);
        }
    }
    gitmeshToOpensearch(gitmeshKey) {
        if (this.model.fieldExists(gitmeshKey)) {
            const field = this.model.getField(gitmeshKey);
            if (field.dynamic) {
                return this.expandDynamicAttribute(gitmeshKey);
            }
            return super.gitmeshToOpensearch(gitmeshKey);
        }
        if (gitmeshKey.startsWith('attributes')) {
            return this.expandDynamicAttribute(gitmeshKey);
        }
        throw new Error(`Unknown filter key: ${gitmeshKey}`);
    }
    fieldExists(key) {
        return this.model.fieldExists(key) || key.startsWith('attributes');
    }
    expandDynamicAttribute(key) {
        const keySplit = key.split('.');
        const actualAttributeName = keySplit.length === 1 ? keySplit[0] : keySplit[1];
        const attribute = this.memberAttributes.find((a) => a.name === actualAttributeName);
        const opensearchType = this.attributeTypeToOpenSearchPrefix(attribute.type);
        if (keySplit.length === 1) {
            return `obj_attributes.obj_${key}.${opensearchType}_default`;
        }
        return keySplit.reduce((acc, k, counter) => {
            if (counter === keySplit.length - 1) {
                acc += `${opensearchType}_${k}`;
            }
            else {
                acc += `${this.gitmeshToOpensearchMap.get(k)}.`;
            }
            return acc;
        }, '');
    }
}
exports.default = MemberTranslator;
//# sourceMappingURL=memberTranslator.js.map