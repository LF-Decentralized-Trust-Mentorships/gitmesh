<template>
  <div
    class="flex items-center gap-3"
  >
    <div
      v-if="changes || insertions || deletions"
      class="flex items-center"
    >
      <div
        class="flex items-center tag h-8 !rounded-l-md !rounded-r-none !bg-zinc-900"
      >
        <i
          class="ri-file-edit-line text-base mr-2 text-zinc-400"
        />
        <p
          class="text-xs text-zinc-100"
        >
          {{ pluralize(changesCopy, changes || 0, true) }}
        </p>
      </div>
      <div class="bg-zinc-900 h-8 rounded-r-md flex items-center gap-2 text-xs px-3 border-y border-r border-zinc-700">
        <div class="text-green-600">
          +{{ insertions || 0 }}
        </div>
        <div class="text-red-600">
          -{{ deletions || 0 }}
        </div>
      </div>
    </div>
    <el-tooltip v-if="sourceId" placement="top" :content="sourceId">
      <div class="text-zinc-300 text-xs max-w-sm whitespace-nowrap overflow-hidden text-ellipsis">
        <span class="font-semibold">SHA:</span> {{ sourceId }}
      </div>
    </el-tooltip>
  </div>
</template>

<script setup>
import pluralize from 'pluralize';

defineProps({
  changes: {
    type: Number,
    default: null,
  },
  changesCopy: {
    type: String,
    default: null,
  },
  insertions: {
    type: Number,
    default: null,
  },
  deletions: {
    type: Number,
    default: null,
  },
  sourceId: {
    type: String,
    default: null,
  },
});
</script>

<script>
export default {
  name: 'AppActivityContentFooter',
};
</script>
