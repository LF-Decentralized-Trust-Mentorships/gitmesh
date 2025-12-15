/**
 * Tenant Mode
 * multi: Allow new users to create new tenants.
 * multi-with-subdomain: Same as multi, but enable access to the tenant via subdomain.
 * single: One tenant, the first user to register will be the admin.
 */
const tenantMode = 'multi';

/**
 * Plan payments configuration.
 */
const isPlanEnabled = true;

const defaultConfig = {
  frontendUrl: {
    host: import.meta.env.VUE_APP_FRONTEND_HOST,
    protocol: import.meta.env.VUE_APP_FRONTEND_PROTOCOL,
  },
  backendUrl: import.meta.env.VUE_APP_BACKEND_URL,
  websocketsUrl: import.meta.env.VUE_APP_WEBSOCKETS_URL,
  tenantMode,
  isPlanEnabled,
  gitHubInstallationUrl:
    import.meta.env.VUE_APP_GITHUB_INSTALLATION_URL,
  discordInstallationUrl:
    import.meta.env.VUE_APP_DISCORD_INSTALLATION_URL,
  cubejsUrl: import.meta.env.VUE_APP_CUBEJS_URL,
  conversationPublicUrl:
    import.meta.env.VUE_APP_CONVERSATIONS_PUBLIC_URL,
  edition: import.meta.env.VUE_APP_EDITION,
  communityPremium: import.meta.env.VUE_APP_COMMUNITY_PREMIUM,
  env: import.meta.env.VUE_APP_ENV,
  hotjarKey: import.meta.env.VUE_APP_HOTJAR_KEY,
  nangoUrl: import.meta.env.VUE_APP_NANGO_URL,
  unleash: {
    apiKey: import.meta.env.VUE_APP_UNLEASH_API_KEY,
    url: import.meta.env.VUE_APP_UNLEASH_URL,
  },
  formbricks: {
    url: import.meta.env.VUE_APP_FORMBRICKS_URL,
    environmentId: import.meta.env.VUE_APP_FORMBRICKS_ENVIRONMENT_ID,
  },
  stripe: {
    publishableKey:
      import.meta.env.VUE_APP_STRIPE_PUBLISHABLE_KEY || '',
    growthPlanPaymentLink:
      import.meta.env.VUE_APP_STRIPE_GROWTH_PLAN_PAYMENT_LINK
      || '',
    signalsPlanPaymentLink:
      import.meta.env
        .VUE_APP_STRIPE_SIGNALS_PLAN_PAYMENT_LINK || '',
    customerPortalLink:
      import.meta.env.VUE_APP_STRIPE_CUSTOMER_PORTAL_LINK || '',
  },
  sampleTenant: {
    id: import.meta.env.VUE_APP_SAMPLE_TENANT_ID,
    token: import.meta.env.VUE_APP_SAMPLE_TENANT_TOKEN,
  },
  isGitEnabled: import.meta.env.VUE_APP_IS_GIT_ENABLED,
  isGroupsioEnabled: import.meta.env.VUE_APP_IS_GROUPSIO_ENABLED,
  isTwitterEnabled: import.meta.env.VUE_APP_IS_TWITTER_ENABLED,
};

const composedConfig = {
  frontendUrl: {
    host: 'VUE_APP_FRONTEND_HOST',
    protocol: 'VUE_APP_FRONTEND_PROTOCOL',
  },
  backendUrl: 'VUE_APP_BACKEND_URL',
  websocketsUrl: 'VUE_APP_WEBSOCKETS_URL',
  tenantMode,
  isPlanEnabled,
  gitHubInstallationUrl:
    'VUE_APP_GITHUB_INSTALLATION_URL',
  discordInstallationUrl:
    'VUE_APP_DISCORD_INSTALLATION_URL',
  cubejsUrl: 'VUE_APP_CUBEJS_URL',
  conversationPublicUrl:
    'VUE_APP_CONVERSATIONS_PUBLIC_URL',
  edition: 'VUE_APP_EDITION',
  communityPremium: 'VUE_APP_COMMUNITY_PREMIUM',
  env: 'VUE_APP_ENV',
  hotjarKey: 'VUE_APP_HOTJAR_KEY',
  nangoUrl: 'VUE_APP_NANGO_URL',
  typeformId: 'VUE_APP_TYPEFORM_ID',
  typeformTitle: 'VUE_APP_TYPEFORM_TITLE',
  unleash: {
    apiKey: 'VUE_APP_UNLEASH_API_KEY',
    url: 'VUE_APP_UNLEASH_URL',
  },
  formbricks: {
    url: 'VUE_APP_FORMBRICKS_URL',
    environmentId: 'VUE_APP_FORMBRICKS_ENVIRONMENT_ID',
  },
  stripe: {
    publishableKey:
      'VUE_APP_STRIPE_PUBLISHABLE_KEY' || '',
    growthPlanPaymentLink:
      'VUE_APP_STRIPE_GROWTH_PLAN_PAYMENT_LINK' || '',
    signalsPlanPaymentLink:
      'VUE_APP_STRIPE_SIGNALS_PLAN_PAYMENT_LINK'
      || '',
    customerPortalLink:
      'VUE_APP_STRIPE_CUSTOMER_PORTAL_LINK' || '',
  },
  sampleTenant: {
    id: 'VUE_APP_SAMPLE_TENANT_ID',
    token: 'VUE_APP_SAMPLE_TENANT_TOKEN',
  },
  isGitEnabled: 'VUE_APP_IS_GIT_ENABLED',
  isGroupsioEnabled: 'VUE_APP_IS_GROUPSIO_ENABLED',
  isTwitterEnabled: 'VUE_APP_IS_TWITTER_ENABLED',
};

const config = defaultConfig.backendUrl
  ? defaultConfig
  : composedConfig;

config.isCommunityVersion = config.edition === 'gitmesh-ce';
config.hasPremiumModules = !config.isCommunityVersion
  || config.communityPremium === 'true';
config.isGitIntegrationEnabled = config.isGitEnabled === 'true';
config.isGroupsioIntegrationEnabled = config.isGroupsioEnabled === 'true';
config.isTwitterIntegrationEnabled = config.isTwitterEnabled === 'true';

export default config;
