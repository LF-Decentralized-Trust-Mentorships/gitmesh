"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Error500InternalServerError = exports.Error404NotFound = exports.Error401Unauthorized = exports.Error400BadRequest = exports.HttpStatusError = void 0;
class HttpStatusError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        Object.setPrototypeOf(this, HttpStatusError.prototype);
    }
}
exports.HttpStatusError = HttpStatusError;
class Error400BadRequest extends HttpStatusError {
    constructor(message) {
        super(message, 400);
        Object.setPrototypeOf(this, Error400BadRequest.prototype);
    }
}
exports.Error400BadRequest = Error400BadRequest;
class Error401Unauthorized extends HttpStatusError {
    constructor(message) {
        super(message, 401);
        Object.setPrototypeOf(this, Error401Unauthorized.prototype);
    }
}
exports.Error401Unauthorized = Error401Unauthorized;
class Error404NotFound extends HttpStatusError {
    constructor(message) {
        super(message, 404);
        Object.setPrototypeOf(this, Error404NotFound.prototype);
    }
}
exports.Error404NotFound = Error404NotFound;
class Error500InternalServerError extends HttpStatusError {
    constructor(message) {
        super(message, 500);
        Object.setPrototypeOf(this, Error500InternalServerError.prototype);
    }
}
exports.Error500InternalServerError = Error500InternalServerError;
//# sourceMappingURL=http.js.map