"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const common_1 = require("@gitmesh/common");
const permissions_1 = __importDefault(require("../../../security/permissions"));
const permissionChecker_1 = __importDefault(require("../../../services/user/permissionChecker"));
const track_1 = __importDefault(require("../../../segment/track"));
exports.default = async (req, res) => {
    new permissionChecker_1.default(req).validateHasAny([
        permissions_1.default.values.integrationCreate,
        permissions_1.default.values.integrationEdit,
    ]);
    if (req.query.subreddit) {
        try {
            const result = await axios_1.default.get(`https://www.reddit.com/r/${req.query.subreddit}/new.json?limit=1`);
            if (result.status === 200 &&
                result.data.data.children &&
                result.data.data.children.length > 0) {
                (0, track_1.default)('Reddit: subreddit input', {
                    subreddit: req.query.subreddit,
                    valid: true,
                }, Object.assign({}, req));
                return req.responseHandler.success(req, res, result.data.data.children);
            }
        }
        catch (e) {
            (0, track_1.default)('Reddit: subreddit input', {
                subreddit: req.query.subreddit,
                valid: false,
            }, Object.assign({}, req));
            return req.responseHandler.error(req, res, new common_1.Error400(req.language));
        }
    }
    (0, track_1.default)('Reddit: subreddit input', {
        subreddit: req.query.subreddit,
        valid: false,
    }, Object.assign({}, req));
    return req.responseHandler.error(req, res, new common_1.Error400(req.language));
};
//# sourceMappingURL=redditValidator.js.map