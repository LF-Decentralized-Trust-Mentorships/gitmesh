"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const common_1 = require("@gitmesh/common");
const plans_1 = __importDefault(require("../../security/plans"));
const permissions_1 = __importDefault(require("../../security/permissions"));
const emailSender_1 = __importDefault(require("../emailSender"));
const plans = plans_1.default.values;
/**
 * Checks the Permission of the User on a Tenant.
 */
class PermissionChecker {
    constructor({ currentTenant, language, currentUser }) {
        this.currentTenant = currentTenant;
        this.language = language;
        this.currentUser = currentUser;
    }
    /**
     * Validates if the user has a specific permission
     * and throws a Error403 if it doesn't.
     */
    validateHas(permission) {
        if (!this.has(permission)) {
            throw new common_1.Error403(this.language);
        }
    }
    /**
     * Validates if the user has any permission among specified
     * and throws Error403 if it doesn't
     */
    validateHasAny(permissions) {
        const hasOne = permissions.some((p) => this.has(p));
        if (!hasOne) {
            throw new common_1.Error403(this.language);
        }
    }
    /**
     * Checks if the user has permission to change certain protected
     * fields in an integration.
     * @param data Data sent to the integration write service
     */
    validateIntegrationsProtectedFields(data) {
        if (data.limitCount !== undefined) {
            this.validateHas(permissions_1.default.values.integrationControlLimit);
        }
    }
    /**
     * Checks if the user has permission to change certain protected
     * fields in a microservice.
     * @param data Data sent to the microservice write service
     */
    validateMicroservicesProtectedFields(data) {
        if (data.variant !== undefined) {
            if (data.variant === 'default') {
                this.validateHas(permissions_1.default.values.microserviceVariantFree);
            }
            else if (data.variant === 'premium') {
                this.validateHas(permissions_1.default.values.microserviceVariantPremium);
            }
            else {
                throw new common_1.Error400(`Invalid variant: ${data.variant}`);
            }
        }
    }
    /**
     * Checks if the user has a specific permission.
     */
    has(permission) {
        (0, assert_1.default)(permission, 'permission is required');
        if (!this.currentUser) {
            return false;
        }
        if (!this.isEmailVerified) {
            return false;
        }
        if (!this.hasPlanPermission(permission)) {
            return false;
        }
        return this.hasRolePermission(permission);
    }
    /**
     * Validates if the user has access to a storage
     * and throws a Error403 if it doesn't.
     */
    validateHasStorage(storageId) {
        if (!this.hasStorage(storageId)) {
            throw new common_1.Error403(this.language);
        }
    }
    /**
     * Validates if the user has access to a storage.
     */
    hasStorage(storageId) {
        (0, assert_1.default)(storageId, 'storageId is required');
        return this.allowedStorageIds().includes(storageId);
    }
    /**
     * Checks if the current user roles allows the permission.
     */
    hasRolePermission(permission) {
        return this.currentUserRolesIds.some((role) => permission.allowedRoles.some((allowedRole) => allowedRole === role));
    }
    /**
     * Checks if the current company plan allows the permission.
     */
    hasPlanPermission(permission) {
        (0, assert_1.default)(permission, 'permission is required');
        return permission.allowedPlans.includes(this.currentTenantPlan);
    }
    get isEmailVerified() {
        // Only checks if the email is verified
        // if the email system is on
        if (!emailSender_1.default.isConfigured) {
            return true;
        }
        return this.currentUser.emailVerified;
    }
    /**
     * Returns the Current User Roles.
     */
    get currentUserRolesIds() {
        if (!this.currentUser || !this.currentUser.tenants) {
            return [];
        }
        const tenant = this.currentUser.tenants
            .filter((tenantUser) => tenantUser.status === 'active')
            .find((tenantUser) => tenantUser.tenant.id === this.currentTenant.id);
        if (!tenant) {
            return [];
        }
        return tenant.roles;
    }
    /**
     * Return the current tenant plan,
     * check also if it's not expired.
     */
    get currentTenantPlan() {
        if (!this.currentTenant || !this.currentTenant.plan) {
            return plans.essential;
        }
        return this.currentTenant.plan;
    }
    /**
     * Returns the allowed storage ids for the user.
     */
    allowedStorageIds() {
        let allowedStorageIds = [];
        permissions_1.default.asArray.forEach((permission) => {
            if (this.has(permission)) {
                allowedStorageIds = allowedStorageIds.concat((permission.allowedStorage || []).map((storage) => storage.id));
            }
        });
        return [...new Set(allowedStorageIds)];
    }
}
exports.default = PermissionChecker;
//# sourceMappingURL=permissionChecker.js.map