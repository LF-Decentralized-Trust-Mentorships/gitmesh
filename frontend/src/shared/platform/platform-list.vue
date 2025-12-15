<template>
  <component
    :is="asLink ? 'a' : 'span'"
    v-for="(username, ui) of usernameHandles"
    :key="username"
    class="px-4 py-2 flex justify-between items-center relative group"
    :class="{
      'hover:bg-zinc-900 transition-colors cursor-pointer': asLink && getPlatformUrl({ platform, username, index: ui }),
    }"
    :href="getPlatformUrl({ platform, username, index: ui })"
    target="_blank"
    rel="noopener noreferrer"
  >
    <div class="flex gap-3 items-center">
      <app-platform :platform="platform" :show-tooltip="true" :attributes="attributes" />
      <div
        v-if="
          platform === 'linkedin'
            && username.includes(
              'private-',
            )
        "
        class="text-white text-xs"
      >
        *********
        <el-tooltip
          placement="top"
          content="Private profile"
        >
          <i
            class="ri-lock-line text-zinc-200 ml-2"
          />
        </el-tooltip>
      </div>
      <span v-else class="text-white text-xs">
        {{ username }}</span>
    </div>
    <i
      v-if="asLink && getPlatformUrl({ platform, username, index: ui })"
      class="ri-external-link-line text-zinc-600 invisible group-hover:visible"
    />
  </component>
</template>

<script setup>
import { computed } from 'vue';
import { GitmeshIntegrations } from '@/integrations/integrations-config';

const props = defineProps({
  usernameHandles: {
    type: Array,
    default: () => [],
  },
  links: {
    type: Array,
    default: () => [],
  },
  platform: {
    type: String,
    default: null,
  },
  url: {
    type: String,
    default: null,
  },
  attributes: {
    type: Object,
    default: null,
  },
});

const asLink = computed(() => GitmeshIntegrations.getConfig(props.platform)?.showProfileLink);
const getPlatformUrl = ({ platform, username, index }) => {
  if (props.links && props.links.length > 0 && index < props.links.length) {
    return props.links[index];
  }

  const url = GitmeshIntegrations.getConfig(platform)?.url({ username, attributes: props.attributes });
  return url ?? props.url;
};
</script>

<script>
export default {
  name: 'AppPlatformList',
};
</script>
