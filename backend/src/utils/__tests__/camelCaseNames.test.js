"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const camelCaseNames_1 = __importDefault(require("../camelCaseNames"));
describe('camelCaseNames tests', () => {
    it('Should return an empty string for an empty string input', async () => {
        expect((0, camelCaseNames_1.default)('')).toBe('');
    });
    it('Should return lowercase string for a single word name', async () => {
        expect((0, camelCaseNames_1.default)('SOMESTRING')).toBe('somestring');
    });
    it('Should return camelCase string for a multiple word name', async () => {
        expect((0, camelCaseNames_1.default)('SOME VARIABLE NAME')).toBe('someVariableName');
    });
    it('Should return camelCase string for a multiple word name - non-alphanumeric characters should be stripped', async () => {
        expect((0, camelCaseNames_1.default)("MEMBER'S ''##_$$ BIRTHDAY!!")).toBe('membersBirthday');
    });
});
//# sourceMappingURL=camelCaseNames.test.js.map