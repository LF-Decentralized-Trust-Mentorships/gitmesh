<template>
  <article class="flex items-start w-full">
    <div class="flex flex-grow items-start w-full">
      <app-form-item
        :validation="$v.emails"
        :error-messages="{
          email: 'INVALID_FORMAT',
        }"
        class="!mb-0 mr-0 flex-grow w-full terminal-input-group"
      >
        <el-input
          v-model="model.emails[0]"
          :placeholder="placeholder"
          class="terminal-merged-input"
          @blur="$v.emails.$touch"
          @change="$v.emails.$touch"
        >
          <template #append>
            <el-select
              v-model="model.roles[0]"
              class="w-32 terminal-select"
              placeholder="ROLE"
              placement="bottom-end"
              popper-class="terminal-select-dropdown"
            >
              <el-option
                v-for="option in roles"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </template>
        </el-input>
      </app-form-item>
    </div>
    <slot name="after" />
  </article>
</template>

<script setup lang="ts">
import { computed, defineEmits, defineProps } from 'vue';
import { required, email } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import AppFormItem from '@/shared/form/form-item.vue';
import { RoleEnum } from '@/modules/user/types/Roles';

type InvitedUser = {
  emails: string[],
  roles: string[]
}

// Uppercase labels for terminal look
const roles = [
  {
    value: RoleEnum.ADMIN,
    label: 'ADMIN',
  },
  {
    value: RoleEnum.READONLY,
    label: 'READ-ONLY',
  },
];

const emit = defineEmits<{(e: 'update:modelValue', value: InvitedUser): void}>();
const props = defineProps<{
  modelValue: InvitedUser,
  placeholder?: string,
}>();

const rules = {
  emails: { email },
  roles: { required },
};

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value: InvitedUser) {
    emit('update:modelValue', value);
  },
});

const $v = useVuelidate(rules, model);
</script>

<style scoped>
/* 1. Main Input Styling */
:deep(.terminal-merged-input .el-input__wrapper) {
  background-color: transparent !important;
  box-shadow: none !important; /* Remove default shadow */
  border: 1px solid #27272a; /* zinc-800 */
  border-right: none; /* Merge with append slot */
  border-radius: 0;
  height: 40px;
  padding-left: 12px;
  transition: border-color 0.2s;
}

:deep(.terminal-merged-input .el-input__wrapper.is-focus) {
  border-color: #ea580c; /* orange-600 */
  z-index: 2; /* Bring above append slot */
}

:deep(.terminal-merged-input .el-input__inner) {
  color: white !important;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
}

/* 2. Appended Select Styling */
:deep(.terminal-merged-input .el-input-group__append) {
  background-color: transparent !important;
  box-shadow: none !important;
  border: 1px solid #27272a; /* zinc-800 */
  border-left: 1px solid #3f3f46; /* zinc-700 divider */
  border-radius: 0;
  padding: 0;
  width: 110px; /* Specific width for roles */
}

:deep(.terminal-select .el-input__wrapper) {
  box-shadow: none !important;
  background-color: transparent !important;
  padding: 0 10px;
}

:deep(.terminal-select .el-input__inner) {
  color: #a1a1aa !important; /* zinc-400 */
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  text-align: right;
  cursor: pointer;
}

/* Hover state for select */
:deep(.terminal-merged-input .el-input-group__append:hover) {
  background-color: #18181b !important; /* zinc-900 */
}

/* Error State */
:deep(.is-error-relative .el-input__wrapper) {
  border-color: #ef4444 !important; /* red-500 */
  z-index: 10;
}
</style>

<style>
.terminal-select-dropdown.el-popper {
  background-color: #000000 !important;
  border: 1px solid #3f3f46 !important; /* zinc-700 */
  border-radius: 0 !important;
}

.terminal-select-dropdown .el-select-dropdown__item {
  color: #a1a1aa !important; /* zinc-400 */
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 11px !important;
  height: 32px;
  line-height: 32px;
}

.terminal-select-dropdown .el-select-dropdown__item.hover, 
.terminal-select-dropdown .el-select-dropdown__item:hover {
  background-color: #18181b !important; /* zinc-900 */
  color: #ea580c !important; /* orange-600 */
}

.terminal-select-dropdown .el-select-dropdown__item.selected {
  color: #ea580c !important; /* orange-600 */
  font-weight: bold;
}

/* Remove the arrow/triangle */
.terminal-select-dropdown .el-popper__arrow {
  display: none;
}
</style>