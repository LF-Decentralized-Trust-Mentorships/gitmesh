"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const permissions_1 = __importDefault(require("../../security/permissions"));
const memberService_1 = __importDefault(require("../../services/memberService"));
const permissionChecker_1 = __importDefault(require("../../services/user/permissionChecker"));
/**
 * GET /tenant/{tenantId}/member/active
 * @summary List active members
 * @tag Members
 * @security Bearer
 * @description List active members. It accepts filters, sorting options and pagination.
 * @pathParam {string} tenantId - Your workspace/tenant ID
 * @queryParam {string} [filter[platforms]] - Filter by activity platforms (comma separated list without spaces)
 * @queryParam {string} [filter[isTeamMember]] - If true we will return just team members, if false we will return just non-team members, if undefined we will return both.
 * @queryParam {string} [filter[isBot]] - If true we will return just members who are bots, if false we will return just non-bot members, if undefined we will return both.
 * @queryParam {string} [filter[isOrganization]] - If true we will return just members who are organizations (such as linkedin organizations that post), if false we will return just non-organization members, if undefined we will return both.
 * @queryParam {string} [filter[activityTimestampFrom]] - Filter by activity timestamp from (required)
 * @queryParam {string} [filter[activityTimestampTo]] - Filter by activity timestamp to (required)
 * @queryParam {string} [filter[activityIsContribution]] - Filter by activities that are contributions
 * @queryParam {string} [orderBy] - How to sort results. Available values: activityCount_DESC, activityCount_ASC, activeDaysCount_DESC, activeDaysCount_ASC (default activityCount_DESC)
 * @queryParam {number} [offset] - Skip the first n results. Default 0.
 * @queryParam {number} [limit] - Limit the number of results. Default 20.
 * @response 200 - Ok
 * @response 401 - Unauthorized
 * @response 429 - Too many requests
 */
exports.default = async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    new permissionChecker_1.default(req).validateHas(permissions_1.default.values.memberRead);
    let offset = 0;
    if (req.query.offset) {
        offset = parseInt(req.query.offset, 10);
    }
    let limit = 20;
    if (req.query.limit) {
        limit = parseInt(req.query.limit, 10);
    }
    if (((_a = req.query.filter) === null || _a === void 0 ? void 0 : _a.activityTimestampFrom) === undefined) {
        throw new common_1.Error400(req.language, 'errors.members.activeList.activityTimestampFrom');
    }
    if (((_b = req.query.filter) === null || _b === void 0 ? void 0 : _b.activityTimestampTo) === undefined) {
        throw new common_1.Error400(req.language, 'errors.members.activeList.activityTimestampTo');
    }
    const filters = {
        platforms: ((_c = req.query.filter) === null || _c === void 0 ? void 0 : _c.platforms) !== undefined
            ? (_d = req.query.filter) === null || _d === void 0 ? void 0 : _d.platforms.split(',')
            : undefined,
        isTeamMember: ((_e = req.query.filter) === null || _e === void 0 ? void 0 : _e.isTeamMember) === undefined
            ? undefined
            : ((_f = req.query.filter) === null || _f === void 0 ? void 0 : _f.isTeamMember) === 'true',
        isBot: ((_g = req.query.filter) === null || _g === void 0 ? void 0 : _g.isBot) === undefined ? undefined : ((_h = req.query.filter) === null || _h === void 0 ? void 0 : _h.isBot) === 'true',
        isOrganization: ((_j = req.query.filter) === null || _j === void 0 ? void 0 : _j.isOrganization) === undefined
            ? undefined
            : ((_k = req.query.filter) === null || _k === void 0 ? void 0 : _k.isOrganization) === 'true',
        activityTimestampFrom: (_l = req.query.filter) === null || _l === void 0 ? void 0 : _l.activityTimestampFrom,
        activityTimestampTo: (_m = req.query.filter) === null || _m === void 0 ? void 0 : _m.activityTimestampTo,
        activityIsContribution: ((_o = req.query.filter) === null || _o === void 0 ? void 0 : _o.activityIsContribution) === 'true',
    };
    const orderBy = req.query.orderBy || 'activityCount_DESC';
    const payload = await new memberService_1.default(req).findAndCountActive(filters, offset, limit, orderBy, req.query.segments);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=memberActiveList.js.map