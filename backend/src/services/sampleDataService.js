"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { membersScore } from './../database/utils/keys/microserviceTypes'
const lodash_1 = __importDefault(require("lodash"));
const moment_1 = __importDefault(require("moment"));
const logging_1 = require("@gitmesh/logging");
const types_1 = require("@gitmesh/types");
const integrations_1 = require("@gitmesh/integrations");
const activityService_1 = __importDefault(require("./activityService"));
const memberService_1 = __importDefault(require("./memberService"));
const tenantService_1 = __importDefault(require("./tenantService"));
const memberAttributeSettingsService_1 = __importDefault(require("./memberAttributeSettingsService"));
const organizationService_1 = __importDefault(require("./organizationService"));
const conversationService_1 = __importDefault(require("./conversationService"));
const memberRepository_1 = __importDefault(require("../database/repositories/memberRepository"));
const noteService_1 = __importDefault(require("./noteService"));
const tagService_1 = __importDefault(require("./tagService"));
const conf_1 = require("../conf");
const sequelizeRepository_1 = __importDefault(require("../database/repositories/sequelizeRepository"));
class SampleDataService extends logging_1.LoggerBase {
    constructor(options) {
        super(options.log);
        this.options = options;
    }
    /**
     * Generates sample data from a json file for currentTenant
     * For imported sample activities and members attributes.sample.gitmesh is set to true
     * Sets currentTenant.hasSampleData to true
     * @param sampleMembersActivities members array included from json by require(json)
     *
     */
    async generateSampleData(sampleMembersActivities) {
        const tenantService = new tenantService_1.default(this.options);
        await tenantService.update(this.options.currentTenant.id, {
            hasSampleData: true,
        });
        if (conf_1.API_CONFIG.edition !== 'gitmesh-hosted') {
            try {
                const activityService = new activityService_1.default(this.options);
                const memberService = new memberService_1.default(this.options);
                const tagService = new tagService_1.default(this.options);
                const noteService = new noteService_1.default(this.options);
                const memberAttributeSettingsService = new memberAttributeSettingsService_1.default(this.options);
                await memberAttributeSettingsService.createPredefined(memberAttributeSettingsService_1.default.pickAttributes([types_1.MemberAttributeName.SAMPLE], integrations_1.MEMBER_ATTRIBUTES));
                await memberAttributeSettingsService.createPredefined(integrations_1.GITHUB_MEMBER_ATTRIBUTES);
                await memberAttributeSettingsService.createPredefined(integrations_1.DISCORD_MEMBER_ATTRIBUTES);
                await memberAttributeSettingsService.createPredefined(integrations_1.TWITTER_MEMBER_ATTRIBUTES);
                await memberAttributeSettingsService.createPredefined(integrations_1.DEVTO_MEMBER_ATTRIBUTES);
                await memberAttributeSettingsService.createPredefined(integrations_1.LINKEDIN_MEMBER_ATTRIBUTES);
                const MemberEnrichmentAttributeSettings = [
                    {
                        name: types_1.MemberEnrichmentAttributeName.SKILLS,
                        label: types_1.MemberEnrichmentAttributes[types_1.MemberEnrichmentAttributeName.SKILLS].label,
                        type: types_1.MemberAttributeType.MULTI_SELECT,
                        canDelete: false,
                        show: true,
                    },
                    {
                        name: types_1.MemberEnrichmentAttributeName.LANGUAGES,
                        label: types_1.MemberEnrichmentAttributes[types_1.MemberEnrichmentAttributeName.LANGUAGES].label,
                        type: types_1.MemberAttributeType.MULTI_SELECT,
                        canDelete: false,
                        show: true,
                    },
                    {
                        name: types_1.MemberEnrichmentAttributeName.PROGRAMMING_LANGUAGES,
                        label: types_1.MemberEnrichmentAttributes[types_1.MemberEnrichmentAttributeName.PROGRAMMING_LANGUAGES].label,
                        type: types_1.MemberAttributeType.MULTI_SELECT,
                        canDelete: false,
                        show: true,
                    },
                    {
                        name: types_1.MemberEnrichmentAttributeName.AWARDS,
                        label: types_1.MemberEnrichmentAttributes[types_1.MemberEnrichmentAttributeName.AWARDS].label,
                        type: types_1.MemberAttributeType.SPECIAL,
                        canDelete: false,
                        show: true,
                    },
                    {
                        name: types_1.MemberEnrichmentAttributeName.SENIORITY_LEVEL,
                        label: types_1.MemberEnrichmentAttributes[types_1.MemberEnrichmentAttributeName.SENIORITY_LEVEL].label,
                        type: types_1.MemberAttributeType.STRING,
                        canDelete: false,
                        show: true,
                    },
                    {
                        name: types_1.MemberEnrichmentAttributeName.EXPERTISE,
                        label: types_1.MemberEnrichmentAttributes[types_1.MemberEnrichmentAttributeName.EXPERTISE].label,
                        type: types_1.MemberAttributeType.MULTI_SELECT,
                        canDelete: false,
                        show: true,
                    },
                    {
                        name: types_1.MemberEnrichmentAttributeName.COUNTRY,
                        label: types_1.MemberEnrichmentAttributes[types_1.MemberEnrichmentAttributeName.COUNTRY].label,
                        type: types_1.MemberAttributeType.STRING,
                        canDelete: false,
                        show: true,
                    },
                    {
                        name: types_1.MemberEnrichmentAttributeName.YEARS_OF_EXPERIENCE,
                        label: types_1.MemberEnrichmentAttributes[types_1.MemberEnrichmentAttributeName.YEARS_OF_EXPERIENCE].label,
                        type: types_1.MemberAttributeType.NUMBER,
                        canDelete: false,
                        show: true,
                    },
                    {
                        name: types_1.MemberEnrichmentAttributeName.EDUCATION,
                        label: types_1.MemberEnrichmentAttributes[types_1.MemberEnrichmentAttributeName.EDUCATION].label,
                        type: types_1.MemberAttributeType.SPECIAL,
                        canDelete: false,
                        show: true,
                    },
                    {
                        name: types_1.MemberEnrichmentAttributeName.WORK_EXPERIENCES,
                        label: types_1.MemberEnrichmentAttributes[types_1.MemberEnrichmentAttributeName.WORK_EXPERIENCES].label,
                        type: types_1.MemberAttributeType.SPECIAL,
                        canDelete: false,
                        show: true,
                    },
                ];
                await memberAttributeSettingsService.createPredefined(MemberEnrichmentAttributeSettings);
                // we update this field first because api runs this endpoint asynchronously
                // and frontend expects it to be true after 2 seconds
                await tenantService.update(this.options.currentTenant.id, {
                    hasSampleData: true,
                });
                // 2022-03-16 is the most recent activity date in sample-data.json
                // When importing, we pad that value in days so that most recent activity.timestamp = now()
                const timestampPaddingInDays = (0, moment_1.default)().utc().diff((0, moment_1.default)('2022-09-30 21:52:28').utc(), 'days') - 1;
                this.log.info(`timestampPaddingInDays: ${timestampPaddingInDays}`);
                const members = sampleMembersActivities.members;
                for (const member of members) {
                    const tagList = [];
                    const noteList = [];
                    for (const tag of member.tags || []) {
                        const found = (await tagService.findAndCountAll({ advancedFilter: { name: tag } }))
                            .rows[0];
                        if (found) {
                            tagList.push(found.id);
                        }
                        else {
                            const createdTag = await tagService.create({
                                name: tag,
                                // Current date minus a random interval between 0 and 10 days
                                createdAt: (0, moment_1.default)()
                                    .subtract(Math.floor(Math.random() * 10), 'days')
                                    .toDate(),
                            });
                            tagList.push(createdTag.id);
                        }
                    }
                    member.tags = tagList;
                    for (const note of member.notes || []) {
                        const createdNote = await noteService.create({
                            body: note,
                            // Current date minus a random interval between 0 and 10 days
                            createdAt: (0, moment_1.default)()
                                .subtract(Math.floor(Math.random() * 10), 'days')
                                .toDate(),
                        });
                        noteList.push(createdNote.id);
                    }
                    member.notes = noteList;
                    for (const key of Object.keys(member.attributes)) {
                        const attSettings = lodash_1.default.find(MemberEnrichmentAttributeSettings, {
                            name: key,
                        });
                        if ((attSettings === null || attSettings === void 0 ? void 0 : attSettings.type) === types_1.MemberAttributeType.MULTI_SELECT) {
                            const newOptions = member.attributes[key].enrichment;
                            const existingDbAttribute = (await memberAttributeSettingsService.findAndCountAll({
                                filter: { name: key },
                            })).rows[0];
                            const existingOptions = existingDbAttribute.options;
                            const allOptions = lodash_1.default.union(existingOptions, newOptions);
                            await memberAttributeSettingsService.update(existingDbAttribute.id, {
                                options: allOptions,
                            });
                        }
                    }
                    member.contributions = member.openSourceContributions;
                    member.lastEnriched = new Date();
                    member.platform = 'github';
                    await memberService.upsert(member);
                }
                for (const conv of sampleMembersActivities.conversations) {
                    for (const act of conv) {
                        act.member = members.find((m) => m.displayName === act.member);
                        act.member.attributes[types_1.MemberAttributeName.SAMPLE] = {
                            [types_1.PlatformType.GITMESH]: true,
                        };
                        act.timestamp = (0, moment_1.default)(act.timestamp).utc().add(timestampPaddingInDays, 'days').toDate();
                        if (act.attributes === undefined) {
                            act.attributes = {};
                        }
                        act.attributes.sample = true;
                        act.sentiment.sentiment = Math.min(act.sentiment.sentiment + 40, 100);
                        await activityService.createWithMember(act);
                    }
                }
                this.log.info(`Sample data for tenant ${this.options.currentTenant.id} created succesfully.`);
            }
            catch (err) {
                this.log.error(err);
                throw err;
            }
        }
    }
    /**
     * Deletes sample data
     * Sample data is defined for all members and activities where attributes.sample.gitmesh = true
     * Sets currentTenant.hasSampleData to false
     * Also removes settings for attributes.sample.gitmesh
     */
    async deleteSampleData() {
        const tx = await sequelizeRepository_1.default.createTransaction(this.options);
        const txOptions = Object.assign(Object.assign({}, this.options), { transaction: tx });
        try {
            const tenantService = new tenantService_1.default(txOptions);
            const tenant = await tenantService.findById(this.options.currentTenant.id);
            if (tenant.hasSampleData) {
                if (conf_1.API_CONFIG.edition !== 'gitmesh-hosted') {
                    const memberService = new memberService_1.default(txOptions);
                    const memberAttributeSettingsService = new memberAttributeSettingsService_1.default(txOptions);
                    const memberIds = await memberRepository_1.default.findSampleDataMemberIds(txOptions);
                    const organizationService = new organizationService_1.default(txOptions);
                    const organizationIds = (await organizationService.findAndCountAll({
                        advancedFilter: {
                            members: memberIds,
                        },
                    })).rows.map((org) => org.id);
                    await organizationService.destroyBulk(organizationIds);
                    // deleting sample members should cascade to their activities as well
                    await memberService.destroyBulk(memberIds);
                    const conversationService = new conversationService_1.default(txOptions);
                    const conversationIds = (await conversationService.findAndCountAll({
                        advancedFilter: {
                            activityCount: 0,
                        },
                        limit: 200,
                    })).rows.map((conv) => conv.id);
                    await conversationService.destroyBulk(conversationIds);
                    // delete attribute settings for attributes.sample.gitmesh as well
                    const sampleAttributeSettings = (await memberAttributeSettingsService.findAndCountAll({
                        filter: { name: types_1.MemberAttributeName.SAMPLE },
                    })).rows[0];
                    await memberAttributeSettingsService.destroyAll([sampleAttributeSettings.id]);
                }
                await tenantService.update(this.options.currentTenant.id, {
                    hasSampleData: false,
                }, true);
            }
            await sequelizeRepository_1.default.commitTransaction(tx);
            this.log.info(`Sample data for tenant ${this.options.currentTenant.id} deleted succesfully.`);
        }
        catch (err) {
            this.log.error(err, 'Error deleting sample data!');
            if (tx) {
                await sequelizeRepository_1.default.rollbackTransaction(tx);
            }
            throw err;
        }
    }
}
exports.default = SampleDataService;
//# sourceMappingURL=sampleDataService.js.map