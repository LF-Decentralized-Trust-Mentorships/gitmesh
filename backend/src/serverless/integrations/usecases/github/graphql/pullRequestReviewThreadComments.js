"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baseQuery_1 = __importDefault(require("./baseQuery"));
/* eslint class-methods-use-this: 0 */
class PullRequestReviewThreadCommentsQuery extends baseQuery_1.default {
    constructor(repo, reviewThreadId, githubToken, perPage = 50) {
        const pullRequestReviewThreadCommentsQuery = `{
      node(id: "${reviewThreadId}") {
        ... on PullRequestReviewThread {
          comments(first: ${perPage}, \${beforeCursor}) {
            pageInfo ${baseQuery_1.default.PAGE_SELECT}
            nodes {
              author {
                ... on User ${baseQuery_1.default.USER_SELECT}
              }
              pullRequestReview {
                submittedAt
                author {
                  ... on User ${baseQuery_1.default.USER_SELECT}
                }
              }
              bodyText
              url
              id
              createdAt
              pullRequest {
                url
                id
                title
                additions
                deletions
                changedFiles
                authorAssociation
                state
                repository{
                  url
                }
              }
            }
          }
        }
      }
    }`;
        super(githubToken, pullRequestReviewThreadCommentsQuery, 'pullRequestReviewThreadComments', perPage);
        this.repo = repo;
    }
    getEventData(result) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return {
            hasPreviousPage: (_c = (_b = (_a = result.node) === null || _a === void 0 ? void 0 : _a.comments) === null || _b === void 0 ? void 0 : _b.pageInfo) === null || _c === void 0 ? void 0 : _c.hasPreviousPage,
            startCursor: (_f = (_e = (_d = result.node) === null || _d === void 0 ? void 0 : _d.comments) === null || _e === void 0 ? void 0 : _e.pageInfo) === null || _f === void 0 ? void 0 : _f.startCursor,
            data: (_h = (_g = result.node) === null || _g === void 0 ? void 0 : _g.comments) === null || _h === void 0 ? void 0 : _h.nodes,
        };
    }
}
exports.default = PullRequestReviewThreadCommentsQuery;
//# sourceMappingURL=pullRequestReviewThreadComments.js.map