"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
describe('getCleanString method', () => {
    it('Should clean a string with non alphanumeric characters', async () => {
        const cleanedString = (0, common_1.getCleanString)('!@#$%^&*()_+abc    !@#$%123');
        expect(cleanedString).toStrictEqual('abc 123');
    });
    it('Should return an empty string when an empty string is given', async () => {
        const cleanedString = (0, common_1.getCleanString)('');
        expect(cleanedString).toStrictEqual('');
    });
    it('Should return an empty string when no alphanumeric characters exist', async () => {
        const cleanedString = (0, common_1.getCleanString)('ß!@#$%     ^&*()_+-');
        expect(cleanedString).toStrictEqual('');
    });
});
//# sourceMappingURL=getCleanString.test.js.map