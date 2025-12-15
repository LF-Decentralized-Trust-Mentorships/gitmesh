"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.websiteNormalizer = void 0;
const psl_1 = require("psl");
const websiteNormalizer = (website) => {
    // remove http:// or https://
    const cleanURL = website.replace(/(^\w+:|^)\/\//, '');
    const parsed = (0, psl_1.parse)(cleanURL);
    if (!(0, psl_1.isValid)(cleanURL)) {
        return null;
    }
    return parsed.domain;
};
exports.websiteNormalizer = websiteNormalizer;
//# sourceMappingURL=websiteNormalizer.js.map