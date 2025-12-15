"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("@octokit/graphql");
const moment_1 = __importDefault(require("moment"));
const rateLimitError_1 = require("../../../../../types/integration/rateLimitError");
class BaseQuery {
    constructor(githubToken, query, eventType, perPage) {
        this.githubToken = githubToken;
        this.query = query;
        this.perPage = perPage;
        this.eventType = eventType;
        this.graphQL = graphql_1.graphql.defaults({
            headers: {
                authorization: `token ${this.githubToken}`,
            },
        });
    }
    /**
     * Substitutes a variable like string $var with given variable
     * in a string. Useful when reusing the same string template
     * for multiple graphql paging requests.
     * $var in the string is substituted with obj[var]
     * @param str string to make the substitution
     * @param obj object containing variable to interpolate
     * @returns interpolated string
     */
    static interpolate(str, obj) {
        return str.replace(/\${([^}]+)}/g, (_, prop) => obj[prop]);
    }
    /**
     * Gets a single page result given a cursor.
     * Single page before the given cursor will be fetched.
     * @param beforeCursor Cursor to paginate records before it
     * @returns parsed graphQl result
     */
    async getSinglePage(beforeCursor) {
        const paginatedQuery = BaseQuery.interpolate(this.query, {
            beforeCursor: BaseQuery.getPagination(beforeCursor),
        });
        try {
            const result = await this.graphQL(paginatedQuery);
            return this.getEventData(result);
        }
        catch (err) {
            throw BaseQuery.processGraphQLError(err);
        }
    }
    /**
     * Parses graphql result into an object.
     * Object contains information about paging, and fetched data.
     * @param result from graphql query
     * @returns parsed result into paging and data values.
     */
    getEventData(result) {
        var _a, _b;
        return {
            hasPreviousPage: (_a = result.repository[this.eventType].pageInfo) === null || _a === void 0 ? void 0 : _a.hasPreviousPage,
            startCursor: (_b = result.repository[this.eventType].pageInfo) === null || _b === void 0 ? void 0 : _b.startCursor,
            data: [{}],
        };
    }
    /**
     * Returns pagination string given cursor.
     * @param beforeCursor cursor to use for the pagination
     * @returns pagination string that can be injected into a graphql query.
     */
    static getPagination(beforeCursor) {
        if (beforeCursor) {
            return `before: "${beforeCursor}"`;
        }
        return '';
    }
    static processGraphQLError(err) {
        if (err.errors && err.errors[0].type === 'RATE_LIMITED') {
            if (err.headers && err.headers['x-ratelimit-reset']) {
                const query = err.request && err.request.query ? err.request.query : 'Unknown GraphQL query!';
                const epochReset = parseInt(err.headers['x-ratelimit-reset'], 10);
                const resetDate = moment_1.default.unix(epochReset);
                const diffInSeconds = resetDate.diff((0, moment_1.default)(), 'seconds');
                return new rateLimitError_1.RateLimitError(diffInSeconds + 5, query, err);
            }
        }
        return err;
    }
}
BaseQuery.BASE_URL = 'https://api.github.com/graphql';
BaseQuery.USER_SELECT = `{
        login
        name
        avatarUrl
        id
        isHireable
        twitterUsername
        url
        websiteUrl
        email
        bio
        company
        location
        followers {
          totalCount
        }
    }`;
BaseQuery.ORGANIZATION_SELECT = `{
    email
    url
    location
    name
    twitterUsername
    websiteUrl
    description
    avatarUrl
  }`;
BaseQuery.PAGE_SELECT = `{
        hasPreviousPage
        startCursor
    }`;
exports.default = BaseQuery;
//# sourceMappingURL=baseQuery.js.map