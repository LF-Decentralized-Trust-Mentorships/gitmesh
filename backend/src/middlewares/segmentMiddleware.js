"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.segmentMiddleware = void 0;
const types_1 = require("@gitmesh/types");
const segmentRepository_1 = __importDefault(require("../database/repositories/segmentRepository"));
const isFeatureEnabled_1 = __importDefault(require("../feature-flags/isFeatureEnabled"));
async function segmentMiddleware(req, res, next) {
    try {
        let segments = [];
        const segmentRepository = new segmentRepository_1.default(req);
        if (!(await (0, isFeatureEnabled_1.default)(types_1.FeatureFlag.SEGMENTS, req))) {
            // return default segment
            const segments = await segmentRepository.querySubprojects({ limit: 1, offset: 0 });
            req.currentSegments = segments.rows;
            next();
            return;
        }
        if (req.query.segments) {
            // for get requests, segments will be in query
            segments = await segmentRepository.findInIds(req.query.segments);
        }
        else if (req.body.segments) {
            // for post and put requests, segments will be in body
            segments = await segmentRepository.findInIds(req.body.segments);
        }
        else {
            const segments = await segmentRepository.querySubprojects({ limit: 1, offset: 0 });
            req.currentSegments = segments.rows;
            next();
            return;
        }
        req.currentSegments = segments.filter((s) => segmentRepository_1.default.isSubproject(s));
        next();
    }
    catch (error) {
        next(error);
    }
}
exports.segmentMiddleware = segmentMiddleware;
//# sourceMappingURL=segmentMiddleware.js.map