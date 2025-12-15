"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEVTO_MEMBER_ATTRIBUTES = void 0;
const types_1 = require("@gitmesh/types");
const utils_1 = require("../utils");
const memberAttributes_1 = require("../twitter/memberAttributes");
const memberAttributes_2 = require("../github/memberAttributes");
const common_1 = require("@gitmesh/common");
exports.DEVTO_MEMBER_ATTRIBUTES = (0, common_1.distinctBy)([
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
        name: types_1.MemberAttributes[types_1.MemberAttributeName.NAME].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.NAME].label,
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
        name: types_1.MemberAttributes[types_1.MemberAttributeName.BIO].name,
        label: types_1.MemberAttributes[types_1.MemberAttributeName.BIO].label,
        type: types_1.MemberAttributeType.STRING,
        canDelete: false,
        show: true,
    },
    ...(0, utils_1.pickAttributes)([types_1.MemberAttributeName.URL], memberAttributes_1.TWITTER_MEMBER_ATTRIBUTES),
    ...(0, utils_1.pickAttributes)([types_1.MemberAttributeName.URL, types_1.MemberAttributeName.NAME], memberAttributes_2.GITHUB_MEMBER_ATTRIBUTES),
], (a) => `${a.name}-${a.type}`);
//# sourceMappingURL=memberAttributes.js.map