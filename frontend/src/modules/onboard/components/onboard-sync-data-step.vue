<template>
  <div class="relative">
    
    <div class="flex items-start gap-3 mb-6 bg-zinc-900/50 border border-zinc-700 rounded-sm p-3">
      <div class="flex items-center justify-center h-5">
        <i class="ri-information-line text-orange-500 text-sm" />
      </div>
      <div class="text-zinc-400 text-xs font-mono leading-relaxed">
        > Connect at least one integration to unlock your workspace and start getting insights.
      </div>
    </div>

    <div
      v-if="loading"
      class="flex items-center justify-center py-12"
    >
      <div
        v-loading="loading"
        class="app-page-spinner w-20"
      />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      <app-onboard-integration-item
        v-for="highlightedIntegration in highlightedIntegrationsArray"
        :key="highlightedIntegration.platform"
        :integration="highlightedIntegration"
        @allow-redirect="onConnect"
        @invite-colleagues="emit('inviteColleagues')"
      />

      <app-onboard-integration-item
        v-for="integration in integrationsArray"
        :key="integration.platform"
        :integration="integration"
        @allow-redirect="onConnect"
      />
      
    </div>

    <app-dialog
      v-model="showGithubDialog"
      size="small"
      :title="isWaitingForGithub ? ':: GITHUB_CONNECTION' : ':: FINALIZING_SETUP'"
      :show-loading-icon="!isWaitingForGithub"
      custom-class="terminal-dialog"
    >
      <template #content>
        <div class="px-6 pb-6 text-zinc-300 font-mono text-xs">
          <div v-if="isWaitingForGithub">
            <p class="mb-4 text-zinc-400">
              > A new tab has opened with your GitHub App settings.
            </p>
            <p class="mb-2 font-bold text-white uppercase tracking-wider">
              Enter Installation ID:
            </p>
            
            <div class="bg-zinc-900 border border-zinc-700 p-3 mb-4 text-[11px]">
              <ol class="list-decimal list-inside space-y-2 text-zinc-200">
                <li>Check URL: <code class="text-orange-500">.../installations/12345</code></li>
                <li>Copy the number at the end.</li>
                <li>Paste below to authenticate.</li>
              </ol>
            </div>

            <div class="flex gap-2 items-center mt-4">
              <input
                v-model="manualInstallId"
                type="text"
                placeholder="ID: XXXXXXXX"
                class="flex-1 px-3 py-2 bg-black border border-zinc-700 text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none transition-colors font-mono text-xs"
              />
              <button
                @click="connectWithInstallId"
                :disabled="!manualInstallId"
                class="h-9 px-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold uppercase tracking-wider transition-colors"
              >
                Connect
              </button>
            </div>
          </div>
          
          <div v-else class="flex flex-col items-center py-4 gap-3 text-center">
            <i class="ri-loader-4-line text-2xl animate-spin text-orange-500"></i>
            <p>
              Synchronizing <span class="text-white font-bold">GitHub</span> protocols...<br />
              <span class="text-zinc-200 text-[10px]">> Do not reload interface.</span>
            </p>
          </div>
        </div>
      </template>
    </app-dialog>
  </div>
</template>

<script setup>
import { useStore } from 'vuex';
import {
  computed, onMounted, ref,
} from 'vue';

import { GitmeshIntegrations } from '@/integrations/integrations-config';
import AppOnboardIntegrationItem from '@/modules/onboard/components/onboard-integration-item.vue';
import { minValue } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';

const emit = defineEmits(['allowRedirect', 'inviteColleagues']);
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => {},
  },
});

const store = useStore();

const loading = computed(
  () => store.getters['integration/loadingFetch'],
);
const integrationsArray = computed(() => GitmeshIntegrations.mappedConfigs(store)
  .filter((i) => !i.onboard?.highlight && !!i.onboard));
const highlightedIntegrationsArray = computed(() => GitmeshIntegrations.mappedConfigs(store)
  .filter((i) => i.onboard?.highlight && !!i.onboard));
const showGithubDialog = ref(false);
const isWaitingForGithub = ref(false);
const manualInstallId = ref('');
let pollInterval = null;

useVuelidate({
  activeIntegrations: {
    minValue: minValue(1),
  },
}, props.modelValue);

const handleGithubInstallation = async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const installId = params.get('installation_id');
  const setupAction = params.get('setup_action');
  const source = params.get('source');

  if (code || installId) {
    if (source === 'discord') {
      await store.dispatch('integration/doDiscordConnect', {
        guildId: params.get('guild_id'),
      });
    } else {
      showGithubDialog.value = true;
      await store.dispatch('integration/doGithubConnect', {
        code,
        installId,
        setupAction,
      });
      showGithubDialog.value = false;
      
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: 'github-installation-complete' }, window.location.origin);
        window.close();
      }
    }
  }
};

onMounted(async () => {
  await handleGithubInstallation();

  const handleMessage = async (event) => {
    if (event.origin !== window.location.origin) return;
    
    if (event.data?.type === 'github-installation-complete') {
      await store.dispatch('integration/doFetch');
    }
  };

  window.addEventListener('message', handleMessage);

  return () => {
    window.removeEventListener('message', handleMessage);
  };
});

const onConnect = (val) => {
  emit('allowRedirect', val);
};

const connectWithInstallId = async () => {
  if (!manualInstallId.value) return;
  
  if (pollInterval) {
    clearInterval(pollInterval);
  }
  
  isWaitingForGithub.value = false;
  
  try {
    await store.dispatch('integration/doGithubConnect', {
      code: null,
      installId: manualInstallId.value,
      setupAction: 'install',
    });
    
    showGithubDialog.value = false;
    manualInstallId.value = '';
  } catch (error) {
    isWaitingForGithub.value = true;
  }
};

const startPollingForGithubIntegration = () => {
  isWaitingForGithub.value = true;
  
  pollInterval = setInterval(async () => {
    await store.dispatch('integration/doFetch');
    
    const githubIntegration = highlightedIntegrationsArray.value.find(
      (i) => i.platform === 'github' && i.status !== undefined
    ) || integrationsArray.value.find(
      (i) => i.platform === 'github' && i.status !== undefined
    );
    
    if (githubIntegration) {
      clearInterval(pollInterval);
      isWaitingForGithub.value = false;
      showGithubDialog.value = false;
      manualInstallId.value = '';
    }
  }, 2000); 
  
  setTimeout(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
      isWaitingForGithub.value = false;
    }
  }, 300000); 
};

window.addEventListener('github-connection-started', () => {
  showGithubDialog.value = true;
  startPollingForGithubIntegration();
});
</script>

<style>
/* If you are using ElementUI or a generic dialog component, 
  you might need global overrides to force the modal itself to be dark. 
*/
.el-dialog, .app-dialog {
  background-color: #09090b !important; /* zinc-950 */
  border: 1px solid #3f3f46 !important; /* zinc-700 */
  box-shadow: 0 0 0 1px rgba(255,255,255,0.05) !important;
}

.el-dialog__title {
  color: #ffffff !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 14px !important;
}

.el-dialog__headerbtn .el-dialog__close {
  color: #71717a !important;
}
.el-dialog__headerbtn:hover .el-dialog__close {
  color: #ea580c !important; /* orange-600 */
}
</style>