<template>
  <el-aside class="gitmesh-menu h-full bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800 overflow-y-auto no-scrollbar transition-all duration-300 ease-in-out" width="fit-content">
    <el-menu
      class="flex flex-col h-full justify-between bg-transparent border-none"
      :collapse="isCollapsed"
      :router="true"
    >
      <!-- Workspace Dropdown -->
      <div class="pt-2">
        <cr-menu-workspace v-if="currentTenant" :collapsed="isCollapsed" />
      </div>

      <div class="px-3 pt-4 pb-2 flex flex-col grow">
        <cr-menu-quickstart v-if="isQuickstartEnabled" :collapsed="isCollapsed" />

        <!-- Menu items -->
        <cr-menu-links class="mb-2" :links="mainMenu" :collapsed="isCollapsed" link-class="text-sm" />

        <div class="border-t border-zinc-700 mb-4" />

        <cr-menu-links :links="bottomMenu" :collapsed="isCollapsed" link-class="text-sm" />

        <div class="grow" />
        <!-- Support popover and Toggle -->
        <div class="px-1 pb-2">
          <div class="flex" :class="isCollapsed ? 'flex-col items-center gap-1' : 'items-center justify-between'">
            <div :class="{ 'flex-1 min-w-0 mr-2': !isCollapsed, 'w-full': isCollapsed }">
              <cr-menu-support :collapsed="isCollapsed" />
            </div>
            <el-button
              class="btn btn--icon--sm btn--transparent !h-8 w-8 flex items-center justify-center
              toggle-menu-button transition !bg-transparent !text-zinc-400 hover:!bg-zinc-800 hover:!text-zinc-100 !border-0 mb-2"
              @click="toggleMenu()"
            >
              <i
                class="text-lg leading-none"
                :class="isCollapsed ? 'ri-layout-left-line' : 'ri-layout-left-2-line'"
              />
            </el-button>
          </div>
        </div>
      </div>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { useStore } from 'vuex';
import { computed, watch } from 'vue';

import { mapGetters } from '@/shared/vuex/vuex.helpers';
import { useActivityTypeStore } from '@/modules/activity/store/type';
import CrMenuWorkspace from '@/modules/layout/components/menu/menu-workspace.vue';
import CrMenuLinks from '@/modules/layout/components/menu/menu-links.vue';
import { bottomMenu, mainMenu } from '@/modules/layout/config/menu';
import CrMenuSupport from '@/modules/layout/components/menu/menu-support.vue';
import CrMenuQuickstart from '@/modules/layout/components/menu/menu-quickstart.vue';
import { FeatureFlag } from '@/utils/featureFlag';

const store = useStore();
const { currentTenant } = mapGetters('auth');
const { setTypes } = useActivityTypeStore();

watch(
  () => currentTenant,
  (tenant) => {
    if (tenant.value?.settings.length > 0) {
      setTypes(tenant.value.settings[0].activityTypes);
    }
  },
  { immediate: true, deep: true },
);

const isCollapsed = computed(
  () => store.getters['layout/menuCollapsed'],
);
function toggleMenu() {
  store.dispatch('layout/toggleMenu');
}

const isQuickstartEnabled = computed(() => FeatureFlag.isFlagEnabled(FeatureFlag.flags.quickstartV2));
</script>

<script>
export default {
  name: 'CrMenu',
};
</script>

<style lang="scss">
.gitmesh-menu{
  .el-menu--vertical:not(.el-menu--collapse):not(.el-menu--popup-container) {
    width: 281px;
  }
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
