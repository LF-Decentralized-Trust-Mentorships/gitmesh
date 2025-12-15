<template>
  <app-dialog v-model="isOpened" :title="isEdit ? 'Edit organization' : 'Add organization'">
    <template #content>
      <div class="px-6">
        <app-form-item
          label="Organization"
          :required="true"
          class="w-full mb-5"
          :validation="$v.organization"
          :error-messages="{
            required: 'Please select or create an organization from the dropdown',
          }"
        >
          <app-autocomplete-one-input
            v-model="form.organization"
            :fetch-fn="fetchOrganizationsFn"
            :create-fn="createOrganizationFn"
            placeholder="Type to search or create an organization"
            input-class="organization-input"
            create-prefix="Create: "
            :create-if-not-found="true"
            :in-memory-filter="false"
            :clearable="false"
            class="w-full"
            :teleported="false"
            @blur="$v.organization.$touch"
            @change="$v.organization.$touch"
          >
            <template v-if="form.organization && (form.organization.displayName || form.organization.name)" #prefix>
              <div class="flex items-center">
                <app-avatar
                  :entity="{
                    displayName: form.organization.displayName || form.organization.name,
                    avatar: form.organization.logo,
                  }"
                  size="xxs"
                />
              </div>
            </template>
            <template #option="{ item }">
              <div class="flex items-center">
                <app-avatar
                  :entity="{
                    displayName: item.label,
                    avatar: item.logo,
                  }"
                  size="xxs"
                  class="mr-2"
                />
                {{ item.label }}
              </div>
            </template>
          </app-autocomplete-one-input>
        </app-form-item>
        <div class="flex items-center -mx-2.5">
          <div class="w-7/12 px-2.5">
            <app-form-item
              label="Job title"
            >
              <el-input
                v-model="form.jobTitle"
                clearable
              />
            </app-form-item>
          </div>
          <div class="w-5/12 px-2.5">
            <app-form-item
              label="Period"
              :validation="$v.dateStart"
              :error-messages="{
                minDate: 'Invalid date range',
              }"
            >
              <div class="flex">
                <el-date-picker
                  v-model="form.dateStart"
                  type="month"
                  placeholder="From"
                  class="!w-auto custom-date-range-picker date-from -mr-px"
                  popper-class="date-picker-popper"
                  format="MMM YYYY"
                  @blur="$v.dateStart.$touch"
                  @change="$v.dateStart.$touch"
                />
                <el-date-picker
                  v-model="form.dateEnd"
                  type="month"
                  placeholder="To"
                  class="!w-auto custom-date-range-picker date-to"
                  popper-class="date-picker-popper"
                  format="MMM YYYY"
                  @blur="$v.dateStart.$touch"
                  @change="$v.dateStart.$touch"
                />
              </div>
            </app-form-item>
          </div>
        </div>
      </div>

      <footer
        class="bg-gray-50 py-4 px-6 flex justify-end rounded-b-md"
      >
        <el-button
          class="btn btn--bordered btn--md mr-4"
          @click="emit('update:modelValue', false)"
        >
          Cancel
        </el-button>
        <el-button
          class="btn btn--primary btn--md"
          :disabled="$v.$invalid"
          @click="submit()"
        >
          <span v-if="isEdit">Update</span>
          <span v-else>Add organization</span>
        </el-button>
      </footer>
    </template>
  </app-dialog>
</template>

<script setup lang="ts">
import { Organization } from '@/modules/organization/types/Organization';
import { computed, onMounted, reactive, watch } from 'vue';
import AppDialog from '@/shared/dialog/dialog.vue';
import AppFormItem from '@/shared/form/form-item.vue';
import { OrganizationService } from '@/modules/organization/organization-service';
import AppAvatar from '@/shared/avatar/avatar.vue';
import AppAutocompleteOneInput from '@/shared/form/autocomplete-one-input.vue';
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import moment from 'moment';
import Message from '@/shared/message/message';

type SelectOrganization = Organization & { label: string };

interface MemberOrganizationForm {
  organization: Organization | '',
  jobTitle: string;
  dateStart: string;
  dateEnd: string;
}

const props = defineProps<{
  modelValue: boolean,
  organization?: Organization | null,
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: boolean), (e: 'add', value: Organization), (e: 'edit', value: Organization),}>();

const isOpened = computed<boolean>({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit('update:modelValue', value);
  },
});

const isEdit = computed<boolean>(() => !!props.organization);

const form = reactive<MemberOrganizationForm>({
  organization: '',
  jobTitle: '',
  dateStart: '',
  dateEnd: '',
});

const rules = {
  organization: {
    required: (value) => {
      console.log('Validation check - value:', value, 'has id:', value?.id);
      // Check if organization exists and has an ID
      const isValid = value && typeof value === 'object' && value.id;
      console.log('Validation result:', isValid);
      return isValid;
    },
  },
  dateStart: {
    minDate: (value, rest) => !form.dateEnd || (!!form.dateStart && moment(value).isBefore(moment(rest.dateEnd))),
  },
};

const $v = useVuelidate(rules, form);

const submit = () => {
  if ($v.value.$invalid) {
    return;
  }

  if (!form.organization || !form.organization.id) {
    console.error('Cannot add organization: No organization selected or organization has no ID', form.organization);
    return;
  }

  const data = {
    ...(props.organization || {}),
    ...form.organization,
    memberOrganizations: {
      title: form.jobTitle || null,
      dateStart: form.dateStart ? moment(form.dateStart).startOf('month').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : null,
      dateEnd: form.dateEnd ? moment(form.dateEnd).startOf('month').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : null,
    },
  } as Organization;
  
  console.log('Adding organization to contact:', { 
    id: data.id, 
    displayName: data.displayName,
    name: data.name,
    title: data.memberOrganizations.title 
  });
  
  if (isEdit.value) {
    emit('edit', data);
  } else {
    emit('add', data);
  }
  isOpened.value = false;
};

const fetchOrganizationsFn = (query: number, limit:number) => OrganizationService.listAutocomplete(query, limit)
  .then((options: SelectOrganization[]) => options.filter((m) => m.id !== props.modelValue.id).map((o) => ({
    ...o,
    displayName: o.label,
    name: o.label,
  })))
  .catch(() => []);

const createOrganizationFn = async (value: string) => {
  console.log('createOrganizationFn called with value:', value);
  
  try {
    console.log('Calling OrganizationService.create...');
    const newOrganization = await OrganizationService.create({
      name: value,
      manuallyCreated: true,
    });
    
    console.log('OrganizationService.create response:', newOrganization);
    
    if (!newOrganization || !newOrganization.id) {
      console.error('Failed to create organization: Invalid response', newOrganization);
      Message.error('Failed to create organization: Invalid response from server');
      return null;
    }
    
    const displayName = newOrganization.displayName || value;
    const result = {
      ...newOrganization,
      label: displayName,
      displayName: displayName,
      name: displayName,
    };
    
    console.log('Organization created successfully, returning:', result);
    return result;
  } catch (error) {
    console.error('Error creating organization:', error);
    console.error('Error details:', error.response?.data || error.message);
    Message.error(`Failed to create organization: ${error.response?.data?.message || error.message}`);
    return null;
  }
};

const fillForm = (organization: Organization) => {
  form.organization = {
    ...organization,
    label: organization.displayName || organization.name,
  } as Organization;
  form.jobTitle = organization.memberOrganizations.title;
  form.dateStart = organization.memberOrganizations.dateStart;
  form.dateEnd = organization.memberOrganizations.dateEnd;
};

// Watch for changes to form.organization
watch(() => form.organization, (newVal, oldVal) => {
  console.log('form.organization changed:'); 
  console.log('  old:', oldVal);
  console.log('  new:', newVal);
  console.log('  newVal type:', typeof newVal);
  console.log('  newVal keys:', newVal ? Object.keys(newVal) : 'null/undefined');
  console.log('  hasId:', newVal?.id);
  console.log('  validation:', $v.value.organization);
  console.log('  validation.$invalid:', $v.value.organization.$invalid);
}, { deep: true });

onMounted(() => {
  if (props.organization) {
    fillForm(props.organization);
  }
});

</script>

<script lang="ts">
export default {
  name: 'AppMemberFormOrganizationsCreate',
};
</script>

<style lang="scss">
.custom-date-range-picker{
  &.date-from{
    .el-input__wrapper{
      @apply rounded-r-none h-10 #{!important};
    }
  }

  &.date-to{
    .el-input__wrapper{
      @apply rounded-l-none h-10 #{!important};
    }
  }
}
</style>
