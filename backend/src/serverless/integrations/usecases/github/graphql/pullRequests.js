"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baseQuery_1 = __importDefault(require("./baseQuery"));
/* eslint class-methods-use-this: 0 */
class PullRequestsQuery extends baseQuery_1.default {
    constructor(repo, githubToken, perPage = 20) {
        const pullRequestsQuery = `{
            repository(owner: "${repo.owner}", name: "${repo.name}") {
              pullRequests(last: ${perPage}, \${beforeCursor}) {
                pageInfo ${baseQuery_1.default.PAGE_SELECT}
                nodes {
                    author {
                        ... on User ${baseQuery_1.default.USER_SELECT}
                    }
                    bodyText
                    state
                    title
                    id
                    url
                    createdAt
                    number
                    additions
                    deletions
                    changedFiles
                    authorAssociation
                    labels(first: 10) {
                      nodes {
                        name
                      }
                    }
                    timelineItems(
                      first: 100
                      itemTypes: [PULL_REQUEST_REVIEW, MERGED_EVENT, ASSIGNED_EVENT, REVIEW_REQUESTED_EVENT, CLOSED_EVENT]
                    ) {
                      nodes {
                        ... on ReviewRequestedEvent {
                          __typename
                          id
                          createdAt
                          actor {
                            ... on User ${baseQuery_1.default.USER_SELECT}
                          }
                          requestedReviewer {
                            ... on User ${baseQuery_1.default.USER_SELECT}
                          }
                        }
                        ... on PullRequestReview {
                          __typename
                          id
                          state
                          submittedAt
                          body
                          author {
                            ... on User ${baseQuery_1.default.USER_SELECT}
                          }
                        }
                        ... on AssignedEvent {
                          __typename
                          id
                          assignee {
                            ... on User ${baseQuery_1.default.USER_SELECT}
                          }
                          actor {
                            ... on User ${baseQuery_1.default.USER_SELECT}
                          }
                          createdAt
                        }
                        ... on MergedEvent {
                          __typename
                          id
                          createdAt
                          actor {
                            ... on User ${baseQuery_1.default.USER_SELECT}
                          }
                          createdAt
                        }
                        ... on ClosedEvent{
                          __typename
                          id
                          actor {
                            ... on User ${baseQuery_1.default.USER_SELECT}
                          }
                          createdAt
                        }
                      }
                    }
                }
              }
            }
          }`;
        super(githubToken, pullRequestsQuery, 'pullRequests', perPage);
        this.repo = repo;
    }
    getEventData(result) {
        var _a, _b;
        return Object.assign(Object.assign({}, super.getEventData(result)), { data: (_b = (_a = result.repository) === null || _a === void 0 ? void 0 : _a.pullRequests) === null || _b === void 0 ? void 0 : _b.nodes });
    }
}
exports.default = PullRequestsQuery;
//# sourceMappingURL=pullRequests.js.map