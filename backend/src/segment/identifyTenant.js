"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@gitmesh/types");
const conf_1 = require("../conf");
async function identifyTenant(req) {
    try {
        if (conf_1.SEGMENT_CONFIG.writeKey) {
            const Analytics = require('analytics-node');
            const analytics = new Analytics(conf_1.SEGMENT_CONFIG.writeKey);
            if (conf_1.API_CONFIG.edition === types_1.Edition.HOSTED || conf_1.API_CONFIG.edition === types_1.Edition.LFX) {
                if (req.currentUser && req.currentUser.email && !req.currentUser.email.includes('support@gitmesh.dev')) {
                    analytics.group({
                    userId: req.currentUser.id,
                    groupId: req.currentTenant.id,
                    traits: {
                        name: req.currentTenant.name,
                    },
                });
            }
        }
            else if (conf_1.API_CONFIG.edition === types_1.Edition.COMMUNITY) {
                if (req.currentUser && req.currentUser.email && !req.currentUser.email.includes('gitmesh.dev')) {
                    analytics.group({
                    userId: req.currentUser.id,
                    groupId: req.currentTenant.id,
                    traits: {
                        createdAt: req.currentTenant.createdAt,
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
exports.default = identifyTenant;
//# sourceMappingURL=identifyTenant.js.map