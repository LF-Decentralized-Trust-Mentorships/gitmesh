"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTraceToLogFields = void 0;
/**
 * Small utility to manually add trace details to a log: "trace_id" and "span_id".
 * Most of the time this is not required since correlation between logs and traces
 * is fully automated, but it may be useful in some rare edge cases.
 */
const addTraceToLogFields = (span, fields) => {
    let merged = {};
    if (fields) {
        merged = Object.assign({}, fields);
    }
    if (span) {
        merged['trace_id'] = span.spanContext().traceId;
        merged['span_id'] = span.spanContext().spanId;
    }
    return merged;
};
exports.addTraceToLogFields = addTraceToLogFields;
//# sourceMappingURL=correlation.js.map