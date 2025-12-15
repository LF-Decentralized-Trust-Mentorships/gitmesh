"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const graphql_1 = require("@octokit/graphql");
const baseQuery_1 = __importDefault(require("./baseQuery"));
const logger = (0, logging_1.getServiceChildLogger)('github.getOrganization');
/**
 * Get information from a organization using the GitHub GraphQL API.
 * @param name Name of the organization in GitHub
 * @param token GitHub personal access token
 * @returns Information from organization
 */
const getOrganization = async (name, token) => {
    let organization;
    try {
        const graphqlWithAuth = graphql_1.graphql.defaults({
            headers: {
                authorization: `token ${token}`,
            },
        });
        const sanitizedName = name.replaceAll('\\', '').replaceAll('"', '');
        const organizationsQuery = `{
      search(query: "type:org ${sanitizedName}", type: USER, first: 10) {
        nodes {
          ... on Organization ${baseQuery_1.default.ORGANIZATION_SELECT}
          }
        }
        rateLimit {
            limit
            cost
            remaining
            resetAt
        }
      }`;
        organization = (await graphqlWithAuth(organizationsQuery));
        organization =
            organization.search.nodes.length > 0 ? organization.search.nodes[0] : null;
    }
    catch (err) {
        logger.error(err, { name }, 'Error getting organization!');
        // It may be that the organization was not found, if for example it is a bot
        // In that case we want to return null instead of throwing an error
        if (err.errors && err.errors[0].type === 'NOT_FOUND') {
            organization = null;
        }
        else {
            throw baseQuery_1.default.processGraphQLError(err);
        }
    }
    return organization;
};
exports.default = getOrganization;
//# sourceMappingURL=organizations.js.map