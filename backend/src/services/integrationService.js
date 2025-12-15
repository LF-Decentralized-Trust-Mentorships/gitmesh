"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_app_1 = require("@octokit/auth-app");
const request_1 = require("@octokit/request");
const moment_1 = __importDefault(require("moment"));
const lodash_1 = __importDefault(require("lodash"));
const axios_1 = __importDefault(require("axios"));
const types_1 = require("@gitmesh/types");
const common_1 = require("@gitmesh/common");
const integrations_1 = require("@gitmesh/integrations");
const index_1 = require("../conf/index");
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
const integrationRepository_1 = __importDefault(require("../database/repositories/integrationRepository"));
const track_1 = __importDefault(require("../segment/track"));
const getInstalledRepositories_1 = require("../serverless/integrations/usecases/github/rest/getInstalledRepositories");
const telemetryTrack_1 = __importDefault(require("../segment/telemetryTrack"));
const getToken_1 = __importDefault(require("../serverless/integrations/usecases/nango/getToken"));
const getOrganizations_1 = require("../serverless/integrations/usecases/linkedin/getOrganizations");
const serviceSQS_1 = require("../serverless/utils/serviceSQS");
const memberAttributeSettingsRepository_1 = __importDefault(require("../database/repositories/memberAttributeSettingsRepository"));
const tenantRepository_1 = __importDefault(require("../database/repositories/tenantRepository"));
const githubReposRepository_1 = __importDefault(require("../database/repositories/githubReposRepository"));
const memberService_1 = __importDefault(require("./memberService"));
const organizationService_1 = __importDefault(require("./organizationService"));
const memberSyncRemoteRepository_1 = __importDefault(require("@/database/repositories/memberSyncRemoteRepository"));
const organizationSyncRemoteRepository_1 = __importDefault(require("@/database/repositories/organizationSyncRemoteRepository"));
const memberRepository_1 = __importDefault(require("@/database/repositories/memberRepository"));
const searchSyncService_1 = __importDefault(require("./searchSyncService"));
const discordToken = index_1.DISCORD_CONFIG.token || index_1.DISCORD_CONFIG.token2;
class IntegrationService {
    constructor(options) {
        this.options = options;
    }
    async createOrUpdate(data, transaction) {
        try {
            const record = await integrationRepository_1.default.findByPlatform(data.platform, Object.assign(Object.assign({}, this.options), { transaction }));
            const updatedRecord = await this.update(record.id, data, transaction);
            if (!index_1.IS_TEST_ENV) {
                (0, track_1.default)('Integration Updated', {
                    id: data.id,
                    platform: data.platform,
                    status: data.status,
                }, Object.assign({}, this.options));
            }
            return updatedRecord;
        }
        catch (error) {
            if (error.code === 404) {
                const record = await this.create(data, transaction);
                if (!index_1.IS_TEST_ENV) {
                    (0, track_1.default)('Integration Created', {
                        id: data.id,
                        platform: data.platform,
                        status: data.status,
                    }, Object.assign({}, this.options));
                    (0, telemetryTrack_1.default)('Integration created', {
                        id: record.id,
                        createdAt: record.createdAt,
                        platform: record.platform,
                    }, this.options);
                }
                return record;
            }
            throw error;
        }
    }
    /**
     * Find all active integrations for a tenant
     * @returns The active integrations for a tenant
     */
    async getAllActiveIntegrations() {
        return integrationRepository_1.default.findAndCountAll({ filter: { status: 'done' } }, this.options);
    }
    async findByPlatform(platform) {
        return integrationRepository_1.default.findByPlatform(platform, this.options);
    }
    async findAllByPlatform(platform) {
        return integrationRepository_1.default.findAllByPlatform(platform, this.options);
    }
    async create(data, transaction) {
        try {
            const record = await integrationRepository_1.default.create(data, Object.assign(Object.assign({}, this.options), { transaction }));
            return record;
        }
        catch (error) {
            sequelizeRepository_1.default.handleUniqueFieldError(error, this.options.language, 'integration');
            throw error;
        }
    }
    async update(id, data, transaction) {
        try {
            const record = await integrationRepository_1.default.update(id, data, Object.assign(Object.assign({}, this.options), { transaction }));
            return record;
        }
        catch (err) {
            sequelizeRepository_1.default.handleUniqueFieldError(err, this.options.language, 'integration');
            throw err;
        }
    }
    async destroyAll(ids) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            for (const id of ids) {
                await integrationRepository_1.default.destroy(id, Object.assign(Object.assign({}, this.options), { transaction }));
            }
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (error) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw error;
        }
    }
    async findById(id) {
        return integrationRepository_1.default.findById(id, this.options);
    }
    async findAllAutocomplete(search, limit) {
        return integrationRepository_1.default.findAllAutocomplete(search, limit, this.options);
    }
    async findAndCountAll(args) {
        return integrationRepository_1.default.findAndCountAll(args, this.options);
    }
    async query(data) {
        const advancedFilter = data.filter;
        const orderBy = data.orderBy;
        const limit = data.limit;
        const offset = data.offset;
        return integrationRepository_1.default.findAndCountAll({ advancedFilter, orderBy, limit, offset }, this.options);
    }
    async import(data, importHash) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            if (!importHash) {
                throw new common_1.Error400(this.options.language, 'importer.errors.importHashRequired');
            }
            if (await this._isImportHashExistent(importHash)) {
                throw new common_1.Error400(this.options.language, 'importer.errors.importHashExistent');
            }
            const dataToCreate = Object.assign(Object.assign({}, data), { importHash });
            const result = this.create(dataToCreate, transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return await result;
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
    }
    async _isImportHashExistent(importHash) {
        const count = await integrationRepository_1.default.count({
            importHash,
        }, this.options);
        return count > 0;
    }
    /**
     * Returns installation access token for a Github App installation
     * @param installId Install id of the Github app
     * @returns Installation authentication token
     */
    static async getInstallToken(installId) {
        let privateKey = index_1.GITHUB_CONFIG.privateKey;
        if (index_1.KUBE_MODE) {
            privateKey = Buffer.from(privateKey, 'base64').toString('ascii');
        }
        // Note: For local development, the private key should already have actual newlines
        // from the environment variable, so no conversion is needed
        const auth = (0, auth_app_1.createAppAuth)({
            appId: index_1.GITHUB_CONFIG.appId,
            privateKey,
            clientId: index_1.GITHUB_CONFIG.clientId,
            clientSecret: index_1.GITHUB_CONFIG.clientSecret,
        });
        // Retrieve installation access token
        const installationAuthentication = await auth({
            type: 'installation',
            installationId: installId,
        });
        return installationAuthentication.token;
    }
    /**
     * Adds GitHub integration to a tenant and calls the onboarding SOA endpoint
     * @param code Temporary code generated by GitHub after authorize
     * @param installId Install id of the Gitmesh GitHub app
     * @param setupAction
     * @returns integration object
     */
    async connectGithub(code, installId, setupAction = 'install') {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        let integration;
        try {
            if (setupAction === 'request') {
                return await this.createOrUpdate({
                    platform: types_1.PlatformType.GITHUB,
                    status: 'waiting-approval',
                }, transaction);
            }
            let token = null;
            // If we have an OAuth code, try to exchange it for a user token
            // This happens when user goes through OAuth flow
            // If the code is invalid but we have installation_id, we can still proceed
            if (code) {
                try {
                    const GITHUB_AUTH_ACCESSTOKEN_URL = 'https://github.com/login/oauth/access_token';
                    // Getting the GitHub client ID and secret from the .env file.
                    const CLIENT_ID = index_1.GITHUB_CONFIG.clientId;
                    const CLIENT_SECRET = index_1.GITHUB_CONFIG.clientSecret;
                    // Post to GitHub to get token
                    const tokenResponse = await (0, axios_1.default)({
                        method: 'post',
                        url: GITHUB_AUTH_ACCESSTOKEN_URL,
                        data: {
                            client_id: CLIENT_ID,
                            client_secret: CLIENT_SECRET,
                            code,
                        },
                    });
                    // Doing some processing on the token
                    token = tokenResponse.data;
                    token = token.slice(token.search('=') + 1, token.search('&'));
                    // Verify the token is valid
                    const requestWithAuth = request_1.request.defaults({
                        headers: {
                            authorization: `token ${token}`,
                        },
                    });
                    await requestWithAuth('GET /user');
                }
                catch (error) {
                    // If OAuth token exchange fails but we have installation_id, log warning and continue
                    // The GitHub App installation token will be used instead
                    if (installId) {
                        this.options.log.warn({ code, installId, error: error.message }, 'OAuth code exchange failed, but continuing with installation token');
                        token = null;
                    }
                    else {
                        // If we don't have installation_id, this is a critical error
                        throw new common_1.Error542(`Invalid token for GitHub integration. Code: ${code}, setupAction: ${setupAction}. Token: ${token}`);
                    }
                }
            }
            // Using try/catch since we want to return an error if the installation is not validated properly
            // Fetch install token from GitHub, this will allow us to get the
            // repos that the user gave us access to
            const installToken = await IntegrationService.getInstallToken(installId);
            const repos = await (0, getInstalledRepositories_1.getInstalledRepositories)(installToken);
            const githubOwner = IntegrationService.extractOwner(repos, this.options);
            // TODO: I will do this later. For now they can add it manually.
            // // If the git integration is configured, we add the repos to the git config
            // let isGitintegrationConfigured
            // try {
            //   await this.findByPlatform(PlatformType.GIT)
            //   isGitintegrationConfigured = true
            // } catch (err) {
            //   isGitintegrationConfigured = false
            // }
            // if (isGitintegrationConfigured) {
            //   const gitRemotes = await this.gitGetRemotes()
            //   await this.gitConnectOrUpdate({
            //     remotes: [...gitRemotes, ...repos.map((repo) => repo.cloneUrl)],
            //   })
            // }
            let orgAvatar;
            try {
                const response = await (0, request_1.request)('GET /users/{user}', {
                    user: githubOwner,
                });
                orgAvatar = response.data.avatar_url;
            }
            catch (err) {
                this.options.log.warn(err, 'Error while fetching GitHub user!');
            }
            integration = await this.createOrUpdate({
                platform: types_1.PlatformType.GITHUB,
                token: token || 'github-app',
                settings: { repos, updateMemberAttributes: true, orgAvatar },
                integrationIdentifier: installId,
                status: 'mapping',
            }, transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
        return integration;
    }
    static extractOwner(repos, options) {
        const owners = lodash_1.default.countBy(repos, 'owner');
        if (Object.keys(owners).length === 1) {
            return Object.keys(owners)[0];
        }
        options.log.warn('Multiple owners found in GitHub repos!', owners);
        // return the owner with the most repos
        return lodash_1.default.maxBy(Object.keys(owners), (owner) => owners[owner]);
    }
    async mapGithubRepos(integrationId, mapping) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        const txOptions = Object.assign(Object.assign({}, this.options), { transaction });
        try {
            await githubReposRepository_1.default.updateMapping(integrationId, mapping, txOptions);
            const integration = await integrationRepository_1.default.update(integrationId, { status: 'in-progress' }, txOptions);
            this.options.log.info({ tenantId: integration.tenantId }, 'Sending GitHub message to int-run-worker!');
            const emitter = await (0, serviceSQS_1.getIntegrationRunWorkerEmitter)();
            await emitter.triggerIntegrationRun(integration.tenantId, integration.platform, integration.id, true);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
    }
    async getGithubRepos(integrationId) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        const txOptions = Object.assign(Object.assign({}, this.options), { transaction });
        try {
            const mapping = await githubReposRepository_1.default.getMapping(integrationId, txOptions);
            await sequelizeRepository_1.default.commitTransaction(transaction);
            return mapping;
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
    }
    /**
     * Adds discord integration to a tenant
     * @param guildId Guild id of the discord server
     * @returns integration object
     */
    async discordConnect(guildId) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        let integration;
        try {
            this.options.log.info('Creating Discord integration!');
            integration = await this.createOrUpdate({
                platform: types_1.PlatformType.DISCORD,
                integrationIdentifier: guildId,
                token: discordToken,
                settings: { channels: [], updateMemberAttributes: true },
                status: 'in-progress',
            }, transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
        this.options.log.info({ tenantId: integration.tenantId }, 'Sending Discord message to int-run-worker!');
        const emitter = await (0, serviceSQS_1.getIntegrationRunWorkerEmitter)();
        await emitter.triggerIntegrationRun(integration.tenantId, integration.platform, integration.id, true);
        return integration;
    }
    async linkedinOnboard(organizationId) {
        let integration;
        try {
            integration = await integrationRepository_1.default.findByPlatform(types_1.PlatformType.LINKEDIN, Object.assign({}, this.options));
        }
        catch (err) {
            this.options.log.error(err, 'Error while fetching LinkedIn integration from DB!');
            throw new common_1.Error404();
        }
        let valid = false;
        for (const org of integration.settings.organizations) {
            if (org.id === organizationId) {
                org.inUse = true;
                valid = true;
                break;
            }
        }
        if (!valid) {
            this.options.log.error(`No organization with id ${organizationId} found!`);
            throw new common_1.Error404(this.options.language, 'errors.linkedin.noOrganizationFound');
        }
        if (integration.status === 'pending-action') {
            const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
            try {
                integration = await this.createOrUpdate({
                    platform: types_1.PlatformType.LINKEDIN,
                    status: 'in-progress',
                    settings: integration.settings,
                }, transaction);
                await sequelizeRepository_1.default.commitTransaction(transaction);
            }
            catch (err) {
                await sequelizeRepository_1.default.rollbackTransaction(transaction);
                throw err;
            }
            const emitter = await (0, serviceSQS_1.getIntegrationRunWorkerEmitter)();
            await emitter.triggerIntegrationRun(integration.tenantId, integration.platform, integration.id, true);
            return integration;
        }
        this.options.log.error('LinkedIn integration is not in pending-action status!');
        throw new common_1.Error404(this.options.language, 'errors.linkedin.cantOnboardWrongStatus');
    }
    async hubspotStopSyncMember(payload) {
        if (!payload.memberId) {
            throw new Error('memberId is required in the payload while syncing member to hubspot!');
        }
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            const memberService = new memberService_1.default(this.options);
            const member = await memberService.findById(payload.memberId);
            const memberSyncRemoteRepository = new memberSyncRemoteRepository_1.default(Object.assign(Object.assign({}, this.options), { transaction }));
            await memberSyncRemoteRepository.stopMemberManualSync(member.id);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            this.options.log.error(err, 'Error while stopping hubspot member sync!');
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
    }
    async hubspotSyncMember(payload) {
        if (!payload.memberId) {
            throw new Error('memberId is required in the payload while syncing member to hubspot!');
        }
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        let integration;
        let member;
        let memberSyncRemote;
        try {
            integration = await integrationRepository_1.default.findByPlatform(types_1.PlatformType.HUBSPOT, Object.assign(Object.assign({}, this.options), { transaction }));
            member = await memberRepository_1.default.findById(payload.memberId, Object.assign(Object.assign({}, this.options), { transaction }));
            const memberSyncRemoteRepo = new memberSyncRemoteRepository_1.default(Object.assign(Object.assign({}, this.options), { transaction }));
            memberSyncRemote = await memberSyncRemoteRepo.markMemberForSyncing({
                integrationId: integration.id,
                memberId: member.id,
                metaData: null,
                syncFrom: 'manual',
                lastSyncedAt: null,
            });
            integration = await this.createOrUpdate({
                platform: types_1.PlatformType.HUBSPOT,
                settings: Object.assign(Object.assign({}, integration.settings), { syncRemoteEnabled: true }),
            }, transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            this.options.log.error(err, 'Error while starting Hubspot member sync!');
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
        const integrationSyncWorkerEmitter = await (0, serviceSQS_1.getIntegrationSyncWorkerEmitter)();
        await integrationSyncWorkerEmitter.triggerSyncMember(this.options.currentTenant.id, integration.id, payload.memberId, memberSyncRemote.id);
        const searchSyncService = new searchSyncService_1.default(this.options);
        // send it to opensearch because in member.update we bypass while passing transactions
        await searchSyncService.triggerMemberSync(this.options.currentTenant.id, member.id);
    }
    async hubspotStopSyncOrganization(payload) {
        if (!payload.organizationId) {
            throw new Error('organizationId is required in the payload while stopping organization sync to hubspot!');
        }
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        try {
            const organizationService = new organizationService_1.default(this.options);
            const organization = await organizationService.findById(payload.organizationId);
            const organizationSyncRemoteRepository = new organizationSyncRemoteRepository_1.default(Object.assign(Object.assign({}, this.options), { transaction }));
            await organizationSyncRemoteRepository.stopOrganizationManualSync(organization.id);
        }
        catch (err) {
            this.options.log.error(err, 'Error while stopping Hubspot organization sync!');
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
    }
    async hubspotSyncOrganization(payload) {
        if (!payload.organizationId) {
            throw new Error('organizationId is required in the payload while syncing organization to hubspot!');
        }
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        let integration;
        let organization;
        let organizationSyncRemote;
        try {
            integration = await integrationRepository_1.default.findByPlatform(types_1.PlatformType.HUBSPOT, Object.assign(Object.assign({}, this.options), { transaction }));
            const organizationService = new organizationService_1.default(this.options);
            organization = await organizationService.findById(payload.organizationId);
            const organizationSyncRemoteRepo = new organizationSyncRemoteRepository_1.default(Object.assign(Object.assign({}, this.options), { transaction }));
            organizationSyncRemote = await organizationSyncRemoteRepo.markOrganizationForSyncing({
                integrationId: integration.id,
                organizationId: organization.id,
                metaData: null,
                syncFrom: 'manual',
                lastSyncedAt: null,
            });
            integration = await this.createOrUpdate({
                platform: types_1.PlatformType.HUBSPOT,
                settings: Object.assign(Object.assign({}, integration.settings), { syncRemoteEnabled: true }),
            }, transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
            const integrationSyncWorkerEmitter = await (0, serviceSQS_1.getIntegrationSyncWorkerEmitter)();
            await integrationSyncWorkerEmitter.triggerSyncOrganization(this.options.currentTenant.id, integration.id, payload.organizationId, organizationSyncRemote.id);
        }
        catch (err) {
            this.options.log.error(err, 'Error while starting Hubspot organization sync!');
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
    }
    async hubspotOnboard(onboardSettings) {
        if (onboardSettings.enabledFor.length === 0) {
            throw new common_1.Error400(this.options.language, 'errors.hubspot.missingEnabledEntities');
        }
        if (!onboardSettings.attributesMapping.members &&
            !onboardSettings.attributesMapping.organizations) {
            throw new common_1.Error400(this.options.language, 'errors.hubspot.missingAttributesMapping');
        }
        if (onboardSettings.enabledFor.includes(integrations_1.HubspotEntity.MEMBERS) &&
            !onboardSettings.attributesMapping.members) {
            throw new common_1.Error400(this.options.language, 'errors.hubspot.missingAttributesMapping');
        }
        if (onboardSettings.enabledFor.includes(integrations_1.HubspotEntity.ORGANIZATIONS) &&
            !onboardSettings.attributesMapping.organizations) {
            throw new common_1.Error400(this.options.language, 'errors.hubspot.missingAttributesMapping');
        }
        const tenantId = this.options.currentTenant.id;
        let integration;
        try {
            integration = await integrationRepository_1.default.findByPlatform(types_1.PlatformType.HUBSPOT, Object.assign({}, this.options));
        }
        catch (err) {
            this.options.log.error(err, 'Error while fetching HubSpot integration from DB!');
            throw new common_1.Error404();
        }
        const memberAttributeSettings = (await memberAttributeSettingsRepository_1.default.findAndCountAll({}, this.options)).rows;
        const platforms = (await tenantRepository_1.default.getAvailablePlatforms(tenantId, this.options)).map((p) => p.platform);
        const hubspotId = integration.settings.hubspotId;
        const memberMapper = integrations_1.HubspotFieldMapperFactory.getFieldMapper(integrations_1.HubspotEntity.MEMBERS, hubspotId, memberAttributeSettings, platforms);
        const organizationMapper = integrations_1.HubspotFieldMapperFactory.getFieldMapper(integrations_1.HubspotEntity.ORGANIZATIONS, hubspotId);
        // validate members
        if (onboardSettings.attributesMapping.members) {
            for (const field of Object.keys(onboardSettings.attributesMapping.members)) {
                const hubspotProperty = integration.settings.hubspotProperties.members.find((p) => p.name === onboardSettings.attributesMapping.members[field]);
                if (!memberMapper.isFieldMappableToHubspotType(field, hubspotProperty.type)) {
                    throw new Error(`Member field ${field} has incompatible type with hubspot property ${hubspotProperty.name}`);
                }
            }
        }
        // validate organizations
        if (onboardSettings.attributesMapping.organizations) {
            for (const field of Object.keys(onboardSettings.attributesMapping.organizations)) {
                const hubspotProperty = integration.settings.hubspotProperties.organizations.find((p) => p.name === onboardSettings.attributesMapping.organizations[field]);
                if (!organizationMapper.isFieldMappableToHubspotType(field, hubspotProperty.type)) {
                    throw new Error(`Organization field ${field} has incompatible type with hubspot property ${hubspotProperty.name}`);
                }
            }
        }
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        // save attribute mapping and enabledFor
        try {
            integration = await this.createOrUpdate({
                platform: types_1.PlatformType.HUBSPOT,
                settings: Object.assign(Object.assign({}, integration.settings), { attributesMapping: onboardSettings.attributesMapping, enabledFor: onboardSettings.enabledFor, gitmeshAttributes: memberAttributeSettings, platforms }),
                status: 'in-progress',
            }, transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
        // Send queue message that starts the hubspot integration
        const emitter = await (0, serviceSQS_1.getIntegrationRunWorkerEmitter)();
        await emitter.triggerIntegrationRun(integration.tenantId, integration.platform, integration.id, true);
    }
    async hubspotGetLists() {
        const tenantId = this.options.currentTenant.id;
        const nangoId = `${tenantId}-${types_1.PlatformType.HUBSPOT}`;
        let token;
        try {
            token = await (0, getToken_1.default)(nangoId, types_1.PlatformType.HUBSPOT, this.options.log);
        }
        catch (err) {
            this.options.log.error(err, 'Error while verifying HubSpot tenant token in Nango!');
            throw new common_1.Error400(this.options.language, 'errors.noNangoToken.message');
        }
        if (!token) {
            throw new common_1.Error400(this.options.language, 'errors.noNangoToken.message');
        }
        const context = {
            log: this.options.log,
            serviceSettings: {
                nangoId,
                nangoUrl: index_1.NANGO_CONFIG.url,
                nangoSecretKey: index_1.NANGO_CONFIG.secretKey,
            },
        };
        const memberLists = await (0, integrations_1.getHubspotLists)(nangoId, context);
        return {
            members: memberLists,
            organizations: [], // hubspot doesn't support company lists yet
        };
    }
    async hubspotGetMappableFields() {
        const memberAttributeSettings = (await memberAttributeSettingsRepository_1.default.findAndCountAll({}, this.options)).rows;
        const identities = await tenantRepository_1.default.getAvailablePlatforms(this.options.currentTenant.id, this.options);
        // hubspotId is not used while getting the typemap, we can send it null
        const memberMapper = integrations_1.HubspotFieldMapperFactory.getFieldMapper(integrations_1.HubspotEntity.MEMBERS, null, memberAttributeSettings, identities.map((i) => i.platform));
        const organizationMapper = integrations_1.HubspotFieldMapperFactory.getFieldMapper(integrations_1.HubspotEntity.ORGANIZATIONS, null);
        return {
            members: memberMapper.getTypeMap(),
            organizations: organizationMapper.getTypeMap(),
        };
    }
    async hubspotUpdateProperties() {
        const tenantId = this.options.currentTenant.id;
        const nangoId = `${tenantId}-${types_1.PlatformType.HUBSPOT}`;
        let integration;
        try {
            integration = await integrationRepository_1.default.findByPlatform(types_1.PlatformType.HUBSPOT, Object.assign({}, this.options));
        }
        catch (err) {
            this.options.log.error(err, 'Error while fetching HubSpot integration from DB!');
            throw new common_1.Error404();
        }
        let token;
        try {
            token = await (0, getToken_1.default)(nangoId, types_1.PlatformType.HUBSPOT, this.options.log);
        }
        catch (err) {
            this.options.log.error(err, 'Error while verifying HubSpot tenant token in Nango!');
            throw new common_1.Error400(this.options.language, 'errors.noNangoToken.message');
        }
        if (!token) {
            throw new common_1.Error400(this.options.language, 'errors.noNangoToken.message');
        }
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        const context = {
            log: this.options.log,
            serviceSettings: {
                nangoId,
                nangoUrl: index_1.NANGO_CONFIG.url,
                nangoSecretKey: index_1.NANGO_CONFIG.secretKey,
            },
        };
        const hubspotMemberProperties = await (0, integrations_1.getHubspotProperties)(nangoId, integrations_1.HubspotEndpoint.CONTACTS, context);
        const hubspotOrganizationProperties = await (0, integrations_1.getHubspotProperties)(nangoId, integrations_1.HubspotEndpoint.COMPANIES, context);
        try {
            integration = await this.createOrUpdate({
                platform: types_1.PlatformType.HUBSPOT,
                settings: Object.assign(Object.assign({}, integration.settings), { updateMemberAttributes: true, hubspotProperties: {
                        [integrations_1.HubspotEntity.MEMBERS]: hubspotMemberProperties,
                        [integrations_1.HubspotEntity.ORGANIZATIONS]: hubspotOrganizationProperties,
                    } }),
            }, transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
        return integration.settings.hubspotProperties;
    }
    async hubspotConnect() {
        const tenantId = this.options.currentTenant.id;
        const nangoId = `${tenantId}-${types_1.PlatformType.HUBSPOT}`;
        let token;
        try {
            token = await (0, getToken_1.default)(nangoId, types_1.PlatformType.HUBSPOT, this.options.log);
        }
        catch (err) {
            this.options.log.error(err, 'Error while verifying HubSpot tenant token in Nango!');
            throw new common_1.Error400(this.options.language, 'errors.noNangoToken.message');
        }
        if (!token) {
            throw new common_1.Error400(this.options.language, 'errors.noNangoToken.message');
        }
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        let integration;
        const context = {
            log: this.options.log,
            serviceSettings: {
                nangoId,
                nangoUrl: index_1.NANGO_CONFIG.url,
                nangoSecretKey: index_1.NANGO_CONFIG.secretKey,
            },
        };
        const hubspotMemberProperties = await (0, integrations_1.getHubspotProperties)(nangoId, integrations_1.HubspotEndpoint.CONTACTS, context);
        const hubspotOrganizationProperties = await (0, integrations_1.getHubspotProperties)(nangoId, integrations_1.HubspotEndpoint.COMPANIES, context);
        const hubspotInfo = await (0, integrations_1.getHubspotTokenInfo)(nangoId, context);
        try {
            integration = await this.createOrUpdate({
                platform: types_1.PlatformType.HUBSPOT,
                settings: {
                    updateMemberAttributes: true,
                    hubspotProperties: {
                        [integrations_1.HubspotEntity.MEMBERS]: hubspotMemberProperties,
                        [integrations_1.HubspotEntity.ORGANIZATIONS]: hubspotOrganizationProperties,
                    },
                    hubspotId: hubspotInfo.hub_id,
                },
                status: 'pending-action',
            }, transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
        return integration;
    }
    async linkedinConnect() {
        const tenantId = this.options.currentTenant.id;
        const nangoId = `${tenantId}-${types_1.PlatformType.LINKEDIN}`;
        let token;
        try {
            token = await (0, getToken_1.default)(nangoId, types_1.PlatformType.LINKEDIN, this.options.log);
        }
        catch (err) {
            this.options.log.error(err, 'Error while verifying LinkedIn tenant token in Nango!');
            throw new common_1.Error400(this.options.language, 'errors.noNangoToken.message');
        }
        if (!token) {
            throw new common_1.Error400(this.options.language, 'errors.noNangoToken.message');
        }
        // fetch organizations
        let organizations;
        try {
            organizations = await (0, getOrganizations_1.getOrganizations)(nangoId, this.options.log);
        }
        catch (err) {
            this.options.log.error(err, 'Error while fetching LinkedIn organizations!');
            throw new common_1.Error400(this.options.language, 'errors.linkedin.noOrganization');
        }
        if (organizations.length === 0) {
            this.options.log.error('No organization found for LinkedIn integration!');
            throw new common_1.Error400(this.options.language, 'errors.linkedin.noOrganization');
        }
        let status = 'pending-action';
        if (organizations.length === 1) {
            status = 'in-progress';
            organizations[0].inUse = true;
        }
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        let integration;
        try {
            integration = await this.createOrUpdate({
                platform: types_1.PlatformType.LINKEDIN,
                settings: { organizations, updateMemberAttributes: true },
                status,
            }, transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
        if (status === 'in-progress') {
            const emitter = await (0, serviceSQS_1.getIntegrationRunWorkerEmitter)();
            await emitter.triggerIntegrationRun(integration.tenantId, integration.platform, integration.id, true);
        }
        return integration;
    }
    /**
     * Creates the Reddit integration and starts the onboarding
     * @param subreddits Subreddits to track
     * @returns integration object
     */
    async redditOnboard(subreddits) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        let integration;
        try {
            this.options.log.info('Creating reddit integration!');
            integration = await this.createOrUpdate({
                platform: types_1.PlatformType.REDDIT,
                settings: { subreddits, updateMemberAttributes: true },
                status: 'in-progress',
            }, transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
        this.options.log.info({ tenantId: integration.tenantId }, 'Sending reddit message to int-run-worker!');
        const emitter = await (0, serviceSQS_1.getIntegrationRunWorkerEmitter)();
        await emitter.triggerIntegrationRun(integration.tenantId, integration.platform, integration.id, true);
        return integration;
    }
    /**
     * Adds/updates Dev.to integration
     * @param integrationData  to create the integration object
     * @returns integration object
     */
    async devtoConnectOrUpdate(integrationData) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        let integration;
        try {
            this.options.log.info('Creating devto integration!');
            integration = await this.createOrUpdate({
                platform: types_1.PlatformType.DEVTO,
                token: integrationData.apiKey,
                settings: {
                    users: integrationData.users,
                    organizations: integrationData.organizations,
                    articles: [],
                    updateMemberAttributes: true,
                },
                status: 'in-progress',
            }, transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
        this.options.log.info({ tenantId: integration.tenantId }, 'Sending devto message to int-run-worker!');
        const emitter = await (0, serviceSQS_1.getIntegrationRunWorkerEmitter)();
        await emitter.triggerIntegrationRun(integration.tenantId, integration.platform, integration.id, true);
        return integration;
    }
    /**
     * Adds/updates Git integration
     * @param integrationData  to create the integration object
     * @returns integration object
     */
    async gitConnectOrUpdate(integrationData) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        let integration;
        try {
            integration = await this.createOrUpdate({
                platform: types_1.PlatformType.GIT,
                settings: {
                    remotes: integrationData.remotes,
                },
                status: 'done',
            }, transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
        return integration;
    }
    /**
     * Get all remotes for the Git integration, by segment
     * @returns Remotes for the Git integration
     */
    async gitGetRemotes() {
        try {
            const integrations = await this.findAllByPlatform(types_1.PlatformType.GIT);
            return integrations.reduce((acc, integration) => {
                const { id, segmentId, settings: { remotes }, } = integration;
                acc[segmentId] = { remotes, integrationId: id };
                return acc;
            }, {});
        }
        catch (err) {
            throw new common_1.Error400(this.options.language, 'errors.git.noIntegration');
        }
    }
    /**
     * Adds/updates Hacker News integration
     * @param integrationData  to create the integration object
     * @returns integration object
     */
    async hackerNewsConnectOrUpdate(integrationData) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        let integration;
        try {
            integration = await this.createOrUpdate({
                platform: types_1.PlatformType.HACKERNEWS,
                settings: {
                    keywords: integrationData.keywords,
                    urls: integrationData.urls,
                    updateMemberAttributes: true,
                },
                status: 'in-progress',
            }, transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
        this.options.log.info({ tenantId: integration.tenantId }, 'Sending HackerNews message to int-run-worker!');
        const emitter = await (0, serviceSQS_1.getIntegrationRunWorkerEmitter)();
        await emitter.triggerIntegrationRun(integration.tenantId, integration.platform, integration.id, true);
        return integration;
    }
    /**
     * Adds/updates slack integration
     * @param integrationData to create the integration object
     * @returns integration object
     */
    async slackCallback(integrationData) {
        integrationData.settings = integrationData.settings || {};
        integrationData.settings.updateMemberAttributes = true;
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        let integration;
        try {
            this.options.log.info('Creating Slack integration!');
            integration = await this.createOrUpdate(Object.assign(Object.assign({ platform: types_1.PlatformType.SLACK }, integrationData), { status: 'in-progress' }), transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
        this.options.log.info({ tenantId: integration.tenantId }, 'Sending Slack message to int-run-worker!');
        const isOnboarding = !('channels' in integration.settings);
        const emitter = await (0, serviceSQS_1.getIntegrationRunWorkerEmitter)();
        await emitter.triggerIntegrationRun(integration.tenantId, integration.platform, integration.id, isOnboarding);
        return integration;
    }
    /**
     * Adds/updates twitter integration
     * @param integrationData to create the integration object
     * @returns integration object
     */
    async twitterCallback(integrationData) {
        const { profileId, token, refreshToken } = integrationData;
        const hashtags = !integrationData.hashtags || integrationData.hashtags === '' ? [] : integrationData.hashtags;
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        let integration;
        try {
            integration = await this.createOrUpdate({
                platform: types_1.PlatformType.TWITTER,
                integrationIdentifier: profileId,
                token,
                refreshToken,
                limitCount: 0,
                limitLastResetAt: (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss'),
                status: 'in-progress',
                settings: {
                    followers: [],
                    hashtags: typeof hashtags === 'string' ? hashtags.split(',') : hashtags,
                    updateMemberAttributes: true,
                },
            }, transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
        this.options.log.info({ tenantId: integration.tenantId }, 'Sending Twitter message to int-run-worker!');
        const emitter = await (0, serviceSQS_1.getIntegrationRunWorkerEmitter)();
        await emitter.triggerIntegrationRun(integration.tenantId, integration.platform, integration.id, true);
        return integration;
    }
    /**
     * Adds/updates Stack Overflow integration
     * @param integrationData  to create the integration object
     * @returns integration object
     */
    async stackOverflowConnectOrUpdate(integrationData) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        let integration;
        try {
            this.options.log.info('Creating Stack Overflow integration!');
            integration = await this.createOrUpdate({
                platform: types_1.PlatformType.STACKOVERFLOW,
                settings: {
                    tags: integrationData.tags,
                    keywords: integrationData.keywords,
                    updateMemberAttributes: true,
                },
                status: 'in-progress',
            }, transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
        this.options.log.info({ tenantId: integration.tenantId }, 'Sending StackOverflow message to int-run-worker!');
        const emitter = await (0, serviceSQS_1.getIntegrationRunWorkerEmitter)();
        await emitter.triggerIntegrationRun(integration.tenantId, integration.platform, integration.id, true);
        return integration;
    }
    /**
     * Adds/updates Discourse integration
     * @param integrationData  to create the integration object
     * @returns integration object
     */
    async discourseConnectOrUpdate(integrationData) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        let integration;
        try {
            integration = await this.createOrUpdate({
                platform: types_1.PlatformType.DISCOURSE,
                settings: {
                    apiKey: integrationData.apiKey,
                    apiUsername: integrationData.apiUsername,
                    forumHostname: integrationData.forumHostname,
                    webhookSecret: integrationData.webhookSecret,
                    updateMemberAttributes: true,
                },
                status: 'in-progress',
            }, transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
        this.options.log.info({ tenantId: integration.tenantId }, 'Sending Discourse message to int-run-worker!');
        const emitter = await (0, serviceSQS_1.getIntegrationRunWorkerEmitter)();
        await emitter.triggerIntegrationRun(integration.tenantId, integration.platform, integration.id, true);
        return integration;
    }
    async groupsioConnectOrUpdate(integrationData) {
        const transaction = await sequelizeRepository_1.default.createTransaction(this.options);
        let integration;
        // integration data should have the following fields
        // email, token, array of groups
        // we shouldn't store password and 2FA token in the database
        // user should update them every time thety change something
        try {
            this.options.log.info('Creating Groups.io integration!');
            integration = await this.createOrUpdate({
                platform: types_1.PlatformType.GROUPSIO,
                settings: {
                    email: integrationData.email,
                    token: integrationData.token,
                    groups: integrationData.groupNames,
                    updateMemberAttributes: true,
                },
                status: 'in-progress',
            }, transaction);
            await sequelizeRepository_1.default.commitTransaction(transaction);
        }
        catch (err) {
            await sequelizeRepository_1.default.rollbackTransaction(transaction);
            throw err;
        }
        this.options.log.info({ tenantId: integration.tenantId }, 'Sending Groups.io message to int-run-worker!');
        const emitter = await (0, serviceSQS_1.getIntegrationRunWorkerEmitter)();
        await emitter.triggerIntegrationRun(integration.tenantId, integration.platform, integration.id, true);
        return integration;
    }
    async groupsioGetToken(data) {
        const config = {
            method: 'post',
            url: 'https://groups.io/api/v1/login',
            params: {
                email: data.email,
                password: data.password,
                twofactor: data.twoFactorCode,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        };
        let response;
        try {
            response = await (0, axios_1.default)(config);
            // we need to get cookie from the response
            const cookie = response.headers['set-cookie'][0].split(';')[0];
            return {
                groupsioCookie: cookie,
            };
        }
        catch (err) {
            if ('two_factor_required' in response.data) {
                throw new common_1.Error400(this.options.language, 'errors.groupsio.twoFactorRequired');
            }
            throw new common_1.Error400(this.options.language, 'errors.groupsio.invalidCredentials');
        }
    }
    async groupsioVerifyGroup(data) {
        var _a, _b;
        const groupName = data.groupName;
        const config = {
            method: 'post',
            url: `https://groups.io/api/v1/gettopics?group_name=${encodeURIComponent(groupName)}`,
            headers: {
                'Content-Type': 'application/json',
                Cookie: data.cookie,
            },
        };
        let response;
        try {
            response = await (0, axios_1.default)(config);
            return {
                group: (_b = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.group_id,
            };
        }
        catch (err) {
            throw new common_1.Error400(this.options.language, 'errors.groupsio.invalidGroup');
        }
    }
}
exports.default = IntegrationService;
//# sourceMappingURL=integrationService.js.map