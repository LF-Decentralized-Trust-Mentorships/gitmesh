import Plans from '@/security/plans';
import config from '@/config';
import { renderCal } from '@/utils/cals';

const gitmeshHostedPlans = Plans.values;
const communityPlans = Plans.communityValues;

const intoToGitmeshCal = ({
  displayCalDialog,
}) => {
  displayCalDialog();
  setTimeout(() => {
    renderCal({
      calLink: 'gitmesh/sales',
    });
  }, 0);
};

const customPlanCal = ({
  displayCalDialog,
}) => {
  displayCalDialog();
  setTimeout(() => {
    renderCal({
      calLink: 'gitmesh/sales',
    });
  }, 0);
};

const openCustomerPortalLink = () => {
  window.open(config.stripe.customerPortalLink, '_blank');
};

/**
 * ctaLabel: Copy shown in the CTA dependent on the active plan.
 * Key of ctaLabel represents the active plan, value represents the copy that should appear on the corresponding column plan
 * ctaAction: Action triggered by CTA click dependent on the active plan.
 * Key of ctaAction represents the acttive plan, value represents the set of actions trigerred when the corresponding column plan button is clicked.
 */
export const plans = {
  gitmeshHosted: [
    {
      key: gitmeshHostedPlans.essential,
      title: 'Essential',
      description: 'Understand & manage your community',
      price: 'Free',
      features: [
        'Unlimited seats',
        'Unlimited contacts, organizations & activities',
        '1K monthly active contacts',
        'Get data from GitHub, Discord, Slack, Discourse, DEV, Reddit, Stack Overflow, Hacker News, Zapier, n8n & more',
        '2 active automations & CSV exports',
        'Sentiment analysis',
        'Full API access',
        'Community & in-app support',
      ],
      ctaLabel: {
        [Plans.values.signals]: 'Downgrade to Essential',
        [Plans.values.growth]: 'Downgrade to Essential',
        [Plans.values.scale]: 'Downgrade to Essential',
        [Plans.values.enterprise]: 'Downgrade to Essential',
      },
      ctaAction: {
        [Plans.values.signals]: openCustomerPortalLink,
        [Plans.values.growth]: openCustomerPortalLink,
        [Plans.values.scale]: openCustomerPortalLink,
        [Plans.values.enterprise]: openCustomerPortalLink,
      },
    },
    {
      key: gitmeshHostedPlans.scale,
      title: 'Scale',
      description:
        'Commercialize your open source product',
      price: '$950/month',
      priceInfo: 'annual payment',
      featuresNote: 'Everything in Essential, plus:',
      features: [
        '10k monthly active contacts',
        'LinkedIn & HubSpot',
        'Smart enrichment of all active contacts & organizations',
        '20 active automations & CSV exports',
        'Slack connect support',
      ],
      featuresSpecial: [
        '90$ for each additional 1K MAC',
      ],
      ctaLabel: {
        [Plans.values.signals]: 'Start 30-days trial',
        [Plans.values.essential]: 'Start 30-days trial',
        [Plans.values.growth]: 'Start 30-days trial',
        [Plans.values.enterprise]: 'Downgrade to Scale',
      },
      ctaAction: {
        [Plans.values.signals]: intoToGitmeshCal,
        [Plans.values.essential]: intoToGitmeshCal,
        [Plans.values.growth]: intoToGitmeshCal,
        [Plans.values.enterprise]: openCustomerPortalLink,
      },
    },
    {
      key: gitmeshHostedPlans.enterprise,
      title: 'Enterprise',
      description:
        'Tailored to your needs',
      price: 'Custom price',
      featuresNote: 'Everything in Scale, plus:',
      features: [
        'Self hosting with enterprise support',
        'Custom integrations',
        'Activity categorization & topic analysis',
        'Unlimited active automations & CSV exports',
        'Custom RBAC & SAML-based SSO',
        'Dedicated community expert',
      ],
      ctaLabel: {
        [Plans.values.signals]: 'Get a quote',
        [Plans.values.essential]: 'Get a quote',
        [Plans.values.growth]: 'Get a quote',
        [Plans.values.scale]: 'Get a quote',
      },
      ctaAction: {
        [Plans.values.signals]: customPlanCal,
        [Plans.values.essential]: customPlanCal,
        [Plans.values.growth]: customPlanCal,
        [Plans.values.scale]: customPlanCal,
      },
    },
  ],
  community: [
    {
      key: communityPlans.community,
      title: 'Community',
      description:
        "Keep ownership of your data and host gitmesh.dev's community version for free on your own premises",
      price: 'Free',
      features: [
        'Unlimited seats',
        'Unlimited community contacts & activities',
        'Community management',
        'Community intelligence',
        'Integrations with GitHub, Discord, Slack, X/Twitter, DEV, Hacker News',
        'Community support',
      ],
      ctaLabel: {
        [Plans.communityValues.custom]: 'Downgrage to Community',
      },
      ctaAction: {
        [Plans.communityValues.custom]: openCustomerPortalLink,
      },
    },
    {
      key: communityPlans.custom,
      title: 'Custom',
      description:
        "Get access to gitmesh.dev's premium features and support, and host the platform on your own premises",
      price: 'On request',
      featuresNote: 'Everything in Community, plus:',
      features: [
        'Community growth',
        'Organization-level insights',
        'Custom integrations',
        'Enterprise-grade support',
        'LinkedIn integration',
        'Unlimited contact enrichments (automated)',
      ],
      ctaLabel: {
        [Plans.communityValues.community]: 'Book a call',
      },
      ctaAction: {
        [Plans.communityValues.community]: customPlanCal,
      },
    },
  ],
};
