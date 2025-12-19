export enum QuickstartGuideType {
  CONNECT_INTEGRATION = 'connect-integration',
  ENRICH_MEMBER = 'enrich-member',
  VIEW_REPORT = 'view-report',
  SET_SIGNALS = 'set-signals',
  INVITE_COLLEAGUES = 'invite-colleagues',
  CONNECT_FIRST_INTEGRATION = 'connect-first-integration',
  EXPLORE_CONTACTS = 'explore-contacts',
  EXPLORE_ORGANIZATIONS = 'explore-organizations',
  CREATE_AUTOMATIONS = 'create-automations',
}

export interface QuickstartGuideMap {
  [key: string]: QuickstartGuide
}

export interface QuickstartGuide {
  title: string
  body: string
  videoLink: string
  learnMoreLink: string
  buttonLink: string
  buttonText: string
  completed: boolean
  disabledInSampleData?: boolean
  disabledTooltipText?: string
}

export interface QuickstartGuideSettings {
  isSignalsGuideDismissed: boolean
  isQuickstartGuideDismissed: boolean
}

const connectIntegrationGuide: QuickstartGuide = {
  title: 'Add your next integration',
  body: 'Expand your data and insights effortlessly.',
  videoLink: '', // Video to be added later
  learnMoreLink: 'https://github.com/LF-Decentralized-Trust-labs/gitmesh',
  buttonLink: '/integrations',
  buttonText: 'Connect integrations',
  completed: false,
}

const connectFirstIntegrationGuide: QuickstartGuide = {
  title: 'Connect your first integration',
  body: 'Start syncing data from your channels in one step.',
  videoLink: '', // Video to be added later
  learnMoreLink: 'https://github.com/LF-Decentralized-Trust-labs/gitmesh',
  buttonLink: '/integrations',
  buttonText: 'Connect integrations',
  completed: false,
}

const enrichMemberGuide: QuickstartGuide = {
  title: 'Enrich a contact',
  body: 'Get more insights about contacts by enriching them with attributes such as emails, seniority, OSS contributions and much more.',
  videoLink: '', // Video to be added later
  learnMoreLink: '', // Video to be added later
  buttonLink: '/contacts',
  buttonText: 'Try enrichment',
  completed: false,
  disabledInSampleData: true,
  disabledTooltipText: 'Connect integrations to try enrichment',
}

const viewReportGuide: QuickstartGuide = {
  title: 'Look into reports',
  body: 'Explore ready-made reports for deeper community insights.',
  videoLink: '', // Video to be added later
  learnMoreLink: '', // Video to be added later
  buttonLink: '/devtel',
  buttonText: 'Explore reports',
  completed: false,
}

const setSignalsGuide: QuickstartGuide = {
  title: 'Discover content in your niche',
  body: 'Discover and engage with relevant content across various community platforms in order to gain developers’ mindshare and increase your community awareness.',
  videoLink: '', // Video to be added later
  learnMoreLink: '', // Video to be added later
  buttonLink: '/signals',
  buttonText: 'Explore Signals',
  completed: false,
}

const inviteColleaguesGuide: QuickstartGuide = {
  title: 'Invite your team',
  body: 'Add teammates with full or read-only access.',
  videoLink: '', // Video to be added later
  learnMoreLink: 'https://github.com/LF-Decentralized-Trust-labs/gitmesh',
  buttonLink: '/settings',
  buttonText: 'Invite Team',
  completed: false,
}

const exploreOrganizations: QuickstartGuide = {
  title: 'Explore organizations',
  body: 'Identify companies with active developer engagement and find those that match your ICP.',
  videoLink: '', // Video to be added later
  learnMoreLink: 'https://github.com/LF-Decentralized-Trust-labs/gitmesh',
  buttonLink: '/organizations',
  buttonText: 'Explore organizations',
  completed: false,
}

const exploreContacts: QuickstartGuide = {
  title: 'Explore contacts',
  body: 'View all community and product engagement in one place.',
  videoLink: '', // Video to be added later
  learnMoreLink: 'https://github.com/LF-Decentralized-Trust-labs/gitmesh',
  buttonLink: '/contacts',
  buttonText: 'Explore contacts',
  completed: false,
}

const createAutomations: QuickstartGuide = {
  title: 'Create automations',
  body: 'Automate repetitive workflows with HubSpot syncs, Slack notifications, or Webhooks.',
  videoLink: '', // Video to be added later
  learnMoreLink: 'https://github.com/LF-Decentralized-Trust-labs/gitmesh',
  buttonLink: '/automations',
  buttonText: 'Create automations',
  completed: false,
}

export const DEFAULT_GUIDES = {
  [QuickstartGuideType.CONNECT_INTEGRATION]: connectIntegrationGuide,
  [QuickstartGuideType.INVITE_COLLEAGUES]: inviteColleaguesGuide,
  [QuickstartGuideType.ENRICH_MEMBER]: enrichMemberGuide,
  [QuickstartGuideType.VIEW_REPORT]: viewReportGuide,
  [QuickstartGuideType.SET_SIGNALS]: setSignalsGuide,
}

export const DEFAULT_GUIDES_V2 = {
  [QuickstartGuideType.CONNECT_FIRST_INTEGRATION]: connectFirstIntegrationGuide,
  [QuickstartGuideType.INVITE_COLLEAGUES]: inviteColleaguesGuide,
  [QuickstartGuideType.EXPLORE_CONTACTS]: exploreContacts,
  [QuickstartGuideType.EXPLORE_ORGANIZATIONS]: exploreOrganizations,
  [QuickstartGuideType.VIEW_REPORT]: viewReportGuide,
  [QuickstartGuideType.CREATE_AUTOMATIONS]: createAutomations,
}
