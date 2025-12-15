import { UnleashClient } from 'unleash-proxy-client';
import { useLogRocket } from '@/utils/logRocket';
import config from '@/config';
import { store } from '@/store';

export const FEATURE_FLAGS = {
  signals: 'signals',
  organizations: 'organizations',
  automations: 'automations',
  linkedin: 'linkedin',
  memberEnrichment: 'member-enrichment',
  csvExport: 'csv-export',
  hubspot: 'hubspot',
  logRocket: 'log-rocket',
  developerMode: 'developer-mode',
  quickstartV2: 'quickstart-v2',
  twitter: 'twitter',
};

class FeatureFlagService {
  constructor() {
    this.flags = FEATURE_FLAGS;

    if (!config.isCommunityVersion && config.unleash.url?.length > 0) {
      const unleashConfig = {
        url: `${config.unleash.url}/api/frontend`,
        clientKey: config.unleash.apiKey,
        appName: 'gitmesh-web-app',
        environment: 'production',
      };

      this.unleash = new UnleashClient(unleashConfig);
    }
  }

  init(tenant) {
    if (config.isCommunityVersion) {
      return;
    }

    const { init: initLogRocket, captureException } = useLogRocket();

    this.unleash.start();

    const context = this.getContextFromTenant(tenant);

    if (context) {
      this.updateContext(context);
    }

    this.unleash.on('ready', () => {
      initLogRocket();

      store.dispatch('tenant/doUpdateFeatureFlag', {
        isReady: true,
      });
    });

    this.unleash.on('error', (error) => {
      captureException(error);

      store.dispatch('tenant/doUpdateFeatureFlag', {
        hasError: true,
      });
    });
  }

  isFlagEnabled(flag) {
    if (config.isCommunityVersion) {
      return true;
    }

    // Temporary workaround for Unleash connectivity issues
    // Check if user has premium plans for specific features
    let currentTenant = null;
    
    // Try multiple ways to get current tenant
    if (window.store?.state?.auth?.currentTenant) {
      currentTenant = window.store.state.auth.currentTenant;
    } else if (store?.state?.auth?.currentTenant) {
      currentTenant = store.state.auth.currentTenant;
    }
    
    if (currentTenant && flag === 'signals') {
      const premiumPlans = ['Growth', 'Signals', 'Scale', 'Enterprise'];
      const hasPremiumPlan = premiumPlans.includes(currentTenant.plan);
      console.log(`📡 Signals Workaround: Plan="${currentTenant.plan}", HasAccess=${hasPremiumPlan}`);
      if (hasPremiumPlan) return true;
    }

    return this.unleash.isEnabled(flag);
  }

  updateContext(tenant) {
    if (config.isCommunityVersion) {
      return;
    }

    const context = this.getContextFromTenant(tenant);
    if (context) {
      this.unleash.updateContext(context);
    }
  }

  getContextFromTenant(tenant) {
    if (!tenant || !tenant.id) {
      return null;
    }

    return {
      tenantId: tenant.id,
      tenantName: tenant.name,
      isTrialPlan: tenant.isTrialPlan,
      email: tenant.email,
      automationCount: `${tenant.automationCount}`,
      csvExportCount: `${tenant.csvExportCount}`,
      memberEnrichmentCount: `${tenant.memberEnrichmentCount}`,
      plan: tenant.plan,
    };
  }

  premiumFeatureCopy() {
    if (config.isCommunityVersion) {
      return 'Enterprise';
    }
    return 'Scale';
  }

  scaleFeatureCopy() {
    if (config.isCommunityVersion) {
      return 'Enterprise';
    }
    return 'Scale';
  }
}

export const FeatureFlag = new FeatureFlagService();
