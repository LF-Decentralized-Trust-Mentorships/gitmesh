<template>
  <div v-if="isPremium" class="min-h-screen bg-black">
    <!-- Premium Edition -->
    <PremiumHeader />
    <PremiumHero />
    <PremiumFeatures />
    <PremiumFooter />
  </div>

  <div v-else class="min-h-screen bg-black">
    <!-- Community Edition -->
    <CommunityHeader />
    <CommunityHero />
    <CommunityQuickStart />
    <CommunityFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import config from '@/config';

// Community Components
import CommunityHeader from '@/components/landing/CommunityHeader.vue';
import CommunityHero from '@/components/landing/CommunityHero.vue';
import CommunityQuickStart from '@/components/landing/CommunityQuickStart.vue';
import CommunityFooter from '@/components/landing/CommunityFooter.vue';

// Premium Components (Dynamic Import)
const premiumModules = import.meta.glob('../premium/landing/*.vue');

const loadPremiumComponent = (fileName) => {
  const path = `../premium/landing/${fileName}`;
  const loader = premiumModules[path];
  return defineAsyncComponent({
    loader: loader || (() => Promise.resolve({ render: () => null })),
    // If the component fails to load (e.g. file missing), render nothing
    onError: (error, retry, fail, attempts) => {
      console.warn(`Failed to load premium component: ${fileName}`, error);
      fail();
    }
  });
};

const PremiumHeader = loadPremiumComponent('PremiumHeader.vue');
const PremiumHero = loadPremiumComponent('PremiumHero.vue');
const PremiumFeatures = loadPremiumComponent('PremiumFeatures.vue');
const PremiumFooter = loadPremiumComponent('PremiumFooter.vue');

const router = useRouter();
const store = useStore();
const isPremium = computed(() => !config.isCommunityVersion);

// Redirect authenticated users to dashboard after store is initialized
onMounted(async () => {
  try {
    await store.dispatch('auth/doWaitUntilInit');
    const currentUser = store.getters['auth/currentUser'];
    
    if (currentUser) {
      router.push('/dashboard');
    }
  } catch (error) {
    // If auth init fails, just show the landing page
    console.log('Auth check skipped for landing page');
  }
});
</script>
