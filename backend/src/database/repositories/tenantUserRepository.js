"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const sequelizeRepository_1 = __importDefault(require("./sequelizeRepository"));
const auditLogRepository_1 = __importDefault(require("./auditLogRepository"));
class TenantUserRepository {
    static async findByTenant(tenantId, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const records = await options.database.tenantUser.findAll({
            where: {
                tenantId,
            },
            transaction,
        });
        return records;
    }
    static async findByTenantAndUser(tenantId, userId, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const record = await options.database.tenantUser.findOne({
            where: {
                tenantId,
                userId,
            },
            transaction,
        });
        return record;
    }
    static async findByInvitationToken(invitationToken, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const record = await options.database.tenantUser.findOne({
            where: {
                invitationToken,
            },
            include: ['tenant', 'user'],
            transaction,
        });
        return record;
    }
    static async create(tenant, user, roles, options) {
        roles = roles || [];
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const status = selectStatus('active', roles);
        await options.database.tenantUser.create({
            tenantId: tenant.id,
            userId: user.id,
            status,
            roles,
        }, { transaction });
        await auditLogRepository_1.default.log({
            entityName: 'user',
            entityId: user.id,
            action: auditLogRepository_1.default.CREATE,
            values: {
                email: user.email,
                status,
                roles,
            },
        }, options);
    }
    static async destroy(tenantId, id, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const user = await options.database.user.findByPk(id, {
            transaction,
        });
        const tenantUser = await this.findByTenantAndUser(tenantId, id, options);
        await tenantUser.destroy({ transaction });
        await auditLogRepository_1.default.log({
            entityName: 'user',
            entityId: user.id,
            action: auditLogRepository_1.default.DELETE,
            values: {
                email: user.email,
            },
        }, options);
    }
    static async updateRoles(tenantId, id, roles, options, isInvited = false) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const user = await options.database.user.findByPk(id, {
            transaction,
        });
        let tenantUser = await this.findByTenantAndUser(tenantId, id, options);
        let isCreation = false;
        if (!tenantUser) {
            isCreation = true;
            tenantUser = await options.database.tenantUser.create({
                tenantId,
                userId: id,
                status: selectStatus('invited', []),
                invitationToken: crypto_1.default.randomBytes(20).toString('hex'),
                roles: [],
                invitedById: isInvited ? options.currentUser.id : undefined,
            }, { transaction });
        }
        const { roles: existingRoles } = tenantUser;
        let newRoles = [];
        if (options.addRoles) {
            newRoles = [...new Set([...existingRoles, ...roles])];
        }
        else if (options.removeOnlyInformedRoles) {
            newRoles = existingRoles.filter((existingRole) => !roles.includes(existingRole));
        }
        else {
            newRoles = roles || [];
        }
        tenantUser.roles = newRoles;
        tenantUser.status = selectStatus(tenantUser.status, newRoles);
        await tenantUser.save({
            transaction,
        });
        await auditLogRepository_1.default.log({
            entityName: 'user',
            entityId: user.id,
            action: isCreation ? auditLogRepository_1.default.CREATE : auditLogRepository_1.default.UPDATE,
            values: {
                email: user.email,
                status: tenantUser.status,
                roles: newRoles,
            },
        }, options);
        return tenantUser;
    }
    static async updateSettings(userId, data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const tenantUser = await this.findByTenantAndUser(options.currentTenant.id, userId, options);
        await tenantUser.update({
            settings: Object.assign(Object.assign({}, tenantUser.settings), data),
            updatedById: currentUser.id,
        }, { transaction });
        return tenantUser;
    }
    static async updateSignalsSettings(userId, data, options) {
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const tenantUser = await this.findByTenantAndUser(options.currentTenant.id, userId, options);
        await tenantUser.update({
            settings: Object.assign(Object.assign({}, tenantUser.settings), { signals: Object.assign(Object.assign({}, tenantUser.settings.signals), data) }),
            updatedById: currentUser.id,
        }, { transaction });
        return tenantUser;
    }
    static async acceptInvitation(invitationToken, options) {
        const transaction = sequelizeRepository_1.default.getTransaction(options);
        const currentUser = sequelizeRepository_1.default.getCurrentUser(options);
        const invitationTenantUser = await this.findByInvitationToken(invitationToken, options);
        const isSameEmailFromInvitation = invitationTenantUser.userId === currentUser.id;
        const existingTenantUser = await this.findByTenantAndUser(invitationTenantUser.tenantId, currentUser.id, options);
        // There might be a case that the invite was sent to another email,
        // and the current user is also invited or is already a member
        if (existingTenantUser && existingTenantUser.id !== invitationTenantUser.id) {
            // destroys the new invite
            await this.destroy(invitationTenantUser.tenantId, invitationTenantUser.userId, options);
            // Merges the roles from the invitation and the current tenant user
            existingTenantUser.roles = [
                ...new Set([...existingTenantUser.roles, ...invitationTenantUser.roles]),
            ];
            // Change the status to active (in case the existing one is also invited)
            existingTenantUser.invitationToken = null;
            existingTenantUser.status = selectStatus('active', existingTenantUser.roles);
            await existingTenantUser.save({
                transaction,
            });
        }
        else {
            // In this case there's no tenant user for the current user and the tenant
            // Sometimes the invitation is sent not to the
            // correct email. In those cases the userId must be changed
            // to match the correct user.
            invitationTenantUser.userId = currentUser.id;
            invitationTenantUser.invitationToken = null;
            invitationTenantUser.status = selectStatus('active', invitationTenantUser.roles);
            await invitationTenantUser.save({
                transaction,
            });
        }
        const emailVerified = currentUser.emailVerified || isSameEmailFromInvitation;
        await options.database.user.update({
            emailVerified,
        }, { where: { id: currentUser.id }, transaction });
        const auditLogRoles = existingTenantUser ? existingTenantUser.roles : invitationTenantUser.roles;
        await auditLogRepository_1.default.log({
            entityName: 'user',
            entityId: currentUser.id,
            action: auditLogRepository_1.default.UPDATE,
            values: {
                email: currentUser.email,
                roles: auditLogRoles,
                status: selectStatus('active', auditLogRoles),
            },
        }, options);
    }
}
exports.default = TenantUserRepository;
function selectStatus(oldStatus, newRoles) {
    newRoles = newRoles || [];
    if (oldStatus === 'invited') {
        return oldStatus;
    }
    if (!newRoles.length) {
        return 'empty-permissions';
    }
    return 'active';
}
//# sourceMappingURL=tenantUserRepository.js.map