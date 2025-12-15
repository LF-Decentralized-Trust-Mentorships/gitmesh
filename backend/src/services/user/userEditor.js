"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const common_1 = require("@gitmesh/common");
const roles_1 = __importDefault(require("../../security/roles"));
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
const userRepository_1 = __importDefault(require("../../database/repositories/userRepository"));
const tenantUserRepository_1 = __importDefault(require("../../database/repositories/tenantUserRepository"));
const plans_1 = __importDefault(require("../../security/plans"));
/**
 * Handles the edition of the user(s) via the User page.
 */
class UserEditor {
    constructor(options) {
        this.options = options;
    }
    /**
     * Updates a user via the User page.
     */
    async update(data) {
        this.data = data;
        await this._validate();
        try {
            this.transaction = await sequelizeRepository_1.default.createTransaction(this.options);
            await this._loadUser();
            await this._updateAtDatabase();
            await sequelizeRepository_1.default.commitTransaction(this.transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(this.transaction);
            throw error;
        }
    }
    get _roles() {
        if (this.data.roles && !Array.isArray(this.data.roles)) {
            return [this.data.roles];
        }
        const uniqueRoles = [...new Set(this.data.roles)];
        return uniqueRoles;
    }
    /**
     * Loads the user and validate that it exists.
     */
    async _loadUser() {
        this.user = await userRepository_1.default.findById(this.data.id, this.options);
        if (!this.user) {
            throw new common_1.Error400(this.options.language, 'user.errors.userNotFound');
        }
    }
    /**
     * Updates the user at the database.
     */
    async _updateAtDatabase() {
        await tenantUserRepository_1.default.updateRoles(this.options.currentTenant.id, this.data.id, this.data.roles, this.options);
    }
    /**
     * Checks if the user is removing the responsable for the plan
     */
    async _isRemovingPlanUser() {
        if (this._roles.includes(roles_1.default.values.admin)) {
            return false;
        }
        const { currentTenant } = this.options;
        if (currentTenant.plan === plans_1.default.values.essential) {
            return false;
        }
        if (!currentTenant.planUserId) {
            return false;
        }
        return String(this.data.id) === String(currentTenant.planUserId);
    }
    /**
     * Checks if the user is removing it's own admin role
     */
    async _isRemovingOwnAdminRole() {
        if (this._roles.includes(roles_1.default.values.admin)) {
            return false;
        }
        if (String(this.data.id) !== String(this.options.currentUser.id)) {
            return false;
        }
        const tenantUser = this.options.currentUser.tenants.find((userTenant) => userTenant.tenant.id === this.options.currentTenant.id);
        return tenantUser.roles.includes(roles_1.default.values.admin);
    }
    async _validate() {
        (0, assert_1.default)(this.options.currentTenant.id, 'tenantId is required');
        (0, assert_1.default)(this.options.currentUser, 'currentUser is required');
        (0, assert_1.default)(this.options.currentUser.id, 'currentUser.id is required');
        (0, assert_1.default)(this.options.currentUser.email, 'currentUser.email is required');
        (0, assert_1.default)(this.data.id, 'id is required');
        (0, assert_1.default)(this._roles, 'roles is required (can be empty)');
        if (await this._isRemovingPlanUser()) {
            throw new common_1.Error400(this.options.language, 'user.errors.revokingPlanUser');
        }
        if (await this._isRemovingOwnAdminRole()) {
            throw new common_1.Error400(this.options.language, 'user.errors.revokingOwnPermission');
        }
    }
}
exports.default = UserEditor;
//# sourceMappingURL=userEditor.js.map