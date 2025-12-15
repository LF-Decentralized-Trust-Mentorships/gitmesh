"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const moment_1 = __importDefault(require("moment"));
const common_1 = require("@gitmesh/common");
const logging_1 = require("@gitmesh/logging");
const configTypes_1 = require("../../conf/configTypes");
const userRepository_1 = __importDefault(require("../../database/repositories/userRepository"));
const emailSender_1 = __importDefault(require("../emailSender"));
const tenantUserRepository_1 = __importDefault(require("../../database/repositories/tenantUserRepository"));
const sequelizeRepository_1 = __importDefault(require("../../database/repositories/sequelizeRepository"));
const conf_1 = require("../../conf");
const tenantService_1 = __importDefault(require("../tenantService"));
const tenantRepository_1 = __importDefault(require("../../database/repositories/tenantRepository"));
const tenantSubdomain_1 = require("../tenantSubdomain");
const identify_1 = __importDefault(require("../../segment/identify"));
const track_1 = __importDefault(require("../../segment/track"));
const BCRYPT_SALT_ROUNDS = 12;
const log = (0, logging_1.getServiceChildLogger)('AuthService');
class AuthService {
    static async signup(email, password, invitationToken, tenantId, firstName, lastName, acceptedTermsAndPrivacy, options = {}) {
        const transaction = await sequelizeRepository_1.default.createTransaction(options);
        try {
            email = email.toLowerCase();
            const existingUser = await userRepository_1.default.findByEmail(email, options);
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])([^ \t]{8,})$/;
            if (!passwordRegex.test(password)) {
                throw new common_1.Error400(options.language, 'auth.passwordInvalid');
            }
            // Generates a hashed password to hide the original one.
            const hashedPassword = await bcrypt_1.default.hash(password, BCRYPT_SALT_ROUNDS);
            // The user may already exist on the database in case it was invided.
            if (existingUser) {
                // If the user already have an password,
                // it means that it has already signed up
                const existingPassword = await userRepository_1.default.findPassword(existingUser.id, options);
                if (existingPassword) {
                    throw new common_1.Error400(options.language, 'auth.emailAlreadyInUse');
                }
                /**
                 * In the case of the user exists on the database (was invited)
                 * it only creates the new password
                 */
                await userRepository_1.default.updatePassword(existingUser.id, hashedPassword, false, Object.assign(Object.assign({}, options), { transaction, bypassPermissionValidation: true }));
                // Handles onboarding process like
                // invitation, creation of default tenant,
                // or default joining the current tenant
                await this.handleOnboard(existingUser, invitationToken, tenantId, Object.assign(Object.assign({}, options), { transaction }));
                // Email may have been alreadyverified using the invitation token
                const isEmailVerified = Boolean(await userRepository_1.default.count({
                    emailVerified: true,
                    id: existingUser.id,
                }, Object.assign(Object.assign({}, options), { transaction })));
                if (!isEmailVerified && emailSender_1.default.isConfigured) {
                    await this.sendEmailAddressVerificationEmail(options.language, existingUser.email, tenantId, Object.assign(Object.assign({}, options), { transaction, bypassPermissionValidation: true }));
                }
                const token = jsonwebtoken_1.default.sign({ id: existingUser.id }, conf_1.API_CONFIG.jwtSecret, {
                    expiresIn: conf_1.API_CONFIG.jwtExpiresIn,
                });
                await sequelizeRepository_1.default.commitTransaction(transaction);
                // Identify in Segment
                (0, identify_1.default)(existingUser);
                (0, track_1.default)('Signed up', {
                    invitation: true,
                    email: existingUser.email,
                }, options, existingUser.id);
                return token;
            }
            firstName = firstName || email.split('@')[0];
            lastName = lastName || '';
            const fullName = `${firstName} ${lastName}`.trim();
            const newUser = await userRepository_1.default.createFromAuth({
                firstName,
                lastName,
                fullName,
                password: hashedPassword,
                email,
                acceptedTermsAndPrivacy,
            }, Object.assign(Object.assign({}, options), { transaction }));
            // Handles onboarding process like
            // invitation, creation of default tenant,
            // or default joining the current tenant
            await this.handleOnboard(newUser, invitationToken, tenantId, Object.assign(Object.assign({}, options), { transaction }));
            // Email may have been alreadyverified using the invitation token
            const isEmailVerified = Boolean(await userRepository_1.default.count({
                emailVerified: true,
                id: newUser.id,
            }, Object.assign(Object.assign({}, options), { transaction })));
            if (!isEmailVerified && emailSender_1.default.isConfigured) {
                await this.sendEmailAddressVerificationEmail(options.language, newUser.email, tenantId, Object.assign(Object.assign({}, options), { transaction }));
            }
            // Identify in Segment
            (0, identify_1.default)(newUser);
            (0, track_1.default)('Signed up', {
                invitation: true,
                email: newUser.email,
            }, options, newUser.id);
            const token = jsonwebtoken_1.default.sign({ id: newUser.id }, conf_1.API_CONFIG.jwtSecret, {
                expiresIn: conf_1.API_CONFIG.jwtExpiresIn,
            });
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return token;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    static async findByEmail(email, options = {}) {
        email = email.toLowerCase();
        return userRepository_1.default.findByEmail(email, options);
    }
    static async signin(email, password, invitationToken, tenantId, options = {}) {
        const transaction = await sequelizeRepository_1.default.createTransaction(options);
        try {
            email = email.toLowerCase();
            const user = await userRepository_1.default.findByEmail(email, options);
            if (!user) {
                throw new common_1.Error400(options.language, 'auth.userNotFound');
            }
            const currentPassword = await userRepository_1.default.findPassword(user.id, options);
            if (!currentPassword) {
                throw new common_1.Error400(options.language, 'auth.wrongPassword');
            }
            const passwordsMatch = await bcrypt_1.default.compare(password, currentPassword);
            if (!passwordsMatch) {
                throw new common_1.Error400(options.language, 'auth.wrongPassword');
            }
            // Handles onboarding process like
            // invitation, creation of default tenant,
            // or default joining the current tenant
            await this.handleOnboard(user, invitationToken, tenantId, Object.assign(Object.assign({}, options), { currentUser: user, transaction }));
            const token = jsonwebtoken_1.default.sign({ id: user.id }, conf_1.API_CONFIG.jwtSecret, {
                expiresIn: conf_1.API_CONFIG.jwtExpiresIn,
            });
            (0, identify_1.default)(user);
            (0, track_1.default)('Signed in', {
                email: user.email,
            }, options, user.id);
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return token;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    static async handleOnboard(currentUser, invitationToken, tenantId, options) {
        if (invitationToken) {
            try {
                await tenantUserRepository_1.default.acceptInvitation(invitationToken, Object.assign(Object.assign({}, options), { currentUser, bypassPermissionValidation: true }));
            }
            catch (error) {
                log.error(error, 'Error handling onboard!');
                // In case of invitation acceptance error, does not prevent
                // the user from sign up/in
            }
        }
        const isMultiTenantViaSubdomain = [configTypes_1.TenantMode.MULTI, configTypes_1.TenantMode.MULTI_WITH_SUBDOMAIN].includes(conf_1.TENANT_MODE) && tenantId;
        if (isMultiTenantViaSubdomain) {
            await new tenantService_1.default(Object.assign(Object.assign({}, options), { currentUser })).joinWithDefaultRolesOrAskApproval({
                tenantId,
                // leave empty to require admin's approval
                roles: [],
            }, options);
        }
        const singleTenant = conf_1.TENANT_MODE === configTypes_1.TenantMode.SINGLE;
        if (singleTenant) {
            // In case is single tenant, and the user is signing in
            // with an invited email and for some reason doesn't have the token
            // it auto-assigns it
            await new tenantService_1.default(Object.assign(Object.assign({}, options), { currentUser })).joinDefaultUsingInvitedEmail(options.transaction);
            // Creates or join default Tenant
            await new tenantService_1.default(Object.assign(Object.assign({}, options), { currentUser })).createOrJoinDefault({
                // leave empty to require admin's approval
                roles: [],
            }, options.transaction);
        }
    }
    static async findByToken(token, options) {
        return new Promise((resolve, reject) => {
            jsonwebtoken_1.default.verify(token, conf_1.API_CONFIG.jwtSecret, (err, decoded) => {
                if (err) {
                    reject(err);
                    return;
                }
                const { id } = decoded;
                const jwtTokenIat = decoded.iat;
                userRepository_1.default.findById(id, Object.assign(Object.assign({}, options), { bypassPermissionValidation: true }))
                    .then((user) => {
                    const isTokenManuallyExpired = user &&
                        user.jwtTokenInvalidBefore &&
                        moment_1.default.unix(jwtTokenIat).isBefore((0, moment_1.default)(user.jwtTokenInvalidBefore));
                    if (isTokenManuallyExpired) {
                        reject(new common_1.Error401());
                        return;
                    }
                    // If the email sender id not configured,
                    // removes the need for email verification.
                    if (user && !emailSender_1.default.isConfigured) {
                        user.emailVerified = true;
                    }
                    resolve(user);
                })
                    .catch((error) => reject(error));
            });
        });
    }
    static async sendEmailAddressVerificationEmail(language, email, tenantId, options) {
        if (!emailSender_1.default.isConfigured) {
            throw new common_1.Error400(language, 'email.error');
        }
        let link;
        try {
            let tenant;
            if (tenantId) {
                tenant = await tenantRepository_1.default.findById(tenantId, Object.assign({}, options));
            }
            email = email.toLowerCase();
            const token = await userRepository_1.default.generateEmailVerificationToken(email, options);
            link = `${tenantSubdomain_1.tenantSubdomain.frontendUrl(tenant)}/auth/verify-email?token=${token}`;
        }
        catch (error) {
            log.error(error, 'Error sending email address verification email!');
            throw new common_1.Error400(language, 'auth.emailAddressVerificationEmail.error');
        }
        return new emailSender_1.default(emailSender_1.default.TEMPLATES.EMAIL_ADDRESS_VERIFICATION, { link }).sendTo(email);
    }
    static async sendPasswordResetEmail(language, email, tenantId, options) {
        if (!emailSender_1.default.isConfigured) {
            throw new common_1.Error400(language, 'email.error');
        }
        let link;
        try {
            let tenant;
            if (tenantId) {
                tenant = await tenantRepository_1.default.findById(tenantId, Object.assign({}, options));
            }
            email = email.toLowerCase();
            const token = await userRepository_1.default.generatePasswordResetToken(email, options);
            link = `${tenantSubdomain_1.tenantSubdomain.frontendUrl(tenant)}/auth/password-reset?token=${token}`;
        }
        catch (error) {
            log.error(error, 'Error sending password reset email');
            throw new common_1.Error400(language, 'auth.passwordReset.error');
        }
        return new emailSender_1.default(emailSender_1.default.TEMPLATES.PASSWORD_RESET, { link }).sendTo(email);
    }
    static async verifyEmail(token, options) {
        const { currentUser } = options;
        const user = await userRepository_1.default.findByEmailVerificationToken(token, options);
        if (!user) {
            throw new common_1.Error400(options.language, 'auth.emailAddressVerificationEmail.invalidToken');
        }
        if (currentUser && currentUser.id && currentUser.id !== user.id) {
            throw new common_1.Error400(options.language, 'auth.emailAddressVerificationEmail.signedInAsWrongUser', user.email, currentUser.email);
        }
        return userRepository_1.default.markEmailVerified(user.id, options);
    }
    static async passwordReset(token, password, options = {}) {
        const user = await userRepository_1.default.findByPasswordResetToken(token, options);
        if (!user) {
            throw new common_1.Error400(options.language, 'auth.passwordReset.invalidToken');
        }
        const hashedPassword = await bcrypt_1.default.hash(password, BCRYPT_SALT_ROUNDS);
        return userRepository_1.default.updatePassword(user.id, hashedPassword, true, Object.assign(Object.assign({}, options), { bypassPermissionValidation: true }));
    }
    static async changePassword(oldPassword, newPassword, options) {
        const { currentUser } = options;
        const currentPassword = await userRepository_1.default.findPassword(options.currentUser.id, options);
        const passwordsMatch = await bcrypt_1.default.compare(oldPassword, currentPassword);
        if (!passwordsMatch) {
            throw new common_1.Error400(options.language, 'auth.passwordChange.invalidPassword');
        }
        const newHashedPassword = await bcrypt_1.default.hash(newPassword, BCRYPT_SALT_ROUNDS);
        return userRepository_1.default.updatePassword(currentUser.id, newHashedPassword, true, options);
    }
    static async signinFromSocial(provider, providerId, email, emailVerified, firstName, lastName, fullName, options = {}) {
        if (!email) {
            throw new Error('auth-no-email');
        }
        const transaction = await sequelizeRepository_1.default.createTransaction(options);
        try {
            email = email.toLowerCase();
            let user = await userRepository_1.default.findByEmail(email, options);
            if (user) {
                (0, identify_1.default)(user);
                (0, track_1.default)('Signed in', {
                    [provider]: true,
                    email: user.email,
                }, options, user.id);
            }
            // If there was no provider, we can link it to the provider
            if (user && (user.provider === undefined || user.provider === null || user.emailVerified)) {
                await userRepository_1.default.update(user.id, {
                    firstName,
                    lastName,
                    provider,
                    providerId,
                    emailVerified,
                }, options);
                log.debug({ user }, 'User');
            }
            else if (user && (user.provider !== provider || user.providerId !== providerId)) {
                throw new Error('auth-invalid-provider');
            }
            if (!user) {
                user = await userRepository_1.default.createFromSocial(provider, providerId, email, emailVerified, firstName, lastName, fullName, options);
                (0, identify_1.default)(user);
                (0, track_1.default)('Signed up', {
                    [provider]: true,
                    email: user.email,
                }, options, user.id);
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id }, conf_1.API_CONFIG.jwtSecret, {
                expiresIn: conf_1.API_CONFIG.jwtExpiresIn,
            });
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return token;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    static async signinFromSSO(provider, providerId, email, emailVerified, firstName, lastName, fullName, invitationToken, tenantId, options = {}) {
        if (!email) {
            throw new Error('auth-no-email');
        }
        const transaction = await sequelizeRepository_1.default.createTransaction(options);
        try {
            email = email.toLowerCase();
            let user = await userRepository_1.default.findByEmail(email, options);
            if (user) {
                (0, identify_1.default)(user);
                (0, track_1.default)('Signed in', {
                    [provider]: true,
                    email: user.email,
                }, options, user.id);
            }
            // If there was no provider, we can link it to the provider
            if (user && (!user.provider || !user.providerId)) {
                await userRepository_1.default.update(user.id, {
                    provider,
                    providerId,
                    emailVerified: true,
                }, options);
                log.debug({ user }, 'User');
            }
            if (user && !user.emailVerified && emailVerified) {
                await userRepository_1.default.update(user.id, {
                    emailVerified,
                }, options);
                log.debug({ user }, 'User');
            }
            if (!user) {
                user = await userRepository_1.default.createFromSocial(provider, providerId, email, emailVerified, firstName, lastName, fullName, options);
                (0, identify_1.default)(user);
                (0, track_1.default)('Signed up', {
                    [provider]: true,
                    email: user.email,
                }, options, user.id);
            }
            if (invitationToken) {
                await this.handleOnboard(user, invitationToken, tenantId, Object.assign(Object.assign({}, options), { transaction }));
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id }, conf_1.API_CONFIG.jwtSecret, {
                expiresIn: conf_1.API_CONFIG.jwtExpiresIn,
            });
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return token;
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
}
exports.default = AuthService;
//# sourceMappingURL=authService.js.map