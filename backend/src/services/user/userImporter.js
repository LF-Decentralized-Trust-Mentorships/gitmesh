"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@gitmesh/common");
const userRepository_1 = __importDefault(require("../../database/repositories/userRepository"));
const userCreator_1 = __importDefault(require("./userCreator"));
/**
 * Flags if should send invitation emails for imported users.
 */
const SEND_INVITATION_EMAIL = false;
class UserImporter {
    constructor(options) {
        this.options = options;
    }
    async import(data, importHash) {
        if (!importHash) {
            throw new common_1.Error400(this.options.language, 'importer.errors.importHashRequired');
        }
        if (await this._isImportHashExistent(importHash)) {
            throw new common_1.Error400(this.options.language, 'importer.errors.importHashExistent');
        }
        const dataToCreate = Object.assign(Object.assign({ emails: [data.email] }, data), { importHash });
        return new userCreator_1.default(this.options).execute(dataToCreate, SEND_INVITATION_EMAIL);
    }
    async _isImportHashExistent(importHash) {
        const count = await userRepository_1.default.count({
            importHash,
        }, this.options);
        return count > 0;
    }
}
exports.default = UserImporter;
//# sourceMappingURL=userImporter.js.map