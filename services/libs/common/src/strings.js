"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCleanString = void 0;
const getCleanString = (value) => {
    return value
        .replace(/[^-0-9A-Z ]+/gi, '') // only get alphanumeric characters and dashes
        .replace(/-+/gi, ' ') // convert dashes into spaces
        .replace(/\s+/g, ' ') // get rid of excessive spaces between words
        .toLowerCase()
        .trim();
};
exports.getCleanString = getCleanString;
//# sourceMappingURL=strings.js.map