"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISCORD_MEMBER_ATTRIBUTES = void 0;
const types_1 = require("@gitmesh/types");
exports.DISCORD_MEMBER_ATTRIBUTES = [
    {
        name: types_1.MemberAttributes[types_1.MemberAttributeName.SOURCE_ID].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.SOURCE_ID].label,
        type: types_1.MemberAttributeType.STRING,
        canDelete: false,
        show: false,
    },
    {
        name: types_1.MemberAttributes[types_1.MemberAttributeName.AVATAR_URL].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.AVATAR_URL].label,
        type: types_1.MemberAttributeType.URL,
        canDelete: false,
        show: false,
    },
];
//# sourceMappingURL=memberAttributes.js.map