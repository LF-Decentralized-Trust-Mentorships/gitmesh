"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickAttributes = void 0;
const pickAttributes = (names, attributes) => {
    return attributes.filter((attribute) => names.includes(attribute.name));
};
exports.pickAttributes = pickAttributes;
//# sourceMappingURL=utils.js.map