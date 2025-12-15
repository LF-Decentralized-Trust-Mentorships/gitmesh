"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const common_1 = require("@gitmesh/common");
const emailSender_1 = __importDefault(require("../emailSender"));
const userRepository_1 = __importDefault(require("../../database/repositories/userRepository"));
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
const tenantUserRepository_1 = __importDefault(require("../../database/repositories/tenantUserRepository"));
const tenantSubdomain_1 = require("../tenantSubdomain");
class UserCreator {
    constructor(options) {
        this.emailsToInvite = [];
        this.emails = [];
        this.sendInvitationEmails = true;
        this.options = options;
    }
    /**
     * Creates new user(s) via the User page.
     * Sends Invitation Emails if flagged.
     */
    async execute(data, sendInvitationEmails = true) {
        this.data = data;
        this.sendInvitationEmails = sendInvitationEmails;
        await this._validate();
        try {
            this.transaction = await sequelizeRepository_1.default.createTransaction(this.options);
            await this._addOrUpdateAll();
            await sequelizeRepository_1.default.commitTransaction(this.transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(this.transaction);
            throw error;
        }
        if (this._hasEmailsToInvite) {
            await this._sendAllInvitationEmails();
        }
        else {
            throw new common_1.Error409('en', 'user.errors.userAlreadyExists');
        }
        return this.emailsToInvite;
    }
    get _roles() {
        if (this.data.roles && !Array.isArray(this.data.roles)) {
            return [this.data.roles];
        }
        const uniqueRoles = [...new Set(this.data.roles)];
        return uniqueRoles;
    }
    get _emails() {
        if (this.data.emails && !Array.isArray(this.data.emails)) {
            this.emails = [this.data.emails];
        }
        else {
            const uniqueEmails = [...new Set(this.data.emails)];
            this.emails = uniqueEmails;
        }
        return this.emails.map((email) => email.trim());
    }
    /**
     * Creates or updates many users at once.
     */
    async _addOrUpdateAll() {
        return Promise.all(this.emails.map((email) => this._addOrUpdate(email)));
    }
    /**
     * Creates or updates the user passed.
     * If the user already exists, it only adds the role to the user.
     */
    async _addOrUpdate(email) {
        let user = await userRepository_1.default.findByEmailWithoutAvatar(email, Object.assign(Object.assign({}, this.options), { transaction: this.transaction }));
        if (!user) {
            user = await userRepository_1.default.create({ email }, Object.assign(Object.assign({}, this.options), { transaction: this.transaction }));
        }
        const isUserAlreadyInTenant = user.tenants.some((userTenant) => userTenant.tenant.id === this.options.currentTenant.id);
        const tenantUser = await tenantUserRepository_1.default.updateRoles(this.options.currentTenant.id, user.id, this._roles, Object.assign(Object.assign({}, this.options), { addRoles: true, transaction: this.transaction }), true);
        if (!isUserAlreadyInTenant) {
            this.emailsToInvite.push({
                email,
                token: tenantUser.invitationToken,
            });
        }
    }
    /**
     * Verify if there are emails to invite.
     */
    get _hasEmailsToInvite() {
        return this.emailsToInvite && this.emailsToInvite.length;
    }
    /**
     * Sends all invitation emails.
     */
    async _sendAllInvitationEmails() {
        if (!this.sendInvitationEmails) {
            return undefined;
        }
        return Promise.all(this.emailsToInvite.map((emailToInvite) => {
            const link = `${tenantSubdomain_1.tenantSubdomain.frontendUrl(this.options.currentTenant)}/auth/invitation?token=${emailToInvite.token}`;
            return new emailSender_1.default(emailSender_1.default.TEMPLATES.INVITATION, {
                tenant: this.options.currentTenant,
                link,
            }).sendTo(emailToInvite.email);
        }));
    }
    /**
     * Validates the user(s) data.
     */
    async _validate() {
        (0, assert_1.default)(this.options.currentUser, 'currentUser is required');
        (0, assert_1.default)(this.options.currentTenant.id, 'tenantId is required');
        (0, assert_1.default)(this.options.currentUser.id, 'currentUser.id is required');
        (0, assert_1.default)(this.options.currentUser.email, 'currentUser.email is required');
        (0, assert_1.default)(this._emails && this._emails.length, 'emails is required');
        (0, assert_1.default)(this._roles && this._roles.length, 'roles is required');
    }
}
exports.default = UserCreator;
//# sourceMappingURL=userCreator.js.map