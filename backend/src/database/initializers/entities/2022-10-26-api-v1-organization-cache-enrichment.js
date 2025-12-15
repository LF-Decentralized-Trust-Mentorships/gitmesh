"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const getUserContext_1 = __importDefault(require("../../utils/getUserContext"));
const sequelizeRepository_1 = __importDefault(require("../../repositories/sequelizeRepository"));
const organizations_1 = __importDefault(require("../../../serverless/integrations/usecases/github/graphql/organizations"));
const organizationCacheRepository_1 = __importDefault(require("../../repositories/organizationCacheRepository"));
const organizationRepository_1 = __importDefault(require("../../repositories/organizationRepository"));
exports.default = async () => {
    const options = await sequelizeRepository_1.default.getDefaultIRepositoryOptions();
    // const tenants = await TenantService._findAndCountAllForEveryUser({})
    const tenantsQuery = `select * from tenants`;
    let tenants = await options.database.sequelize.query(tenantsQuery, {
        type: sequelize_1.QueryTypes.SELECT,
    });
    tenants = tenants.filter((i) => i.id !== '62712f6f-94e8-41e5-8cb7-87e3d272830b');
    // for each tenant
    for (const tenant of tenants) {
        const userContext = await (0, getUserContext_1.default)(tenant.id);
        const ghIntegration = await userContext.database.integration.findOne({
            where: {
                platform: 'github',
                tenantId: tenant.id,
            },
            include: [],
        });
        if (ghIntegration) {
            const organizationQuery = `select * from organizations o where o."tenantId"  = :tenantId`;
            const organizations = await userContext.database.sequelize.query(organizationQuery, {
                type: sequelize_1.QueryTypes.SELECT,
                replacements: {
                    tenantId: tenant.id,
                },
            });
            for (const org of organizations) {
                // check if organization already exists in the cache by name
                const record = await userContext.database.organizationCache.findOne({
                    where: {
                        name: org.name,
                    },
                    include: [],
                });
                org.name = org.name.replace(/["\\]+/g, '');
                // organization is not enriched from gh api yet
                if (!record) {
                    const orgFromGH = await (0, organizations_1.default)(org.name, ghIntegration.token);
                    if (orgFromGH) {
                        // check cache
                        const checkCache = await organizationCacheRepository_1.default.findByUrl(orgFromGH.url, userContext);
                        // if it already exists on cache, some other organization should be already enriched, find that org
                        const findOrg = await options.database.organization.findOne({
                            attributes: ['id', 'name', 'url'],
                            where: {
                                url: orgFromGH.url,
                                name: orgFromGH.name,
                                tenantId: tenant.id,
                            },
                        });
                        if (checkCache && findOrg) {
                            // update current organizations members to found organization
                            const memberOrganizationsUpdateQuery = `UPDATE "memberOrganizations" SET "organizationId" = :existingOrganizationId WHERE "organizationId" = :duplicateOrganizationId`;
                            await options.database.sequelize.query(memberOrganizationsUpdateQuery, {
                                type: sequelize_1.QueryTypes.UPDATE,
                                replacements: {
                                    existingOrganizationId: findOrg.id,
                                    duplicateOrganizationId: org.id,
                                },
                            });
                            // delete current organization
                            await organizationRepository_1.default.destroy(org.id, userContext, true);
                        }
                        else {
                            // it's not in cache, create it
                            if (!checkCache) {
                                await organizationCacheRepository_1.default.create(orgFromGH, userContext);
                            }
                            // check any other organization already has names similar to gh api response
                            let findByName = await options.database.organization.findAll({
                                attributes: ['id', 'name'],
                                where: {
                                    name: orgFromGH.name,
                                    tenantId: tenant.id,
                                },
                            });
                            findByName = findByName.filter((i) => i.id !== org.id);
                            if (findByName.length > 0) {
                                const memberOrganizationsUpdateQuery = `UPDATE "memberOrganizations" SET "organizationId" = :existingOrganizationId WHERE "organizationId" = :duplicateOrganizationId`;
                                await options.database.sequelize.query(memberOrganizationsUpdateQuery, {
                                    type: sequelize_1.QueryTypes.UPDATE,
                                    replacements: {
                                        existingOrganizationId: org.id,
                                        duplicateOrganizationId: findByName[0].id,
                                    },
                                });
                                // delete foundByName organization
                                await organizationRepository_1.default.destroy(findByName[0].id, userContext, true);
                            }
                            const orgFromGhParsed = {
                                name: orgFromGH.name,
                                url: orgFromGH.url,
                                location: orgFromGH.location,
                                description: orgFromGH.description,
                                logo: orgFromGH.avatarUrl,
                            };
                            if (orgFromGH.email) {
                                orgFromGhParsed.emails = [orgFromGH.email];
                            }
                            if (orgFromGH.twitterUsername) {
                                orgFromGhParsed.twitter = { handle: orgFromGH.twitterUsername };
                            }
                            // enrich the organization with cache
                            await organizationRepository_1.default.update(org.id, Object.assign(Object.assign({}, org), orgFromGhParsed), userContext);
                        }
                    }
                }
                else {
                    const fieldsFromCache = {
                        name: record.name,
                        url: record.url,
                        location: record.location,
                        description: record.description,
                        logo: record.logo,
                        emails: record.emails,
                        twitter: record.twitter,
                    };
                    // enrich the organization with cache
                    await organizationRepository_1.default.update(org.id, Object.assign(Object.assign({}, org), fieldsFromCache), userContext);
                }
            }
        }
    }
};
//# sourceMappingURL=2022-10-26-api-v1-organization-cache-enrichment.js.map