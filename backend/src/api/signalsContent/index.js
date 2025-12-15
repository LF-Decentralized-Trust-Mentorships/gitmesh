"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@gitmesh/types");
const errorMiddleware_1 = require("../../middlewares/errorMiddleware");
const featureFlagMiddleware_1 = require("../../middlewares/featureFlagMiddleware");
exports.default = (app) => {
    app.post(`/tenant/:tenantId/signalsContent/query`, (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'), (0, errorMiddleware_1.safeWrap)(require('./signalsContentQuery').default));
    app.post(`/tenant/:tenantId/signalsContent`, (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'), (0, errorMiddleware_1.safeWrap)(require('./signalsContentUpsert').default));
    app.post(`/tenant/:tenantId/signalsContent/track`, (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'), (0, errorMiddleware_1.safeWrap)(require('./signalsContentTrack').default));
    app.get(`/tenant/:tenantId/signalsContent/reply`, (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'), (0, errorMiddleware_1.safeWrap)(require('./signalsContentReply').default));
    app.get(`/tenant/:tenantId/signalsContent/search`, (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'), (0, errorMiddleware_1.safeWrap)(require('./signalsContentSearch').default));
    app.get(`/tenant/:tenantId/signalsContent/:id`, (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'), (0, errorMiddleware_1.safeWrap)(require('./signalsContentFind').default));
    app.post(`/tenant/:tenantId/signalsContent/:contentId/action`, (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'), (0, errorMiddleware_1.safeWrap)(require('./signalsActionCreate').default));
    app.put(`/tenant/:tenantId/signalsContent/settings`, (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'), (0, errorMiddleware_1.safeWrap)(require('./signalsSettingsUpdate').default));
    app.delete(`/tenant/:tenantId/signalsContent/:contentId/action/:actionId`, (0, featureFlagMiddleware_1.featureFlagMiddleware)(types_1.FeatureFlag.SIGNALS, 'entities.signals.errors.planLimitExceeded'), (0, errorMiddleware_1.safeWrap)(require('./signalsActionDestroy').default));
};
//# sourceMappingURL=index.js.map