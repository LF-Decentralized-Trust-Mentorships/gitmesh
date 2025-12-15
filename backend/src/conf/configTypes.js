"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantMode = exports.ServiceType = void 0;
var ServiceType;
(function (ServiceType) {
    ServiceType["API"] = "api";
    ServiceType["NODEJS_WORKER"] = "nodejs-worker";
    ServiceType["JOB_GENERATOR"] = "job-generator";
})(ServiceType = exports.ServiceType || (exports.ServiceType = {}));
var TenantMode;
(function (TenantMode) {
    TenantMode["SINGLE"] = "single";
    TenantMode["MULTI"] = "multi";
    TenantMode["MULTI_WITH_SUBDOMAIN"] = "multi-with-subdomain";
})(TenantMode = exports.TenantMode || (exports.TenantMode = {}));
//# sourceMappingURL=configTypes.js.map