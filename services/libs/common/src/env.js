"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EDITION = exports.SERVICE = exports.IS_CLOUD_ENV = exports.LOG_LEVEL = exports.IS_STAGING_ENV = exports.IS_PROD_ENV = exports.IS_DEV_ENV = exports.IS_TEST_ENV = void 0;
exports.getEnv = getEnv;
exports.IS_TEST_ENV = process.env.NODE_ENV === 'test';
exports.IS_DEV_ENV = process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'docker' ||
    process.env.NODE_ENV === undefined;
exports.IS_PROD_ENV = process.env.NODE_ENV === 'production';
exports.IS_STAGING_ENV = process.env.NODE_ENV === 'staging';
exports.LOG_LEVEL = process.env.LOG_LEVEL || 'info';
exports.IS_CLOUD_ENV = exports.IS_PROD_ENV || exports.IS_STAGING_ENV;
exports.SERVICE = process.env.SERVICE || 'unknown-service';
exports.EDITION = process.env.EDITION;
function getEnv() {
    if (exports.IS_PROD_ENV)
        return 'prod';
    if (exports.IS_STAGING_ENV)
        return 'staging';
    return 'local';
}
//# sourceMappingURL=env.js.map