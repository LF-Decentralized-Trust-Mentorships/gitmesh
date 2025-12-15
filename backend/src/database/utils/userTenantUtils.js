"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserInTenant = void 0;
function isUserInTenant(user, tenant) {
    if (!user) {
        return false;
    }
    if (!tenant || !tenant.id) {
        return true;
    }
    return user.tenants.some((tenantUser) => tenantUser.tenant.id === tenant.id);
}
exports.isUserInTenant = isUserInTenant;
//# sourceMappingURL=userTenantUtils.js.map