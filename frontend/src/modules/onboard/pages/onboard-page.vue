<template>
  <div class="min-h-screen bg-black flex flex-col relative selection:bg-orange-500/30">
    
    <div class="fixed inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

    <div class="relative z-10 flex-1 flex flex-col pb-24"> <div class="mt-8 mb-8 flex justify-center px-6">
        <div class="flex flex-col items-center gap-4 w-full max-w-2xl">
          
          <div class="flex items-center gap-2">
             <span class="text-white font-sans text-lg font-bold tracking-tight">GitMesh</span>
          </div>

          <div class="text-center">
            <h3 class="font-mono text-lg leading-8 text-white">
              <span class="text-orange-500 mr-2">root@{{ currentUser?.firstName?.toLowerCase() || 'user' }}:~#</span>./setup_workspace.sh
            </h3>
            <p class="text-xs text-zinc-200 font-mono mt-1">
              // Initialize tenant configuration and integration modules.
            </p>
          </div>

        </div>
      </div>

      <div class="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-zinc-700/50 py-4 flex justify-center px-6">
        <div class="flex items-center gap-2 sm:gap-6 w-full max-w-2xl justify-center overflow-x-auto no-scrollbar">
          
          <div
            v-for="(step, index) in Object.values(onboardingSteps)"
            :key="step.name"
            class="flex items-center group whitespace-nowrap"
            :class="{
              'cursor-pointer': index < currentStep - 1,
              'opacity-100': index + 1 === currentStep,
              'opacity-40': index + 1 !== currentStep
            }"
            @click="onStepClick(index)"
          >
            <div v-if="index > 0" class="h-px w-4 sm:w-8 bg-zinc-700 mr-2 sm:mr-6"></div>

            <div class="flex items-center gap-2">
              <span
                class="font-mono text-xs font-bold"
                :class="getStepColor(index + 1)"
              >
                [ 0{{ index + 1 }} ]
              </span>
              <span
                class="font-mono text-xs hidden sm:block uppercase tracking-wider"
                :class="getStepColor(index + 1)"
              >
                {{ step.name }}
              </span>
            </div>
          </div>

        </div>
      </div>

      <div class="flex justify-center mt-8 px-6">
        <main class="w-full max-w-2xl">
          <div class="text-zinc-300 font-mono">
            <component
              :is="stepConfig.component"
              v-model="form"
              @allow-redirect="onConnect"
              @invite-colleagues="onInviteColleagues"
            />
          </div>
        </main>
      </div>

    </div>

    <div class="fixed bottom-0 w-full bg-black border-t border-zinc-700 py-4 px-6 z-30 flex justify-center">
      <div class="w-full max-w-2xl">
        <el-tooltip
          placement="top"
          :disabled="!stepConfig.ctaTooltip || !$v.$invalid"
          :content="stepConfig.ctaTooltip"
          popper-class="terminal-tooltip" 
        >
          <div class="w-full">
            <button
              class="w-full h-12 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-200 disabled:cursor-not-allowed text-black font-mono text-sm font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              :disabled="$v.$invalid || loadingSubmitAction"
              @click="onBtnClick"
            >
              <span v-if="loadingSubmitAction" class="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"></span>
              <span v-else class="flex items-center gap-2">
                 :: {{ stepConfig.cta }} <i class="ri-arrow-right-line text-lg" />
              </span>
            </button>
          </div>
        </el-tooltip>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {
  reactive, ref, computed, watch, onUnmounted,
} from 'vue';
import {
  mapGetters,
} from '@/shared/vuex/vuex.helpers';
import onboardingSteps from '@/modules/onboard/config/steps';
import useVuelidate from '@vuelidate/core';
import { useStore } from 'vuex';
import { GitmeshIntegrations } from '@/integrations/integrations-config';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useStore();

const { currentUser, currentTenant } = mapGetters('auth');

const loadingSubmitAction = ref(false);
const allowRedirect = ref(false);
const currentStep = ref(1);
const form = reactive({
  tenantName: currentTenant.value?.name,
  activeIntegrations: 0,
  invitedUsers: [{
    emails: [],
    roles: ['admin'],
  }],
});

const stepConfig = computed(() => Object.values(onboardingSteps)[currentStep.value - 1]);
const activeIntegrations = computed(() => GitmeshIntegrations.mappedEnabledConfigs(
  store,
).filter((integration) => integration.status));

// Helper for step styling logic
const getStepColor = (stepIndex: number) => {
  if (stepIndex === currentStep.value) return 'text-orange-500';
  if (stepIndex < currentStep.value) return 'text-zinc-400 decoration-line-through decoration-orange-500/50';
  return 'text-zinc-600';
};

// Prevent window reload when form has changes
const preventWindowReload = (e: BeforeUnloadEvent) => {
  if (!allowRedirect.value) {
    e.preventDefault();
    e.returnValue = '';
  } else {
    allowRedirect.value = false;
  }
};

window.addEventListener('beforeunload', preventWindowReload);

onUnmounted(() => {
  window.removeEventListener(
    'beforeunload',
    preventWindowReload,
  );
});

// If currentTenant, fetch integrations
watch(currentTenant, (tenant, oldTenant) => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  if (tenant?.id === oldTenant?.id) {
    return;
  }

  if (tenant) {
    form.tenantName = tenant.name;
    store.dispatch('integration/doFetch');

    currentStep.value = 2;
  } else if (code) {
    router.replace({ query: {} });
  }
}, {
  deep: true,
  immediate: true,
});

// If currentTenant and activeIntegrations, set second step as the active one
watch(activeIntegrations, (integrations) => {
  form.activeIntegrations = integrations.length;

  if (integrations.length && currentStep.value < 2) {
    currentStep.value = 2;
  }
});

const $v = useVuelidate({}, form);

// Steps Submit action
const onBtnClick = () => {
  loadingSubmitAction.value = true;

  if (currentStep.value === 3) {
    allowRedirect.value = true;
  }

  stepConfig.value.submitAction(form, activeIntegrations.value).then(() => {
    if (currentStep.value < Object.values(onboardingSteps).length) {
      currentStep.value += 1;
    }
  }).finally(() => {
    loadingSubmitAction.value = false;
  });
};

// Click on step tabs
const onStepClick = (index: number) => {
  if (!(index < currentStep.value - 1)) {
    return;
  }

  currentStep.value = index + 1;
};

const onConnect = (val: boolean) => {
  allowRedirect.value = val;
};

const onInviteColleagues = () => {
  currentStep.value = 3;
};
</script>

<style scoped>
/* Scrollbar hiding for the steps bar */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Tooltip Customization for Element Plus */
:global(.terminal-tooltip) {
    background-color: #27272a !important; /* zinc-800 */
    border: 1px solid #3f3f46 !important; /* zinc-700 */
    color: #fff !important;
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 11px !important;
    border-radius: 0px !important;
}
:global(.terminal-tooltip .el-popper__arrow::before) {
    background-color: #27272a !important;
    border: 1px solid #3f3f46 !important;
}
</style>