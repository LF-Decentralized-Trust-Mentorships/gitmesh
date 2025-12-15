"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cubejs_1 = require("@gitmesh/cubejs");
exports.default = async (req, res) => {
    const payload = await cubejs_1.CubeJsService.verifyToken(req.language, req.body.token, req.params.tenantId);
    await req.responseHandler.success(req, res, payload);
};
//# sourceMappingURL=cubeJsVerifyToken.js.map