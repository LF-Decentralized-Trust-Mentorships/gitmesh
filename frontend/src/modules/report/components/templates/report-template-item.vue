<template>
  <div class="hover:cursor-pointer group h-full" @click="onClick">
    <div
      class="bg-zinc-950/50 p-6 rounded-lg border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-200 h-full flex flex-col backdrop-blur-sm"
    >
      <div class="flex items-start justify-between mb-5">
        <div
          class="rounded-md h-10 w-10 flex items-center justify-center bg-zinc-800/50 border border-zinc-700/50 group-hover:border-zinc-600 group-hover:bg-zinc-800 transition-all duration-200"
        >
          <i
            class="text-zinc-400 group-hover:text-zinc-200 text-lg transition-colors duration-200"
            :class="template.icon"
          />
        </div>

        <div class="flex items-center gap-2">
          <div
            v-if="template.public"
            class="bg-zinc-800/50 text-zinc-400 px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 border border-zinc-700/50"
          >
            <i class="ri-global-line text-xs" /><span>Public</span>
          </div>
          <app-report-template-dropdown
            v-if="template.public"
            :report="{
              id: template.id,
              public: template.public,
            }"
          />
        </div>
      </div>
      
      <div class="mt-auto">
        <div class="text-zinc-100 text-base font-semibold mb-2.5 group-hover:text-white transition-colors duration-200">
          {{ template.name }}
        </div>
        <div class="text-zinc-500 text-sm leading-relaxed line-clamp-2 font-light">
          {{ template.description }}
        </div>
      </div>

      <!-- Bottom accent line -->
      <div class="h-px bg-zinc-800 group-hover:bg-zinc-700 mt-5 transition-colors duration-200"></div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';
import AppReportTemplateDropdown from '@/modules/report/components/templates/report-template-dropdown.vue';

const router = useRouter();
const props = defineProps({
  template: {
    type: Object,
    required: true,
  },
});

const onClick = () => {
  router.push({
    name: 'reportTemplate',
    params: {
      id: props.template.id,
    },
  });
};
</script>
