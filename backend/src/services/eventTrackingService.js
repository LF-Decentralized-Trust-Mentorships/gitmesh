"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const track_1 = __importDefault(require("../segment/track"));
class EventTrackingService extends logging_1.LoggerBase {
    constructor(options) {
        super(options.log);
        this.options = options;
    }
    async trackEvent(event) {
        await (0, track_1.default)(event.name, event.properties, this.options);
    }
}
exports.default = EventTrackingService;
//# sourceMappingURL=eventTrackingService.js.map