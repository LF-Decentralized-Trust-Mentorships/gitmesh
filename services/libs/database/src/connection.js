"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbConnection = exports.getDbInstance = void 0;
const logging_1 = require("@gitmesh/logging");
const pg_promise_1 = __importDefault(require("pg-promise"));
const log = (0, logging_1.getServiceChildLogger)('database.connection');
let dbInstance;
const getDbInstance = () => {
    if (dbInstance) {
        return dbInstance;
    }
    log.trace('Creating database library instance!');
    dbInstance = (0, pg_promise_1.default)({
        // tslint:disable-next-line:max-line-length
        // see https://stackoverflow.com/questions/36120435/verify-database-connection-with-pg-promise-when-starting-an-app
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async error(err, e) {
            if (e.cn) {
                if (log !== undefined)
                    log.fatal(err, { cn: e.cn }, 'DB connection error. Stopping process');
                // logs don't have flush:
                await new Promise((resolve) => setTimeout(resolve, 100));
                process.nextTick(() => process.exit());
            }
        },
    });
    // timestamp
    dbInstance.pg.types.setTypeParser(1114, (s) => s);
    // timestamp with timezone
    dbInstance.pg.types.setTypeParser(1184, (s) => s);
    // numeric
    dbInstance.pg.types.setTypeParser(1700, (s) => parseFloat(s));
    // int4
    dbInstance.pg.types.setTypeParser(23, (s) => parseInt(s, 10));
    return dbInstance;
};
exports.getDbInstance = getDbInstance;
const dbConnection = {};
const getDbConnection = async (config, maxPoolSize, idleTimeoutMillis) => {
    if (dbConnection[config.host]) {
        return dbConnection[config.host];
    }
    log.info({ database: config.database, host: config.host, port: config.port }, 'Connecting to database!');
    const dbInstance = (0, exports.getDbInstance)();
    dbConnection[config.host] = dbInstance(Object.assign(Object.assign({}, config), { max: maxPoolSize || 20, idleTimeoutMillis: idleTimeoutMillis !== undefined ? idleTimeoutMillis : 10000, 
        // query_timeout: 30000,
        application_name: process.env.SERVICE || 'unknown-app' }));
    await dbConnection[config.host].connect();
    return dbConnection[config.host];
};
exports.getDbConnection = getDbConnection;
//# sourceMappingURL=connection.js.map