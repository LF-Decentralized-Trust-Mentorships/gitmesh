"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyActivityTypes = void 0;
const types_1 = require("@gitmesh/types");
const types_2 = require("./github/types");
const types_3 = require("./hackernews/types");
const types_4 = require("./reddit/types");
exports.prettyActivityTypes = {
    [types_1.PlatformType.GITHUB]: {
        [types_2.GithubActivityType.FORK]: 'forked',
        [types_2.GithubActivityType.STAR]: 'starred',
        [types_2.GithubActivityType.UNSTAR]: 'unstarred',
        'pull_request-open': 'opened a new pull request',
        [types_2.GithubActivityType.PULL_REQUEST_OPENED]: 'opened a new pull request',
        'pull_request-close': 'closed a pull request',
        [types_2.GithubActivityType.PULL_REQUEST_CLOSED]: 'closed a pull request',
        'issues-open': 'opened a new issue',
        [types_2.GithubActivityType.ISSUE_OPENED]: 'opened a new issue',
        'issues-close': 'closed an issue',
        [types_2.GithubActivityType.ISSUE_CLOSED]: 'closed an issue',
        [types_2.GithubActivityType.ISSUE_COMMENT]: 'commented on an issue',
        [types_2.GithubActivityType.PULL_REQUEST_COMMENT]: 'commented on a pull request',
        [types_2.GithubActivityType.DISCUSSION_STARTED]: 'started a discussion',
        [types_2.GithubActivityType.DISCUSSION_COMMENT]: 'commented on a discussion',
        contributed_to_community: 'contributed to community',
        joined_community: 'joined community',
    },
    [types_1.PlatformType.DISCORD]: {
        contributed_to_community: 'contributed to community',
        joined_community: 'joined community',
        message: 'sent a message',
        replied: 'replied to a message',
        replied_thread: 'replied to a thread',
        thread_started: 'started a new thread',
        started_thread: 'started a new thread',
        joined_guild: 'joined server',
    },
    [types_1.PlatformType.SLACK]: {
        contributed_to_community: 'contributed to community',
        joined_community: 'joined community',
        message: 'sent a message',
        replied: 'replied to a message',
        replied_thread: 'replied to a thread',
        file_share: 'shared a file',
        reaction_added: 'reacted to a message',
        channel_joined: 'joined channel',
        left_channel: 'left channel',
    },
    [types_1.PlatformType.TWITTER]: {
        contributed_to_community: 'contributed to community',
        joined_community: 'joined community',
        mention: 'mentioned you in a tweet',
        hashtag: 'posted a tweet',
        follow: 'followed you',
    },
    [types_1.PlatformType.DEVTO]: {
        comment: 'comment',
    },
    [types_1.PlatformType.HACKERNEWS]: {
        [types_3.HackerNewsActivityType.POST]: 'posted',
        [types_3.HackerNewsActivityType.COMMENT]: 'commented ',
    },
    [types_1.PlatformType.REDDIT]: {
        [types_4.RedditActivityType.POST]: 'posted',
        [types_4.RedditActivityType.COMMENT]: 'commented',
    },
    [types_1.PlatformType.LINKEDIN]: {
        comment: 'commented',
        reaction: 'reacted',
    },
};
//# sourceMappingURL=prettyActivityTypes.js.map