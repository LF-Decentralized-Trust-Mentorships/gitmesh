"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newMemberBlocks = void 0;
const types_1 = require("@gitmesh/types");
const conf_1 = require("../../../../../../conf");
const defaultAvatarUrl = 'https://uploads-ssl.webflow.com/635150609746eee5c60c4aac/6502afc9d75946873c1efa93_image%20(292).png';
const newMemberBlocks = (member) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    // Which platform identities are displayed as buttons and which ones go to menu
    let buttonPlatforms = ['github', 'twitter', 'linkedin'];
    const platforms = member.activeOn;
    const reach = platforms && platforms.length > 0 ? (_a = member.reach) === null || _a === void 0 ? void 0 : _a[platforms[0]] : (_b = member.reach) === null || _b === void 0 ? void 0 : _b.total;
    const details = [];
    if ((_c = member.attributes.jobTitle) === null || _c === void 0 ? void 0 : _c.default) {
        details.push(`*💼 Job title:* ${(_d = member.attributes.jobTitle) === null || _d === void 0 ? void 0 : _d.default}`);
    }
    if (member.organizations.length > 0) {
        const orgs = member.organizations.map((org) => `<${`${conf_1.API_CONFIG.frontendUrl}/organizations/${org.id}`}|${org.name || org.displayName}>`);
        details.push(`*🏢 Organization:* ${orgs.join(' | ')}`);
    }
    if (reach > 0) {
        details.push(`*👥 Reach:* ${reach} followers`);
    }
    if ((_f = (_e = member.attributes) === null || _e === void 0 ? void 0 : _e.location) === null || _f === void 0 ? void 0 : _f.default) {
        details.push(`*📍 Location:* ${(_h = (_g = member.attributes) === null || _g === void 0 ? void 0 : _g.location) === null || _h === void 0 ? void 0 : _h.default}`);
    }
    if (member.emails.length > 0) {
        const [email] = member.emails;
        details.push(`*✉️ Email:* <mailto:${email}|${email}>`);
    }
    const profiles = Object.keys(member.username)
        .map((p) => {
        var _a, _b, _c;
        const username = (((_a = member.username) === null || _a === void 0 ? void 0 : _a[p]) || []).length > 0 ? member.username[p][0] : null;
        const url = ((_c = (_b = member.attributes) === null || _b === void 0 ? void 0 : _b.url) === null || _c === void 0 ? void 0 : _c[p]) || (username && types_1.integrationProfileUrl[p](username)) || null;
        return {
            platform: p,
            url,
        };
    })
        .filter((p) => !!p.url);
    if (platforms.length > 0 && !buttonPlatforms.includes(platforms[0])) {
        buttonPlatforms = [platforms[0], ...buttonPlatforms];
    }
    const buttonProfiles = buttonPlatforms
        .map((platform) => profiles.find((profile) => profile.platform === platform))
        .filter((profiles) => !!profiles);
    const menuProfiles = profiles.filter((profile) => !buttonPlatforms.includes(profile.platform));
    return {
        blocks: [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: member.displayName,
                    emoji: true,
                },
            },
            ...(platforms && platforms.length > 0
                ? [
                    {
                        type: 'context',
                        elements: [
                            {
                                type: 'mrkdwn',
                                text: `Joined your community on *${types_1.integrationLabel[platforms[0]] || platforms[0]}*`,
                            },
                        ],
                    },
                ]
                : []),
            ...(details.length > 0
                ? [
                    {
                        type: 'divider',
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: details.length > 0 ? details.join('\n') : '\n',
                        },
                        accessory: {
                            type: 'image',
                            image_url: (_l = (_k = (_j = member.attributes) === null || _j === void 0 ? void 0 : _j.avatarUrl) === null || _k === void 0 ? void 0 : _k.default) !== null && _l !== void 0 ? _l : defaultAvatarUrl,
                            alt_text: 'computer thumbnail',
                        },
                    },
                    {
                        type: 'divider',
                    },
                ]
                : []),
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: 'View in gitmesh.dev',
                            emoji: true,
                        },
                        url: `${conf_1.API_CONFIG.frontendUrl}/contacts/${member.id}`,
                    },
                    ...(buttonProfiles || [])
                        .map(({ platform, url }) => {
                        var _a;
                        return ({
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: `${(_a = types_1.integrationLabel[platform]) !== null && _a !== void 0 ? _a : platform} profile`,
                                emoji: true,
                            },
                            url,
                        });
                    })
                        .filter((action) => !!action.url),
                    ...(menuProfiles.length > 0
                        ? [
                            {
                                type: 'overflow',
                                options: menuProfiles.map(({ platform, url }) => {
                                    var _a;
                                    return ({
                                        text: {
                                            type: 'plain_text',
                                            text: `${(_a = types_1.integrationLabel[platform]) !== null && _a !== void 0 ? _a : platform} profile`,
                                            emoji: true,
                                        },
                                        url,
                                    });
                                }),
                            },
                        ]
                        : []),
                ],
            },
        ],
    };
};
exports.newMemberBlocks = newMemberBlocks;
//# sourceMappingURL=newMemberBlocks.js.map