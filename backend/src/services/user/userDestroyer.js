"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const common_1 = require("@gitmesh/common");
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
const userRepository_1 = __importDefault(require("../../database/repositories/userRepository"));
const tenantUserRepository_1 = __importDefault(require("../../database/repositories/tenantUserRepository"));
const plans_1 = __importDefault(require("../../security/plans"));
/**
 * Handles removing the permissions of the users.
 */
class UserDestroyer {
    constructor(options) {
        this.options = options;
    }
    /**
     * Removes all passed users.
     */
    async destroyAll(data) {
        this.data = data;
        await this._validate();
        try {
            this.transaction = await sequelizeRepository_1.default.createTransaction(this.options);
            await Promise.all(this._ids.map((id) => this._destroy(id)));
            return await sequelizeRepository_1.default.commitTransaction(this.transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(this.transaction);
            throw error;
        }
    }
    get _ids() {
        let ids;
        if (this.data.ids && !Array.isArray(this.data.ids)) {
            ids = [this.data.ids];
        }
        else {
            const uniqueIds = [...new Set(this.data.ids)];
            ids = uniqueIds;
        }
        return ids.map((id) => id.trim());
    }
    async _destroy(id) {
        const user = await userRepository_1.default.findByIdWithoutAvatar(id, this.options);
        await tenantUserRepository_1.default.destroy(this.options.currentTenant.id, user.id, this.options);
    }
    /**
     * Checks if the user is removing the responsable for the plan
     */
    async _isRemovingPlanUser() {
        const { currentTenant } = this.options;
        if (currentTenant.plan === plans_1.default.values.essential) {
            return false;
        }
        if (!currentTenant.planUserId) {
            return false;
        }
        return this._ids.includes(String(currentTenant.planUserId));
    }
    /**
     * Checks if the user is removing himself
     */
    _isRemovingHimself() {
        return this._ids.includes(String(this.options.currentUser.id));
    }
    async _validate() {
        (0, assert_1.default)(this.options.currentTenant.id, 'tenantId is required');
        (0, assert_1.default)(this.options.currentUser, 'currentUser is required');
        (0, assert_1.default)(this.options.currentUser.id, 'currentUser.id is required');
        (0, assert_1.default)(this.options.currentUser.email, 'currentUser.email is required');
        (0, assert_1.default)(this._ids && this._ids.length, 'ids is required');
        if (await this._isRemovingPlanUser()) {
            throw new common_1.Error400(this.options.language, 'user.errors.destroyingPlanUser');
        }
        if (this._isRemovingHimself()) {
            throw new common_1.Error400(this.options.language, 'user.errors.destroyingHimself');
        }
    }
}
exports.default = UserDestroyer;
//# sourceMappingURL=userDestroyer.js.map