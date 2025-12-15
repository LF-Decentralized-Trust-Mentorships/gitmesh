"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUrl = void 0;
const URL_REGEXP = new RegExp('^(https?:\\/\\/)?' + // validate protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
    '(\\#[-a-z\\d_]*)?$', 'i');
const isUrl = (value) => {
    return URL_REGEXP.test(value);
};
exports.isUrl = isUrl;
//# sourceMappingURL=validations.js.map