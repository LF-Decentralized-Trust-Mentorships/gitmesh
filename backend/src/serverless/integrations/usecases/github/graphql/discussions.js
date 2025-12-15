"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baseQuery_1 = __importDefault(require("./baseQuery"));
/* eslint class-methods-use-this: 0 */
class DiscussionsQuery extends baseQuery_1.default {
    constructor(repo, githubToken, perPage = 100) {
        const discussionsQuery = `{
        repository(owner: "${repo.owner}", name: "${repo.name}") {
          discussions(last: ${perPage}, \${beforeCursor}) {
            pageInfo ${baseQuery_1.default.PAGE_SELECT}
            nodes {
              author {
                ... on User ${baseQuery_1.default.USER_SELECT}
              }
              number
              bodyText
              title
              id
              url
              createdAt
              comments {
                totalCount
              }
              category {
                id
                isAnswerable
                name
                slug
                emoji
                description
              }
            }
          }
        }
      }`;
        super(githubToken, discussionsQuery, 'discussions', perPage);
        this.repo = repo;
    }
    getEventData(result) {
        var _a, _b;
        return Object.assign(Object.assign({}, super.getEventData(result)), { data: (_b = (_a = result.repository) === null || _a === void 0 ? void 0 : _a.discussions) === null || _b === void 0 ? void 0 : _b.nodes });
    }
}
exports.default = DiscussionsQuery;
//# sourceMappingURL=discussions.js.map