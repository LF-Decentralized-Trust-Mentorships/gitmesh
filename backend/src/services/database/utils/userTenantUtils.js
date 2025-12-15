"use strict";
exports.__esModule = true;
exports.isUserInTenant = void 0;
function isUserInTenant(user, tenant) {
    if (!user) {
        return false;
    }
    if (!tenant || !tenant.id) {
        return true;
    }
    return user.tenants.some(function (tenantUser) { return tenantUser.tenant.id === tenant.id; });
}
exports.isUserInTenant = isUserInTenant;
