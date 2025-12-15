"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureFlagMiddleware = void 0;
const common_1 = require("@gitmesh/common");
const isFeatureEnabled_1 = __importDefault(require("../feature-flags/isFeatureEnabled"));
function featureFlagMiddleware(featureFlag, errorMessage) {
    return async (req, res, next) => {
        if (!(await (0, isFeatureEnabled_1.default)(featureFlag, req))) {
            await req.responseHandler.error(req, res, new common_1.Error403(req.language, errorMessage));
            return;
        }
        next();
    };
}
exports.featureFlagMiddleware = featureFlagMiddleware;
//# sourceMappingURL=featureFlagMiddleware.js.map