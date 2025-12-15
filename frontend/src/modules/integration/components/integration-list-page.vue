<template>
  <app-page-wrapper>
    <h4 class="text-white font-mono text-2xl font-bold mb-4">Integrations</h4>
    <div class="flex items-center justify-between">
      <div class="text-xs text-zinc-400 font-mono">
        Connect with all data sources that are relevant to
        your community
      </div>
      <div class="text-xs text-white font-mono">
        <span class="text-base">🪄</span> Missing something?
        <a
          href="https://github.com/LF-Decentralized-Trust-labs/gitmesh/issues"
          class="text-orange-500 hover:text-orange-400 underline"
        >Open an issue</a>
      </div>
    </div>
    <div class="mt-10">
      <div class="mb-6">
        <app-alert
          v-if="
            integrations.github
              && integrations.github.status
                === 'waiting-approval'
          "
        >
          <template #body>
            Please invite your GitHub admin to gitmesh.dev and
            ask them to set up the integration.
            <a
              href="https://github.com/LF-Decentralized-Trust-labs/gitmesh"
              class="font-semibold absolute right-0 inset-y-0 flex items-center pr-4"
              rel="noopener noreferrer"
              target="_blank"
            >Read more</a>
          </template>
        </app-alert>
        <app-alert
          v-if="
            integrations.discord
              && integrations.discord.status === 'in-progress'
          "
        >
          <template #body>
            Add Discord Bot to the private channels you need
            it to have access to.
            <a
              href="https://github.com/LF-Decentralized-Trust-labs/gitmesh"
              class="font-semibold absolute right-0 inset-y-0 flex items-center pr-4"
              rel="noopener noreferrer"
              target="_blank"
            >Read more</a>
          </template>
        </app-alert>
        <app-alert v-if="integrationsWithErrors.length > 0">
          <template #body>
            Please disconnect and connect again all the
            integrations with connectivity issues. If this
            problem persists, contact us via
            <a
              href="mailto:support@gitmesh.dev"
              class="font-semibold"
            >email</a>
            or engage within our
            <a
              href="https://discord.gg/xXvYkK3yEp"
              class="font-semibold"
            >
              Discord community</a>.
          </template>
        </app-alert>
        <app-alert v-if="integrationsWithNoData.length > 0">
          <template #body>
            Please check the
            <a
              href="https://github.com/LF-Decentralized-Trust-labs/gitmesh"
              class="font-semibold"
              target="_blank"
              rel="noopener noreferrer"
            >documentation</a>
            for integrations with no activities to make sure
            they are set up correctly. If the setup is
            correct, contact us via
            <a
              href="mailto:support@gitmesh.dev"
              class="font-semibold"
            >email</a>
            or engage within our
            <a
              href="https://discord.gg/xXvYkK3yEp"
              class="font-semibold"
            >
              Discord community</a>.
          </template>
        </app-alert>
      </div>
      <app-integration-list />
    </div>
  </app-page-wrapper>
</template>

<script>
import { mapGetters } from 'vuex';
import ConfirmDialog from '@/shared/dialog/confirm-dialog';
import Message from '@/shared/message/message';
import AppIntegrationList from './integration-list.vue';

export default {
  name: 'AppIntegrationListPage',

  components: { AppIntegrationList },

  computed: {
    ...mapGetters({
      integrations: 'integration/listByPlatform',
      integrationsWithErrors: 'integration/withErrors',
      integrationsWithNoData: 'integration/withNoData',
    }),
  },

  watch: {
    '$route.query.slack-success': {
      immediate: true,
      handler(value) {
        if (value) {
          ConfirmDialog({
            vertical: true,
            type: 'custom',
            icon: '<img src="/images/automation/slack.png" class="h-8 w-8" alt="slack logo" />',
            title: `<span class="flex items-start gap-1">Connect Slack bot
              <span class="text-brand-500 text-3xs leading-3 pt-1 font-normal">Required</span></span>`,
            titleClass: 'text-lg',
            message: `
            <img src="/images/integrations/slack-bot.png" class="mb-6" alt="slack bot installation" />
            To fetch data from Slack, you need to install the gitmesh.dev Slack bot and add it to all channels you want to track. <br><br>
            You can either add the Slack bot directly from a channel, or add the app via channel Integrations.`,
            confirmButtonText: 'How to connect Slack bot',
            showCancelButton: false,
            messageClass: 'text-xs !leading-5 !mt-1 text-gray-300',
            verticalCustomClass: 'custom-slack-message-box',
            closeOnClickModal: false,
            hideCloseButton: true,
          }).then(() => {
            window.open('https://github.com/LF-Decentralized-Trust-labs/gitmesh', '_blank');
            this.$router.replace({ query: null });
          });
        }
      },
    },
    '$route.query.twitter-error': {
      immediate: true,
      handler(value) {
        if (value) {
          Message.error('Something went wrong during X/Twitter OAuth. Please try again later.');
        }
      },
    },
  },
};
</script>

<style>
.custom-slack-message-box .el-button--primary span::after {
  content: "\ecaf";
  font-family: "remixicon" !important;
  font-size: 18px;
  margin-left: 0.5rem;
}
</style>
