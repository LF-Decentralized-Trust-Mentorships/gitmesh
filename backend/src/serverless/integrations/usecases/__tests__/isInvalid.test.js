"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const isInvalid_1 = __importDefault(require("../isInvalid"));
describe('Is invalid tests', () => {
    it('It should return valid when the result is correct', async () => {
        const result = {
            value: {
                followers: [1, 2, 3],
                nextPage: '',
            },
        };
        expect((0, isInvalid_1.default)(result, 'followers')).toBe(false);
    });
    it('It should also work for other keys', async () => {
        const result = {
            value: {
                mentions: [1, 2, 3],
                nextPage: '',
            },
        };
        expect((0, isInvalid_1.default)(result, 'mentions')).toBe(false);
    });
    it('It return invalid when no value also work for other keys', async () => {
        const result = {
            broken: true,
        };
        expect((0, isInvalid_1.default)(result, 'mentions')).toBe(true);
    });
    it('It return invalid when no key', async () => {
        const result = {
            value: {
                broken: true,
            },
        };
        expect((0, isInvalid_1.default)(result, 'mentions')).toBe(true);
    });
    it('It return invalid when wrong key', async () => {
        const result = {
            value: {
                mentions: [1, 2, 3],
                nextPage: '',
            },
        };
        expect((0, isInvalid_1.default)(result, 'followers')).toBe(true);
    });
    it('It return valid when empty list', async () => {
        const result = {
            value: {
                mentions: [],
                nextPage: '',
            },
        };
        expect((0, isInvalid_1.default)(result, 'mentions')).toBe(false);
    });
});
//# sourceMappingURL=isInvalid.test.js.map