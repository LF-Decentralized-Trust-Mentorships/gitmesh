"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentLevel = exports.SegmentStatus = void 0;
var SegmentStatus;
(function (SegmentStatus) {
    SegmentStatus["ACTIVE"] = "active";
    SegmentStatus["ARCHIVED"] = "archived";
    SegmentStatus["FORMATION"] = "formation";
    SegmentStatus["PROSPECT"] = "prospect";
})(SegmentStatus || (exports.SegmentStatus = SegmentStatus = {}));
var SegmentLevel;
(function (SegmentLevel) {
    SegmentLevel[SegmentLevel["PROJECT_GROUP"] = 0] = "PROJECT_GROUP";
    SegmentLevel[SegmentLevel["PROJECT"] = 1] = "PROJECT";
    SegmentLevel[SegmentLevel["SUB_PROJECT"] = 2] = "SUB_PROJECT";
})(SegmentLevel || (exports.SegmentLevel = SegmentLevel = {}));
//# sourceMappingURL=segments.js.map