"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MEMBER_ATTRIBUTES = exports.MEMBER_ATTRIBUTES = void 0;
const types_1 = require("@gitmesh/types");
exports.MEMBER_ATTRIBUTES = [
    {
        name: types_1.MemberAttributes[types_1.MemberAttributeName.SAMPLE].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.SAMPLE].label,
        type: types_1.MemberAttributeType.BOOLEAN,
        canDelete: true,
        show: false,
    },
];
exports.DEFAULT_MEMBER_ATTRIBUTES = [
    {
        name: types_1.MemberAttributes[types_1.MemberAttributeName.JOB_TITLE].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.JOB_TITLE].label,
        type: types_1.MemberAttributeType.STRING,
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
        name: types_1.MemberAttributes[types_1.MemberAttributeName.URL].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.URL].label,
        type: types_1.MemberAttributeType.URL,
        canDelete: false,
        show: true,
    },
    {
        name: types_1.MemberAttributes[types_1.MemberAttributeName.IS_TEAM_MEMBER].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.IS_TEAM_MEMBER].label,
        type: types_1.MemberAttributeType.BOOLEAN,
        canDelete: false,
        show: false,
    },
    {
        name: types_1.MemberAttributes[types_1.MemberAttributeName.IS_BOT].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.IS_BOT].label,
        type: types_1.MemberAttributeType.BOOLEAN,
        canDelete: false,
        show: false,
    },
    {
        name: types_1.MemberAttributes[types_1.MemberAttributeName.IS_ORGANIZATION].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.IS_ORGANIZATION].label,
        type: types_1.MemberAttributeType.BOOLEAN,
        canDelete: false,
        show: false,
    },
];
//# sourceMappingURL=memberAttributes.js.map