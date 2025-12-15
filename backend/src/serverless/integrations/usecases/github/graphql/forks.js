"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baseQuery_1 = __importDefault(require("./baseQuery"));
/* eslint class-methods-use-this: 0 */
class ForksQuery extends baseQuery_1.default {
    constructor(repo, githubToken, perPage = 100) {
        const forksQuery = `{
        repository(owner: "${repo.owner}", name: "${repo.name}") {
          forks(last: ${perPage}, \${beforeCursor}) {
            pageInfo ${baseQuery_1.default.PAGE_SELECT}
            nodes {
              owner {
                ... on User ${baseQuery_1.default.USER_SELECT}
              }
              name
              url
              id
              createdAt
            }
          }
        }
      }`;
        super(githubToken, forksQuery, 'forks', perPage);
        this.repo = repo;
    }
    getEventData(result) {
        var _a, _b;
        return Object.assign(Object.assign({}, super.getEventData(result)), { data: (_b = (_a = result.repository) === null || _a === void 0 ? void 0 : _a.forks) === null || _b === void 0 ? void 0 : _b.nodes });
    }
}
exports.default = ForksQuery;
//# sourceMappingURL=forks.js.map