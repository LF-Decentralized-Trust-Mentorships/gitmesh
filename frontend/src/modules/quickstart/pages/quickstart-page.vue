<template>
  <app-page-wrapper>
    <div class="pb-6">
      <h4 class="mb-1">
        Welcome to GitMesh 🐾
      </h4>
      <p class="text-xs leading-5 text-gray-300">
        The place where open-source teams coordinate, review, and ship together.
      </p>
    </div>
    <div class="flex flex-wrap -mx-2.5">
      <div class="w-full lg:w-2/3 px-2.5">
        <cr-quickstart-guides />
      </div>
      <div class="w-full lg:w-1/3 px-2.5">
        <cr-quickstart-widgets />
      </div>
    </div>
  </app-page-wrapper>
</template>

<script setup lang="ts">
import CrQuickstartGuides from '@/modules/quickstart/components/quickstart-guides.vue';
import CrQuickstartWidgets from '@/modules/quickstart/components/quickstart-widgets.vue';
</script>

<script lang="ts">
export default {
  name: 'AppQuickstartPage',
};
</script>
