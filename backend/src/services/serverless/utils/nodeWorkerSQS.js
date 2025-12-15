"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.sendOrgMergeMessage = exports.sendBulkEnrichMessage = exports.sendExportCSVNodeSQSMessage = exports.sendNewMemberNodeSQSMessage = exports.sendNewActivityNodeSQSMessage = exports.sendNodeWorkerMessage = void 0;
var logging_1 = require("@gitmesh/logging");
var sqs_1 = require("@gitmesh/sqs");
var types_1 = require("@gitmesh/types");
var moment_1 = __importDefault(require("moment"));
var conf_1 = require("../../conf");
var workerTypes_1 = require("../types/workerTypes");
var serviceSQS_1 = require("./serviceSQS");
var log = (0, logging_1.getServiceChildLogger)('nodeWorkerSQS');
// 15 minute limit for delaying is max for SQS
var limitSeconds = 15 * 60;
var sendNodeWorkerMessage = function (tenantId, body, delaySeconds, targetQueueUrl) { return __awaiter(void 0, void 0, void 0, function () {
    var attributes, delay, delayed, remainedSeconds, now, params;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (conf_1.IS_TEST_ENV) {
                    return [2 /*return*/];
                }
                delayed = false;
                if (delaySeconds) {
                    if (delaySeconds > limitSeconds) {
                        remainedSeconds = delaySeconds - limitSeconds;
                        attributes = {
                            tenantId: {
                                DataType: 'String',
                                StringValue: tenantId
                            },
                            remainingDelaySeconds: {
                                DataType: 'Number',
                                StringValue: "".concat(remainedSeconds)
                            }
                        };
                        if (targetQueueUrl) {
                            attributes.targetQueueUrl = { DataType: 'String', StringValue: targetQueueUrl };
                        }
                        delay = limitSeconds;
                    }
                    else {
                        attributes = {
                            tenantId: {
                                DataType: 'String',
                                StringValue: tenantId
                            }
                        };
                        if (targetQueueUrl) {
                            attributes.targetQueueUrl = { DataType: 'String', StringValue: targetQueueUrl };
                        }
                        delay = delaySeconds;
                    }
                    delayed = true;
                }
                now = (0, moment_1["default"])().valueOf();
                params = {
                    QueueUrl: delayed ? conf_1.SQS_CONFIG.nodejsWorkerDelayableQueue : conf_1.SQS_CONFIG.nodejsWorkerQueue,
                    MessageGroupId: delayed ? undefined : "".concat(now),
                    MessageDeduplicationId: delayed ? undefined : "".concat(tenantId, "-").concat(now),
                    MessageBody: JSON.stringify(body),
                    MessageAttributes: attributes,
                    DelaySeconds: delay
                };
                log.debug({
                    messageType: body.type,
                    body: body
                }, 'Sending nodejs-worker sqs message!');
                return [4 /*yield*/, (0, sqs_1.sendMessage)((0, serviceSQS_1.SQS_CLIENT)(), params)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendNodeWorkerMessage = sendNodeWorkerMessage;
var sendNewActivityNodeSQSMessage = function (tenant, activityId, segmentId) { return __awaiter(void 0, void 0, void 0, function () {
    var payload;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                payload = {
                    type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
                    tenant: tenant,
                    activityId: activityId,
                    segmentId: segmentId,
                    trigger: types_1.AutomationTrigger.NEW_ACTIVITY,
                    service: 'automation'
                };
                return [4 /*yield*/, (0, exports.sendNodeWorkerMessage)(tenant, payload)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendNewActivityNodeSQSMessage = sendNewActivityNodeSQSMessage;
var sendNewMemberNodeSQSMessage = function (tenant, memberId, segmentId) { return __awaiter(void 0, void 0, void 0, function () {
    var payload;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                payload = {
                    type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
                    tenant: tenant,
                    memberId: memberId,
                    segmentId: segmentId,
                    trigger: types_1.AutomationTrigger.NEW_MEMBER,
                    service: 'automation'
                };
                return [4 /*yield*/, (0, exports.sendNodeWorkerMessage)(tenant, payload)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendNewMemberNodeSQSMessage = sendNewMemberNodeSQSMessage;
var sendExportCSVNodeSQSMessage = function (tenant, user, entity, segmentIds, criteria) { return __awaiter(void 0, void 0, void 0, function () {
    var payload;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                payload = {
                    type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
                    service: 'csv-export',
                    user: user,
                    tenant: tenant,
                    entity: entity,
                    criteria: criteria,
                    segmentIds: segmentIds
                };
                return [4 /*yield*/, (0, exports.sendNodeWorkerMessage)(tenant, payload)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.sendExportCSVNodeSQSMessage = sendExportCSVNodeSQSMessage;
var sendBulkEnrichMessage = function (tenant, memberIds, segmentIds, notifyFrontend, skipCredits) {
    if (notifyFrontend === void 0) { notifyFrontend = true; }
    if (skipCredits === void 0) { skipCredits = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var payload;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    payload = {
                        type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
                        service: 'bulk-enrich',
                        memberIds: memberIds,
                        tenant: tenant,
                        segmentIds: segmentIds,
                        notifyFrontend: notifyFrontend,
                        skipCredits: skipCredits
                    };
                    return [4 /*yield*/, (0, exports.sendNodeWorkerMessage)(tenant, payload)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.sendBulkEnrichMessage = sendBulkEnrichMessage;
var sendOrgMergeMessage = function (tenantId, primaryOrgId, secondaryOrgId, notifyFrontend) {
    if (notifyFrontend === void 0) { notifyFrontend = true; }
    return __awaiter(void 0, void 0, void 0, function () {
        var payload;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    payload = {
                        type: workerTypes_1.NodeWorkerMessageType.NODE_MICROSERVICE,
                        service: 'org-merge',
                        tenantId: tenantId,
                        primaryOrgId: primaryOrgId,
                        secondaryOrgId: secondaryOrgId,
                        notifyFrontend: notifyFrontend
                    };
                    return [4 /*yield*/, (0, exports.sendNodeWorkerMessage)(tenantId, payload)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
exports.sendOrgMergeMessage = sendOrgMergeMessage;
