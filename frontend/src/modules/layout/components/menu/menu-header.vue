<template>
  <div
    class="h-14 flex items-center transition group pl-4 pr-4"
  >
    <!-- Logo removed -->
    <div class="grow"></div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';

const props = defineProps<{
  collapsed: boolean,
}>();

const emit = defineEmits<{(e: 'toggle-menu'): any}>();
</script>

<script lang="ts">
export default {
  name: 'CrMenuHeader',
};
</script>
