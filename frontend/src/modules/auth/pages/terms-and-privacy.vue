<template>
  <div class="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-6 relative overflow-y-auto selection:bg-orange-500/30">
    
    <div class="fixed inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

    <div class="relative w-full max-w-sm z-10">
      
      <div class="mb-8 text-center flex flex-col items-center">

        <h1 class="text-white font-sans text-xl font-bold tracking-tight mb-2">
          <span class="text-orange-500">/</span>terms_of_service
        </h1>
        <p class="text-zinc-200 text-xs font-mono max-w-[280px]">
          Review and accept legal protocols to initialize session.
        </p>
      </div>

      <div class="space-y-6">
        
        <div class="bg-zinc-900/20 border border-zinc-700 p-4">
          <div class="flex flex-col gap-2">
            <el-checkbox
              id="remember-me"
              v-model="model[fields.acceptedTermsAndPrivacy.name]"
              class="terminal-checkbox !h-auto items-start"
            >
              <div class="text-zinc-400 text-[11px] font-mono leading-relaxed pt-0.5">
                I accept the 
                <a href="https://github.com/LF-Decentralized-Trust-labs/gitmesh" target="_blank" rel="noopener noreferrer" class="text-zinc-300 hover:text-orange-500 underline decoration-zinc-700 hover:decoration-orange-500 transition-colors">
                  Terms of Service
                </a>
                and 
                <a href="https://github.com/LF-Decentralized-Trust-labs/gitmesh" target="_blank" rel="noopener noreferrer" class="text-zinc-300 hover:text-orange-500 underline decoration-zinc-700 hover:decoration-orange-500 transition-colors">
                  Privacy Policy
                </a>
              </div>
            </el-checkbox>

            <div v-if="acceptTerms && !model[fields.acceptedTermsAndPrivacy.name]" class="text-orange-500 text-[10px] font-mono pl-6 leading-tight">
              > Error: Acceptance required to proceed.
            </div>
          </div>
        </div>

        <button
          id="submit"
          :disabled="!model[fields.acceptedTermsAndPrivacy.name] || loading"
          class="w-full bg-orange-600 hover:bg-orange-500 text-black h-10 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider group"
          @click="doSubmit"
        >
          <span v-if="loading" class="animate-spin w-3 h-3 border-2 border-black border-t-transparent rounded-full"></span>
          <span v-else class="flex items-center gap-2">
             :: CONTINUE <i class="ri-arrow-right-line group-hover:translate-x-1 transition-transform"></i>
          </span>
        </button>
        
        <div class="text-center">
             <button @click="doLogout" class="text-zinc-600 hover:text-zinc-400 text-[10px] font-mono transition-colors">
                [ cancel_session ]
             </button>
        </div>

      </div>

    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { UserModel } from '@/modules/user/user-model';
import { AuthService } from '@/modules/auth/auth-service';

const { fields } = UserModel;

export default {
  name: 'AppTermsPage',
  data() {
    return {
      model: {},
      acceptTerms: false,
      loading: false,
    };
  },

  computed: {
    ...mapGetters('auth', ['currentUser']),
    fields() {
      return fields;
    },
  },

  mounted() {
    if (!this.currentUser) {
      this.$router.push('/auth/signin');
    }
  },

  methods: {
    ...mapActions('auth', ['doRefreshCurrentUser', 'doSignout']),

    doSubmit() {
      if (this.model.acceptedTermsAndPrivacy) {
        this.loading = true;
        AuthService.updateProfile({
          acceptedTermsAndPrivacy: this.model.acceptedTermsAndPrivacy,
        })
          .then(() => this.doRefreshCurrentUser())
          .then(() => {
            this.$router.push('/');
          })
          .catch((error) => {
             console.error(error);
             // Optional: Handle error display here
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        this.acceptTerms = true;
      }
    },
    
    doLogout() {
        this.doSignout();
    }
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;600;700;900&display=swap');

.font-sans { font-family: 'Inter', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }

/* Checkbox Tweaks for consistency with other pages */
:deep(.terminal-checkbox .el-checkbox__inner) {
  background-color: transparent;
  border-color: #52525b; /* zinc-600 */
  border-radius: 0;
  width: 14px; 
  height: 14px;
  margin-top: 2px; /* Align with multi-line text */
}

:deep(.terminal-checkbox .el-checkbox__inner::after) {
  border-color: #000;
  top: 1px;
  left: 4px;
}

:deep(.terminal-checkbox .el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #ea580c; /* orange-600 */
  border-color: #ea580c;
}

:deep(.terminal-checkbox .el-checkbox__label) {
  color: #a1a1aa !important; /* zinc-400 */
  white-space: normal; /* Allow text wrapping */
  height: auto;
}
:deep(.terminal-checkbox .el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #ea580c !important;
}
</style>