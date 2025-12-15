"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncStatus = exports.SyncMode = void 0;
var SyncMode;
(function (SyncMode) {
    SyncMode["SYNCHRONOUS"] = "synchronous";
    SyncMode["ASYNCHRONOUS"] = "asynchronous";
    SyncMode["USE_FEATURE_FLAG"] = "use-feature-flag";
})(SyncMode || (exports.SyncMode = SyncMode = {}));
var SyncStatus;
(function (SyncStatus) {
    SyncStatus["NEVER"] = "never";
    SyncStatus["ACTIVE"] = "active";
    SyncStatus["STOPPED"] = "stopped";
})(SyncStatus || (exports.SyncStatus = SyncStatus = {}));
//# sourceMappingURL=sync.js.map