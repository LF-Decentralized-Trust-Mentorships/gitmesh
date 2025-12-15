export declare enum MemberAttributeType {
    BOOLEAN = "boolean",
    NUMBER = "number",
    EMAIL = "email",
    STRING = "string",
    URL = "url",
    DATE = "date",
    MULTI_SELECT = "multiSelect",
    SPECIAL = "special"
}
export declare enum MemberAttributeName {
    ORGANISATION = "organisation",
    SOURCE_ID = "sourceId",
    IS_HIREABLE = "isHireable",
    URL = "url",
    NAME = "name",
    AVATAR_URL = "avatarUrl",
    LOCATION = "location",
    BIO = "bio",
    COMPANY = "company",
    WEBSITE_URL = "websiteUrl",
    SAMPLE = "sample",
    JOB_TITLE = "jobTitle",
    IS_TEAM_MEMBER = "isTeamMember",
    IS_ORGANIZATION = "isOrganization",
    IS_BOT = "isBot",
    TIMEZONE = "timezone",
    KARMA = "karma",
    SYNC_REMOTE = "syncRemote"
}
export declare const MemberAttributes: {
    organisation: {
        name: MemberAttributeName;
        label: string;
    };
    sourceId: {
        name: MemberAttributeName;
        label: string;
    };
    isHireable: {
        name: MemberAttributeName;
        label: string;
    };
    url: {
        name: MemberAttributeName;
        label: string;
    };
    name: {
        name: MemberAttributeName;
        label: string;
    };
    avatarUrl: {
        name: MemberAttributeName;
        label: string;
    };
    location: {
        name: MemberAttributeName;
        label: string;
    };
    bio: {
        name: MemberAttributeName;
        label: string;
    };
    websiteUrl: {
        name: MemberAttributeName;
        label: string;
    };
    sample: {
        name: MemberAttributeName;
        label: string;
    };
    jobTitle: {
        name: MemberAttributeName;
        label: string;
    };
    timezone: {
        name: MemberAttributeName;
        label: string;
    };
    isTeamMember: {
        name: MemberAttributeName;
        label: string;
    };
    isOrganization: {
        name: MemberAttributeName;
        label: string;
    };
    isBot: {
        name: MemberAttributeName;
        label: string;
    };
    karma: {
        name: MemberAttributeName;
        label: string;
    };
    syncRemote: {
        name: MemberAttributeName;
        label: string;
    };
};
export declare enum MemberEnrichmentAttributeName {
    SENIORITY_LEVEL = "seniorityLevel",
    EMAILS = "emails",
    SKILLS = "skills",
    COUNTRY = "country",
    PROGRAMMING_LANGUAGES = "programmingLanguages",
    LANGUAGES = "languages",
    YEARS_OF_EXPERIENCE = "yearsOfExperience",
    EDUCATION = "education",
    AWARDS = "awards",
    CERTIFICATIONS = "certifications",
    WORK_EXPERIENCES = "workExperiences",
    EXPERTISE = "expertise"
}
export declare const MemberEnrichmentAttributes: {
    seniorityLevel: {
        name: MemberEnrichmentAttributeName;
        label: string;
    };
    emails: {
        name: MemberEnrichmentAttributeName;
        label: string;
    };
    skills: {
        name: MemberEnrichmentAttributeName;
        label: string;
    };
    country: {
        name: MemberEnrichmentAttributeName;
        label: string;
    };
    programmingLanguages: {
        name: MemberEnrichmentAttributeName;
        label: string;
    };
    languages: {
        name: MemberEnrichmentAttributeName;
        label: string;
    };
    yearsOfExperience: {
        name: MemberEnrichmentAttributeName;
        label: string;
    };
    education: {
        name: MemberEnrichmentAttributeName;
        label: string;
    };
    awards: {
        name: MemberEnrichmentAttributeName;
        label: string;
    };
    certifications: {
        name: MemberEnrichmentAttributeName;
        label: string;
    };
    workExperiences: {
        name: MemberEnrichmentAttributeName;
        label: string;
    };
    expertise: {
        name: MemberEnrichmentAttributeName;
        label: string;
    };
};
