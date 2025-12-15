<template>
  <app-page-wrapper>
    <div class="flex h-[calc(100vh-140px)] -mt-6 -mx-6">
      <!-- Sidebar History -->
      <div class="w-64 border-r border-zinc-800/50 bg-zinc-900/20 flex-shrink-0 flex flex-col hidden md:flex">
        <div class="p-4">
          <button class="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm transition-colors border border-zinc-700/50">
            <i class="ri-add-line"></i>
            <span>New Thread</span>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-2 space-y-0.5 custom-scrollbar">
          <div class="px-3 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Today</div>
          <button v-for="i in 3" :key="i" class="w-full text-left px-3 py-2 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 text-sm truncate transition-colors flex items-center gap-2 group">
            <i class="ri-message-3-line text-zinc-600 group-hover:text-zinc-500"></i>
            <span class="truncate">Community Analysis Q{{i}}</span>
          </button>
          <div class="px-3 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider mt-4">Yesterday</div>
          <button v-for="i in 2" :key="i+3" class="w-full text-left px-3 py-2 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 text-sm truncate transition-colors flex items-center gap-2 group">
            <i class="ri-message-3-line text-zinc-600 group-hover:text-zinc-500"></i>
            <span class="truncate">Contributor Report {{i}}</span>
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col relative">
        <div class="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full px-6">
          <div class="w-full mb-8 text-center">
            <h1 class="text-2xl font-medium text-zinc-200 mb-2 tracking-tight">
              Where knowledge begins
            </h1>
          </div>

          <div class="w-full relative group mb-6">
            <div class="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-purple-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 group-hover:border-zinc-700 focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600/50">
              <div class="flex items-start p-3">
                <div class="flex-grow">
                  <textarea
                    v-model="query"
                    placeholder="Ask anything..."
                    class="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-base resize-none focus:outline-none min-h-[48px] py-1 custom-scrollbar"
                    @keydown.enter.prevent="handleSearch"
                  ></textarea>
                </div>
                <div class="flex-shrink-0 ml-3 pt-1">
                  <button
                    class="h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200"
                    :class="query ? 'bg-brand-500 text-white hover:bg-brand-600' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'"
                    :disabled="!query"
                    @click="handleSearch"
                  >
                    <i class="ri-arrow-up-line text-lg"></i>
                  </button>
                </div>
              </div>
              <div class="px-3 pb-2 flex items-center justify-between pt-1">
                <div class="flex items-center gap-2">
                  <button class="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded hover:bg-zinc-800/50">
                    <i class="ri-focus-3-line"></i>
                    <span>Focus</span>
                  </button>
                  <button class="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded hover:bg-zinc-800/50">
                    <i class="ri-attachment-line"></i>
                    <span>Attach</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap justify-center gap-2 w-full">
            <button 
              v-for="(suggestion, index) in suggestions" 
              :key="index"
              class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 transition-all duration-200"
              @click="query = suggestion.subtitle"
            >
              <i :class="suggestion.icon"></i>
              <span>{{ suggestion.title }}</span>
            </button>
          </div>
        </div>
        
        <div class="p-4 text-center">
          <p class="text-[10px] text-zinc-600">
            AI-generated content may be inaccurate.
          </p>
        </div>
      </div>
    </div>
  </app-page-wrapper>
</template>

<script>
export default {
  name: 'ChatPage',
  data() {
    return {
      query: '',
      suggestions: [
        {
          title: 'Community Health',
          subtitle: 'How is the community engagement trending this month?',
          icon: 'ri-heart-pulse-line'
        },
        {
          title: 'Top Contributors',
          subtitle: 'Who are the most active contributors in the last 30 days?',
          icon: 'ri-user-star-line'
        },
        {
          title: 'Activity Analysis',
          subtitle: 'Summarize the recent pull request activities.',
          icon: 'ri-git-pull-request-line'
        },
        {
          title: 'New Members',
          subtitle: 'List new members who joined this week.',
          icon: 'ri-user-add-line'
        }
      ]
    };
  },
  methods: {
    handleSearch() {
      if (!this.query) return;
      // Implement search logic here
      console.log('Searching for:', this.query);
      this.query = '';
    }
  }
};
</script>
