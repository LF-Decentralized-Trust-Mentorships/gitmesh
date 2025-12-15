"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const common_1 = require("@gitmesh/common");
const authService_1 = __importDefault(require("../services/auth/authService"));
/**
 * Authenticates and fills the request with the user if it exists.
 * If no token is passed, it continues the request but without filling the currentUser.
 * If userAutoAuthenticatedEmailForTests exists and no token is passed, it fills with this user for tests.
 */
async function authMiddleware(req, res, next) {
    const isTokenEmpty = (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session) &&
        !req.query.gitmeshToken;
    if (isTokenEmpty) {
        next();
        return;
    }
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    }
    else if (req.cookies) {
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    }
    else if (req.query.gitmeshToken) {
        idToken = req.query.gitmeshToken;
    }
    else {
        next();
        return;
    }
    try {
        const currentUser = await authService_1.default.findByToken(idToken, req);
        req.currentUser = currentUser;
        next();
    }
    catch (error) {
        await req.responseHandler.error(req, res, new common_1.Error401());
    }
}
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map