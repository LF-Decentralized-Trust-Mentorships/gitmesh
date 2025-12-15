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
const command_line_args_1 = __importDefault(require("command-line-args"));
const command_line_usage_1 = __importDefault(require("command-line-usage"));
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
const databaseConnection_1 = require("@/database/databaseConnection");
/* eslint-disable no-console */
const banner = fs.readFileSync(path_1.default.join(__dirname, 'banner.txt'), 'utf8');
const options = [
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Print this usage guide.',
    },
];
const sections = [
    {
        content: banner,
        raw: true,
    },
    {
        header: `Fix wrongly merged orgs using snapshot data - This is a development script, never run it in k8s context!`,
        content: 'Fix wrongly merged orgs using snapshot data - This is a development script, never run it in k8s context!',
    },
    {
        header: 'Options',
        optionList: options,
    },
];
const usage = (0, command_line_usage_1.default)(sections);
const parameters = (0, command_line_args_1.default)(options);
if (parameters.help) {
    console.log(usage);
}
else {
    setImmediate(async () => {
        var _a, _b;
        const snapshotDb = null; // we should get a connection to the snapshot db to get the destroyed data
        const prodDb = await (0, databaseConnection_1.databaseInit)();
        const badIdentities = []; // bad identities in the organization should be populated here before running
        const identityToProcess = badIdentities[0];
        // find organizationId from snapshot db using identity
        const orgs = await snapshotDb.sequelize.query(`select "organizationId" from "organizationIdentities" oi
    where oi.name = '${identityToProcess.name}' and oi.platform = '${identityToProcess.platform}' and "tenantId" = 'ad9a1d40-238d-488d-9433-69752a110550';
    `, {
            useMaster: true,
        });
        const deletedOrganizationId = (_b = (_a = orgs === null || orgs === void 0 ? void 0 : orgs[0]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.organizationId;
        let tx;
        try {
            if (deletedOrganizationId && deletedOrganizationId !== identityToProcess.organizationId) {
                // get the full organization row
                const orgRow = await snapshotDb.sequelize.query(`select * from organizations where id = '${deletedOrganizationId}'`, {
                    useMaster: true,
                });
                console.log(orgRow[0][0]);
                // create a transaction
                tx = await prodDb.sequelize.transaction();
                // CHECK IF ORG ALREADY EXISTS?
                const result = await prodDb.sequelize.query(`
                select id from organizations o 
                where o.id = :deletedOrganizationId`, {
                    replacements: {
                        deletedOrganizationId,
                    },
                    type: sequelize_1.QueryTypes.SELECT,
                    transaction: tx,
                });
                if (result.length === 0 || result[0].length === 0) {
                    // create the merged organization
                    await prodDb.sequelize.query(`INSERT INTO organizations (
                  id, 
                  description, 
                  "emails", 
                  "phoneNumbers", 
                  logo, 
                  tags, 
                  twitter, 
                  linkedin, 
                  crunchbase, 
                  employees, 
                  "revenueRange", 
                  "importHash",
                  "createdAt",
                  "updatedAt",
                  "deletedAt", 
                  "tenantId", 
                  "createdById", 
                  "updatedById", 
                  location, 
                  github, 
                  website, 
                  "isTeamOrganization", 
                  "lastEnrichedAt", 
                  "employeeCountByCountry", 
                  type, "geoLocation", size, ticker, headline, profiles, naics, 
                  address, industry, founded, "displayName", attributes, 
                  "searchSyncedAt", "manuallyCreated", "affiliatedProfiles", 
                  "allSubsidiaries", "alternativeDomains", "alternativeNames", 
                  "averageEmployeeTenure", "averageTenureByLevel", "averageTenureByRole", 
                  "directSubsidiaries", "employeeChurnRate", "employeeCountByMonth", 
                  "employeeGrowthRate", "employeeCountByMonthByLevel", "employeeCountByMonthByRole", 
                  "gicsSector", "grossAdditionsByMonth", "grossDeparturesByMonth", 
                  "ultimateParent", "immediateParent", "weakIdentities")
                VALUES (
                  :id, :description, :emails, :phoneNumbers, :logo, 
                  :tags, :twitter, :linkedin, :crunchbase, :employees, :revenueRange, 
                  :importHash, :createdAt, :updatedAt, :deletedAt, :tenantId, 
                  :createdById, :updatedById, :location, :github, :website, 
                  :isTeamOrganization, :lastEnrichedAt, :employeeCountByCountry, 
                  :type, :geoLocation, :size, :ticker, :headline, :profiles, :naics,
                  :address, :industry, :founded, :displayName, :attributes,
                  :searchSyncedAt, :manuallyCreated, :affiliatedProfiles,
                  :allSubsidiaries, :alternativeDomains, :alternativeNames,
                  :averageEmployeeTenure, :averageTenureByLevel, :averageTenureByRole,
                  :directSubsidiaries, :employeeChurnRate, :employeeCountByMonth,
                  :employeeGrowthRate, :employeeCountByMonthByLevel, :employeeCountByMonthByRole,
                  :gicsSector, :grossAdditionsByMonth, :grossDeparturesByMonth,
                  :ultimateParent, :immediateParent, :weakIdentities)`, {
                        replacements: Object.assign(Object.assign({}, orgRow[0][0]), { twitter: orgRow[0][0].twitter ? JSON.stringify(orgRow[0][0].twitter) : null, linkedin: orgRow[0][0].linkedin ? JSON.stringify(orgRow[0][0].linkedin) : null, crunchbase: orgRow[0][0].crunchbase
                                ? JSON.stringify(orgRow[0][0].crunchbase)
                                : null, revenueRange: orgRow[0][0].revenueRange
                                ? JSON.stringify(orgRow[0][0].revenueRange)
                                : null, github: orgRow[0][0].github ? JSON.stringify(orgRow[0][0].github) : null, employeeCountByCountry: orgRow[0][0].employeeCountByCountry
                                ? JSON.stringify(orgRow[0][0].employeeCountByCountry)
                                : null, naics: orgRow[0][0].naics ? JSON.stringify(orgRow[0][0].naics) : null, address: orgRow[0][0].address ? JSON.stringify(orgRow[0][0].address) : null, attributes: orgRow[0][0].attributes
                                ? JSON.stringify(orgRow[0][0].attributes)
                                : null, averageTenureByLevel: orgRow[0][0].averageTenureByLevel
                                ? JSON.stringify(orgRow[0][0].averageTenureByLevel)
                                : null, averageTenureByRole: orgRow[0][0].averageTenureByRole
                                ? JSON.stringify(orgRow[0][0].averageTenureByRole)
                                : null, employeeChurnRate: orgRow[0][0].employeeChurnRate
                                ? JSON.stringify(orgRow[0][0].employeeChurnRate)
                                : null, employeeCountByMonth: orgRow[0][0].employeeCountByMonth
                                ? JSON.stringify(orgRow[0][0].employeeCountByMonth)
                                : null, employeeGrowthRate: orgRow[0][0].employeeGrowthRate
                                ? JSON.stringify(orgRow[0][0].employeeGrowthRate)
                                : null, employeeCountByMonthByLevel: orgRow[0][0].employeeCountByMonthByLevel
                                ? JSON.stringify(orgRow[0][0].employeeCountByMonthByLevel)
                                : null, employeeCountByMonthByRole: orgRow[0][0].employeeCountByMonthByRole
                                ? JSON.stringify(orgRow[0][0].employeeCountByMonthByRole)
                                : null, grossAdditionsByMonth: orgRow[0][0].grossAdditionsByMonth
                                ? JSON.stringify(orgRow[0][0].grossAdditionsByMonth)
                                : null, grossDeparturesByMonth: orgRow[0][0].grossDeparturesByMonth
                                ? JSON.stringify(orgRow[0][0].grossDeparturesByMonth)
                                : null, weakIdentities: orgRow[0][0].weakIdentities
                                ? JSON.stringify(orgRow[0][0].weakIdentities)
                                : null, directSubsidiaries: null, affiliatedProfiles: null, allSubsidiaries: null, alternativeDomains: null, alternativeNames: null, profiles: null }),
                        type: sequelize_1.QueryTypes.INSERT,
                        transaction: tx,
                    });
                }
                // update identity to belong to found org
                await prodDb.sequelize.query(`
              update "organizationIdentities" 
              set "organizationId" = :deletedOrganizationId 
              where 
                  name = :name 
                  and platform = :platform 
                  and "organizationId" = :oldOrganizationId
                  and "tenantId" = 'ad9a1d40-238d-488d-9433-69752a110550'`, {
                    replacements: {
                        name: identityToProcess.name,
                        platform: identityToProcess.platform,
                        oldOrganizationId: identityToProcess.organizationId,
                        deletedOrganizationId,
                    },
                    type: sequelize_1.QueryTypes.UPDATE,
                    transaction: tx,
                });
                // find memberOrganization rows that belonged to deleted org
                const result2 = await snapshotDb.sequelize.query(`
              select id from "memberOrganizations" mo
              where mo."organizationId" = :deletedOrganizationId;`, {
                    replacements: {
                        deletedOrganizationId,
                    },
                    type: sequelize_1.QueryTypes.SELECT,
                });
                // Obtain only the id's from the resulting objects array
                const idsBelongToMergedOrg = result2.map((res) => res.id);
                // memberOrganization row that the deleted org has in snapshot db, update memberOrganization rows in the prod db
                await prodDb.sequelize.query(`
              update "memberOrganizations" 
              set "organizationId" = :deletedOrganizationId 
              where 
              id in (:idsBelongToMergedOrg)`, {
                    replacements: {
                        deletedOrganizationId,
                        idsBelongToMergedOrg,
                    },
                    type: sequelize_1.QueryTypes.UPDATE,
                    transaction: tx,
                });
                // find distinct memberIds belong to deleted organization
                const result3 = await snapshotDb.sequelize.query(`
              select distinct mo."memberId" from "memberOrganizations" mo
              where mo."organizationId" = :deletedOrganizationId;`, {
                    replacements: {
                        deletedOrganizationId,
                    },
                    type: sequelize_1.QueryTypes.SELECT,
                });
                const memberIds = result3.map((res) => res.memberId);
                // update activity organizations that belong to these members
                await prodDb.sequelize.query(`
              update "activities" 
              set "organizationId" = :deletedOrganizationId 
              where 
              "memberId" in (:memberIds)`, {
                    replacements: {
                        deletedOrganizationId,
                        memberIds,
                    },
                    type: sequelize_1.QueryTypes.UPDATE,
                    transaction: tx,
                });
                // add restored organization to organizationSegments again
                await prodDb.sequelize.query(`
                insert into "organizationSegments" ("organizationId", "segmentId", "tenantId", "createdAt")
                values (:deletedOrganizationId, '86eb7dac-57d6-40aa-b034-37f1ff4b0ddb', 'ad9a1d40-238d-488d-9433-69752a110550', now())
                on conflict do nothing`, {
                    replacements: {
                        deletedOrganizationId,
                    },
                    type: sequelize_1.QueryTypes.INSERT,
                    transaction: tx,
                });
                await tx.commit();
                console.log(`Organization ${deletedOrganizationId} unmerged from organization ${identityToProcess.organizationId}`);
            }
        }
        catch (e) {
            console.log(e);
            if (tx) {
                console.log('Rolling back transaction!');
                await tx.rollback();
            }
        }
        process.exit(0);
    });
}
//# sourceMappingURL=fix-auto-merged-orgs.js.map