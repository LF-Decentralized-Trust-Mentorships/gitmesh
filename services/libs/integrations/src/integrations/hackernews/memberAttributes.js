"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HACKERNEWS_MEMBER_ATTRIBUTES = void 0;
const types_1 = require("@gitmesh/types");
exports.HACKERNEWS_MEMBER_ATTRIBUTES = [
    {
        name: types_1.MemberAttributes[types_1.MemberAttributeName.SOURCE_ID].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.SOURCE_ID].label,
        type: types_1.MemberAttributeType.STRING,
        canDelete: false,
        show: false,
    },
    {
        name: types_1.MemberAttributes[types_1.MemberAttributeName.URL].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.URL].label,
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
        name: types_1.MemberAttributes[types_1.MemberAttributeName.KARMA].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.KARMA].label,
        type: types_1.MemberAttributeType.NUMBER,
        canDelete: false,
        show: true,
    },
];
//# sourceMappingURL=memberAttributes.js.map