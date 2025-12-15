"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GITHUB_MEMBER_ATTRIBUTES = void 0;
const types_1 = require("@gitmesh/types");
exports.GITHUB_MEMBER_ATTRIBUTES = [
    {
        name: types_1.MemberAttributes[types_1.MemberAttributeName.IS_HIREABLE].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.IS_HIREABLE].label,
        type: types_1.MemberAttributeType.BOOLEAN,
        canDelete: false,
        show: true,
    },
    {
        name: types_1.MemberAttributes[types_1.MemberAttributeName.URL].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.URL].label,
        type: types_1.MemberAttributeType.URL,
        canDelete: false,
        show: true,
    },
    {
        name: types_1.MemberAttributes[types_1.MemberAttributeName.WEBSITE_URL].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.WEBSITE_URL].label,
        type: types_1.MemberAttributeType.URL,
        canDelete: false,
        show: true,
    },
    {
        name: types_1.MemberAttributes[types_1.MemberAttributeName.BIO].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.BIO].label,
        type: types_1.MemberAttributeType.STRING,
        canDelete: false,
        show: true,
    },
    {
        name: types_1.MemberAttributes[types_1.MemberAttributeName.LOCATION].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.LOCATION].label,
        type: types_1.MemberAttributeType.STRING,
        canDelete: false,
        show: true,
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