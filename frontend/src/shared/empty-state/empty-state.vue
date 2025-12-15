<template>
  <div class="flex gap-6 items-center justify-center">
    <i class="text-3xl text-zinc-600" :class="icon" />
    <div class="text-zinc-200 italic text-xs">
      {{ description }}
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  icon: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});
</script>
