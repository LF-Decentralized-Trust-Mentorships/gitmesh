"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baseQuery_1 = __importDefault(require("./baseQuery"));
/* eslint class-methods-use-this: 0 */
class TeamsQuery extends baseQuery_1.default {
    constructor(teamNodeId, githubToken, perPage = 50) {
        const teamsQuery = `{
                node(id: "${teamNodeId}") {
                    ... on Team {
                            members {
                                nodes ${baseQuery_1.default.USER_SELECT}
                            }
                        }
                    }
                }`;
        super(githubToken, teamsQuery, 'teams', perPage);
    }
    getEventData(result) {
        var _a, _b;
        return { hasPreviousPage: false, startCursor: '', data: (_b = (_a = result.node) === null || _a === void 0 ? void 0 : _a.members) === null || _b === void 0 ? void 0 : _b.nodes };
    }
}
exports.default = TeamsQuery;
//# sourceMappingURL=teams.js.map