declare const en: {
    app: {
        title: string;
    };
    settings: {
        memberAttributes: {
            errors: {
                wrongType: string;
                alreadyExists: string;
                typesNotMatching: string;
                canDeleteReadonly: string;
                requiredFields: string;
                notFound: string;
                priorityArrayNotFound: string;
                reservedField: string;
            };
        };
        activityTypes: {
            errors: {
                typeRequiredWhenCreating: string;
                typeRequiredWhenUpdating: string;
                notFound: string;
            };
        };
        activityChannels: {
            errors: {
                typeRequiredWhenCreating: string;
                notFound: string;
            };
        };
    };
    auth: {
        userNotFound: string;
        wrongPassword: string;
        weakPassword: string;
        emailAlreadyInUse: string;
        invalidEmail: string;
        passwordReset: {
            invalidToken: string;
            error: string;
        };
        passwordInvalid: string;
        emailAddressVerificationEmail: {
            invalidToken: string;
            error: string;
            signedInAsWrongUser: string;
        };
        passwordChange: {
            invalidPassword: string;
        };
    };
    cubejs: {
        invalidToken: string;
        tenantIdNotMatching: string;
    };
    user: {
        errors: {
            userAlreadyExists: string;
            userNotFound: string;
            destroyingHimself: string;
            revokingOwnPermission: string;
            revokingPlanUser: string;
            destroyingPlanUser: string;
        };
    };
    task: {
        errors: {
            unknownBatchOperation: string;
        };
    };
    tenant: {
        exists: string;
        url: {
            exists: string;
        };
        invitation: {
            notSameEmail: string;
        };
        planActive: string;
        stripeNotConfigured: string;
        sampleDataCreationStarted: string;
        sampleDataDeletionCompleted: string;
        errors: {
            publishedConversationExists: string;
            nameRequiredOnCreate: string;
        };
    };
    errors: {
        notFound: {
            message: string;
        };
        forbidden: {
            message: string;
        };
        missingScopes: {
            message: string;
        };
        validation: {
            message: string;
        };
        noMember: {
            message: string;
        };
        activityDup: {
            message: string;
        };
        OrganizationNameRequired: {
            message: string;
        };
        projectNotFound: {
            message: string;
        };
        signals: {
            urlRequiredWhenUpserting: string;
            contentNotFound: string;
            feedSettingsMissing: string;
            keywordsMissing: string;
            platformMissing: string;
            platformInvalid: string;
            publishedDateMissing: string;
            emailInvalid: string;
            frequencyInvalid: string;
            timeInvalid: string;
            notOnboarded: string;
            invalidEvent: string;
        };
        integrations: {
            badEndpoint: string;
        };
        sentiment: {
            mood: string;
            label: string;
            sentiment: string;
        };
        csvExport: {
            planLimitExceeded: string;
        };
        reports: {
            templateReportsCreateNotAllowed: string;
            templateReportsUpdateNotAllowed: string;
        };
        noNangoToken: {
            message: string;
        };
        linkedin: {
            noOrganization: string;
            cantOnboardWrongStatus: string;
            noOrganizationFound: string;
        };
        hubspot: {
            notInPlan: string;
        };
        members: {
            activeList: {
                activityTimestampFrom: string;
                activityTimestampTo: string;
            };
        };
        git: {
            noIntegration: string;
        };
    };
    email: {
        error: string;
    };
    preview: {
        error: string;
    };
    entities: {
        member: {
            errors: {
                unique: {
                    username: string;
                    email: string;
                    platform: string;
                };
            };
        };
        activity: {
            errors: {
                platformAndUsernameNotMatching: string;
                platformRequiredWhileUpsert: string;
                unique: {};
            };
        };
        tag: {
            errors: {
                unique: {};
            };
        };
        integration: {
            name: {
                github: string;
                linkedin: string;
                twitter: string;
                devto: string;
                stackoverflow: string;
                reddit: string;
                discord: string;
                slack: string;
                hackernews: string;
                discourse: string;
            };
        };
        automation: {
            errors: {
                planLimitExceeded: string;
            };
        };
        signals: {
            errors: {
                planLimitExceeded: string;
            };
        };
    };
    communityHelpCenter: {
        errors: {
            planNotSupportingCustomUrls: string;
        };
    };
    enrichment: {
        errors: {
            planLimitExceeded: string;
            requestedEnrichmentMoreThanLimit: string;
            enrichmentFailed: string;
            noGithubHandleOrEmail: string;
            memberNotFound: string;
        };
    };
};
export default en;
