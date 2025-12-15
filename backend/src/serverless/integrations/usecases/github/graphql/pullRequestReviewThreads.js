"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baseQuery_1 = __importDefault(require("./baseQuery"));
/* eslint class-methods-use-this: 0 */
class PullRequestReviewThreadsQuery extends baseQuery_1.default {
    constructor(repo, pullRequestNumber, githubToken, perPage = 100) {
        const pullRequestReviewThreadsQuery = `{
        repository(name: "${repo.name}", owner: "${repo.owner}") {
          pullRequest(number: ${pullRequestNumber}) {
            id
            reviewDecision
            reviewThreads(first: ${perPage}, \${beforeCursor}) {
              pageInfo ${baseQuery_1.default.PAGE_SELECT}
              nodes {
                id
              }
            }
          }
        }
      }`;
        super(githubToken, pullRequestReviewThreadsQuery, 'pullRequestReviewThreads', perPage);
        this.repo = repo;
    }
    getEventData(result) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return {
            hasPreviousPage: (_d = (_c = (_b = (_a = result.repository) === null || _a === void 0 ? void 0 : _a.pullRequest) === null || _b === void 0 ? void 0 : _b.reviewThreads) === null || _c === void 0 ? void 0 : _c.pageInfo) === null || _d === void 0 ? void 0 : _d.hasPreviousPage,
            startCursor: (_h = (_g = (_f = (_e = result.repository) === null || _e === void 0 ? void 0 : _e.pullRequest) === null || _f === void 0 ? void 0 : _f.reviewThreads) === null || _g === void 0 ? void 0 : _g.pageInfo) === null || _h === void 0 ? void 0 : _h.startCursor,
            data: (_l = (_k = (_j = result.repository) === null || _j === void 0 ? void 0 : _j.pullRequest) === null || _k === void 0 ? void 0 : _k.reviewThreads) === null || _l === void 0 ? void 0 : _l.nodes,
        };
    }
}
exports.default = PullRequestReviewThreadsQuery;
//# sourceMappingURL=pullRequestReviewThreads.js.map