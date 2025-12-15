<template>
  <div class="pt-3">
    <div
      v-if="loading"
      v-loading="loading"
      class="app-page-spinner h-16 !relative !min-h-5"
    />

    <div v-else>
      <!-- Empty state -->
      <app-empty-state-cta
        v-if="count === 0"
        icon="ri-bar-chart-line"
        title="No reports yet"
        description="Please create your first report to start analyzing data from your community"
        cta-btn="Add report"
        @cta-click="$emit('cta-click')"
      />

      <div v-else>
        <!-- Sorter -->
        <div class="mb-2">
          <app-pagination-sorter
            :page-size="Number(pagination.pageSize)"
            :total="computedCount"
            :current-page="pagination.currentPage"
            :has-page-counter="false"
            module="report"
            position="top"
            @change-sorter="doChangePaginationPageSize"
          />
        </div>

        <!-- Sorters list -->
        <div class="app-list-table panel">
          <app-report-list-toolbar />
          <div class="-mx-6 -mt-6">
            <el-table
              ref="table"
              v-loading="loading"
              :data="computedRows"
              row-key="id"
              border
              :row-class-name="rowClass"
              @sort-change="doChangeSort"
              @row-click="handleRowClick"
            >
              <el-table-column
                type="selection"
                width="75"
              />

              <el-table-column
                label="Name"
                prop="name"
                sortable="custom"
              >
                <template #default="scope">
                  <router-link
                    :to="{
                      name: 'reportView',
                      params: {
                        id: scope.row.id,
                      },
                    }"
                    class="flex items-center text-zinc-100"
                  >
                    <span class="font-semibold">{{
                      scope.row.name
                    }}</span>
                  </router-link>
                </template>
              </el-table-column>
              <el-table-column
                label="# of Widgets"
                prop="widgetsCount"
              >
                <template #default="scope">
                  <span class="text-zinc-200">{{ scope.row.widgets.length }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Visibility">
                <template #default="scope">
                  <span
                    v-if="scope.row.public"
                    class="badge badge--green"
                  >Public</span>
                  <span v-else class="badge">Private</span>
                </template>
              </el-table-column>
              <el-table-column
                label=""
                width="200"
                fixed="right"
              >
                <template #default="scope">
                  <div class="table-actions">
                    <app-report-dropdown
                      :report="scope.row"
                    />
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <div v-if="!!count" class="mt-8 px-6">
              <app-pagination
                :total="computedCount"
                :page-size="Number(pagination.pageSize)"
                :current-page="pagination.currentPage || 1"
                module="report"
                @change-current-page="
                  doChangePaginationCurrentPage
                "
                @change-page-size="
                  doChangePaginationPageSize
                "
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  defineEmits, ref, watch, computed,
} from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import AppReportDropdown from './report-dropdown.vue';
import AppReportListToolbar from './report-list-toolbar.vue';

const store = useStore();
const router = useRouter();
defineEmits(['cta-click']);

const table = ref(null);

const loading = computed(
  () => store.state.report.list.loading,
);
const count = computed(() => store.state.report.count);
const rows = computed(() => store.getters['report/rows']);

const computedRows = computed(() => {
  if (loading.value) {
    return [];
  }

  return rows.value.filter((r) => !r.isTemplate);
});

const computedCount = computed(() => {
  if (loading.value) {
    return 0;
  }

  return (
    count.value
    - rows.value.filter((r) => r.isTemplate).length
  );
});

const selectedRows = computed(
  () => store.getters['report/selectedRows'],
);
const pagination = computed(
  () => store.getters['report/pagination'],
);

watch(table, (newValue) => {
  if (newValue) {
    store.dispatch('report/doMountTable', table.value);
  }
});

function doChangeSort(sorter) {
  store.dispatch('report/doChangeSort', sorter);
}

function doChangePaginationCurrentPage(currentPage) {
  store.dispatch(
    'report/doChangePaginationCurrentPage',
    currentPage,
  );
}

function doChangePaginationPageSize(pageSize) {
  store.dispatch(
    'report/doChangePaginationPageSize',
    pageSize,
  );
}

function rowClass({ row }) {
  const isSelected = selectedRows.value.find((r) => r.id === row.id)
    !== undefined;

  return isSelected ? 'is-selected' : '';
}

function handleRowClick(row) {
  router.push({
    name: 'reportView',
    params: { id: row.id },
  });
}
</script>

<script>
export default {
  name: 'AppReportListTable',
};
</script>

<style lang="scss" scoped>
:deep(.el-table) {
  background-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: transparent;
  --el-table-row-hover-bg-color: #27272a; // zinc-800
  color: #f4f4f5; // zinc-100
  
  th.el-table__cell {
    background-color: transparent;
    color: #a1a1aa; // zinc-400
    border-bottom: 1px solid #3f3f46; // zinc-700
  }
  
  td.el-table__cell {
    border-bottom: 1px solid #3f3f46; // zinc-700
  }

  .el-table__inner-wrapper::before {
    display: none;
  }
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-text-color: #a1a1aa;
  --el-pagination-button-color: #a1a1aa;
  --el-pagination-button-disabled-bg-color: transparent;
  --el-pagination-button-bg-color: transparent;
  --el-pagination-hover-color: #fff;
}
</style>
