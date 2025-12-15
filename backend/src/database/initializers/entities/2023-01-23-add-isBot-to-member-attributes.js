"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const integrations_1 = require("@gitmesh/integrations");
const tenantService_1 = __importDefault(require("../../../services/tenantService"));
const getUserContext_1 = __importDefault(require("../../utils/getUserContext"));
const memberAttributeSettingsService_1 = __importDefault(require("../../../services/memberAttributeSettingsService"));
/* eslint-disable no-console */
const addIsBotToMemberAttributes = async () => {
    const tenants = await tenantService_1.default._findAndCountAllForEveryUser({});
    const isBotAttributes = integrations_1.DEFAULT_MEMBER_ATTRIBUTES.find((a) => a.name === 'isBot');
    // for each tenant
    for (const tenant of tenants.rows) {
        const userContext = await (0, getUserContext_1.default)(tenant.id);
        const memberAttributeSettingsService = new memberAttributeSettingsService_1.default(userContext);
        console.log(`Creating isBot member attribute for tenant ${tenant.id}`);
        await memberAttributeSettingsService.create({
            name: isBotAttributes.name,
            label: isBotAttributes.label,
            type: isBotAttributes.type,
            canDelete: isBotAttributes.canDelete,
            show: isBotAttributes.show,
        });
    }
};
addIsBotToMemberAttributes();
//# sourceMappingURL=2023-01-23-add-isBot-to-member-attributes.js.map