"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationResultType = exports.IntegrationResultState = exports.IntegrationStreamDataState = exports.IntegrationStreamType = exports.IntegrationStreamState = exports.IntegrationRunState = exports.IntegrationState = void 0;
var IntegrationState;
(function (IntegrationState) {
    IntegrationState["IN_PROGRESS"] = "in-progress";
    IntegrationState["DONE"] = "done";
    IntegrationState["ERROR"] = "error";
    IntegrationState["INACTIVE"] = "inactive";
    IntegrationState["WAITING_APPROVAL"] = "waiting-approval";
    IntegrationState["NEEDS_RECONNECT"] = "needs-reconnect";
})(IntegrationState || (exports.IntegrationState = IntegrationState = {}));
var IntegrationRunState;
(function (IntegrationRunState) {
    IntegrationRunState["DELAYED"] = "delayed";
    IntegrationRunState["PENDING"] = "pending";
    IntegrationRunState["PROCESSING"] = "processing";
    IntegrationRunState["PROCESSED"] = "processed";
    IntegrationRunState["ERROR"] = "error";
    IntegrationRunState["INTEGRATION_DELETED"] = "integration-deleted";
})(IntegrationRunState || (exports.IntegrationRunState = IntegrationRunState = {}));
var IntegrationStreamState;
(function (IntegrationStreamState) {
    IntegrationStreamState["DELAYED"] = "delayed";
    IntegrationStreamState["PENDING"] = "pending";
    IntegrationStreamState["PROCESSED"] = "processed";
    IntegrationStreamState["ERROR"] = "error";
})(IntegrationStreamState || (exports.IntegrationStreamState = IntegrationStreamState = {}));
var IntegrationStreamType;
(function (IntegrationStreamType) {
    IntegrationStreamType["ROOT"] = "root";
    IntegrationStreamType["CHILD"] = "child";
})(IntegrationStreamType || (exports.IntegrationStreamType = IntegrationStreamType = {}));
var IntegrationStreamDataState;
(function (IntegrationStreamDataState) {
    IntegrationStreamDataState["DELAYED"] = "delayed";
    IntegrationStreamDataState["PENDING"] = "pending";
    IntegrationStreamDataState["PROCESSING"] = "processing";
    IntegrationStreamDataState["PROCESSED"] = "processed";
    IntegrationStreamDataState["ERROR"] = "error";
})(IntegrationStreamDataState || (exports.IntegrationStreamDataState = IntegrationStreamDataState = {}));
var IntegrationResultState;
(function (IntegrationResultState) {
    IntegrationResultState["PENDING"] = "pending";
    IntegrationResultState["PROCESSING"] = "processing";
    IntegrationResultState["PROCESSED"] = "processed";
    IntegrationResultState["ERROR"] = "error";
    IntegrationResultState["DELAYED"] = "delayed";
})(IntegrationResultState || (exports.IntegrationResultState = IntegrationResultState = {}));
var IntegrationResultType;
(function (IntegrationResultType) {
    IntegrationResultType["ACTIVITY"] = "activity";
    IntegrationResultType["MEMBER_ENRICH"] = "member_enrich";
    IntegrationResultType["ORGANIZATION_ENRICH"] = "organization_enrich";
    IntegrationResultType["TWITTER_MEMBER_REACH"] = "twitter_member_reach";
})(IntegrationResultType || (exports.IntegrationResultType = IntegrationResultType = {}));
//# sourceMappingURL=integrations.js.map