<template>
  <el-popover
    placement="right-end"
    :width="260"
    trigger="click"
    popper-class="!pt-2 !px-1 !pb-1 transform translate-x-1"
    @show="isDropdownOpen = true"
    @hide="isDropdownOpen = false"
  >
    <template #reference>
      <div>
        <el-tooltip
          :disabled="!props.collapsed || isDropdownOpen"
          :hide-after="50"
          content="Help & support"
          effect="dark"
          placement="right"
          raw-content
        >
          <div
            class="rounded-md h-8 transition !text-zinc-400 flex items-center
          group whitespace-nowrap flex-nowrap px-1.5 hover:bg-zinc-800 hover:!text-zinc-100 mb-2 cursor-pointer overflow-hidden"
            :class="[isDropdownOpen ? 'bg-zinc-800 !text-zinc-100' : '', props.collapsed ? 'justify-center' : '']"
          >
            <i class="ri-question-line text-lg" :class="{ 'mr-3': !props.collapsed }" />
            <span v-if="!props.collapsed" class="text-sm">
              GitMesh Support
            </span>
          </div>
        </el-tooltip>
      </div>
    </template>

    <div class="-mb-">
      <div class="pt-1 pb-3 px-4">
        <p class="uppercase text-2xs font-semibold tracking-1 text-gray-400 leading-6 text-center">
          GitMesh Support
        </p>
      </div>
      <div class="px-3 -mx-1 border-b border-gray-100 pb-4 mb-2">
        <cr-menu-support-help />
      </div>
      <cr-menu-links
        :collapsed="false"
        :links="supportMenu"
        link-class="!p-3 !h-10 !mb-1 !text-xs"
        icon-class="!text-base"
      />
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CrMenuLinks from '@/modules/layout/components/menu/menu-links.vue';
import { supportMenu } from '@/modules/layout/config/menu';
import CrMenuSupportHelp from '@/modules/layout/components/menu/menu-support-help.vue';

const props = defineProps<{
  collapsed: boolean
}>();

const isDropdownOpen = ref<boolean>(false);
</script>

<script lang="ts">
export default {
  name: 'CrMenuSupport',
};
</script>
