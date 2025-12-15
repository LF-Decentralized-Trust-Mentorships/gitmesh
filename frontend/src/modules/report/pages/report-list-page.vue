<template>
  <app-page-wrapper>
    <div class="mb-10">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-zinc-100 font-semibold text-2xl mb-2">Developers Telemetry</h4>
          <div class="text-sm text-zinc-400">
            Engineering telemetry that tracks team capacity, active work, and individual contribution in real time.
          </div>
        </div>
        <el-button
          v-if="!!count"
          class="btn btn--primary btn--md"
          @click="isCreatingReport = true"
        >
          <i class="ri-add-line mr-2"></i>
          Add report
        </el-button>
      </div>
    </div>

    <div
      v-if="loading"
      v-loading="loading"
      class="app-page-spinner h-16 !relative !min-h-5"
    />
    <div v-else>
      <!-- Template reports -->
      <div v-if="computedTemplates.length">
        <div
          class="text-zinc-100 font-semibold text-base mb-6 flex items-center gap-2.5 tracking-tight"
        >
          <div class="h-1 w-1 rounded-full bg-zinc-600"></div>
          <span class="font-mono text-sm uppercase text-zinc-400 tracking-wider">Default Reports</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <app-report-template-item
            v-for="template in computedTemplates"
            :key="template.name"
            :template="template"
          />
        </div>

        <div
          v-if="customReportsCount"
          class="my-10 border-t border-zinc-800"
        />
      </div>

      <!-- Custom Reports -->
      <div v-if="customReportsCount">
        <div
          class="text-zinc-100 font-semibold text-base mb-6 flex items-center gap-2.5 tracking-tight"
        >
          <div class="h-1 w-1 rounded-full bg-zinc-600"></div>
          <span class="font-mono text-sm uppercase text-zinc-400 tracking-wider">Custom Reports</span>
        </div>
        <app-report-list-table
          @cta-click="isCreatingReport = true"
        />
      </div>
      <app-report-create-dialog
        v-model="isCreatingReport"
      />
    </div>
  </app-page-wrapper>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import ReportListTable from '@/modules/report/components/report-list-table.vue';
import AppReportCreateDialog from '@/modules/report/components/report-create-dialog.vue';
import { ReportPermissions } from '@/modules/report/report-permissions';
import AppReportTemplateItem from '@/modules/report/components/templates/report-template-item.vue';
import templates from '@/modules/report/templates/config';

export default {
  name: 'report',

  components: {
    AppReportCreateDialog,
    AppReportTemplateItem,
    'app-report-list-table': ReportListTable,
  },

  data() {
    return {
      isCreatingReport: false,
      templates,
    };
  },

  computed: {
    ...mapState({
      count: (state) => state.report.count,
      loading: (state) => state.report.list.loading,
    }),
    ...mapGetters({
      currentTenant: 'auth/currentTenant',
      currentUser: 'auth/currentUser',
      rows: 'report/rows',
    }),
    hasPermissionToCreate() {
      return new ReportPermissions(
        this.currentTenant,
        this.currentUser,
      ).create;
    },
    computedTemplates() {
      if (this.loading) {
        return [];
      }

      const templateRows = this.rows.filter(
        (r) => r.isTemplate,
      );

      // List all templates that exist in the backend
      // (have an id)
      return this.templates.map((t) => {
        const rowTemplate = templateRows.find(
          (r) => r.name === t.config.nameAsId,
        );
        return {
          ...t.config,
          public: rowTemplate?.public || false,
          id: rowTemplate?.id,
        };
      }).filter((t) => !!t.id);
    },
    customReportsCount() {
      return this.count - this.computedTemplates.length;
    },
  },

  created() {
    this.doFetch({
      keepPagination: true,
    });
  },

  async mounted() {
    window.analytics.page('Reports');
  },

  methods: {
    ...mapActions({
      doFetch: 'report/doFetch',
    }),
  },
};
</script>

<style></style>
