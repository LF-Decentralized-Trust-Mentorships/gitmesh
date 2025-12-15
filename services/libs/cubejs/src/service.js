"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CubeJsService = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const core_1 = __importDefault(require("@cubejs-client/core"));
const common_1 = require("@gitmesh/common");
class CubeJsService {
    /**
     * Sets tenant security context for cubejs api.
     * Also initializes cubejs api object from security context.
     * @param tenantId
     * @param segments
     */
    async init(tenantId, segments) {
        this.tenantId = tenantId;
        this.segments = segments;
        this.token = await CubeJsService.generateJwtToken(this.tenantId, this.segments);
        this.api = (0, core_1.default)(this.token, { apiUrl: process.env['CUBEJS_URL'] });
    }
    /**
     * Loads the result data for a given cubejs query
     * @param query
     * @returns
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async load(query) {
        const result = await this.api.load(query);
        return result.loadResponses[0].data;
    }
    static async generateJwtToken(tenantId, segments) {
        const context = { tenantId, segments };
        const token = jsonwebtoken_1.default.sign(context, process.env['CUBEJS_JWT_SECRET'], {
            expiresIn: process.env['CUBEJS_JWT_EXPIRY'],
        });
        return token;
    }
    static async verifyToken(language, token, tenantId) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const decodedToken = jsonwebtoken_1.default.verify(token, process.env['CUBEJS_JWT_SECRET']);
            if (decodedToken.tenantId !== tenantId) {
                throw new common_1.Error400(language, 'cubejs.tenantIdNotMatching');
            }
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                throw new common_1.Error400(language, 'cubejs.invalidToken');
            }
            throw error;
        }
    }
}
exports.CubeJsService = CubeJsService;
//# sourceMappingURL=service.js.map