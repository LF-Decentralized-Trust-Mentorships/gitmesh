<template>
  <div class="pt-2">
    <app-form-item
      :required="true"
      :validation="$v.tenantName"
      :error-messages="{
        required: 'This field is required',
      }"
      class="terminal-form-item"
    >
      <template #label>
         <span class="text-zinc-200 font-mono text-xs uppercase tracking-wider">Community Name</span>
      </template>
      
      <el-input
        v-model="form.tenantName"
        type="text"
        placeholder="e.g. OpenSourceLabs"
        class="terminal-input"
        @blur="$v.tenantName.$touch"
        @change="$v.tenantName.$touch"
      />
    </app-form-item>
    
    <div class="mt-2 text-[10px] text-zinc-600 font-mono pl-1">
      > Creates a unique namespace for your workspace.
    </div>
  </div>
</template>

<script setup lang="ts">
import AppFormItem from '@/shared/form/form-item.vue';
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import { computed } from 'vue';

type Form = {
  tenantName: string
  invitedUsers: string
}

const emit = defineEmits<{(e: 'update:modelValue', value: Form): void}>();
const props = defineProps<{
  modelValue: Form,
}>();

const rules = {
  tenantName: {
    required,
  },
};

const form = computed<Form>({
  get() {
    return props.modelValue;
  },
  set(value: Form) {
    emit('update:modelValue', {
      ...props.modelValue,
      tenantName: value.tenantName,
    });
  },
});

const $v = useVuelidate(rules, form);

</script>

<style scoped>
/* COMPACT TERMINAL INPUT STYLES */
:deep(.terminal-input .el-input__wrapper) {
  background-color: transparent !important;
  box-shadow: 0 0 0 1px #27272a !important; /* zinc-800 */
  border-radius: 0;
  padding: 0px 0px; 
  height: 48px; /* Slightly taller for main input */
  transition: all 0.2s ease;
}

:deep(.terminal-input .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #52525b !important; /* zinc-600 */
}

:deep(.terminal-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #ea580c !important; /* orange-600 */
}

:deep(.terminal-input .el-input__inner) {
  color: #ffffff !important; /* WHITE TEXT FORCE */
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  height: 100%;
  padding-left: 12px;
}

:deep(.terminal-input .el-input__inner::placeholder) {
    color: #52525b; 
    opacity: 1;
}

/* Override AppFormItem Label if it renders standard Element UI label */
:deep(.el-form-item__label) {
  color: #71717a !important; /* zinc-500 */
  font-family: 'JetBrains Mono', monospace !important;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.05em;
  padding-bottom: 8px !important;
}

/* Error Message Styling */
:deep(.el-form-item__error) {
  color: #ea580c !important; /* orange-600 */
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  padding-top: 4px;
}
:deep(.el-form-item__error::before) {
  content: '> ';
}
</style>