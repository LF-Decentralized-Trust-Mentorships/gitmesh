"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("@octokit/graphql");
const baseQuery_1 = __importDefault(require("./baseQuery"));
/**
 * Get information from a member using the GitHub GraphQL API.
 * @param username GitHub username
 * @param token GitHub personal access token
 * @returns Information from member
 */
const getMember = async (username, token) => {
    let user;
    try {
        const graphqlWithAuth = graphql_1.graphql.defaults({
            headers: {
                authorization: `token ${token}`,
            },
        });
        user = (await graphqlWithAuth(`{ 
            user(login: "${username}") ${baseQuery_1.default.USER_SELECT}
          }
      `)).user;
    }
    catch (err) {
        // It may be that the user was not found, if for example it is a bot
        // In that case we want to return null instead of throwing an error
        if (err.errors && err.errors[0].type === 'NOT_FOUND') {
            user = null;
        }
        else {
            throw baseQuery_1.default.processGraphQLError(err);
        }
    }
    return user;
};
exports.default = getMember;
//# sourceMappingURL=members.js.map