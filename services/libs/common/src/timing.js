"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EPOCH_DATE = exports.addSeconds = exports.timeout = void 0;
const timeout = async (delayMilliseconds) => new Promise((resolve) => {
    setTimeout(resolve, delayMilliseconds);
});
exports.timeout = timeout;
const addSeconds = (date, seconds) => {
    const newDate = new Date(date);
    newDate.setSeconds(newDate.getSeconds() + seconds);
    return newDate;
};
exports.addSeconds = addSeconds;
exports.EPOCH_DATE = new Date('1970-01-01T00:00:00+00:00');
//# sourceMappingURL=timing.js.map