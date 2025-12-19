<template>
  <div class="relative">
    <!-- Header Controls -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <!-- Search -->
      <div class="w-full md:w-72">
        <el-input
          v-model="search"
          placeholder="Search integrations..."
          prefix-icon="ri-search-line"
          clearable
        />
      </div>

      <!-- Filter Tabs -->
      <div class="flex bg-gray p-1 rounded-lg border border-gray-400">
        <button
          v-for="filter in filters"
          :key="filter.value"
          class="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
          :class="activeFilter === filter.value ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-200 hover:bg-gray'"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="flex items-center justify-center py-20"
    >
      <div
        v-loading="loading"
        class="app-page-spinner w-20"
      />
    </div>
    
    <div v-else>
      <div v-if="filteredIntegrations.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500">
        <i class="ri-search-2-line text-4xl mb-4 text-gray-300"></i>
        <p>No integrations found matching your criteria.</p>
        <button 
            v-if="search || activeFilter !== 'all'" 
            class="mt-4 text-brand-500 hover:underline text-sm"
            @click="clearFilters"
        >
            Clear filters
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <app-integration-list-item
          v-for="integration in filteredIntegrations"
          :key="integration.platform"
          :integration="integration"
        />
      </div>
    </div>

    <app-dialog
      v-model="showGithubDialog"
      size="small"
      title="Finishing the setup"
      :show-loading-icon="true"
    >
      <template #content>
        <div class="px-6 pb-6">
          We're finishing the last steps of the
          <span class="font-semibold">GitHub</span> <br />
          integration setup, please don't reload the page.
        </div>
      </template>
    </app-dialog>
  </div>
</template>

<script setup>
import { useStore } from 'vuex';
import {
  defineProps, computed, onMounted, ref,
} from 'vue';

import { GitmeshIntegrations } from '@/integrations/integrations-config';
import AppIntegrationListItem from '@/modules/integration/components/integration-list-item.vue';

const store = useStore();
const props = defineProps({
  onboard: {
    type: Boolean,
    default: false,
  },
});

const search = ref('');
const activeFilter = ref('all');
const filters = [
  { label: 'All', value: 'all' },
  { label: 'Connected', value: 'connected' },
  { label: 'Not Connected', value: 'not_connected' },
];

const customIntegration = ref({
  platform: 'custom',
  name: 'Build your own',
  description:
    'Use our integration framework to build your own connector.',
  image: '/images/integrations/custom.svg',
});

const loading = computed(
  () => store.getters['integration/loadingFetch'],
);
 
const allIntegrations = computed(() => {
  const list = props.onboard
    ? GitmeshIntegrations.mappedEnabledConfigs(store)
    : GitmeshIntegrations.mappedConfigs(store);
  
  return [...list, customIntegration.value];
});

const filteredIntegrations = computed(() => {
  let result = allIntegrations.value;

  // Search
  if (search.value) {
    const q = search.value.toLowerCase();
    result = result.filter((i) => i.name.toLowerCase().includes(q)
      || i.description.toLowerCase().includes(q));
  }

  // Filter
  if (activeFilter.value === 'connected') {
    result = result.filter((i) => i.status !== undefined);
  } else if (activeFilter.value === 'not_connected') {
    result = result.filter((i) => i.status === undefined);
  }

  return result;
});

const clearFilters = () => {
  search.value = '';
  activeFilter.value = 'all';
};

const showGithubDialog = ref(false);

onMounted(async () => {
  if (store.state.integration.count === 0) {
    await store.dispatch('integration/doFetch');
  }

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const installId = params.get('installation_id');
  const setupAction = params.get('setup_action');
  const source = params.get('source');

  // Handle Discord callback
  if (source === 'discord' && params.get('guild_id')) {
    await store.dispatch('integration/doDiscordConnect', {
      guildId: params.get('guild_id'),
    });
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  // Handle GitHub callback from setup URL or direct installation
  if (source === 'github' || code || installId) {
    showGithubDialog.value = true;
    
    try {
      await store.dispatch('integration/doGithubConnect', {
        code: code || null,
        installId: installId || null,
        setupAction: setupAction || 'install',
      });
      
      // Clean up URL parameters after successful connection
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('GitHub connection failed:', error);
    } finally {
      showGithubDialog.value = false;
    }
  }
});
</script>

<script>
export default {
  name: 'AppIntegrationsList',
};
</script>
