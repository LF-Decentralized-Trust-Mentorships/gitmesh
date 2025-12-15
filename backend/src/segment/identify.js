"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@gitmesh/types");
const conf_1 = require("../conf");
function identify(user) {
    try {
        const Analytics = require('analytics-node');
        if (conf_1.SEGMENT_CONFIG.writeKey) {
            const analytics = new Analytics(conf_1.SEGMENT_CONFIG.writeKey);
            if (conf_1.API_CONFIG.edition === types_1.Edition.HOSTED || conf_1.API_CONFIG.edition === types_1.Edition.LFX) {
            if (user.email && user.email !== 'support@gitmesh.dev') {
                analytics.identify({
                    userId: user.id,
                    traits: {
                        name: user.fullName,
                        email: user.email,
                        createdAt: user.createdAt,
                        tenants: (user.tenants || [])
                            .map((tenantUser) => {
                            if (tenantUser && tenantUser.tenant) {
                                return {
                                    id: tenantUser.tenant.id,
                                    name: tenantUser.tenant.name,
                                    url: tenantUser.tenant.url,
                                };
                            }
                            return undefined;
                        })
                            .filter((t) => t),
                        // Hubspot custom traits
                        created_an_account: true,
                        created_an_account__date: user.createdAt,
                    },
                });
            }
        }
            else if (conf_1.API_CONFIG.edition === types_1.Edition.COMMUNITY) {
                if (user.email && !user.email.includes('gitmesh.dev')) {
                    analytics.identify({
                    userId: user.id,
                    traits: {
                        createdAt: user.createdAt,
                        tenants: (user.tenants || [])
                            .map((tenantUser) => {
                            if (tenantUser && tenantUser.tenant) {
                                return {
                                    id: tenantUser.tenant.id,
                                };
                            }
                            return undefined;
                        })
                            .filter((t) => t),
                        },
                    });
                }
            }
        }
    }
    catch (error) {
        console.error(error);
    }
}
exports.default = identify;
//# sourceMappingURL=identify.js.map