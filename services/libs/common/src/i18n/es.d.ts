declare const es: {
    app: {
        title: string;
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
        emailAddressVerificationEmail: {
            invalidToken: string;
            error: string;
            signedInAsWrongUser: string;
        };
        passwordChange: {
            invalidPassword: string;
        };
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
    };
    importer: {
        errors: {
            invalidFileEmpty: string;
            invalidFileExcel: string;
            invalidFileUpload: string;
            importHashRequired: string;
            importHashExistent: string;
        };
    };
    errors: {
        notFound: {
            message: string;
        };
        forbidden: {
            message: string;
        };
        validation: {
            message: string;
        };
    };
    email: {
        error: string;
    };
    preview: {
        error: string;
    };
    entities: {
        project: {
            errors: {
                unique: {};
            };
        };
        repo: {
            errors: {
                unique: {
                    url: string;
                };
            };
        };
        member: {
            errors: {
                unique: {
                    username: string;
                    email: string;
                };
            };
        };
        activity: {
            errors: {
                unique: {};
            };
        };
        tag: {
            errors: {
                unique: {};
            };
        };
    };
};
export default es;
