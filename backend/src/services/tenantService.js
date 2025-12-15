"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const integrations_1 = require("@gitmesh/integrations");
const types_1 = require("@gitmesh/types");
const common_1 = require("@gitmesh/common");
const index_1 = require("../conf/index");
const tenantRepository_1 = __importDefault(require("../database/repositories/tenantRepository"));
const tenantUserRepository_1 = __importDefault(require("../database/repositories/tenantUserRepository"));
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const permissionChecker_1 = __importDefault(require("./user/permissionChecker"));
const permissions_1 = __importDefault(require("../security/permissions"));
const roles_1 = __importDefault(require("../security/roles"));
const settingsService_1 = __importDefault(require("./settingsService"));
const plans_1 = __importDefault(require("../security/plans"));
const memberService_1 = __importDefault(require("./memberService"));
const microserviceTypes = __importStar(require("../database/utils/keys/microserviceTypes"));
const default_report_json_1 = __importDefault(require("../jsons/default-report.json"));
const dashboard_widgets_json_1 = __importDefault(require("../jsons/dashboard-widgets.json"));
const reportRepository_1 = __importDefault(require("../database/repositories/reportRepository"));
const widgetRepository_1 = __importDefault(require("../database/repositories/widgetRepository"));
const microserviceRepository_1 = __importDefault(require("../database/repositories/microserviceRepository"));
const conversationRepository_1 = __importDefault(require("../database/repositories/conversationRepository"));
const memberAttributeSettingsService_1 = __importDefault(require("./memberAttributeSettingsService"));
const configTypes_1 = require("../conf/configTypes");
const taskRepository_1 = __importDefault(require("../database/repositories/taskRepository"));
const segmentService_1 = __importDefault(require("./segmentService"));
const organizationService_1 = __importDefault(require("./organizationService"));
const customView_1 = require("@/types/customView");
const customViewRepository_1 = __importDefault(require("@/database/repositories/customViewRepository"));
class TenantService {
    constructor(options) {
        this.options = options;
    }
    /**
     * Creates the default tenant or joins the default with
     * roles passed.
     * If default roles are empty, the admin will have to asign the roles
     * to new users.
     */
    async createOrJoinDefault({ roles }, transaction) {
        const tenant = await tenantRepository_1.default.findDefault(Object.assign(Object.assign({}, this.options), { transaction }));
        if (tenant) {
            const tenantUser = await tenantUserRepository_1.default.findByTenantAndUser(tenant.id, this.options.currentUser.id, Object.assign(Object.assign({}, this.options), { transaction }));
            // In this situation, the user has used the invitation token
            // and it is already part of the tenant
            if (tenantUser) {
                return undefined;
            }
            return tenantUserRepository_1.default.create(tenant, this.options.currentUser, roles, Object.assign(Object.assign({}, this.options), { transaction }));
        }
        const record = await tenantRepository_1.default.create({ name: 'default', url: 'default' }, Object.assign(Object.assign({}, this.options), { transaction }));
        await settingsService_1.default.findOrCreateDefault(Object.assign(Object.assign({}, this.options), { currentTenant: record, transaction }));
        const tenantUserRepoRecord = await tenantUserRepository_1.default.create(record, this.options.currentUser, [roles_1.default.values.admin], Object.assign(Object.assign({}, this.options), { transaction }));
        return tenantUserRepoRecord;
    }
    async joinWithDefaultRolesOrAskApproval({ roles, tenantId }, { transaction }) {
        const tenant = await tenantRepository_1.default.findById(tenantId, Object.assign(Object.assign({}, this.options), { transaction }));
        const tenantUser = await tenantUserRepository_1.default.findByTenantAndUser(tenant.id, this.options.currentUser.id, Object.assign(Object.assign({}, this.options), { transaction }));
        if (tenantUser) {
            // If found the invited tenant user via email
            // accepts the invitation
            if (tenantUser.status === 'invited') {
                return tenantUserRepository_1.default.acceptInvitation(tenantUser.invitationToken, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            // In this case the tenant user already exists
            // and it's accepted or with empty permissions
            return undefined;
        }
        return tenantUserRepository_1.default.create(tenant, this.options.currentUser, roles, Object.assign(Object.assign({}, this.options), { transaction }));
    }
    // In case this user has been invited
    // but havent used the invitation token
    async joinDefaultUsingInvitedEmail(transaction) {
        const tenant = await tenantRepository_1.default.findDefault(Object.assign(Object.assign({}, this.options), { transaction }));
        if (!tenant) {
            return undefined;
        }
        const tenantUser = await tenantUserRepository_1.default.findByTenantAndUser(tenant.id, this.options.currentUser.id, Object.assign(Object.assign({}, this.options), { transaction }));
        if (!tenantUser || tenantUser.status !== 'invited') {
            return undefined;
        }
        return tenantUserRepository_1.default.acceptInvitation(tenantUser.invitationToken, Object.assign(Object.assign({}, this.options), { transaction }));
    }
    async create(data) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            if (index_1.TENANT_MODE === configTypes_1.TenantMode.SINGLE) {
                const count = await tenantRepository_1.default.count(null, Object.assign(Object.assign({}, this.options), { transaction }));
                if (count > 0) {
                    throw new common_1.Error400(this.options.language, 'tenant.exists');
                }
            }
            if (data.integrationsRequired) {
                // Convert all to lowercase
                data.integrationsRequired = data.integrationsRequired.map((item) => item.toLowerCase());
            }
            const record = await tenantRepository_1.default.create(data, Object.assign(Object.assign({}, this.options), { transaction }));
            const segment = await new segmentService_1.default(Object.assign(Object.assign({}, this.options), { currentTenant: record, transaction })).createProjectGroup({
                name: data.name,
                url: data.url,
                slug: data.url || (await tenantRepository_1.default.generateTenantUrl(data.name, this.options)),
                status: types_1.SegmentStatus.ACTIVE,
            });
            this.options.currentSegments = [segment.projects[0].subprojects[0]];
            await settingsService_1.default.findOrCreateDefault(Object.assign(Object.assign({}, this.options), { currentTenant: record, transaction }));
            const memberAttributeSettingsService = new memberAttributeSettingsService_1.default(Object.assign(Object.assign({}, this.options), { currentTenant: record }));
            // create default member attribute settings
            await memberAttributeSettingsService.createPredefined(integrations_1.DEFAULT_MEMBER_ATTRIBUTES, transaction);
            await tenantUserRepository_1.default.create(record, this.options.currentUser, [roles_1.default.values.admin], Object.assign(Object.assign({}, this.options), { transaction }));
            // create default microservices for the tenant
            await microserviceRepository_1.default.create({ type: microserviceTypes.membersScore }, Object.assign(Object.assign({}, this.options), { transaction, currentTenant: record }));
            // create default report for the tenant
            const report = await reportRepository_1.default.create({
                name: default_report_json_1.default.name,
                public: default_report_json_1.default.public,
            }, Object.assign(Object.assign({}, this.options), { transaction, currentTenant: record }));
            // create member template report
            await reportRepository_1.default.create({
                name: 'Members report',
                public: false,
                isTemplate: true,
                noSegment: true,
            }, Object.assign(Object.assign({}, this.options), { transaction, currentTenant: record }));
            // create community-product fit template report
            await reportRepository_1.default.create({
                name: 'Product-community fit report',
                public: false,
                isTemplate: true,
                noSegment: true,
            }, Object.assign(Object.assign({}, this.options), { transaction, currentTenant: record }));
            // create activities template report
            await reportRepository_1.default.create({
                name: 'Activities report',
                public: false,
                isTemplate: true,
                noSegment: true,
            }, Object.assign(Object.assign({}, this.options), { transaction, currentTenant: record }));
            for (const widgetToCreate of default_report_json_1.default.widgets) {
                await widgetRepository_1.default.create(Object.assign(Object.assign({}, widgetToCreate), { report: report.id }), Object.assign(Object.assign({}, this.options), { transaction, currentTenant: record }));
            }
            // create dashboard widgets
            for (const widgetType of dashboard_widgets_json_1.default) {
                await widgetRepository_1.default.create({ type: widgetType }, Object.assign(Object.assign({}, this.options), { transaction, currentTenant: record }));
            }
            // create suggested tasks
            await taskRepository_1.default.createSuggestedTasks(Object.assign(Object.assign({}, this.options), { transaction, currentTenant: record }));
            // create default custom views
            for (const entity of Object.values(customView_1.defaultCustomViews)) {
                for (const customView of entity) {
                    await customViewRepository_1.default.create(customView, Object.assign(Object.assign({}, this.options), { transaction, currentTenant: record }));
                }
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return record;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async update(id, data, force = false) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            let record = await tenantRepository_1.default.findById(id, Object.assign(Object.assign({}, this.options), { transaction, currentTenant: { id } }));
            if (data.hasSampleData === undefined) {
                data.hasSampleData = record.hasSampleData;
            }
            if (!force) {
                new permissionChecker_1.default(Object.assign(Object.assign({}, this.options), { currentTenant: { id } })).validateHas(permissions_1.default.values.tenantEdit);
            }
            // if tenant already has some published conversations, updating url is not allowed
            if (data.url && data.url !== record.url) {
                const publishedConversations = await conversationRepository_1.default.findAndCountAll({ filter: { published: true } }, Object.assign(Object.assign({}, this.options), { transaction, currentTenant: record }));
                if (publishedConversations.count > 0) {
                    throw new common_1.Error400(this.options.language, 'tenant.errors.publishedConversationExists');
                }
            }
            record = await tenantRepository_1.default.update(id, data, Object.assign(Object.assign({}, this.options), { transaction, currentTenant: record }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return record;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async viewOrganizations() {
        return settingsService_1.default.save({ organizationsViewed: true }, this.options);
    }
    async viewContacts() {
        return settingsService_1.default.save({ contactsViewed: true }, this.options);
    }
    async updatePlanUser(id, planStripeCustomerId, planUserId) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            await tenantRepository_1.default.updatePlanUser(id, planStripeCustomerId, planUserId, Object.assign(Object.assign({}, this.options), { transaction, currentTenant: { id }, bypassPermissionValidation: true }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async updatePlanToFree(planStripeCustomerId) {
        return this.updatePlanStatus(planStripeCustomerId, plans_1.default.values.essential, 'active');
    }
    async updatePlanStatus(planStripeCustomerId, plan, planStatus) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            await tenantRepository_1.default.updatePlanStatus(planStripeCustomerId, plan, planStatus, Object.assign(Object.assign({}, this.options), { transaction, bypassPermissionValidation: true }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async destroyAll(ids) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            for (const id of ids) {
                const tenant = await tenantRepository_1.default.findById(id, Object.assign(Object.assign({}, this.options), { transaction, currentTenant: { id } }));
                new permissionChecker_1.default(Object.assign(Object.assign({}, this.options), { currentTenant: tenant })).validateHas(permissions_1.default.values.tenantDestroy);
                if (!plans_1.default.allowTenantDestroy(tenant.plan, tenant.planStatus)) {
                    throw new common_1.Error400(this.options.language, 'tenant.planActive');
                }
                await tenantRepository_1.default.destroy(id, Object.assign(Object.assign({}, this.options), { transaction, currentTenant: { id } }));
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async findById(id, options) {
        options = options || {};
        return tenantRepository_1.default.findById(id, Object.assign(Object.assign({}, this.options), options));
    }
    async findByUrl(url, options) {
        options = options || {};
        return tenantRepository_1.default.findByUrl(url, Object.assign(Object.assign({}, this.options), options));
    }
    async findAllAutocomplete(search, limit) {
        return tenantRepository_1.default.findAllAutocomplete(search, limit, this.options);
    }
    async findAndCountAll(args) {
        return tenantRepository_1.default.findAndCountAll(args, this.options);
    }
    /**
     * Find all tenants bypassing default user filter
     * @param args filter argument
     * @returns count and rows of found tenants
     */
    static async _findAndCountAllForEveryUser(args) {
        const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
        const filterUsers = false;
        return tenantRepository_1.default.findAndCountAll(args, options, filterUsers);
    }
    async acceptInvitation(token, forceAcceptOtherEmail = false) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            const tenantUser = await tenantUserRepository_1.default.findByInvitationToken(token, Object.assign(Object.assign({}, this.options), { transaction }));
            if (!tenantUser || tenantUser.status !== 'invited') {
                throw new common_1.Error404();
            }
            const isNotCurrentUserEmail = tenantUser.user.id !== this.options.currentUser.id;
            if (!forceAcceptOtherEmail && isNotCurrentUserEmail) {
                throw new common_1.Error400(this.options.language, 'tenant.invitation.notSameEmail', tenantUser.user.email, this.options.currentUser.email);
            }
            await tenantUserRepository_1.default.acceptInvitation(token, Object.assign(Object.assign({}, this.options), { currentTenant: { id: tenantUser.tenant.id }, transaction }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return tenantUser.tenant;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async declineInvitation(token) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            const tenantUser = await tenantUserRepository_1.default.findByInvitationToken(token, Object.assign(Object.assign({}, this.options), { transaction }));
            if (!tenantUser || tenantUser.status !== 'invited') {
                throw new common_1.Error404();
            }
            await tenantUserRepository_1.default.destroy(tenantUser.tenant.id, this.options.currentUser.id, Object.assign(Object.assign({}, this.options), { transaction, currentTenant: { id: tenantUser.tenant.id } }));
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async import(data, importHash) {
        if (!importHash) {
            throw new common_1.Error400(this.options.language, 'importer.errors.importHashRequired');
        }
        if (await this._isImportHashExistent(importHash)) {
            throw new common_1.Error400(this.options.language, 'importer.errors.importHashExistent');
        }
        const dataToCreate = Object.assign(Object.assign({}, data), { importHash });
        return this.create(dataToCreate);
    }
    async _isImportHashExistent(importHash) {
        const count = await tenantRepository_1.default.count({
            importHash,
        }, this.options);
        return count > 0;
    }
    /**
     * Return a list of all the memberToMerge suggestions available in the
     * tenant's members
     */
    async findMembersToMerge(args) {
        const memberService = new memberService_1.default(this.options);
        return memberService.findMembersWithMergeSuggestions(args);
    }
    async findOrganizationsToMerge(args) {
        const organizationService = new organizationService_1.default(this.options);
        return organizationService.findOrganizationsWithMergeSuggestions(args);
    }
}
exports.default = TenantService;
//# sourceMappingURL=tenantService.js.map