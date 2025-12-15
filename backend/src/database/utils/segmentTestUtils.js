"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchSegments = exports.populateSegments = void 0;
const segmentRepository_1 = __importDefault(require("../repositories/segmentRepository"));
async function populateSegments(options) {
    const repository = new segmentRepository_1.default(options);
    options.currentSegments = await Promise.all(options.currentSegments.map(async (segment) => repository.findById(segment.id)));
}
exports.populateSegments = populateSegments;
function switchSegments(options, segments) {
    options.currentSegments = segments;
}
exports.switchSegments = switchSegments;
//# sourceMappingURL=segmentTestUtils.js.map