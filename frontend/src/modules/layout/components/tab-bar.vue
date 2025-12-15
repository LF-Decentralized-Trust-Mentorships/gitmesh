<template>
  <div class="flex items-center bg-black border-b border-zinc-800 overflow-x-auto no-scrollbar w-full">
    <div
      v-for="tab in tabs"
      :key="tab.id"
      class="group flex items-center px-4 py-2.5 text-sm cursor-pointer border-r border-zinc-800 min-w-[140px] max-w-[240px] transition-all relative select-none"
      :class="{
        'bg-zinc-900 text-white': activeTabPath === tab.path,
        'text-zinc-200 hover:bg-zinc-900/50 hover:text-zinc-300': activeTabPath !== tab.path,
        'opacity-75': isSleeping(tab)
      }"
      @click="handleTabClick(tab)"
    >
      <div 
        v-if="activeTabPath === tab.path"
        class="absolute top-0 left-0 right-0 h-0.5 bg-brand-500"
      />
      
      <!-- Icon based on route name -->
      <i v-if="tab.name?.includes('member')" class="ri-user-line mr-2 text-xs" />
      <i v-else-if="tab.name?.includes('organization')" class="ri-building-line mr-2 text-xs" />
      <i v-else-if="tab.name?.includes('settings')" class="ri-settings-3-line mr-2 text-xs" />
      <i v-else class="ri-file-list-line mr-2 text-xs" />

      <span class="truncate mr-2 flex-1">{{ tab.title }}</span>
      
      <div
        class="opacity-0 group-hover:opacity-100 hover:bg-zinc-700 rounded p-0.5 transition-all text-zinc-400 hover:text-white flex items-center justify-center"
        @click.stop="handleTabClose(tab)"
      >
        <i class="ri-close-line text-xs" />
      </div>
    </div>

    <!-- Page Status Badge (Dev Mode Only) -->
    <div v-if="isDevMode && badge && badge !== 'NONE'" class="ml-auto px-4 flex items-center">
      <el-tooltip
        :content="`Status: ${badge}`"
        placement="bottom"
        effect="dark"
      >
        <span 
          class="px-2 py-0.5 rounded text-[10px] font-mono font-medium tracking-wider uppercase border cursor-help"
          :class="{
            'bg-purple-500/10 text-purple-400 border-purple-500/20': badge === 'BETA',
            'bg-blue-500/10 text-blue-400 border-blue-500/20': badge === 'COMING SOON',
            'bg-zinc-800 text-zinc-400 border-zinc-700': badge !== 'BETA' && badge !== 'COMING SOON'
          }"
        >
          {{ badge }}
        </span>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTabsStore } from '../store/tabs';
import { storeToRefs } from 'pinia';
import pageStatus from '@/config/page-status.json';

const route = useRoute();
const router = useRouter();
const tabsStore = useTabsStore();
const { tabs, activeTabPath } = storeToRefs(tabsStore);

const isDevMode = import.meta.env.DEV;
const badge = computed(() => {
  // Check if the current route name exists in the page status config
  if (route.name && pageStatus[route.name as keyof typeof pageStatus]) {
    return pageStatus[route.name as keyof typeof pageStatus];
  }
  // Fallback to route meta badge if not in config
  return route.meta?.badge;
});

// Watch route changes to add tabs
watch(
  () => route.fullPath,
  () => {
    if (route.name && route.name !== 'Login' && route.name !== 'Error') {
      tabsStore.addTab(route);
    }
  },
  { immediate: true }
);

// Watch active tab path to navigate
watch(activeTabPath, (newPath) => {
  if (newPath && newPath !== route.fullPath) {
    router.push(newPath);
  }
});

const handleTabClick = (tab: any) => {
  tabsStore.setActiveTab(tab.path);
};

const handleTabClose = (tab: any) => {
  tabsStore.removeTab(tab.path);
  // If we closed the last tab, navigate to home
  if (tabs.value.length === 0) {
    router.push('/');
  }
};

const isSleeping = (tab: any) => {
  const SLEEP_THRESHOLD = 15 * 60 * 1000; // 15 minutes
  return tab.path !== activeTabPath.value && (Date.now() - tab.lastAccessed) > SLEEP_THRESHOLD;
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
