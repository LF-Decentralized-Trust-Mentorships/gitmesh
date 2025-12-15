import { buildInitialState, store } from '@/store';
import { PermissionChecker } from '@/modules/user/permission-checker';

const OnboardPage = () => import('@/modules/onboard/pages/onboard-page.vue');
const OnboardBookADemoPage = () => import('@/modules/onboard/pages/onboard-book-a-demo-page.vue');

let hasResetState = false;

// Reset the flag when user completes onboarding or navigates away
const resetOnboardState = () => {
  hasResetState = false;
};

export default [
  {
    name: 'onboard',
    path: '/onboard',
    component: OnboardPage,
    meta: {
      auth: true,
      title: 'Onboarding',
    },
    beforeEnter: (to, from) => {
      // Only reset state on first entry to onboard, not on subsequent visits
      // This prevents state reset when hovering over integrations or when page refreshes
      if (!hasResetState || from.name === null) {
        const initialState = buildInitialState(true);
        store.replaceState(initialState);
        hasResetState = true;
      }
    },
  },
  {
    name: 'onboardDemo',
    path: '/onboard/demo',
    component: OnboardBookADemoPage,
    meta: {
      auth: true,
      title: 'Onboarding',
    },
    beforeEnter: () => {
      // Reset flag when moving to demo page (final onboarding step)
      resetOnboardState();
    },
  },
];
