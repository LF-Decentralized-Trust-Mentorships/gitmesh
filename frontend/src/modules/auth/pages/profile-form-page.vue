<template>
  <app-page-wrapper size="narrow">
    <div class="profile-form-page">
      <h4 class="mb-6">
        Account settings
      </h4>
      <el-container
        class="bg-zinc-900 rounded-lg border border-zinc-700"
      >
        <el-main class="p-6">
          <el-form
            ref="profileFormRef"
            label-position="top"
            :model="profileModel"
            :rules="profileRules"
            class="form"
            @submit.prevent="doSubmit"
          >
            <div class="grid gap-x-12 grid-cols-3">
              <h6 class="text-white">Personal details</h6>
              <div class="col-span-2">
                <el-form-item
                  :label="computedFields.email.label"
                  :prop="computedFields.email.name"
                  :required="computedFields.email.required"
                >
                  <el-input
                    ref="focus"
                    v-model="
                      profileModel[
                        computedFields.email.name
                      ]
                    "
                    disabled
                    class="terminal-input"
                  />
                </el-form-item>
                <div class="flex gap-6">
                  <el-form-item
                    class="grow"
                    :label="computedFields.firstName.label"
                    :prop="computedFields.firstName.name"
                    :required="
                      computedFields.firstName.required
                    "
                  >
                    <el-input
                      ref="focus"
                      v-model="
                        profileModel[
                          computedFields.firstName.name
                        ]
                      "
                      class="terminal-input"
                    />
                  </el-form-item>

                  <el-form-item
                    class="grow"
                    :label="computedFields.lastName.label"
                    :prop="computedFields.lastName.name"
                    :required="
                      computedFields.lastName.required
                    "
                  >
                    <el-input
                      v-model="
                        profileModel[
                          computedFields.lastName.name
                        ]
                      "
                      class="terminal-input"
                    />
                  </el-form-item>
                </div>
              </div>
            </div>
          </el-form>

          <el-divider
            class="!mb-6 !mt-10 !border-zinc-700"
          />

          <el-form
            ref="passwordFormRef"
            label-position="top"
            :model="passwordModel"
            :rules="passwordRules"
            class="form"
            @submit.prevent="doSubmit"
          >
            <div class="grid gap-x-12 grid-cols-3">
              <h6 class="text-white">Change password</h6>
              <div class="col-span-2">
                <el-form-item
                  :label="computedFields.oldPassword.label"
                  :prop="computedFields.oldPassword.name"
                  :required="
                    computedFields.oldPassword.required
                  "
                >
                  <el-input
                    ref="focus"
                    v-model="
                      passwordModel[
                        computedFields.oldPassword.name
                      ]
                    "
                    type="password"
                    class="terminal-input"
                  />
                </el-form-item>

                <el-form-item
                  :label="computedFields.newPassword.label"
                  :prop="computedFields.newPassword.name"
                  :required="
                    computedFields.newPassword.required
                  "
                  type="password"
                >
                  <el-input
                    v-model="
                      passwordModel[
                        computedFields.newPassword.name
                      ]
                    "
                    type="password"
                    class="terminal-input"
                  />
                </el-form-item>

                <el-form-item
                  :label="
                    computedFields.newPasswordConfirmation
                      .label
                  "
                  :prop="
                    computedFields.newPasswordConfirmation
                      .name
                  "
                  :required="
                    computedFields.newPasswordConfirmation
                      .required
                  "
                  type="password"
                >
                  <el-input
                    v-model="
                      passwordModel[
                        computedFields
                          .newPasswordConfirmation.name
                      ]
                    "
                    type="password"
                    class="terminal-input"
                  />
                </el-form-item>
              </div>
            </div>
          </el-form>
        </el-main>
        <el-footer
          class="bg-zinc-900 flex items-center p-6 h-fit rounded-b-lg"
          :class="
            hasFormChanged
              ? 'justify-between'
              : 'justify-end'
          "
        >
          <el-button
            v-if="hasFormChanged"
            class="btn btn-link btn-link--primary"
            :disabled="saveLoading"
            @click="doReset"
          >
            <i class="ri-arrow-go-back-line" />
            <span>Reset changes</span>
          </el-button>
          <div class="flex gap-4">
            <el-button
              :disabled="saveLoading"
              class="btn btn--md btn--bordered"
              @click="doCancel"
            >
              Cancel
            </el-button>
            <el-button
              class="btn btn--md btn--primary"
              :disabled="
                saveLoading
                  || !hasFormChanged
                  || !isFormValid
              "
              @click="doSubmit"
            >
              <app-i18n code="common.save" />
            </el-button>
          </div>
        </el-footer>
      </el-container>
    </div>
  </app-page-wrapper>
</template>

<script setup>
import { useStore } from 'vuex';
import { ref, computed, onBeforeMount } from 'vue';
import isEqual from 'lodash/isEqual';
import { useRouter } from 'vue-router';
import { i18n } from '@/i18n';
import { FormSchema } from '@/shared/form/form-schema';
import { UserModel } from '@/modules/user/user-model';

const { fields } = UserModel;
const store = useStore();
const router = useRouter();

const profileFormSchema = computed(
  () => new FormSchema([
    fields.email,
    fields.firstName,
    fields.lastName,
  ]),
);
const passwordFormSchema = computed(
  () => new FormSchema([
    fields.oldPassword,
    fields.newPassword,
    fields.newPasswordConfirmation,
  ]),
);

const currentUser = computed(
  () => store.getters['auth/currentUser'],
);
const saveLoading = computed(
  () => store.getters['auth/loadingUpdateProfile']
    || store.getters['auth/loadingPasswordChange'],
);

const computedFields = computed(() => fields);

// Form references
const profileFormRef = ref(null);
const passwordFormRef = ref(null);

// Form models
const profileModel = ref(null);
const passwordModel = ref(null);

// Form rules
const profileRules = ref(profileFormSchema.value.rules());
const passwordRules = computed(() => {
  const rules = passwordFormSchema.value.rules();

  const passwordConfirmationValidator = (
    _rule,
    value,
    callback,
  ) => {
    if (
      value !== passwordModel.value[fields.newPassword.name]
    ) {
      callback(
        new Error(i18n('auth.passwordChange.mustMatch')),
      );
    } else {
      callback();
    }
  };

  return {
    ...rules,
    [fields.newPasswordConfirmation.name]: [
      ...rules[fields.newPasswordConfirmation.name],
      {
        validator: passwordConfirmationValidator,
        trigger: 'blur',
      },
    ],
  };
});

// Form validations
const hasProfileModelChanged = computed(() => !isEqual(
  profileFormSchema.value.initialValues(
    currentUser.value,
  ),
  profileModel.value,
));
const hasPasswordModelChanged = computed(
  () => !isEqual(
    passwordFormSchema.value.initialValues(
      currentUser.value,
    ),
    passwordModel.value,
  ),
);
const hasFormChanged = computed(
  () => hasProfileModelChanged.value
    || hasPasswordModelChanged.value,
);

const isProfileFormValid = computed(() => profileFormSchema.value.isValidSync(profileModel.value));
const isPasswordFormValid = computed(() => passwordFormSchema.value.isValidSync(passwordModel.value));

const isFormValid = computed(
  () => ((hasPasswordModelChanged.value
      && isPasswordFormValid.value)
      || !hasPasswordModelChanged.value)
    && ((hasProfileModelChanged.value
      && isProfileFormValid.value)
      || !hasProfileModelChanged.value),
);

onBeforeMount(() => {
  profileModel.value = profileFormSchema.value.initialValues(currentUser.value);
  passwordModel.value = passwordFormSchema.value.initialValues(
    currentUser.value,
  );
});

const doCancel = () => {
  router.push({ path: '/' });
};

const doReset = () => {
  profileModel.value = profileFormSchema.value.initialValues(currentUser.value);

  passwordModel.value = passwordFormSchema.value.initialValues(
    currentUser.value,
  );
};

const doSubmit = async () => {
  // Submit for profile changes
  if (hasProfileModelChanged.value) {
    try {
      await profileFormRef.value.validate();
    } catch (error) {
      return;
    }

    const values = profileFormSchema.value.cast(
      profileModel.value,
    );

    store.dispatch('auth/doUpdateProfile', values);
    router.push('/');
  }

  // Submit for password changes
  if (hasPasswordModelChanged.value) {
    try {
      await passwordFormRef.value.validate();
    } catch (error) {
      return;
    }

    const values = passwordFormSchema.value.cast(
      passwordModel.value,
    );

    store.dispatch('auth/doChangePassword', values);
  }
};
</script>

<script>
export default {
  name: 'AppProfileFormPage',
};
</script>

<style lang="scss">
.profile-form-page {
  .el-form .el-form-item__content,
  .el-form--default.el-form--label-top
    .el-form-item__content {
    @apply mb-6;
  }
}

/* COMPACT INPUT STYLES */
.terminal-input .el-input__wrapper {
  background-color: transparent !important;
  box-shadow: 0 0 0 1px #3f3f46 !important; /* zinc-700 */
  border-radius: 0;
  padding: 0px 0px; 
  height: 40px; 
  transition: all 0.2s ease;
}

.terminal-input .el-input__wrapper:hover {
  box-shadow: 0 0 0 1px #52525b !important; /* zinc-600 */
}

.terminal-input .el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px #ea580c !important; /* orange-600 */
}

.terminal-input .el-input__inner {
  color: #ffffff; 
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  height: 100%;
  padding-left: 10px;
}

.terminal-input .el-input__inner::placeholder {
    color: #52525b; 
    opacity: 1;
}

.terminal-input.is-disabled .el-input__inner {
    color: #71717a !important; /* zinc-500 */
    -webkit-text-fill-color: #71717a !important;
}

.el-form-item__label {
  color: #a1a1aa !important; /* zinc-400 */
}
</style>
