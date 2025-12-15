"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.weeklyAnalyticsEmailsWorker = void 0;
const moment_1 = __importDefault(require("moment"));
const redis_1 = require("@gitmesh/redis");
const sequelize_1 = require("sequelize");
const html_to_text_1 = require("html-to-text");
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const integrations_1 = require("@gitmesh/integrations");
const cubejs_1 = require("@gitmesh/cubejs");
const getUserContext_1 = __importDefault(require("../../../../../database/utils/getUserContext"));
const emailSender_1 = __importDefault(require("../../../../../services/emailSender"));
const conversationService_1 = __importDefault(require("../../../../../services/conversationService"));
const conf_1 = require("../../../../../conf");
const getStage_1 = __importDefault(require("../../../../../services/helpers/getStage"));
const userRepository_1 = __importDefault(require("../../../../../database/repositories/userRepository"));
const conversationRepository_1 = __importDefault(require("../../../../../database/repositories/conversationRepository"));
const recurringEmailsHistoryRepository_1 = __importDefault(require("../../../../../database/repositories/recurringEmailsHistoryRepository"));
const nodeWorkerSQS_1 = require("../../../../utils/nodeWorkerSQS");
const workerTypes_1 = require("../../../../types/workerTypes");
const recurringEmailsHistoryTypes_1 = require("../../../../../types/recurringEmailsHistoryTypes");
const segmentRepository_1 = __importDefault(require("../../../../../database/repositories/segmentRepository"));
const log = (0, logging_1.getServiceChildLogger)('weeklyAnalyticsEmailsWorker');
const MAX_RETRY_COUNT = 5;
/**
 * Sends weekly analytics emails of a given tenant
 * to all users of the tenant.
 * Data sent is for the last week.
 * @param tenantId
 */
async function weeklyAnalyticsEmailsWorker(tenantId) {
    log.info(tenantId, `Processing tenant's weekly emails...`);
    const response = await getAnalyticsData(tenantId);
    const userContext = await (0, getUserContext_1.default)(tenantId);
    if (response.shouldRetry) {
        if (conf_1.WEEKLY_EMAILS_CONFIG.enabled !== 'true') {
            log.info(`Weekly emails are disabled. Not retrying.`);
            return {
                status: 200,
                msg: `Weekly emails are disabled. Not retrying.`,
                emailSent: false,
            };
        }
        log.error(response.error, 'Exception while getting analytics data. Retrying with a new message.');
        // expception while getting data. send new node message and return
        await (0, nodeWorkerSQS_1.sendNodeWorkerMessage)(tenantId, {
            type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
            tenant: tenantId,
            service: 'weekly-analytics-emails',
        });
        return {
            status: 400,
            msg: `Exception while getting analytics data. Retrying with a new mq message.`,
            emailSent: false,
        };
    }
    if (!userContext.currentUser) {
        const message = `Tenant(${tenantId}) doesn't have any active users.`;
        log.info(message);
        return {
            status: 200,
            msg: message,
            emailSent: false,
        };
    }
    const { dateTimeStartThisWeek, dateTimeEndThisWeek, totalMembersThisWeek, totalMembersPreviousWeek, activeMembersThisWeek, activeMembersPreviousWeek, newMembersThisWeek, newMembersPreviousWeek, mostActiveMembers, totalOrganizationsThisWeek, totalOrganizationsPreviousWeek, activeOrganizationsThisWeek, activeOrganizationsPreviousWeek, newOrganizationsThisWeek, newOrganizationsPreviousWeek, mostActiveOrganizations, totalActivitiesThisWeek, totalActivitiesPreviousWeek, newActivitiesThisWeek, newActivitiesPreviousWeek, topActivityTypes, conversations, activeTenantIntegrations, } = response.data;
    const rehRepository = new recurringEmailsHistoryRepository_1.default(userContext);
    const isEmailAlreadySent = (await rehRepository.findByWeekOfYear(tenantId, (0, moment_1.default)().utc().startOf('isoWeek').subtract(7, 'days').isoWeek().toString(), recurringEmailsHistoryTypes_1.RecurringEmailType.WEEKLY_ANALYTICS)) !== null;
    if (activeTenantIntegrations.length > 0 && !isEmailAlreadySent) {
        log.info(tenantId, ` has completed integrations. Eligible for weekly emails.. `);
        const allTenantUsers = await userRepository_1.default.findAllUsersOfTenant(tenantId);
        const advancedSuppressionManager = {
            groupId: parseInt(conf_1.SENDGRID_CONFIG.weeklyAnalyticsUnsubscribeGroupId, 10),
            groupsToDisplay: [parseInt(conf_1.SENDGRID_CONFIG.weeklyAnalyticsUnsubscribeGroupId, 10)],
        };
        const emailSentTo = [];
        for (const user of allTenantUsers) {
            if (user.email && user.emailVerified) {
                const userFirstName = user.firstName ? user.firstName : user.email.split('@')[0];
                const data = {
                    dateRangePretty: `${dateTimeStartThisWeek.format('D MMM YYYY')} - ${dateTimeEndThisWeek.format('D MMM YYYY')}`,
                    members: {
                        total: Object.assign({ value: totalMembersThisWeek }, getChangeAndDirection(totalMembersThisWeek, totalMembersPreviousWeek)),
                        new: Object.assign({ value: newMembersThisWeek }, getChangeAndDirection(newMembersThisWeek, newMembersPreviousWeek)),
                        active: Object.assign({ value: activeMembersThisWeek }, getChangeAndDirection(activeMembersThisWeek, activeMembersPreviousWeek)),
                        mostActive: mostActiveMembers,
                    },
                    organizations: {
                        total: Object.assign({ value: totalOrganizationsThisWeek }, getChangeAndDirection(totalOrganizationsThisWeek, totalOrganizationsPreviousWeek)),
                        new: Object.assign({ value: newOrganizationsThisWeek }, getChangeAndDirection(newOrganizationsThisWeek, newOrganizationsPreviousWeek)),
                        active: Object.assign({ value: activeOrganizationsThisWeek }, getChangeAndDirection(activeOrganizationsThisWeek, activeOrganizationsPreviousWeek)),
                        mostActive: mostActiveOrganizations,
                    },
                    activities: {
                        total: Object.assign({ value: totalActivitiesThisWeek }, getChangeAndDirection(totalActivitiesThisWeek, totalActivitiesPreviousWeek)),
                        new: Object.assign({ value: newActivitiesThisWeek }, getChangeAndDirection(newActivitiesThisWeek, newActivitiesPreviousWeek)),
                        topActivityTypes,
                    },
                    conversations,
                    tenant: {
                        name: userContext.currentTenant.name,
                    },
                    user: {
                        name: userFirstName,
                    },
                };
                await new emailSender_1.default(emailSender_1.default.TEMPLATES.WEEKLY_ANALYTICS, data).sendTo(user.email, advancedSuppressionManager);
                await new emailSender_1.default(emailSender_1.default.TEMPLATES.WEEKLY_ANALYTICS, data).sendTo('team@gitmesh.dev', advancedSuppressionManager);
                emailSentTo.push(user.email);
            }
        }
        const reHistory = await rehRepository.create({
            tenantId,
            type: recurringEmailsHistoryTypes_1.RecurringEmailType.WEEKLY_ANALYTICS,
            weekOfYear: dateTimeStartThisWeek.isoWeek().toString(),
            emailSentAt: (0, moment_1.default)().toISOString(),
            emailSentTo,
        });
        log.info({ receipt: reHistory }, `Email sent!`);
        return { status: 200, emailSent: true };
    }
    if (isEmailAlreadySent) {
        log.warn({ tenantId }, 'E-mail is already sent for this tenant this week. Skipping!');
    }
    else {
        log.info({ tenantId }, 'No active integrations present in the tenant. Email will not be sent.');
    }
    return {
        status: 200,
        msg: `No active integrations present in the tenant. Email will not be sent.`,
        emailSent: false,
    };
}
exports.weeklyAnalyticsEmailsWorker = weeklyAnalyticsEmailsWorker;
async function getAnalyticsData(tenantId) {
    try {
        const s3Url = `https://${conf_1.S3_CONFIG.microservicesAssetsBucket}-${(0, getStage_1.default)()}.s3.eu-central-1.amazonaws.com`;
        const unixEpoch = moment_1.default.unix(0);
        const dateTimeEndThisWeek = (0, moment_1.default)().utc().startOf('isoWeek');
        const dateTimeStartThisWeek = (0, moment_1.default)().utc().startOf('isoWeek').subtract(7, 'days');
        const dateTimeEndPreviousWeek = dateTimeStartThisWeek.clone();
        const dateTimeStartPreviousWeek = dateTimeStartThisWeek.clone().subtract(7, 'days');
        const userContext = await (0, getUserContext_1.default)(tenantId);
        const cjs = new cubejs_1.CubeJsService();
        const segmentRepository = new segmentRepository_1.default(userContext);
        const subprojects = await segmentRepository.querySubprojects({});
        const segmentIds = subprojects.rows.map((subproject) => subproject.id);
        // tokens should be set for each tenant
        await cjs.init(tenantId, segmentIds);
        // members
        const totalMembersThisWeek = await cubejs_1.CubeJsRepository.getNewMembers(cjs, unixEpoch, dateTimeEndThisWeek);
        const totalMembersPreviousWeek = await cubejs_1.CubeJsRepository.getNewMembers(cjs, unixEpoch, dateTimeEndPreviousWeek);
        const activeMembersThisWeek = await cubejs_1.CubeJsRepository.getActiveMembers(cjs, dateTimeStartThisWeek, dateTimeEndThisWeek);
        const activeMembersPreviousWeek = await cubejs_1.CubeJsRepository.getActiveMembers(cjs, dateTimeStartPreviousWeek, dateTimeEndPreviousWeek);
        const newMembersThisWeek = await cubejs_1.CubeJsRepository.getNewMembers(cjs, dateTimeStartThisWeek, dateTimeEndThisWeek);
        const newMembersPreviousWeek = await cubejs_1.CubeJsRepository.getNewMembers(cjs, dateTimeStartPreviousWeek, dateTimeEndPreviousWeek);
        const mostActiveMembers = (await userContext.database.sequelize.query(`
      select 
        count(a.id) as "activityCount",
        m."displayName" as name,
        m.attributes->'avatarUrl'->>'default' as "avatarUrl"
      from members m
      inner join activities a on m.id = a."memberId"
      where m."tenantId" = :tenantId
        and a.timestamp between :startDate and :endDate
        and coalesce(m.attributes->'isTeamMember'->>'default', 'false')::boolean is false
        and coalesce(m.attributes->'isBot'->>'default', 'false')::boolean is false
      group by m.id
      order by count(a.id) desc
      limit 5;`, {
            replacements: {
                tenantId,
                startDate: dateTimeStartThisWeek.toISOString(),
                endDate: dateTimeEndThisWeek.toISOString(),
            },
            type: sequelize_1.QueryTypes.SELECT,
        })).map((m) => {
            if (!m.avatarUrl) {
                m.avatarUrl = `${s3Url}/email/member-placeholder.png`;
            }
            return m;
        });
        // organizations
        const totalOrganizationsThisWeek = await cubejs_1.CubeJsRepository.getNewOrganizations(cjs, unixEpoch, dateTimeEndThisWeek);
        const totalOrganizationsPreviousWeek = await cubejs_1.CubeJsRepository.getNewOrganizations(cjs, unixEpoch, dateTimeEndPreviousWeek);
        const activeOrganizationsThisWeek = await cubejs_1.CubeJsRepository.getActiveOrganizations(cjs, dateTimeStartThisWeek, dateTimeEndThisWeek);
        const activeOrganizationsPreviousWeek = await cubejs_1.CubeJsRepository.getActiveOrganizations(cjs, dateTimeStartPreviousWeek, dateTimeEndPreviousWeek);
        const newOrganizationsThisWeek = await cubejs_1.CubeJsRepository.getNewOrganizations(cjs, dateTimeStartThisWeek, dateTimeEndThisWeek);
        const newOrganizationsPreviousWeek = await cubejs_1.CubeJsRepository.getNewOrganizations(cjs, dateTimeStartPreviousWeek, dateTimeEndPreviousWeek);
        const mostActiveOrganizations = (await userContext.database.sequelize.query(`
      select count(a.id) as "activityCount",
         o."displayName" as name,
         o.logo as "avatarUrl"
      from organizations o
        inner join "memberOrganizations" mo
          on o.id = mo."organizationId"
          and mo."deletedAt" is null
        inner join members m on mo."memberId" = m.id
        inner join activities a on m.id = a."memberId"
      where m."tenantId" = :tenantId
        and a.timestamp between :startDate and :endDate
        and coalesce(m.attributes->'isTeamMember'->>'default', 'false')::boolean is false
        and coalesce(m.attributes->'isBot'->>'default', 'false')::boolean is false
      group by o.id
      order by count(a.id) desc
      limit 5;`, {
            replacements: {
                tenantId,
                startDate: dateTimeStartThisWeek.toISOString(),
                endDate: dateTimeEndThisWeek.toISOString(),
            },
            type: sequelize_1.QueryTypes.SELECT,
        })).map((o) => {
            if (!o.avatarUrl) {
                o.avatarUrl = `${s3Url}/email/organization-placeholder.png`;
            }
            return o;
        });
        // activities
        const totalActivitiesThisWeek = await cubejs_1.CubeJsRepository.getNewActivities(cjs, unixEpoch, dateTimeEndThisWeek);
        const totalActivitiesPreviousWeek = await cubejs_1.CubeJsRepository.getNewActivities(cjs, unixEpoch, dateTimeEndPreviousWeek);
        const newActivitiesThisWeek = await cubejs_1.CubeJsRepository.getNewActivities(cjs, dateTimeStartThisWeek, dateTimeEndThisWeek);
        const newActivitiesPreviousWeek = await cubejs_1.CubeJsRepository.getNewActivities(cjs, dateTimeStartPreviousWeek, dateTimeEndPreviousWeek);
        let topActivityTypes = await userContext.database.sequelize.query(`
      select sum(count(*)) OVER () as "totalCount",
         count(*)              as count,
         a.type,
         a.platform
      from activities a
      where a."tenantId" = :tenantId
        and a.timestamp between :startDate and :endDate
      group by a.type, a.platform
      order by count(*) desc
      limit 5;`, {
            replacements: {
                tenantId,
                startDate: dateTimeStartThisWeek.toISOString(),
                endDate: dateTimeEndThisWeek.toISOString(),
            },
            type: sequelize_1.QueryTypes.SELECT,
        });
        topActivityTypes = topActivityTypes.map((a) => {
            const displayOptions = integrations_1.ActivityDisplayService.getDisplayOptions({
                platform: a.platform,
                type: a.type,
            }, segmentRepository_1.default.getActivityTypes(userContext), [types_1.ActivityDisplayVariant.SHORT]);
            const prettyName = displayOptions.short;
            a.type = prettyName[0].toUpperCase() + prettyName.slice(1);
            a.percentage = Number((a.count / a.totalCount) * 100).toFixed(2);
            a.platformIcon = `${s3Url}/email/${a.platform}.png`;
            return a;
        });
        // conversations
        const cs = new conversationService_1.default(userContext);
        const conversations = await Promise.all((await userContext.database.sequelize.query(`
      select
          c.id
      from conversations c
          join activities a on a."conversationId" = c.id
      where a."tenantId" = :tenantId
        and a.timestamp between :startDate and :endDate
      group by c.id
      order by count(a.id) desc
      limit 3;`, {
            replacements: {
                tenantId,
                startDate: dateTimeStartThisWeek.toISOString(),
                endDate: dateTimeEndThisWeek.toISOString(),
            },
            type: sequelize_1.QueryTypes.SELECT,
        })).map(async (c) => {
            const conversationLazyLoaded = await cs.findById(c.id);
            const conversationStarterActivity = conversationLazyLoaded.activities[0];
            c.conversationStartedFromNow = (0, moment_1.default)(conversationStarterActivity.timestamp).fromNow();
            const replyActivities = conversationLazyLoaded.activities.slice(1);
            c.replyCount = replyActivities.length;
            c.memberCount = await conversationRepository_1.default.getTotalMemberCount(replyActivities);
            c.platform = conversationStarterActivity.platform;
            c.body = conversationStarterActivity.title
                ? (0, html_to_text_1.convert)(conversationStarterActivity.title)
                : (0, html_to_text_1.convert)(conversationStarterActivity.body);
            c.platformIcon = `${s3Url}/email/${conversationStarterActivity.platform}.png`;
            const displayOptions = integrations_1.ActivityDisplayService.getDisplayOptions(conversationStarterActivity, segmentRepository_1.default.getActivityTypes(userContext), [types_1.ActivityDisplayVariant.SHORT]);
            let prettyChannel = conversationStarterActivity.channel;
            let prettyChannelHTML = `<span style='text-decoration:none;color:#4B5563'>${prettyChannel}</span>`;
            if (conversationStarterActivity.platform === types_1.PlatformType.GITHUB) {
                const prettyChannelSplitted = prettyChannel.split('/');
                prettyChannel = prettyChannelSplitted[prettyChannelSplitted.length - 1];
                prettyChannelHTML = `<span style='color:#1A59E8'><a target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;color:#1A59E8;font-size:14px;line-height:14px" href="${conversationStarterActivity.channel}">${prettyChannel}</a></span>`;
            }
            c.description = `${displayOptions.short} in ${prettyChannelHTML}`;
            c.sourceLink = conversationStarterActivity.url;
            c.member = conversationStarterActivity.member.displayName;
            return c;
        }));
        const activeTenantIntegrations = await userContext.database.sequelize.query(`
        select * from integrations i
        where i."tenantId" = :tenantId
        and i.status = 'done'
        and i."deletedAt" is null
        limit 1;`, {
            replacements: {
                tenantId,
            },
            type: sequelize_1.QueryTypes.SELECT,
        });
        return {
            shouldRetry: false,
            data: {
                dateTimeStartThisWeek,
                dateTimeEndThisWeek,
                dateTimeStartPreviousWeek,
                dateTimeEndPreviousWeek,
                totalMembersThisWeek,
                totalMembersPreviousWeek,
                activeMembersThisWeek,
                activeMembersPreviousWeek,
                newMembersThisWeek,
                newMembersPreviousWeek,
                mostActiveMembers,
                totalOrganizationsThisWeek,
                totalOrganizationsPreviousWeek,
                activeOrganizationsThisWeek,
                activeOrganizationsPreviousWeek,
                newOrganizationsThisWeek,
                newOrganizationsPreviousWeek,
                mostActiveOrganizations,
                totalActivitiesThisWeek,
                totalActivitiesPreviousWeek,
                newActivitiesThisWeek,
                newActivitiesPreviousWeek,
                topActivityTypes,
                conversations,
                activeTenantIntegrations,
            },
        };
    }
    catch (e) {
        // check redis for retry count
        const redis = await (0, redis_1.getRedisClient)(conf_1.REDIS_CONFIG, true);
        const weeklyEmailsRetryCountsCache = new redis_1.RedisCache('weeklyEmailsRetryCounts', redis, log);
        const retryCount = await weeklyEmailsRetryCountsCache.get(tenantId);
        if (!retryCount) {
            weeklyEmailsRetryCountsCache.set(tenantId, '0', 432000); // set the ttl for 5 days
            return {
                shouldRetry: true,
                data: {},
                error: e,
            };
        }
        const parsedRetryCount = parseInt(retryCount, 10);
        if (parsedRetryCount < MAX_RETRY_COUNT) {
            log.info(`Current retryCount for tenant is: ${retryCount}, trying to send the e-mail again!`);
            // increase retryCount and retry the email
            weeklyEmailsRetryCountsCache.set(tenantId, (parsedRetryCount + 1).toString(), 432000);
            return {
                shouldRetry: true,
                data: {},
                error: e,
            };
        }
        log.info({ error: JSON.stringify(e) }, `Retried total of ${MAX_RETRY_COUNT} times. Skipping sending e-mail!`);
        return {
            shouldRetry: false,
            data: {},
            error: e,
        };
    }
}
function getChangeAndDirection(thisWeekValue, previousWeekValue) {
    let changeAndDirection;
    if (thisWeekValue > previousWeekValue) {
        changeAndDirection = {
            changeVsLastWeek: thisWeekValue - previousWeekValue,
            changeVsLastWeekPercentage: Number(((thisWeekValue - previousWeekValue) / thisWeekValue) * 100).toFixed(2),
            changeVsLastWeekDerivative: 'increasing',
        };
    }
    else if (thisWeekValue === previousWeekValue) {
        changeAndDirection = {
            changeVsLastWeek: 0,
            changeVsLastWeekPercentage: 0,
            changeVsLastWeekDerivative: 'equal',
        };
    }
    else {
        changeAndDirection = {
            changeVsLastWeek: previousWeekValue - thisWeekValue,
            changeVsLastWeekPercentage: Number(((previousWeekValue - thisWeekValue) / previousWeekValue) * 100).toFixed(2),
            changeVsLastWeekDerivative: 'decreasing',
        };
    }
    return changeAndDirection;
}
//# sourceMappingURL=weeklyAnalyticsEmailsWorker.js.map