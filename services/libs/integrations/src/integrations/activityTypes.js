"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ACTIVITY_TYPE_SETTINGS = exports.UNKNOWN_ACTIVITY_TYPE_DISPLAY = void 0;
const types_1 = require("@gitmesh/types");
const types_2 = require("./devto/types");
const types_3 = require("./github/types");
const types_4 = require("./premium/linkedin/types");
const types_5 = require("./stackoverflow/types");
const types_6 = require("./twitter/types");
const types_7 = require("./slack/types");
const types_8 = require("./git/types");
const types_9 = require("./reddit/types");
const types_10 = require("./hackernews/types");
const common_1 = require("@gitmesh/common");
const types_11 = require("./discord/types");
const grid_1 = require("./github/grid");
const grid_2 = require("./devto/grid");
const grid_3 = require("./discord/grid");
const grid_4 = require("./hackernews/grid");
const grid_5 = require("./premium/linkedin/grid");
const grid_6 = require("./reddit/grid");
const grid_7 = require("./slack/grid");
const grid_8 = require("./twitter/grid");
const grid_9 = require("./stackoverflow/grid");
const types_12 = require("./discourse/types");
const grid_10 = require("./discourse/grid");
const grid_11 = require("./groupsio/grid");
const types_13 = require("./groupsio/types");
exports.UNKNOWN_ACTIVITY_TYPE_DISPLAY = {
    default: 'Conducted an activity',
    short: 'conducted an activity',
    channel: '',
};
const githubUrl = 'https://github.com';
const defaultGithubChannelFormatter = (channel) => {
    const channelSplit = channel.split('/');
    const organization = channelSplit[3];
    const repo = channelSplit[4];
    return `<a href="${githubUrl}/${organization}/${repo}" target="_blank">${repo}</a>`;
};
const defaultStackoverflowFormatter = (activity) => {
    if (activity.attributes.keywordMentioned && activity.attributes.tagMentioned) {
        return `<span class="gray notruncate">tagged with "${activity.attributes.tagMentioned}" and mentioning "${activity.attributes.keywordMentioned}"</span>`;
    }
    if (activity.attributes.keywordMentioned) {
        return `<span class="gray notruncate">mentioning "${activity.attributes.keywordMentioned}"</span>`;
    }
    if (activity.attributes.tagMentioned) {
        return `<span class="gray notruncate">tagged with "${activity.attributes.tagMentioned}"</span>`;
    }
    return '';
};
const cleanDiscourseUrl = (url) => {
    // https://discourse-web-aah2.onrender.com/t/test-webhook-topic-cool/26/5 -> remove /5 so only url to topic remains
    const urlSplit = url.split('/');
    urlSplit.pop();
    return urlSplit.join('/');
};
const defaultDiscourseFormatter = (activity) => {
    const topicUrl = cleanDiscourseUrl(activity.url);
    return `<a href="${topicUrl}" target="_blank">#${activity.channel}</a>`;
};
exports.DEFAULT_ACTIVITY_TYPE_SETTINGS = {
    [types_1.PlatformType.GITHUB]: {
        [types_3.GithubActivityType.DISCUSSION_STARTED]: {
            display: {
                default: 'started a discussion in {channel}',
                short: 'started a discussion',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: grid_1.GITHUB_GRID[types_3.GithubActivityType.DISCUSSION_STARTED].isContribution,
        },
        [types_3.GithubActivityType.DISCUSSION_COMMENT]: {
            display: {
                default: 'commented on a discussion in {channel}',
                short: 'commented on a discussion',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: grid_1.GITHUB_GRID[types_3.GithubActivityType.DISCUSSION_COMMENT].isContribution,
        },
        [types_3.GithubActivityType.FORK]: {
            display: {
                default: 'forked {channel}',
                short: 'forked',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: grid_1.GITHUB_GRID.fork.isContribution,
        },
        [types_3.GithubActivityType.ISSUE_CLOSED]: {
            display: {
                default: 'closed an issue in {channel}',
                short: 'closed an issue',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: grid_1.GITHUB_GRID[types_3.GithubActivityType.ISSUE_CLOSED].isContribution,
        },
        [types_3.GithubActivityType.ISSUE_OPENED]: {
            display: {
                default: 'opened a new issue in {channel}',
                short: 'opened an issue',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: grid_1.GITHUB_GRID[types_3.GithubActivityType.ISSUE_OPENED].isContribution,
        },
        [types_3.GithubActivityType.ISSUE_COMMENT]: {
            display: {
                default: 'commented on an issue in {channel}',
                short: 'commented on an issue',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: grid_1.GITHUB_GRID[types_3.GithubActivityType.ISSUE_COMMENT].isContribution,
        },
        [types_3.GithubActivityType.PULL_REQUEST_CLOSED]: {
            display: {
                default: 'closed a pull request in {channel}',
                short: 'closed a pull request',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: grid_1.GITHUB_GRID[types_3.GithubActivityType.PULL_REQUEST_CLOSED].isContribution,
        },
        [types_3.GithubActivityType.PULL_REQUEST_OPENED]: {
            display: {
                default: 'opened a new pull request in {channel}',
                short: 'opened a pull request',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: grid_1.GITHUB_GRID[types_3.GithubActivityType.PULL_REQUEST_OPENED].isContribution,
        },
        [types_3.GithubActivityType.PULL_REQUEST_COMMENT]: {
            display: {
                default: 'commented on a pull request in {channel}',
                short: 'commented on a pull request',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: grid_1.GITHUB_GRID[types_3.GithubActivityType.PULL_REQUEST_COMMENT].isContribution,
        },
        [types_3.GithubActivityType.STAR]: {
            display: {
                default: 'starred {channel}',
                short: 'starred',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: grid_1.GITHUB_GRID[types_3.GithubActivityType.STAR].isContribution,
        },
        [types_3.GithubActivityType.UNSTAR]: {
            display: {
                default: 'unstarred {channel}',
                short: 'unstarred',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: grid_1.GITHUB_GRID[types_3.GithubActivityType.UNSTAR].isContribution,
        },
        [types_3.GithubActivityType.PULL_REQUEST_MERGED]: {
            display: {
                default: 'merged pull request {self}',
                short: 'merged a pull request',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                    self: (activity) => {
                        var _a;
                        const prNumberAndTitle = `#${activity.url.split('/')[6]} ${(_a = activity.parent) === null || _a === void 0 ? void 0 : _a.title}`;
                        return `<a href="${activity.url}" target="_blank">${prNumberAndTitle}</a>`;
                    },
                },
            },
            isContribution: grid_1.GITHUB_GRID[types_3.GithubActivityType.PULL_REQUEST_MERGED].isContribution,
        },
        [types_3.GithubActivityType.PULL_REQUEST_ASSIGNED]: {
            display: {
                default: 'assigned pull request {self}',
                short: 'assigned a pull request',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                    self: (activity) => {
                        var _a;
                        const prNumberAndTitle = `#${activity.url.split('/')[6]} ${(_a = activity.parent) === null || _a === void 0 ? void 0 : _a.title}`;
                        return `<a href="${activity.url}" style="max-width:150px" target="_blank">${prNumberAndTitle}</a> to <a href="/members/${activity.objectMemberId}" target="_blank">${activity.objectMember.displayName}</a>`;
                    },
                },
            },
            isContribution: grid_1.GITHUB_GRID[types_3.GithubActivityType.PULL_REQUEST_ASSIGNED].isContribution,
        },
        [types_3.GithubActivityType.PULL_REQUEST_REVIEWED]: {
            display: {
                default: 'reviewed pull request {self}',
                short: 'reviewed a pull request',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                    self: (activity) => {
                        var _a;
                        const prNumberAndTitle = `#${activity.url.split('/')[6]} ${(_a = activity.parent) === null || _a === void 0 ? void 0 : _a.title}`;
                        return `<a href="${activity.url}" target="_blank">${prNumberAndTitle}</a>`;
                    },
                },
            },
            isContribution: grid_1.GITHUB_GRID[types_3.GithubActivityType.PULL_REQUEST_REVIEWED].isContribution,
        },
        [types_3.GithubActivityType.PULL_REQUEST_REVIEW_REQUESTED]: {
            display: {
                default: 'requested a review for pull request {self}',
                short: 'requested a pull request review',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                    self: (activity) => {
                        var _a;
                        const prNumberAndTitle = `#${activity.url.split('/')[6]} ${(_a = activity.parent) === null || _a === void 0 ? void 0 : _a.title}`;
                        return `<a href="${activity.url}" style="max-width:150px" target="_blank">${prNumberAndTitle}</a> from <a href="/members/${activity.objectMemberId}" target="_blank">${activity.objectMember.displayName}</a>`;
                    },
                },
            },
            isContribution: grid_1.GITHUB_GRID[types_3.GithubActivityType.PULL_REQUEST_REVIEW_REQUESTED].isContribution,
        },
        [types_3.GithubActivityType.PULL_REQUEST_REVIEW_THREAD_COMMENT]: {
            display: {
                default: 'commented while reviewing pull request {self}',
                short: 'commented on a pull request review',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                    self: (activity) => {
                        var _a;
                        const prNumberAndTitle = `#${activity.url.split('/')[6].split('#')[0]} ${(_a = activity.parent) === null || _a === void 0 ? void 0 : _a.title}`;
                        return `<a href="${activity.url}" style="max-width:150px" target="_blank">${prNumberAndTitle}</a>`;
                    },
                },
            },
            isContribution: grid_1.GITHUB_GRID[types_3.GithubActivityType.PULL_REQUEST_REVIEW_THREAD_COMMENT].isContribution,
        },
        [types_8.GitActivityType.AUTHORED_COMMIT]: {
            display: {
                default: 'authored a commit in {channel}',
                short: 'authored a commit',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: true,
        },
        [types_8.GitActivityType.REVIEWED_COMMIT]: {
            display: {
                default: 'reviewed a commit in {channel}',
                short: 'reviewed a commit',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: true,
        },
        [types_8.GitActivityType.TESTED_COMMIT]: {
            display: {
                default: 'tested a commit in {channel}',
                short: 'tested a commit',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: true,
        },
        [types_8.GitActivityType.CO_AUTHORED_COMMIT]: {
            display: {
                default: 'co-authored a commit in {channel}',
                short: 'co-authored a commit',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: true,
        },
        [types_8.GitActivityType.INFORMED_COMMIT]: {
            display: {
                default: 'informed a commit in {channel}',
                short: 'informed a commit',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: true,
        },
        [types_8.GitActivityType.INFLUENCED_COMMIT]: {
            display: {
                default: 'influenced a commit in {channel}',
                short: 'influenced a commit',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: true,
        },
        [types_8.GitActivityType.APPROVED_COMMIT]: {
            display: {
                default: 'approved a commit in {channel}',
                short: 'approved a commit',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: true,
        },
        [types_8.GitActivityType.COMMITTED_COMMIT]: {
            display: {
                default: 'committed a commit in {channel}',
                short: 'committed a commit',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: true,
        },
        [types_8.GitActivityType.REPORTED_COMMIT]: {
            display: {
                default: 'reported a commit in {channel}',
                short: 'reported a commit',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: true,
        },
        [types_8.GitActivityType.RESOLVED_COMMIT]: {
            display: {
                default: 'resolved a commit in {channel}',
                short: 'resolved a commit',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: true,
        },
        [types_8.GitActivityType.SIGNED_OFF_COMMIT]: {
            display: {
                default: 'signed off a commit in {channel}',
                short: 'signed off a commit',
                channel: '{channel}',
                formatter: {
                    channel: defaultGithubChannelFormatter,
                },
            },
            isContribution: true,
        },
    },
    [types_1.PlatformType.GIT]: {
        [types_8.GitActivityType.AUTHORED_COMMIT]: {
            display: {
                default: 'authored a commit in {channel}',
                short: 'authored a commit',
                channel: '{channel}',
            },
            isContribution: true,
        },
        [types_8.GitActivityType.REVIEWED_COMMIT]: {
            display: {
                default: 'reviewed a commit in {channel}',
                short: 'reviewed a commit',
                channel: '{channel}',
            },
            isContribution: true,
        },
        [types_8.GitActivityType.TESTED_COMMIT]: {
            display: {
                default: 'tested a commit in {channel}',
                short: 'tested a commit',
                channel: '{channel}',
            },
            isContribution: true,
        },
        [types_8.GitActivityType.CO_AUTHORED_COMMIT]: {
            display: {
                default: 'co-authored a commit in {channel}',
                short: 'co-authored a commit',
                channel: '{channel}',
            },
            isContribution: true,
        },
        [types_8.GitActivityType.INFORMED_COMMIT]: {
            display: {
                default: 'informed a commit in {channel}',
                short: 'informed a commit',
                channel: '{channel}',
            },
            isContribution: true,
        },
        [types_8.GitActivityType.INFLUENCED_COMMIT]: {
            display: {
                default: 'influenced a commit in {channel}',
                short: 'influenced a commit',
                channel: '{channel}',
            },
            isContribution: true,
        },
        [types_8.GitActivityType.APPROVED_COMMIT]: {
            display: {
                default: 'approved a commit in {channel}',
                short: 'approved a commit',
                channel: '{channel}',
            },
            isContribution: true,
        },
        [types_8.GitActivityType.COMMITTED_COMMIT]: {
            display: {
                default: 'committed a commit in {channel}',
                short: 'committed a commit',
                channel: '{channel}',
            },
            isContribution: true,
        },
        [types_8.GitActivityType.REPORTED_COMMIT]: {
            display: {
                default: 'reported a commit in {channel}',
                short: 'reported a commit',
                channel: '{channel}',
            },
            isContribution: true,
        },
        [types_8.GitActivityType.RESOLVED_COMMIT]: {
            display: {
                default: 'resolved a commit in {channel}',
                short: 'resolved a commit',
                channel: '{channel}',
            },
            isContribution: true,
        },
        [types_8.GitActivityType.SIGNED_OFF_COMMIT]: {
            display: {
                default: 'signed off a commit in {channel}',
                short: 'signed off a commit',
                channel: '{channel}',
            },
            isContribution: true,
        },
    },
    [types_1.PlatformType.DEVTO]: {
        [types_2.DevToActivityType.COMMENT]: {
            display: {
                default: 'commented on <a href="{attributes.articleUrl}" class="truncate max-w-2xs">{attributes.articleTitle}</a>',
                short: 'commented',
                channel: '<a href="{attributes.articleUrl}" class="truncate max-w-2xs">{attributes.articleTitle}</a>',
            },
            isContribution: grid_2.DEVTO_GRID[types_2.DevToActivityType.COMMENT].isContribution,
        },
    },
    [types_1.PlatformType.DISCORD]: {
        [types_11.DiscordActivityType.JOINED_GUILD]: {
            display: {
                default: 'joined server',
                short: 'joined server',
                channel: '',
            },
            isContribution: grid_3.DISCORD_GRID[types_11.DiscordActivityType.JOINED_GUILD].isContribution,
        },
        [types_11.DiscordActivityType.MESSAGE]: {
            display: {
                default: 'sent a message in <span class="text-brand-500 truncate max-w-2xs">#{channel}</span>',
                short: 'sent a message',
                channel: '<span class="text-brand-500 truncate max-w-2xs">#{channel}</span>',
            },
            isContribution: grid_3.DISCORD_GRID[types_11.DiscordActivityType.MESSAGE].isContribution,
        },
        [types_11.DiscordActivityType.THREAD_STARTED]: {
            display: {
                default: 'started a new thread',
                short: 'started a new thread',
                channel: '',
            },
            isContribution: grid_3.DISCORD_GRID[types_11.DiscordActivityType.THREAD_STARTED].isContribution,
        },
        [types_11.DiscordActivityType.THREAD_MESSAGE]: {
            display: {
                default: 'replied to a message in thread <span class="text-brand-500 truncate max-w-2xs">#{channel}</span> -> <span class="text-brand-500">{attributes.childChannel}</span>',
                short: 'replied to a message',
                channel: '<span class="text-brand-500 truncate max-w-2xs">thread #{channel}</span> -> <span class="text-brand-500">#{attributes.childChannel}</span>',
            },
            isContribution: grid_3.DISCORD_GRID[types_11.DiscordActivityType.THREAD_MESSAGE].isContribution,
        },
    },
    [types_1.PlatformType.HACKERNEWS]: {
        [types_10.HackerNewsActivityType.COMMENT]: {
            display: {
                default: 'commented on <a href="{attributes.parentUrl}" target="_blank">{attributes.parentTitle}</a>',
                short: 'commented',
                channel: '{channel}',
                formatter: {
                    channel: (channel) => {
                        if ((0, common_1.isUrl)(channel)) {
                            return `<a href="https://${channel}">${channel}</a>`;
                        }
                        return `<a href="">${channel}</a>`;
                    },
                },
            },
            isContribution: grid_4.HACKERNEWS_GRID[types_10.HackerNewsActivityType.COMMENT].isContribution,
        },
        [types_10.HackerNewsActivityType.POST]: {
            display: {
                default: 'posted mentioning {channel}',
                short: 'posted',
                channel: '{channel}',
                formatter: {
                    channel: (channel) => {
                        if ((0, common_1.isUrl)(channel)) {
                            return `<a href="https://${channel}">${channel}</a>`;
                        }
                        return `<a href="">${channel}</a>`;
                    },
                },
            },
            isContribution: grid_4.HACKERNEWS_GRID[types_10.HackerNewsActivityType.POST].isContribution,
        },
    },
    [types_1.PlatformType.LINKEDIN]: {
        [types_4.LinkedinActivityType.COMMENT]: {
            display: {
                default: 'commented on a post <a href="{attributes.postUrl}" target="_blank">{attributes.postBody}</a>',
                short: 'commented',
                channel: '<a href="{attributes.postUrl}" target="_blank">{attributes.postBody}</a>',
            },
            isContribution: grid_5.LINKEDIN_GRID[types_4.LinkedinActivityType.COMMENT].isContribution,
        },
        [types_4.LinkedinActivityType.REACTION]: {
            display: {
                default: 'reacted with <img src="/images/integrations/linkedin-reactions/{attributes.reactionType}.svg"> on a post <a href="{attributes.postUrl}" target="_blank">{attributes.postBody}</a>',
                short: 'reacted',
                channel: '<a href="{attributes.postUrl}" target="_blank">{attributes.postBody}</a>',
            },
            isContribution: grid_5.LINKEDIN_GRID[types_4.LinkedinActivityType.REACTION].isContribution,
        },
    },
    [types_1.PlatformType.REDDIT]: {
        [types_9.RedditActivityType.COMMENT]: {
            display: {
                default: 'commented in subreddit <a href="https://reddit.com/r/{channel}" target="_blank">r/{channel}</a>',
                short: 'commented on a post',
                channel: '<a href="https://reddit.com/r/{channel}" target="_blank">r/{channel}</a>',
            },
            isContribution: grid_6.REDDIT_GRID[types_9.RedditActivityType.COMMENT].isContribution,
        },
        [types_9.RedditActivityType.POST]: {
            display: {
                default: 'posted in subreddit <a href="https://reddit.com/r/{channel}" target="_blank">r/{channel}</a>',
                short: 'posted in subreddit',
                channel: '<a href="https://reddit.com/r/{channel}" target="_blank">r/{channel}</a>',
            },
            isContribution: grid_6.REDDIT_GRID[types_9.RedditActivityType.POST].isContribution,
        },
    },
    [types_1.PlatformType.SLACK]: {
        [types_7.SlackActivityType.JOINED_CHANNEL]: {
            display: {
                default: 'joined channel {channel}',
                short: 'joined channel',
                channel: '{channel}',
                formatter: {
                    channel: (channel) => {
                        if (channel) {
                            return `<span class="text-brand-500 truncate max-w-2xs">#${channel}</span>`;
                        }
                        return '';
                    },
                },
            },
            isContribution: grid_7.SLACK_GRID[types_7.SlackActivityType.JOINED_CHANNEL].isContribution,
        },
        [types_7.SlackActivityType.MESSAGE]: {
            display: {
                default: 'sent a message in {channel}',
                short: 'sent a message',
                channel: '{channel}',
                formatter: {
                    channel: (channel) => {
                        if (channel) {
                            return `<span class="text-brand-500 truncate max-w-2xs">#${channel}</span>`;
                        }
                        return '';
                    },
                },
            },
            isContribution: grid_7.SLACK_GRID[types_7.SlackActivityType.MESSAGE].isContribution,
        },
    },
    [types_1.PlatformType.TWITTER]: {
        [types_6.TwitterActivityType.HASHTAG]: {
            display: {
                default: 'posted a tweet',
                short: 'posted a tweet',
                channel: '',
            },
            isContribution: grid_8.TWITTER_GRID[types_6.TwitterActivityType.HASHTAG].isContribution,
        },
        [types_6.TwitterActivityType.FOLLOW]: {
            display: {
                default: 'followed you',
                short: 'followed you',
                channel: '',
            },
            isContribution: grid_8.TWITTER_GRID[types_6.TwitterActivityType.FOLLOW].isContribution,
        },
        [types_6.TwitterActivityType.MENTION]: {
            display: {
                default: 'mentioned you in a tweet',
                short: 'mentioned you',
                channel: '',
            },
            isContribution: grid_8.TWITTER_GRID[types_6.TwitterActivityType.MENTION].isContribution,
        },
    },
    [types_1.PlatformType.STACKOVERFLOW]: {
        [types_5.StackOverflowActivityType.QUESTION]: {
            display: {
                default: 'Asked a question {self}',
                short: 'asked a question',
                channel: '',
                formatter: {
                    self: defaultStackoverflowFormatter,
                },
            },
            isContribution: grid_9.STACKOVERFLOW_GRID[types_5.StackOverflowActivityType.QUESTION].isContribution,
        },
        [types_5.StackOverflowActivityType.ANSWER]: {
            display: {
                default: 'Answered a question {self}',
                short: 'answered a question',
                channel: '',
                formatter: {
                    self: defaultStackoverflowFormatter,
                },
            },
            isContribution: grid_9.STACKOVERFLOW_GRID[types_5.StackOverflowActivityType.ANSWER].isContribution,
        },
    },
    [types_1.PlatformType.DISCOURSE]: {
        [types_12.DiscourseActivityType.CREATE_TOPIC]: {
            display: {
                default: 'Created a topic {self}',
                short: 'created a topic',
                channel: '<span class="text-brand-500 truncate max-w-2xs">#{channel}</span>',
                formatter: {
                    self: defaultDiscourseFormatter,
                },
            },
            isContribution: grid_10.DISCOURSE_GRID[types_12.DiscourseActivityType.CREATE_TOPIC].isContribution,
        },
        [types_12.DiscourseActivityType.MESSAGE_IN_TOPIC]: {
            display: {
                default: 'Posted a message in {self}',
                short: 'posted a message',
                channel: '<span class="text-brand-500 truncate max-w-2xs">#{channel}</span>',
                formatter: {
                    self: defaultDiscourseFormatter,
                },
            },
            isContribution: grid_10.DISCOURSE_GRID[types_12.DiscourseActivityType.MESSAGE_IN_TOPIC].isContribution,
        },
        [types_12.DiscourseActivityType.JOIN]: {
            display: {
                default: 'Joined a forum',
                short: 'joined a forum',
                channel: '',
            },
            isContribution: grid_10.DISCOURSE_GRID[types_12.DiscourseActivityType.JOIN].isContribution,
        },
        [types_12.DiscourseActivityType.LIKE]: {
            display: {
                default: 'Liked a post in {self}',
                short: 'liked a post',
                channel: '<span class="text-brand-500 truncate max-w-2xs">#{channel}</span>',
                formatter: {
                    self: (activity) => `<a href="${activity.attributes.topicURL}" target="_blank">#${activity.channel}</a>`,
                },
            },
            isContribution: grid_10.DISCOURSE_GRID[types_12.DiscourseActivityType.LIKE].isContribution,
        },
    },
    [types_1.PlatformType.GROUPSIO]: {
        [types_13.GroupsioActivityType.MEMBER_JOIN]: {
            display: {
                default: 'Joined {channel}',
                short: 'joined',
                channel: '{channel}',
            },
            isContribution: grid_11.Groupsio_GRID[types_13.GroupsioActivityType.MEMBER_JOIN].isContribution,
        },
        [types_13.GroupsioActivityType.MESSAGE]: {
            display: {
                default: 'Sent a message in {channel}',
                short: 'sent a message',
                channel: '{channel}',
            },
            isContribution: grid_11.Groupsio_GRID[types_13.GroupsioActivityType.MESSAGE].isContribution,
        },
        [types_13.GroupsioActivityType.MEMBER_LEAVE]: {
            display: {
                default: 'Left {channel}',
                short: 'left',
                channel: '{channel}',
            },
            isContribution: grid_11.Groupsio_GRID[types_13.GroupsioActivityType.MEMBER_LEAVE].isContribution,
        },
    },
};
//# sourceMappingURL=activityTypes.js.map