"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_GUIDES_V2 = exports.DEFAULT_GUIDES = exports.QuickstartGuideType = void 0;
var QuickstartGuideType;
(function (QuickstartGuideType) {
    QuickstartGuideType["CONNECT_INTEGRATION"] = "connect-integration";
    QuickstartGuideType["ENRICH_MEMBER"] = "enrich-member";
    QuickstartGuideType["VIEW_REPORT"] = "view-report";
    QuickstartGuideType["SET_SIGNALS"] = "set-signals";
    QuickstartGuideType["INVITE_COLLEAGUES"] = "invite-colleagues";
    QuickstartGuideType["CONNECT_FIRST_INTEGRATION"] = "connect-first-integration";
    QuickstartGuideType["EXPLORE_CONTACTS"] = "explore-contacts";
    QuickstartGuideType["EXPLORE_ORGANIZATIONS"] = "explore-organizations";
    QuickstartGuideType["CREATE_AUTOMATIONS"] = "create-automations";
})(QuickstartGuideType = exports.QuickstartGuideType || (exports.QuickstartGuideType = {}));
const connectIntegrationGuide = {
    title: 'Add your next integration',
    body: 'Expand your data and insights effortlessly.',
    videoLink: '',
    learnMoreLink: 'https://github.com/alveoli-app/gitmesh',
    buttonLink: '/integrations',
    buttonText: 'Connect integrations',
    completed: false,
};
const connectFirstIntegrationGuide = {
    title: 'Connect your first integration',
    body: 'Start syncing data from your channels in one step.',
    videoLink: '',
    learnMoreLink: 'https://github.com/alveoli-app/gitmesh',
    buttonLink: '/integrations',
    buttonText: 'Connect integrations',
    completed: false,
};
const enrichMemberGuide = {
    title: 'Enrich a contact',
    body: 'Get more insights about contacts by enriching them with attributes such as emails, seniority, OSS contributions and much more.',
    videoLink: '',
    learnMoreLink: '',
    buttonLink: '/contacts',
    buttonText: 'Try enrichment',
    completed: false,
    disabledInSampleData: true,
    disabledTooltipText: 'Connect integrations to try enrichment',
};
const viewReportGuide = {
    title: 'Look into reports',
    body: 'Explore ready-made reports for deeper community insights.',
    videoLink: '',
    learnMoreLink: '',
    buttonLink: '/devtel',
    buttonText: 'Explore reports',
    completed: false,
};
const setSignalsGuide = {
    title: 'Discover content in your niche',
    body: 'Discover and engage with relevant content across various community platforms in order to gain developers’ mindshare and increase your community awareness.',
    videoLink: '',
    learnMoreLink: '',
    buttonLink: '/signals',
    buttonText: 'Explore Signals',
    completed: false,
};
const inviteColleaguesGuide = {
    title: 'Invite your team',
    body: 'Add teammates with full or read-only access.',
    videoLink: '',
    learnMoreLink: 'https://github.com/alveoli-app/gitmesh',
    buttonLink: '/settings',
    buttonText: 'Invite Team',
    completed: false,
};
const exploreOrganizations = {
    title: 'Explore organizations',
    body: 'Identify companies with active developer engagement and find those that match your ICP.',
    videoLink: '',
    learnMoreLink: 'https://github.com/alveoli-app/gitmesh',
    buttonLink: '/organizations',
    buttonText: 'Explore organizations',
    completed: false,
};
const exploreContacts = {
    title: 'Explore contacts',
    body: 'View all community and product engagement in one place.',
    videoLink: '',
    learnMoreLink: 'https://github.com/alveoli-app/gitmesh',
    buttonLink: '/contacts',
    buttonText: 'Explore contacts',
    completed: false,
};
const createAutomations = {
    title: 'Create automations',
    body: 'Automate repetitive workflows with HubSpot syncs, Slack notifications, or Webhooks.',
    videoLink: '',
    learnMoreLink: 'https://github.com/alveoli-app/gitmesh',
    buttonLink: '/automations',
    buttonText: 'Create automations',
    completed: false,
};
exports.DEFAULT_GUIDES = {
    [QuickstartGuideType.CONNECT_INTEGRATION]: connectIntegrationGuide,
    [QuickstartGuideType.INVITE_COLLEAGUES]: inviteColleaguesGuide,
    [QuickstartGuideType.ENRICH_MEMBER]: enrichMemberGuide,
    [QuickstartGuideType.VIEW_REPORT]: viewReportGuide,
    [QuickstartGuideType.SET_SIGNALS]: setSignalsGuide,
};
exports.DEFAULT_GUIDES_V2 = {
    [QuickstartGuideType.CONNECT_FIRST_INTEGRATION]: connectFirstIntegrationGuide,
    [QuickstartGuideType.INVITE_COLLEAGUES]: inviteColleaguesGuide,
    [QuickstartGuideType.EXPLORE_CONTACTS]: exploreContacts,
    [QuickstartGuideType.EXPLORE_ORGANIZATIONS]: exploreOrganizations,
    [QuickstartGuideType.VIEW_REPORT]: viewReportGuide,
    [QuickstartGuideType.CREATE_AUTOMATIONS]: createAutomations,
};
//# sourceMappingURL=quickstartGuideTypes.js.map