"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const types_1 = require("@gitmesh/types");
const integrations_1 = require("@gitmesh/integrations");
const tenantService_1 = __importDefault(require("../../../services/tenantService"));
const getUserContext_1 = __importDefault(require("../../utils/getUserContext"));
const integrationService_1 = __importDefault(require("../../../services/integrationService"));
const memberAttributeSettingsService_1 = __importDefault(require("../../../services/memberAttributeSettingsService"));
const memberService_1 = __importDefault(require("../../../services/memberService"));
exports.default = async () => {
    const tenants = (await tenantService_1.default._findAndCountAllForEveryUser({ filter: {} })).rows;
    for (const tenant of tenants) {
        let updateMembers = [];
        let updateActivities = [];
        const userContext = await (0, getUserContext_1.default)(tenant.id);
        const is = new integrationService_1.default(userContext);
        const memberAttributesService = new memberAttributeSettingsService_1.default(userContext);
        const activeIntegrations = await is.findAndCountAll({ filter: { status: 'done' } });
        // Create default member attribute settings
        await memberAttributesService.createPredefined(integrations_1.DEFAULT_MEMBER_ATTRIBUTES);
        // create sample attribute settings if tenant.hasSampleData = true
        if (tenant.hasSampleData) {
            await memberAttributesService.createPredefined(memberAttributeSettingsService_1.default.pickAttributes([types_1.MemberAttributeName.SAMPLE], integrations_1.MEMBER_ATTRIBUTES));
        }
        // Create integration specific member attribute settings
        for (const integration of activeIntegrations.rows) {
            switch (integration.platform) {
                case types_1.PlatformType.DEVTO:
                    await memberAttributesService.createPredefined(integrations_1.DEVTO_MEMBER_ATTRIBUTES);
                    await memberAttributesService.createPredefined(memberAttributeSettingsService_1.default.pickAttributes([types_1.MemberAttributeName.URL], integrations_1.TWITTER_MEMBER_ATTRIBUTES));
                    await memberAttributesService.createPredefined(memberAttributeSettingsService_1.default.pickAttributes([types_1.MemberAttributeName.URL, types_1.MemberAttributeName.NAME], integrations_1.GITHUB_MEMBER_ATTRIBUTES));
                    break;
                case types_1.PlatformType.DISCORD:
                    await memberAttributesService.createPredefined(integrations_1.DISCORD_MEMBER_ATTRIBUTES);
                    break;
                case types_1.PlatformType.GITHUB:
                    await memberAttributesService.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
                    await memberAttributesService.createPredefined(memberAttributeSettingsService_1.default.pickAttributes([types_1.MemberAttributeName.URL], integrations_1.TWITTER_MEMBER_ATTRIBUTES));
                    break;
                case types_1.PlatformType.SLACK:
                    await memberAttributesService.createPredefined(integrations_1.SLACK_MEMBER_ATTRIBUTES);
                    break;
                case types_1.PlatformType.TWITTER:
                    await memberAttributesService.createPredefined(integrations_1.TWITTER_MEMBER_ATTRIBUTES);
                    break;
                default:
                    break;
            }
        }
        // start transforming members
        const ms = new memberService_1.default(userContext);
        const seq = await userContext.database.sequelize;
        // We need a raw query becuase new entity models don't have old fields (such as gitmeshInfo, bio, location)
        const query = `
        select * from members m 
        where m."tenantId"  = :tenantId
    `;
        const parameters = {
            tenantId: tenant.id,
        };
        const members = await seq.query(query, {
            replacements: parameters,
            type: sequelize_1.QueryTypes.SELECT,
        });
        const nameMemberMapping = {};
        const orgNameMemberIdMappings = {};
        for (const member of members) {
            // displayName
            const displayName = member.username.gitmeshUsername;
            let attributes = {};
            let bioAndLocationSourcePlatform;
            if (member.gitmeshInfo.github) {
                bioAndLocationSourcePlatform = 'github';
            }
            else if (member.gitmeshInfo.devto) {
                bioAndLocationSourcePlatform = 'devto';
            }
            // set attributes.location
            if (member.location) {
                attributes[types_1.MemberAttributeName.LOCATION] = {
                    [bioAndLocationSourcePlatform]: member.location,
                };
            }
            // set attributes.bio
            if (member.bio) {
                attributes[types_1.MemberAttributeName.BIO] = {
                    [bioAndLocationSourcePlatform]: member.bio,
                };
            }
            // set rest of the gitmeshInfo to attributes
            if (member.gitmeshInfo) {
                for (const platform of Object.keys(member.gitmeshInfo)) {
                    // We don't keep sample under a platform, it's stored as gitmeshInfo.sample in the old api
                    if (platform === 'sample') {
                        attributes = setObjectAttribute(attributes, types_1.MemberAttributeName.SAMPLE, types_1.PlatformType.GITMESH, member.gitmeshInfo.sample);
                    }
                    for (const attributeName of Object.keys(member.gitmeshInfo[platform])) {
                        // we change gitmeshInfo.platform.id to attributes.sourceId.platform
                        if (attributeName === 'id') {
                            attributes = setObjectAttribute(attributes, types_1.MemberAttributeName.SOURCE_ID, platform, member.gitmeshInfo[platform][attributeName]);
                        }
                        if (attributeName === 'imageUrl') {
                            attributes = setObjectAttribute(attributes, types_1.MemberAttributeName.AVATAR_URL, platform, member.gitmeshInfo[platform][attributeName]);
                        }
                        else {
                            attributes = setObjectAttribute(attributes, attributeName, platform, member.gitmeshInfo[platform][attributeName]);
                        }
                    }
                }
            }
            // set organization
            if (member.organisation) {
                if (orgNameMemberIdMappings[member.organisation]) {
                    orgNameMemberIdMappings[member.organisation].push(member.id);
                }
                else {
                    orgNameMemberIdMappings[member.organisation] = [member.id];
                }
            }
            attributes = await ms.setAttributesDefaultValues(attributes);
            updateMembers.push(Object.assign(Object.assign({}, member), { displayName,
                attributes }));
        }
        const { randomUUID } = require('crypto');
        if (Object.keys(orgNameMemberIdMappings).length !== 0) {
            let organizationsQuery = `INSERT INTO "organizations" ("id", "name", "createdAt", "updatedAt", "tenantId") VALUES `;
            for (const organisationName of Object.keys(orgNameMemberIdMappings)) {
                organizationsQuery += `('${randomUUID()}', '${organisationName.replace(/'/g, "''")}', NOW(), NOW(), '${tenant.id}'),`;
            }
            organizationsQuery = organizationsQuery.slice(0, organizationsQuery.length - 1);
            organizationsQuery += ` returning id`;
            const ids = await seq.query(organizationsQuery, {
                type: sequelize_1.QueryTypes.INSERT,
            });
            let a = 0;
            for (const organisationName of Object.keys(orgNameMemberIdMappings)) {
                nameMemberMapping[ids[0][a].id] = orgNameMemberIdMappings[organisationName];
                a += 1;
            }
            let memberOrganisationsQuery = `
      INSERT INTO "memberOrganizations" ("createdAt", "updatedAt", "memberId", "organizationId") VALUES `;
            for (const organisationId of Object.keys(nameMemberMapping)) {
                for (const memberId of nameMemberMapping[organisationId]) {
                    memberOrganisationsQuery += `(NOW(), NOW(), '${memberId}', '${organisationId}'),`;
                }
            }
            memberOrganisationsQuery = memberOrganisationsQuery.slice(0, memberOrganisationsQuery.length - 1);
            await seq.query(memberOrganisationsQuery, {
                type: sequelize_1.QueryTypes.INSERT,
            });
        }
        const MEMBER_CHUNK_SIZE = 25000;
        if (updateMembers.length > MEMBER_CHUNK_SIZE) {
            const splittedBulkMembers = [];
            while (updateMembers.length > MEMBER_CHUNK_SIZE) {
                splittedBulkMembers.push(updateMembers.slice(0, MEMBER_CHUNK_SIZE));
                updateMembers = updateMembers.slice(MEMBER_CHUNK_SIZE);
            }
            // push last leftover chunk
            if (updateMembers.length > 0) {
                splittedBulkMembers.push(updateMembers);
            }
            for (const memberChunk of splittedBulkMembers) {
                await userContext.database.member.bulkCreate(memberChunk, {
                    updateOnDuplicate: ['displayName', 'attributes'],
                });
            }
        }
        else {
            await userContext.database.member.bulkCreate(updateMembers, {
                updateOnDuplicate: ['displayName', 'attributes'],
            });
        }
        const totalActivityCount = await getActivityCount(seq, tenant.id);
        let currentActivityCount = 0;
        let currentOffset = 0;
        while (currentActivityCount < totalActivityCount) {
            const LIMIT = 200000;
            updateActivities = [];
            let splittedBulkActivities = [];
            const activities = await getActivities(seq, tenant.id, LIMIT, currentOffset);
            for (const activity of activities) {
                let body = '';
                if (activity.gitmeshInfo.body) {
                    body = activity.gitmeshInfo.body;
                    delete activity.gitmeshInfo.body;
                }
                let url = '';
                if (activity.gitmeshInfo.url) {
                    url = activity.gitmeshInfo.url;
                    delete activity.gitmeshInfo.url;
                }
                let title = '';
                if (activity.gitmeshInfo.title) {
                    title = activity.gitmeshInfo.title;
                    delete activity.gitmeshInfo.title;
                }
                let channel = '';
                if (activity.platform === types_1.PlatformType.TWITTER) {
                    if (activity.type === 'hashtag' && activity.gitmeshInfo.hashtag) {
                        channel = activity.gitmeshInfo.hashtag;
                    }
                }
                else if (activity.platform === types_1.PlatformType.GITHUB) {
                    if (activity.gitmeshInfo.repo) {
                        channel = activity.gitmeshInfo.repo;
                    }
                }
                else if (activity.platform === types_1.PlatformType.SLACK) {
                    if (activity.gitmeshInfo.channel) {
                        channel = activity.gitmeshInfo.channel;
                    }
                }
                else if (activity.platform === types_1.PlatformType.DEVTO) {
                    if (activity.gitmeshInfo.articleTitle) {
                        channel = activity.gitmeshInfo.articleTitle;
                    }
                    if (activity.gitmeshInfo.thread === false || activity.gitmeshInfo.thread === true) {
                        delete activity.gitmeshInfo.thread;
                    }
                }
                else if (activity.platform === types_1.PlatformType.DISCORD) {
                    if (activity.gitmeshInfo.thread === false && activity.gitmeshInfo.channel) {
                        channel = activity.gitmeshInfo.channel;
                    }
                    else if (activity.gitmeshInfo.thread) {
                        channel = activity.gitmeshInfo.thread;
                        if (activity.gitmeshInfo.channel) {
                            delete activity.gitmeshInfo.channel;
                        }
                    }
                }
                const attributes = activity.gitmeshInfo;
                updateActivities.push(Object.assign(Object.assign({}, activity), { body,
                    url,
                    title,
                    attributes,
                    channel }));
            }
            const ACTIVITY_CHUNK_SIZE = 25000;
            if (updateActivities.length > ACTIVITY_CHUNK_SIZE) {
                splittedBulkActivities = [];
                while (updateActivities.length > ACTIVITY_CHUNK_SIZE) {
                    splittedBulkActivities.push(updateActivities.slice(0, ACTIVITY_CHUNK_SIZE));
                    updateActivities = updateActivities.slice(ACTIVITY_CHUNK_SIZE);
                }
                // push last leftover chunk
                if (updateActivities.length > 0) {
                    splittedBulkActivities.push(updateActivities);
                }
                for (const activityChunk of splittedBulkActivities) {
                    await userContext.database.activity.bulkCreate(activityChunk, {
                        updateOnDuplicate: ['body', 'url', 'title', 'attributes', 'channel'],
                    });
                }
            }
            else {
                await userContext.database.activity.bulkCreate(updateActivities, {
                    updateOnDuplicate: ['body', 'url', 'title', 'attributes', 'channel'],
                });
            }
            currentActivityCount += activities.length;
            currentOffset += activities.length;
        }
    }
};
async function getActivityCount(seq, tenantId) {
    const activityCountQuery = `
        select count(*) from activities a
        where a."tenantId"  = :tenantId
    `;
    const activityCountQueryParameters = {
        tenantId,
    };
    const activityCount = (await seq.query(activityCountQuery, {
        replacements: activityCountQueryParameters,
        type: sequelize_1.QueryTypes.SELECT,
    }))[0].count;
    return activityCount;
}
async function getActivities(seq, tenantId, limit, offset) {
    const activityQuery = `
        select * from activities a
        where a."tenantId"  = :tenantId
        ORDER  BY a."timestamp" DESC
        OFFSET :offset
        LIMIT  :limit
    `;
    const activityQueryParameters = {
        tenantId,
        offset,
        limit,
    };
    return seq.query(activityQuery, {
        replacements: activityQueryParameters,
        type: sequelize_1.QueryTypes.SELECT,
    });
}
function setObjectAttribute(obj, attributeName, platform, value) {
    if (obj[attributeName]) {
        obj[attributeName][platform] = value;
    }
    else {
        obj[attributeName] = {
            [platform]: value,
        };
    }
    return obj;
}
//# sourceMappingURL=2022-10-06-api-v1-transformations.js.map