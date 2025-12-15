"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newActivityBlocks = void 0;
const html_to_mrkdwn_ts_1 = __importDefault(require("html-to-mrkdwn-ts"));
const types_1 = require("@gitmesh/types");
const conf_1 = require("../../../../../../conf");
const defaultAvatarUrl = 'https://uploads-ssl.webflow.com/635150609746eee5c60c4aac/6502afc9d75946873c1efa93_image%20(292).png';
const computeEngagementLevel = (score) => {
    if (score <= 1) {
        return 'Silent';
    }
    if (score <= 3) {
        return 'Quiet';
    }
    if (score <= 6) {
        return 'Engaged';
    }
    if (score <= 8) {
        return 'Fan';
    }
    if (score <= 10) {
        return 'Ultra';
    }
    return '';
};
const replacements = {
    '/images/integrations/linkedin-reactions/like.svg': ':thumbsup:',
    '/images/integrations/linkedin-reactions/maybe.svg': ':thinking_face:',
    '/images/integrations/linkedin-reactions/praise.svg': ':clap:',
    '/images/integrations/linkedin-reactions/appreciation.svg': ':heart_hands:',
    '/images/integrations/linkedin-reactions/empathy.svg': ':heart:',
    '/images/integrations/linkedin-reactions/entertainment.svg': ':laughing:',
    '/images/integrations/linkedin-reactions/interest.svg': ':bulb:',
    'href="/': `href="${conf_1.API_CONFIG.frontendUrl}/`,
};
const replaceHeadline = (text) => {
    Object.keys(replacements).forEach((key) => {
        text = text.replaceAll(key, replacements[key]);
    });
    return text;
};
const truncateText = (text, characters = 60) => {
    if (text.length > characters) {
        return `${text.substring(0, characters)}...`;
    }
    return text;
};
const newActivityBlocks = (activity) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    // Which platform identities are displayed as buttons and which ones go to menu
    let buttonPlatforms = ['github', 'twitter', 'linkedin'];
    const display = (0, html_to_mrkdwn_ts_1.default)(replaceHeadline(activity.display.default));
    const reach = ((_a = activity.member.reach) === null || _a === void 0 ? void 0 : _a[activity.platform]) || ((_b = activity.member.reach) === null || _b === void 0 ? void 0 : _b.total);
    const { member } = activity;
    const memberProperties = [];
    if ((_c = member.attributes.jobTitle) === null || _c === void 0 ? void 0 : _c.default) {
        memberProperties.push(`*💼 Job title:* ${(_d = member.attributes.jobTitle) === null || _d === void 0 ? void 0 : _d.default}`);
    }
    if (member.organizations.length > 0) {
        const orgs = member.organizations.map((org) => `<${`${conf_1.API_CONFIG.frontendUrl}/organizations/${org.id}`}|${org.name || org.displayName}>`);
        memberProperties.push(`*🏢 Organization:* ${orgs.join(' | ')}`);
    }
    if (reach > 0) {
        memberProperties.push(`*👥 Reach:* ${reach} followers`);
    }
    if ((_f = (_e = member.attributes) === null || _e === void 0 ? void 0 : _e.location) === null || _f === void 0 ? void 0 : _f.default) {
        memberProperties.push(`*📍 Location:* ${(_h = (_g = member.attributes) === null || _g === void 0 ? void 0 : _g.location) === null || _h === void 0 ? void 0 : _h.default}`);
    }
    if (member.emails.length > 0) {
        const [email] = member.emails;
        memberProperties.push(`*✉️ Email:* <mailto:${email}|${email}>`);
    }
    const engagementLevel = computeEngagementLevel(activity.member.score || activity.engagement);
    if (engagementLevel.length > 0) {
        memberProperties.push(`*📊 Engagement level:* ${engagementLevel}`);
    }
    if (activity.member.activeOn) {
        const platforms = activity.member.activeOn
            .map((platform) => types_1.integrationLabel[platform] || platform)
            .join(' | ');
        memberProperties.push(`*💬 Active on:* ${platforms}`);
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
    if (!buttonPlatforms.includes(activity.platform)) {
        buttonPlatforms = [activity.platform, ...buttonPlatforms];
    }
    const buttonProfiles = buttonPlatforms
        .map((platform) => profiles.find((profile) => profile.platform === platform))
        .filter((profiles) => !!profiles);
    const menuProfiles = profiles.filter((profile) => !buttonPlatforms.includes(profile.platform));
    return {
        blocks: [
            Object.assign({ type: 'section', text: {
                    type: 'mrkdwn',
                    text: `*<${conf_1.API_CONFIG.frontendUrl}/contacts/${activity.member.id}|${activity.member.displayName}>* *${display.text}*`,
                } }, (activity.url
                ? {
                    accessory: {
                        type: 'button',
                        text: {
                            type: 'plain_text',
                            text: `:arrow_upper_right: ${activity.platform !== 'other'
                                ? `Open on ${types_1.integrationLabel[activity.platform]}`
                                : 'Open link'}`,
                            emoji: true,
                        },
                        url: activity.url,
                    },
                }
                : {})),
            ...(activity.title || activity.body
                ? [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `>${activity.title && activity.title !== activity.display.default
                                ? `*${truncateText((0, html_to_mrkdwn_ts_1.default)(activity.title).text, 120).replaceAll('\n', '\n>')}* \n>`
                                : ''}${truncateText((0, html_to_mrkdwn_ts_1.default)(activity.body).text, 260).replaceAll('\n', '\n>')}`,
                        },
                    },
                ]
                : []),
            ...(memberProperties.length > 0
                ? [
                    {
                        type: 'divider',
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: memberProperties.join('\n'),
                        },
                        accessory: {
                            type: 'image',
                            image_url: (_l = (_k = (_j = member.attributes) === null || _j === void 0 ? void 0 : _j.avatarUrl) === null || _k === void 0 ? void 0 : _k.default) !== null && _l !== void 0 ? _l : defaultAvatarUrl,
                            alt_text: 'computer thumbnail',
                        },
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
exports.newActivityBlocks = newActivityBlocks;
//# sourceMappingURL=newActivityBlocks.js.map