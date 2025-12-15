<template>
  <div class="pt-2">
    <app-form-item
      :validation="$v.invitedUsers"
      class="terminal-form-item !mb-0"
    >
      <template #label>
        <span class="text-zinc-200 font-mono text-xs uppercase tracking-wider">
          > Workspace_Members
        </span>
      </template>

      <div class="flex flex-col gap-3">
        <div 
          v-for="(_, ii) of form.invitedUsers"
          :key="ii"
          class="group flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300"
        >
          <div class="flex-grow">
            <!-- 
               removed class="terminal-user-input" to prevent style conflicts.
               The child component (File 2) handles its own styling now.
            -->
            <app-onboard-user-array-input
              v-model="form.invitedUsers[ii]"
              placeholder="user@email.com"
            />
          </div>

          <button
            v-if="form.invitedUsers.length > 1"
            class="h-10 w-10 flex items-center justify-center border border-zinc-700 bg-black hover:border-red-500 hover:text-red-500 text-zinc-600 transition-all shrink-0 group-hover:border-zinc-600"
            @click="removeUser(ii)"
            type="button"
            title="Remove Entry"
          >
            <i class="ri-delete-bin-5-line text-sm" />
          </button>
        </div>
      </div>
    </app-form-item>

    <div class="mt-4 pl-1">
      <button 
        class="flex items-center gap-2 text-zinc-200 hover:text-orange-500 transition-colors font-mono text-[11px] font-bold uppercase tracking-wider group" 
        @click="addUser()"
        type="button"
      >
        <span class="flex items-center justify-center w-4 h-4 border border-zinc-700 group-hover:border-orange-500 transition-colors">
            <i class="ri-add-line text-xs"></i>
        </span>
        <span>:: Add_User</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AppFormItem from '@/shared/form/form-item.vue';
import useVuelidate from '@vuelidate/core';
import AppOnboardUserArrayInput from '@/modules/onboard/components/onboard-user-array-input.vue';
import { RoleEnum } from '@/modules/user/types/Roles';

type Form = {
  invitedUsers: {
    emails: string[];
    roles: string[];
  }[]
}

const emit = defineEmits<{(e: 'update:modelValue', value: Form): void}>();
const props = defineProps<{
  modelValue: Form,
}>();

const form = computed<Form>({
  get() {
    return props.modelValue;
  },
  set(value: Form) {
    emit('update:modelValue', {
      ...props.modelValue,
      invitedUsers: value.invitedUsers,
    });
  },
});

const $v = useVuelidate({}, form);

const addUser = () => {
  form.value.invitedUsers.push({
    emails: [],
    roles: [RoleEnum.ADMIN],
  });
};

const removeUser = (index: number) => {
  form.value.invitedUsers.splice(index, 1);
};
</script>

<!-- No scoped styles here. We rely on the child component to style itself. -->