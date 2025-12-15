"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const common_1 = require("@gitmesh/common");
const authService_1 = __importDefault(require("../../services/auth/authService"));
const conf_1 = require("../../conf");
const jwks = (0, jwks_rsa_1.default)({
    jwksUri: conf_1.AUTH0_CONFIG.jwks,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 86400000,
});
async function getKey(header, callback) {
    jwks.getSigningKey(header.kid, (err, key) => {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}
exports.default = async (req, res) => {
    const { idToken, invitationToken, tenantId } = req.body;
    try {
        const verifyToken = new Promise((resolve, reject) => {
            jsonwebtoken_1.default.verify(idToken, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
                if (err) {
                    reject(new common_1.Error401());
                }
                const { aud } = decoded;
                if (aud !== conf_1.AUTH0_CONFIG.clientId) {
                    reject(new common_1.Error401());
                }
                resolve(decoded);
            });
        });
        const data = await verifyToken;
        // Signin with data
        const token = await authService_1.default.signinFromSSO('auth0', data.sub, data.email, data.email_verified, data.given_name, data.family_name, data.name, invitationToken, tenantId, req);
        return res.send(token);
    }
    catch (err) {
        return res.status(401).send({ error: err });
    }
};
//# sourceMappingURL=ssoCallback.js.map