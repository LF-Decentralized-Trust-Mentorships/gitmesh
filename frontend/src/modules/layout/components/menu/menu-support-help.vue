<template>
  <div class="flex flex-col items-center pb-1">
    <div class="h-12 w-12 rounded-full overflow-hidden mb-2">
      <img alt="GitMesh" src="/images/quickstart/gitmesh.png" class="object-cover" />
    </div>
    <p class="text-center text-sm font-medium mb-1 text-gray-100">
      GitMesh
    </p>
    <p class="text-center text-2xs leading-5 text-gray-300">
      Engineering Team
    </p>
  </div>
  <div>
    <a href="mailto:support@gitmesh.dev" target="_blank" rel="noopener noreferrer" class="block">
      <button type="button" class="btn btn--sm btn--bordered flex items-center w-full mt-3">
        <i class="ri-mail-line mr-2 text-base h-4 flex items-center" /> Drop us a mail.
      </button>
    </a>
    <a href="https://cal.com/gitmesh/onboarding-opensource" target="_blank" rel="noopener noreferrer" class="block">
      <button type="button" class="btn btn--sm btn--bordered flex items-center w-full mt-3">
        <i class="ri-calendar-line mr-2 text-base h-4 flex items-center" /> Hop on a call?
      </button>
    </a>
    <a href="https://github.com/LF-Decentralized-Trust-labs/gitmesh/issues" target="_blank" rel="noopener noreferrer" class="block">
      <button type="button" class="btn btn--sm btn--bordered flex items-center w-full mt-3">
        <i class="ri-bug-line mr-2 text-base h-4 flex items-center" /> Raise an issue!
      </button>
    </a>
  </div>
</template>

<script setup lang="ts">
</script>

<script lang="ts">
export default {
  name: 'CrMenuSupportHelp',
};
</script>
