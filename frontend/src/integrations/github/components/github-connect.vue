<template>
  <slot :connect="connect" />
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import config from '@/config';
import ConfirmDialog from '@/shared/dialog/confirm-dialog';

const emit = defineEmits(['inviteColleagues']);
defineProps({ integration: Object });

const route = useRoute();
const router = useRouter();

// Build GitHub installation URL - GitHub App is configured with setup URL pointing to /onboard?source=github
const githubConnectUrl = computed(() => {
  return config.gitHubInstallationUrl;
});

const connect = () => {
  ConfirmDialog({
    type: 'notification',
    // Terminal-style Title
    title: ':: ADMIN_PERMISSION_REQUIRED',
    titleClass: 'text-white font-mono text-sm font-bold uppercase tracking-wider pt-2',
    
    // Content adjusted for dark mode readability
    message: `
      <div class="space-y-3">
        <p>Only GitHub organization admins can initialize this connection.</p>
        <p class="text-zinc-200">If you are a member, you must invite an admin to this workspace first.</p>
        <p class="text-zinc-400 text-xs mt-2">Note: If the app is already installed, you'll be redirected automatically.</p>
        <a href="https://github.com/LF-Decentralized-Trust-labs/gitmesh" target="_blank" class="text-orange-500 hover:text-orange-400 hover:underline block text-[10px] uppercase tracking-wide mt-1">[ Read Documentation ]</a>
      </div>
    `,
    messageClass: 'text-zinc-300 font-mono text-xs leading-relaxed mt-1',
    icon: 'ri-github-fill text-white',
    
    // BUTTONS (Explicit Terminal Styling)
    confirmButtonText: 'I AM THE ADMIN',
    verticalConfirmButtonClass: 'h-10 bg-orange-600 hover:bg-orange-500 text-black font-mono text-xs font-bold uppercase w-full mb-3 tracking-wider border-none rounded-none',
    
    cancelButtonText: 'INVITE AN ADMIN',
    verticalCancelButtonClass: 'h-10 bg-black border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white font-mono text-xs font-bold uppercase w-full tracking-wider transition-colors rounded-none',
    
    vertical: true,
    distinguishCancelAndClose: true,
    autofocus: false,
    
    // This class triggers the CSS below
    customClass: 'terminal-dialog' 
  })
  .then(() => {
    // Redirect to GitHub installation - GitHub App setup URL will redirect back to /onboard?source=github
    window.location.href = githubConnectUrl.value;
  })
  .catch((action) => {
    if (action === 'cancel') {
      route.name === 'onboard' ? emit('inviteColleagues') : router.push({ name: 'settings' });
    }
  });
};
</script>

<style>
.terminal-dialog.el-message-box {
    background-color: #000000 !important; /* Pure Black Background */
    border: 1px solid #ffffff !important; /* Pure White Border */
    border-radius: 0 !important; /* Sharp Corners */
    padding-bottom: 24px !important;
    max-width: 420px !important;
    box-shadow: none !important;
}

/* Remove default internal padding/headers to let our custom content take control */
.terminal-dialog .el-message-box__header {
    padding: 0 !important;
}
.terminal-dialog .el-message-box__content {
    padding: 24px 24px 12px 24px !important;
}
.terminal-dialog .el-message-box__btns {
    padding: 0 24px !important;
    display: flex;
    flex-direction: column-reverse; /* Stack buttons vertically */
}

/* Ensure buttons have no default margins */
.terminal-dialog .el-message-box__btns button {
    margin-left: 0 !important;
    width: 100%;
}

/* Hide default close button since we use a custom one inside the confirm-dialog */
.terminal-dialog .el-message-box__headerbtn {
    display: none !important;
}
</style>