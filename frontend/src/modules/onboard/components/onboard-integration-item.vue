<template>
  <div 
    class="group relative w-full h-full flex flex-col bg-black border border-zinc-700 hover:border-zinc-600 transition-all duration-200"
    :class="{ 'bg-zinc-900/10': integration.onboard?.highlight }"
  >
    <div 
      class="absolute left-0 top-0 bottom-0 w-[2px] transition-colors duration-300"
      :class="statusColor"
    ></div>

    <div class="p-5 flex flex-col h-full">
      
      <div class="flex items-center gap-4 mb-3">
        
        <div class="relative shrink-0">
          <div class="w-10 h-10 flex items-center justify-center bg-zinc-900 border border-zinc-700 group-hover:border-zinc-600 transition-colors rounded-sm overflow-hidden">
            <img 
              :alt="integration.name" 
              :src="integration.image" 
              class="w-5 h-5 object-contain transition-opacity opacity-90 group-hover:opacity-100"
              :class="{ 'invert-icon': integration.id === 'github' }" 
            />
          </div>
          
          <div class="absolute -bottom-1 -right-1 w-2 h-2 bg-black border border-zinc-700 flex items-center justify-center">
            <div class="w-1 h-1 rounded-full" :class="statusBgColor"></div>
          </div>
        </div>

        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <h3 class="text-white font-sans text-sm font-bold tracking-tight">
              {{ integration.name }}
            </h3>
            <span v-if="integration.premium" class="px-1 py-px bg-zinc-900 border border-zinc-700 text-[9px] text-orange-500 font-mono uppercase tracking-wider">
              PRO
            </span>
          </div>
        </div>
      </div>

      <p class="text-zinc-200 text-xs font-mono leading-relaxed mb-6 flex-grow border-l-2 border-zinc-900 pl-3">
        {{ integration.onboard?.description || 'Integration module' }}
      </p>

      <div class="mt-auto border-t border-zinc-900 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div class="font-mono text-[9px] uppercase tracking-wider">
          <span v-if="isDone" class="text-emerald-500 flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> ONLINE
          </span>
          <span v-else-if="isError" class="text-red-500 flex items-center gap-2">
            <i class="ri-error-warning-fill"></i> ERROR
          </span>
          <span v-else-if="isNoData" class="text-zinc-600 flex items-center gap-2">
            <i class="ri-pulse-line"></i> NO DATA
          </span>
          <span v-else-if="isWaitingForAction" class="text-orange-500 flex items-center gap-2">
            <i class="ri-alert-line"></i> ACTION REQ
          </span>
          <span v-else-if="isConnected" class="text-zinc-400 flex items-center gap-2">
            <i class="ri-loader-4-line animate-spin"></i> SYNCING...
          </span>
          <span v-else class="text-zinc-600 flex items-center gap-2">
            <span class="w-1.5 h-1.5 border border-zinc-700 rounded-full"></span> OFFLINE
          </span>
        </div>

        <app-integration-connect
          :integration="integration"
          @invite-colleagues="emit('inviteColleagues')"
        >
          <template #default="{ connect, connected, settings, hasSettings }">
            <div class="flex items-center gap-2">
              
              <div v-if="!connected || !isConnected || hasSettings" class="flex items-center gap-2">
                
                <button
                  v-if="!connected"
                  class="h-7 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-orange-500 text-zinc-300 hover:text-orange-500 transition-all font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 group/btn"
                  @click="() => onConnect(connect)"
                >
                  <span>:: CONNECT</span>
                  <i class="ri-arrow-right-s-line group-hover/btn:translate-x-0.5 transition-transform"></i>
                </button>

                <button
                  v-else-if="!isConnected"
                  class="h-7 px-2 border border-red-900/30 text-red-700 hover:text-red-500 hover:border-red-500 hover:bg-red-950/10 transition-all font-mono text-[10px] uppercase tracking-wider flex items-center justify-center"
                  :disabled="loadingDisconnect"
                  @click="handleDisconnect"
                >
                   <i v-if="loadingDisconnect" class="ri-loader-4-line animate-spin"></i>
                   <span v-else>ABORT</span>
                </button>

              </div>

              <button
                v-if="hasSettings"
                class="h-7 w-7 flex items-center justify-center border border-zinc-700 bg-black text-zinc-200 hover:text-white hover:border-zinc-500 transition-colors"
                @click="settings"
              >
                <i class="ri-settings-4-fill text-xs"></i>
              </button>

            </div>
          </template>
        </app-integration-connect>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import AppIntegrationConnect from '@/modules/integration/components/integration-connect.vue';

const store = useStore();
const emit = defineEmits(['allowRedirect', 'inviteColleagues']);
const props = defineProps({
  integration: {
    type: Object,
    default: () => {},
  },
});

const loadingDisconnect = ref(false);

const ERROR_BANNER_WORKING_DAYS_DISPLAY = 7;

// Helper to check date diff
const isCurrentDateAfterGivenWorkingDays = (date, workingDays) => {
  if (!date || !workingDays) return false;
  const targetDate = new Date(date);
  const diffDays = Math.ceil(Math.abs(new Date() - targetDate) / (1000 * 60 * 60 * 24));
  return diffDays > workingDays;
};

// --- Computed States ---
const isConnected = computed(() => props.integration.status !== undefined);

const isDone = computed(() => 
  props.integration.status === 'done' || 
  (props.integration.status === 'error' && !isCurrentDateAfterGivenWorkingDays(props.integration.updatedAt, ERROR_BANNER_WORKING_DAYS_DISPLAY))
);

const isError = computed(() => 
  props.integration.status === 'error' && 
  isCurrentDateAfterGivenWorkingDays(props.integration.updatedAt, ERROR_BANNER_WORKING_DAYS_DISPLAY)
);

const isNoData = computed(() => props.integration.status === 'no-data');
const isWaitingForAction = computed(() => props.integration.status === 'pending-action');

// --- Visual Logic ---
const statusColor = computed(() => {
  if (isDone.value) return 'bg-emerald-500';
  if (isError.value || isNoData.value) return 'bg-red-500';
  if (isWaitingForAction.value) return 'bg-orange-500';
  if (isConnected.value) return 'bg-zinc-700';
  return 'bg-zinc-900'; 
});

const statusBgColor = computed(() => {
   if (isDone.value) return 'bg-emerald-500';
   if (isError.value) return 'bg-red-500';
   return 'bg-zinc-800';
});

// --- Actions ---
const handleDisconnect = () => {
  loadingDisconnect.value = true;
  store.dispatch('integration/doDestroy', props.integration.id).finally(() => {
    loadingDisconnect.value = false;
  });
};

const onConnect = (connect) => {
  emit('allowRedirect', true);
  connect();
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;600;700;900&display=swap');

.font-sans { font-family: 'Inter', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }

/* GitHub Logo Fix:
  Inverts color so black logos become white.
  Brightness(2) ensures it hits pure white, not grey.
*/
.invert-icon {
  filter: invert(1) brightness(2);
}

:deep(.el-popper) {
    border-radius: 0px !important;
}
</style>