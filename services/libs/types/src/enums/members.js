"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberEnrichmentAttributes = exports.MemberEnrichmentAttributeName = exports.MemberAttributes = exports.MemberAttributeName = exports.MemberAttributeType = void 0;
var MemberAttributeType;
(function (MemberAttributeType) {
    MemberAttributeType["BOOLEAN"] = "boolean";
    MemberAttributeType["NUMBER"] = "number";
    MemberAttributeType["EMAIL"] = "email";
    MemberAttributeType["STRING"] = "string";
    MemberAttributeType["URL"] = "url";
    MemberAttributeType["DATE"] = "date";
    MemberAttributeType["MULTI_SELECT"] = "multiSelect";
    MemberAttributeType["SPECIAL"] = "special";
})(MemberAttributeType || (exports.MemberAttributeType = MemberAttributeType = {}));
var MemberAttributeName;
(function (MemberAttributeName) {
    MemberAttributeName["ORGANISATION"] = "organisation";
    MemberAttributeName["SOURCE_ID"] = "sourceId";
    MemberAttributeName["IS_HIREABLE"] = "isHireable";
    MemberAttributeName["URL"] = "url";
    MemberAttributeName["NAME"] = "name";
    MemberAttributeName["AVATAR_URL"] = "avatarUrl";
    MemberAttributeName["LOCATION"] = "location";
    MemberAttributeName["BIO"] = "bio";
    MemberAttributeName["COMPANY"] = "company";
    MemberAttributeName["WEBSITE_URL"] = "websiteUrl";
    MemberAttributeName["SAMPLE"] = "sample";
    MemberAttributeName["JOB_TITLE"] = "jobTitle";
    MemberAttributeName["IS_TEAM_MEMBER"] = "isTeamMember";
    MemberAttributeName["IS_ORGANIZATION"] = "isOrganization";
    MemberAttributeName["IS_BOT"] = "isBot";
    MemberAttributeName["TIMEZONE"] = "timezone";
    MemberAttributeName["KARMA"] = "karma";
    MemberAttributeName["SYNC_REMOTE"] = "syncRemote";
})(MemberAttributeName || (exports.MemberAttributeName = MemberAttributeName = {}));
exports.MemberAttributes = {
    [MemberAttributeName.ORGANISATION]: {
        name: MemberAttributeName.ORGANISATION,
        label: 'Organisation',
    },
    [MemberAttributeName.SOURCE_ID]: {
        name: MemberAttributeName.SOURCE_ID,
        label: 'Source Id',
    },
    [MemberAttributeName.IS_HIREABLE]: {
        name: MemberAttributeName.IS_HIREABLE,
        label: 'is Hireable',
    },
    [MemberAttributeName.URL]: {
        name: MemberAttributeName.URL,
        label: 'Url',
    },
    [MemberAttributeName.NAME]: {
        name: MemberAttributeName.NAME,
        label: 'Name',
    },
    [MemberAttributeName.AVATAR_URL]: {
        name: MemberAttributeName.AVATAR_URL,
        label: 'Avatar url',
    },
    [MemberAttributeName.LOCATION]: {
        name: MemberAttributeName.LOCATION,
        label: 'Location',
    },
    [MemberAttributeName.BIO]: {
        name: MemberAttributeName.BIO,
        label: 'Bio',
    },
    [MemberAttributeName.WEBSITE_URL]: {
        name: MemberAttributeName.WEBSITE_URL,
        label: 'Website',
    },
    [MemberAttributeName.SAMPLE]: {
        name: MemberAttributeName.SAMPLE,
        label: 'Sample',
    },
    [MemberAttributeName.JOB_TITLE]: {
        name: MemberAttributeName.JOB_TITLE,
        label: 'Job Title',
    },
    [MemberAttributeName.TIMEZONE]: {
        name: MemberAttributeName.TIMEZONE,
        label: 'Timezone',
    },
    [MemberAttributeName.IS_TEAM_MEMBER]: {
        name: MemberAttributeName.IS_TEAM_MEMBER,
        label: 'is Team Member',
    },
    [MemberAttributeName.IS_ORGANIZATION]: {
        name: MemberAttributeName.IS_ORGANIZATION,
        label: 'is Organization',
    },
    [MemberAttributeName.IS_BOT]: {
        name: MemberAttributeName.IS_BOT,
        label: 'is Bot',
    },
    [MemberAttributeName.KARMA]: {
        name: MemberAttributeName.KARMA,
        label: 'Karma',
    },
    [MemberAttributeName.SYNC_REMOTE]: {
        name: MemberAttributeName.SYNC_REMOTE,
        label: 'Sync remote',
    },
};
var MemberEnrichmentAttributeName;
(function (MemberEnrichmentAttributeName) {
    MemberEnrichmentAttributeName["SENIORITY_LEVEL"] = "seniorityLevel";
    MemberEnrichmentAttributeName["EMAILS"] = "emails";
    MemberEnrichmentAttributeName["SKILLS"] = "skills";
    MemberEnrichmentAttributeName["COUNTRY"] = "country";
    MemberEnrichmentAttributeName["PROGRAMMING_LANGUAGES"] = "programmingLanguages";
    MemberEnrichmentAttributeName["LANGUAGES"] = "languages";
    MemberEnrichmentAttributeName["YEARS_OF_EXPERIENCE"] = "yearsOfExperience";
    MemberEnrichmentAttributeName["EDUCATION"] = "education";
    MemberEnrichmentAttributeName["AWARDS"] = "awards";
    MemberEnrichmentAttributeName["CERTIFICATIONS"] = "certifications";
    MemberEnrichmentAttributeName["WORK_EXPERIENCES"] = "workExperiences";
    MemberEnrichmentAttributeName["EXPERTISE"] = "expertise";
})(MemberEnrichmentAttributeName || (exports.MemberEnrichmentAttributeName = MemberEnrichmentAttributeName = {}));
exports.MemberEnrichmentAttributes = {
    [MemberEnrichmentAttributeName.SENIORITY_LEVEL]: {
        name: MemberEnrichmentAttributeName.SENIORITY_LEVEL,
        label: 'Seniority Level',
    },
    [MemberEnrichmentAttributeName.EMAILS]: {
        name: MemberEnrichmentAttributeName.EMAILS,
        label: 'Emails',
    },
    [MemberEnrichmentAttributeName.SKILLS]: {
        name: MemberEnrichmentAttributeName.SKILLS,
        label: 'Skills',
    },
    [MemberEnrichmentAttributeName.COUNTRY]: {
        name: MemberEnrichmentAttributeName.COUNTRY,
        label: 'Country',
    },
    [MemberEnrichmentAttributeName.PROGRAMMING_LANGUAGES]: {
        name: MemberEnrichmentAttributeName.PROGRAMMING_LANGUAGES,
        label: 'Programming Languages',
    },
    [MemberEnrichmentAttributeName.LANGUAGES]: {
        name: MemberEnrichmentAttributeName.LANGUAGES,
        label: 'Languages',
    },
    [MemberEnrichmentAttributeName.YEARS_OF_EXPERIENCE]: {
        name: MemberEnrichmentAttributeName.YEARS_OF_EXPERIENCE,
        label: 'Years of Experience',
    },
    [MemberEnrichmentAttributeName.EDUCATION]: {
        name: MemberEnrichmentAttributeName.EDUCATION,
        label: 'Education',
    },
    [MemberEnrichmentAttributeName.AWARDS]: {
        name: MemberEnrichmentAttributeName.AWARDS,
        label: 'Awards',
    },
    [MemberEnrichmentAttributeName.CERTIFICATIONS]: {
        name: MemberEnrichmentAttributeName.CERTIFICATIONS,
        label: 'Certifications',
    },
    [MemberEnrichmentAttributeName.WORK_EXPERIENCES]: {
        name: MemberEnrichmentAttributeName.WORK_EXPERIENCES,
        label: 'Work Experiences',
    },
    [MemberEnrichmentAttributeName.EXPERTISE]: {
        name: MemberEnrichmentAttributeName.EXPERTISE,
        label: 'Expertise',
    },
};
//# sourceMappingURL=members.js.map