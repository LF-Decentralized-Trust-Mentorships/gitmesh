"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conf_1 = require("../../conf");
function getStage() {
    if (conf_1.IS_PROD_ENV)
        return 'prod';
    if (conf_1.IS_STAGING_ENV)
        return 'staging';
    return 'local';
}
exports.default = getStage;
//# sourceMappingURL=getStage.js.map