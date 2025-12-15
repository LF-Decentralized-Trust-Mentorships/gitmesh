"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GITHUB_GRID = void 0;
const types_1 = require("./types");
exports.GITHUB_GRID = {
    [types_1.GithubActivityType.DISCUSSION_STARTED]: {
        score: 8,
        isContribution: true,
    },
    [types_1.GithubActivityType.DISCUSSION_COMMENT]: {
        score: 6,
        isContribution: true,
    },
    [types_1.GithubActivityType.FORK]: {
        score: 4,
        isContribution: false,
    },
    [types_1.GithubActivityType.ISSUE_CLOSED]: {
        score: 6,
        isContribution: true,
    },
    [types_1.GithubActivityType.ISSUE_OPENED]: {
        score: 8,
        isContribution: true,
    },
    [types_1.GithubActivityType.ISSUE_COMMENT]: {
        score: 6,
        isContribution: true,
    },
    [types_1.GithubActivityType.PULL_REQUEST_CLOSED]: {
        score: 8,
        isContribution: true,
    },
    [types_1.GithubActivityType.PULL_REQUEST_OPENED]: {
        score: 10,
        isContribution: true,
    },
    [types_1.GithubActivityType.PULL_REQUEST_COMMENT]: {
        score: 6,
        isContribution: true,
    },
    [types_1.GithubActivityType.STAR]: {
        score: 2,
        isContribution: false,
    },
    [types_1.GithubActivityType.UNSTAR]: {
        score: -2,
        isContribution: false,
    },
    [types_1.GithubActivityType.PULL_REQUEST_MERGED]: {
        score: 6,
        isContribution: true,
    },
    [types_1.GithubActivityType.PULL_REQUEST_ASSIGNED]: {
        score: 2,
        isContribution: false,
    },
    [types_1.GithubActivityType.PULL_REQUEST_REVIEWED]: {
        score: 8,
        isContribution: true,
    },
    [types_1.GithubActivityType.PULL_REQUEST_REVIEW_REQUESTED]: {
        score: 2,
        isContribution: false,
    },
    [types_1.GithubActivityType.PULL_REQUEST_REVIEW_THREAD_COMMENT]: {
        score: 6,
        isContribution: true,
    },
    [types_1.GithubActivityType.AUTHORED_COMMIT]: {
        score: 2,
        isContribution: true,
    },
};
//# sourceMappingURL=grid.js.map