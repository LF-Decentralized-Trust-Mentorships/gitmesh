<template>
  <div class="panel bg-black">
    <div class="flex justify-between items-center">
      <div class="flex gap-2">
        <span class="flex items-center gap-1">
          <i class="ri-database-2-line text-lg text-gray-300 enrichment-icon" />
          <span class="text-gray-200 font-semibold text-sm">Contact enrichment</span>
        </span>
      </div>
      <el-tooltip placement="top" content="Learn more">
        <a
          aria-label="Learn more"
          class="btn btn--transparent !h-8 !w-8 !text-gray-400 hover:!text-gray-300"
          href="https://github.com/LF-Decentralized-Trust-labs/gitmesh"
          target="_blank"
          rel="noopener noreferrer"
        ><i class="ri-question-line text-lg" /></a>
      </el-tooltip>
    </div>

    <div class="mt-4 mb-5 text-2xs text-gray-300">
      Enrich this contact with emails, seniority, contributions, and other key attributes to unlock deeper insights.
    </div>

    <el-tooltip
      placement="top"
      content="Contact enrichment requires an associated GitHub profile or Email"
      :disabled="!isEnrichmentDisabled || !isEnrichmentFeatureEnabled()"
      popper-class="max-w-[260px]"
    >
      <span>
        <el-button
          class="btn btn--primary btn--full !h-8"
          :disabled="isEnrichmentActionDisabled"
          @click="onEnrichmentClick"
        >
          <span v-if="isEnrichmentFeatureEnabled()">Enrich contact</span>
          <span v-else>Upgrade plan</span>
        </el-button>
      </span>
    </el-tooltip>

    <div
      class="w-full text-center italic text-gray-500 text-3xs mt-2"
    >
      * requires a GitHub profile or Email
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, onMounted } from 'vue';
import {
  mapActions,
  mapGetters,
} from '@/shared/vuex/vuex.helpers';
import AppSvg from '@/shared/svg/svg.vue';
import { isEnrichmentFeatureEnabled } from '@/modules/member/member-enrichment';
import { useRouter } from 'vue-router';
import { MemberPermissions } from '../member-permissions';

const router = useRouter();
const props = defineProps({
  member: {
    type: Object,
    default: () => {},
  },
});

const { doEnrich } = mapActions('member');
const { doRefreshCurrentUser } = mapActions('auth');
const { currentTenant, currentUser } = mapGetters('auth');

const isEnrichmentDisabled = computed(
  () => !props.member.username?.github?.length
    && !props.member.emails?.length,
);

const isEditLockedForSampleData = computed(() => new MemberPermissions(
  currentTenant.value,
  currentUser.value,
).editLockedForSampleData);

const isEnrichmentActionDisabled = computed(() => isEnrichmentDisabled.value || isEditLockedForSampleData.value);

onMounted(() => {
  doRefreshCurrentUser({});
});

const onEnrichmentClick = async () => {
  if (!isEnrichmentFeatureEnabled()) {
    router.push('/settings?activeTab=plans');
    return;
  }
  await doEnrich(props.member.id);
};
</script>

<style lang="scss">
.enrichment-icon svg use {
  transform: scale(1.25);
}
</style>
