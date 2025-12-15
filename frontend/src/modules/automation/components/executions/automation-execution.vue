<template>
  <div class="webhook-execution px-6 pb-6">
    <div class="flex items-center">
      <div
        :class="
          props.execution.state === 'success'
            ? 'text-green-500'
            : 'text-red-500'
        "
        class="flex items-center"
      >
        <i
          :class="
            props.execution.state === 'success'
              ? 'ri-checkbox-circle-line'
              : 'ri-close-circle-line'
          "
          class="mr-1 text-lg"
        />
        <span class="font-medium text-sm">{{
          props.execution.state === 'success'
            ? 'Success'
            : 'Error'
        }}
        </span>
      </div>
      <div class="text-zinc-200 ml-6 text-sm">
        Timestamp:
      </div>
      <div class="text-zinc-100 ml-2 text-sm">
        {{ formattedDate(props.execution.executedAt) }}
      </div>
    </div>
    <div
      v-if="props.execution.state === 'error' && props.automation.type === 'slack'"
      class="rounded-md bg-yellow-900/20 border border-yellow-900/40 flex items-center justify-between py-3 px-4 mt-6"
    >
      <div class="flex items-center">
        <span class="ri-alert-fill text-yellow-500 text-base mr-3" />
        <span class="text-xs leading-5 text-zinc-100">Please make sure you have the gitmesh.dev notifier app installed in your Slack workspace.</span>
      </div>
      <el-button
        class="btn btn--primary btn--sm ml-4"
        @click="authenticateSlack()"
      >
        Install app
      </el-button>
    </div>
    <div
      v-if="props.execution.state === 'error' && (props.execution.error.message || props.execution.error.body)"
      class="vjs-tree-wrapper vjs-tree-wrapper--error mt-6"
    >
      <span
        class="font-medium block text-sm text-red-500"
        :class="{ 'mb-4': !!props.execution.error.body }"
      >
        {{ props.execution.error.message }}
      </span>
      <vue-json-pretty
        v-if="props.execution.error.body"
        :data="props.execution.error.body"
        :show-double-quotes="false"
        :show-line="false"
      />
    </div>

    <span class="font-medium block text-base mb-3 mt-6 text-zinc-100">Payload</span>
    <div class="vjs-tree-wrapper">
      <vue-json-pretty
        :data="props.execution.payload"
        :show-double-quotes="false"
        :show-line="false"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import moment from 'moment';
import config from '@/config';
import { AuthToken } from '@/modules/auth/auth-token';
import { mapGetters } from '@/shared/vuex/vuex.helpers';

const props = defineProps({
  execution: {
    type: Object,
    default: () => {},
  },
  automation: {
    type: Object,
    default: () => {},
  },
});

const { currentTenant } = mapGetters('auth');

const slackConnectUrl = computed(() => {
  const redirectUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?activeTab=automations&success=true`;

  return `${config.backendUrl}/tenant/${
    currentTenant.value.id
  }/automation/config?redirectUrl=${redirectUrl}&gitmeshToken=${AuthToken.get()}`;
});

const authenticateSlack = () => {
  window.open(slackConnectUrl.value, '_self');
};

const formattedDate = (date) => moment(date).format('YYYY-MM-DD HH:mm:ss');
</script>

<script>
export default {
  name: 'AppAutomationExecution',
};
</script>

<style lang="scss">
.webhook-execution {
  .vjs-tree-wrapper {
    @apply p-4 rounded-md overflow-auto bg-zinc-900;
    max-height: 430px;

    .vjs-tree {
      @apply text-xs;

      &.is-highlight,
      .vjs-tree-node:hover {
        @apply bg-zinc-800;
      }
    }

    &--error {
      @apply bg-red-900/20;
      height: auto;
      max-height: 200px;
      .vjs-tree {
        &.is-highlight,
        .vjs-tree-node:hover {
          @apply bg-red-900/40;
        }
      }
    }
  }

  .vjs-value {
    &-string,
    &-boolean,
    &-number,
    &-array {
      @apply text-zinc-100;
    }
  }

  .vjs-key {
    @apply text-zinc-200;
  }
}
</style>
