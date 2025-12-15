"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("@gitmesh/logging");
const io = require('@pm2/io');
/* eslint-disable class-methods-use-this */
class ApiResponseHandler extends logging_1.LoggerBase {
    constructor(options) {
        super(options.log);
    }
    async download(req, res, path) {
        res.download(path);
    }
    async success(_req, res, payload, status = 200) {
        if (payload !== undefined) {
            // We might want to send a custom status, even the operation succeeded
            res.status(status).send(payload);
        }
        else {
            res.sendStatus(200);
        }
    }
    async error(req, res, error) {
        var _a;
        if (error && error.name && error.name.includes('Sequelize')) {
            req.log.error(error, {
                code: 500,
                url: req.url,
                method: req.method,
                query: error.sql,
                body: req.body,
                errorMessage: (_a = error.original) === null || _a === void 0 ? void 0 : _a.message,
            }, 'Database error while processing REST API request!');
            io.notifyError(error);
            res.status(500).send('Internal Server Error');
        }
        else if (error && [400, 401, 403, 404].includes(error.code)) {
            req.log.error(error, { code: error.code, url: req.url, method: req.method, query: req.query, body: req.body }, 'Client error while processing REST API request!');
            res.status(error.code).send(error.message);
        }
        else {
            if (!error.code) {
                error.code = 500;
            }
            req.log.error(error, { code: error.code, url: req.url, method: req.method, query: req.query, body: req.body }, 'Error while processing REST API request!');
            io.notifyError(error);
            res.status(error.code).send(error.message);
        }
    }
}
exports.default = ApiResponseHandler;
//# sourceMappingURL=apiResponseHandler.js.map