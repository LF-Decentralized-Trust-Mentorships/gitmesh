"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUUID = exports.generateUUIDv1 = exports.generateUUIDv4 = void 0;
const uuid_1 = require("uuid");
const generateUUIDv4 = () => (0, uuid_1.v4)();
exports.generateUUIDv4 = generateUUIDv4;
const generateUUIDv1 = () => (0, uuid_1.v1)();
exports.generateUUIDv1 = generateUUIDv1;
const validateUUID = (uuid) => {
    const uuidRegExp = new RegExp('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$');
    return uuidRegExp.test(uuid);
};
exports.validateUUID = validateUUID;
//# sourceMappingURL=uuidUtils.js.map