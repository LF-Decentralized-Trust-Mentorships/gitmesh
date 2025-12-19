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
      title=":: FINALIZING_GITHUB_SETUP"
      :show-loading-icon="true"
      custom-class="terminal-dialog"
    >
      <template #content>
        <div class="px-6 pb-6 text-zinc-300 font-mono text-xs">
          <div class="flex flex-col items-center py-4 gap-3 text-center">
            <i class="ri-loader-4-line text-2xl animate-spin text-orange-500"></i>
            <p>
              Synchronizing <span class="text-white font-bold">GitHub</span> integration...<br />
              <span class="text-zinc-200 text-[10px]">> Connecting repositories and configuring access.</span>
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

  // Handle Discord callback
  if (source === 'discord' && params.get('guild_id')) {
    await store.dispatch('integration/doDiscordConnect', {
      guildId: params.get('guild_id'),
    });
    return;
  }

  // Handle GitHub callback from setup URL or direct installation
  if (source === 'github' || code || installId) {
    // Show loading dialog while processing GitHub connection
    showGithubDialog.value = true;
    
    try {
      await store.dispatch('integration/doGithubConnect', {
        code: code || null,
        installId: installId || null,
        setupAction: setupAction || 'install',
      });
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('GitHub connection failed:', error);
      // If connection fails and we have source=github but no installId, show manual input helper
      if (source === 'github' && !installId) {
        showManualInputDialog();
      }
    } finally {
      showGithubDialog.value = false;
    }
  }
};

const showManualInputDialog = () => {
  // Show dialog with manual installation ID input for already-installed apps
  const installId = prompt(
    'The GitHub App may already be installed.\n\n' +
    'Please go to: https://github.com/settings/installations\n' +
    'Find the GitMesh app and copy the Installation ID from the URL\n' +
    '(Example: github.com/settings/installations/95088703)\n\n' +
    'Enter the Installation ID:'
  );
  
  if (installId && !isNaN(installId)) {
    showGithubDialog.value = true;
    store.dispatch('integration/doGithubConnect', {
      code: null,
      installId: installId,
      setupAction: 'install',
    }).then(() => {
      window.history.replaceState({}, document.title, window.location.pathname);
    }).catch((error) => {
      console.error('GitHub connection failed:', error);
    }).finally(() => {
      showGithubDialog.value = false;
    });
  }
};

onMounted(async () => {
  await handleGithubInstallation();
});

const onConnect = (val) => {
  emit('allowRedirect', val);
};
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