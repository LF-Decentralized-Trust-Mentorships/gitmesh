"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baseQuery_1 = __importDefault(require("./baseQuery"));
/* eslint class-methods-use-this: 0 */
class PullRequestCommitsQuery extends baseQuery_1.default {
    constructor(repo, pullRequestNumber, githubToken, perPage = 100, maxAuthors = 1) {
        const pullRequestCommitsQuery = `{
      repository(name: "${repo.name}", owner: "${repo.owner}") {
        pullRequest(number: ${pullRequestNumber}) {
          id
          number
          baseRefName
          headRefName
          commits(first: ${perPage}, \${beforeCursor}) {
            pageInfo ${baseQuery_1.default.PAGE_SELECT}
            nodes {
              commit {
                authoredDate
                committedDate
                additions
                changedFilesIfAvailable
                deletions
                oid
                message
                url
                parents(first: 2) {
                	totalCount
                }
                authors(first: ${maxAuthors}) {
                  nodes {
                    user ${baseQuery_1.default.USER_SELECT}
                  }
                }
              }
            }
          }
        }
      }
    }`;
        super(githubToken, pullRequestCommitsQuery, 'pullRequestCommits', perPage);
        this.repo = repo;
    }
    // Override the getEventData method to process commit details
    getEventData(result) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const commitData = result;
        return {
            hasPreviousPage: (_d = (_c = (_b = (_a = result.repository) === null || _a === void 0 ? void 0 : _a.pullRequest) === null || _b === void 0 ? void 0 : _b.commits) === null || _c === void 0 ? void 0 : _c.pageInfo) === null || _d === void 0 ? void 0 : _d.hasPreviousPage,
            startCursor: (_h = (_g = (_f = (_e = result.repository) === null || _e === void 0 ? void 0 : _e.pullRequest) === null || _f === void 0 ? void 0 : _f.commits) === null || _g === void 0 ? void 0 : _g.pageInfo) === null || _h === void 0 ? void 0 : _h.startCursor,
            data: [commitData], // returning an array to match the parseActivities function
        };
    }
}
exports.default = PullRequestCommitsQuery;
//# sourceMappingURL=pullRequestCommits.js.map