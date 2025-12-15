"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baseQuery_1 = __importDefault(require("./baseQuery"));
/* eslint class-methods-use-this: 0 */
class DiscussionCommentsQuery extends baseQuery_1.default {
    constructor(repo, discussionNumber, githubToken, perPage = 100, maxRepliesPerComment = 100) {
        const discussionCommentsQuery = `{
        repository(name: "${repo.name}", owner: "${repo.owner}") {
          discussion(number: ${discussionNumber}) {
            comments(first: ${perPage}, \${beforeCursor}) {
              pageInfo ${baseQuery_1.default.PAGE_SELECT}
              nodes {
                author {
                  ... on User ${baseQuery_1.default.USER_SELECT}
                }
                bodyText
                url
                id
                createdAt
                isAnswer
                replies(first: ${maxRepliesPerComment}) {
                  nodes {
                    author {
                      ... on User ${baseQuery_1.default.USER_SELECT}
                    }
                    bodyText
                    url
                    id
                    createdAt
                  }
                }
                discussion {
                  url
                  id
                  title
                }
              }
              
            }
          }
        }
      }`;
        super(githubToken, discussionCommentsQuery, 'discussionComments', perPage);
        this.repo = repo;
    }
    getEventData(result) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return {
            hasPreviousPage: (_d = (_c = (_b = (_a = result.repository) === null || _a === void 0 ? void 0 : _a.discussion) === null || _b === void 0 ? void 0 : _b.comments) === null || _c === void 0 ? void 0 : _c.pageInfo) === null || _d === void 0 ? void 0 : _d.hasPreviousPage,
            startCursor: (_h = (_g = (_f = (_e = result.repository) === null || _e === void 0 ? void 0 : _e.discussion) === null || _f === void 0 ? void 0 : _f.comments) === null || _g === void 0 ? void 0 : _g.pageInfo) === null || _h === void 0 ? void 0 : _h.startCursor,
            data: (_l = (_k = (_j = result.repository) === null || _j === void 0 ? void 0 : _j.discussion) === null || _k === void 0 ? void 0 : _k.comments) === null || _l === void 0 ? void 0 : _l.nodes,
        };
    }
}
exports.default = DiscussionCommentsQuery;
//# sourceMappingURL=discussionComments.js.map