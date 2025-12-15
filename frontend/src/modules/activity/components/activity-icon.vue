<template>
  <div
    v-if="icons[platform]?.[type]"
    class="absolute z-10 -top-1.5 -right-1.5 outline outline-2 outline-offset-0
  outline-zinc-900 rounded-full h-5 w-5 flex items-center justify-center"
    :class="icons[platform][type].bgColor"
  >
    <i v-if="icons[platform][type].pngnClass" :class="`${icons[platform][type].pngnClass} ${icons[platform][type].color} text-2xs leading-3`" />
    <img v-else :src="icons[platform][type].imgSrc" :alt="type" class="w-5 h-5" />
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  type: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true,
  },
});

const icons = ref({
  github: {
    'issue-comment': {
      iconClass: 'ri-chat-4-line',
      color: 'text-zinc-100',
      bgColor: 'bg-zinc-700',
    },
    'pull_request-opened': {
      iconClass: 'ri-git-pull-request-line',
      color: 'text-white',
      bgColor: 'bg-green-600',
    },
    'pull_request-closed': {
      iconClass: 'ri-git-close-pull-request-line',
      color: 'text-white',
      bgColor: 'bg-red-600',
    },
    'pull_request-comment': {
      iconClass: 'ri-chat-4-line',
      color: 'text-zinc-100',
      bgColor: 'bg-zinc-700',
    },
    'discussion-comment': {
      iconClass: 'ri-chat-4-line',
      color: 'text-zinc-100',
      bgColor: 'bg-zinc-700',
    },
    'pull_request-review-requested': {
      iconClass: 'ri-eye-line',
      color: 'text-zinc-100',
      bgColor: 'bg-zinc-700',
    },
    'pull_request-reviewed': {
      iconClass: 'ri-eye-line',
      color: 'text-zinc-100',
      bgColor: 'bg-zinc-700',
    },
    'pull_request-assigned': {
      iconClass: 'ri-user-shared-line',
      color: 'text-zinc-100',
      bgColor: 'bg-zinc-700',
    },
    'pull_request-merged': {
      iconClass: 'ri-git-merge-line',
      color: 'text-white',
      bgColor: 'bg-purple-600',
    },
    'pull_request-review-thread-comment': {
      iconClass: 'ri-chat-4-line',
      color: 'text-zinc-100',
      bgColor: 'bg-zinc-700',
    },
  },
  git: {
    commit: {
      imgSrc: '/images/integrations/git.png',
      color: 'text-zinc-100',
      bgColor: 'bg-zinc-900',
    },
  },
});
</script>

<script>
export default {
  name: 'AppActivityIcon',
};
</script>
