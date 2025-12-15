"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.getSecondsTillEndOfMonth = void 0;
var moment_1 = __importDefault(require("moment"));
var getSecondsTillEndOfMonth = function () {
    var endTime = (0, moment_1["default"])().endOf('month');
    var startTime = (0, moment_1["default"])();
    return endTime.diff(startTime, 'seconds');
};
exports.getSecondsTillEndOfMonth = getSecondsTillEndOfMonth;
