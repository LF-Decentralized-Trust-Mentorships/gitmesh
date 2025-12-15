import { defineStore } from 'pinia';

export interface Tab {
  id: string;
  path: string;
  title: string;
  name?: string;
  query?: Record<string, any>;
  params?: Record<string, any>;
  meta?: Record<string, any>;
  lastAccessed: number;
}

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    tabs: [] as Tab[],
    activeTabPath: '' as string,
    inactivityTimer: null as any,
  }),

  actions: {
    addTab(route: any) {
      const path = route.fullPath || route.path;
      const now = Date.now();
      
      // Check if tab with same name and params exists
      const existingTabIndex = this.tabs.findIndex(t => 
        t.name === route.name && 
        JSON.stringify(t.params) === JSON.stringify(route.params)
      );

      if (existingTabIndex !== -1) {
        // Update existing tab path (to keep query params in sync)
        this.tabs[existingTabIndex].path = path;
        this.tabs[existingTabIndex].query = route.query;
        this.tabs[existingTabIndex].params = route.params;
        this.tabs[existingTabIndex].lastAccessed = now;
        this.activeTabPath = path;
        return;
      }

      // Don't add login, error pages, etc. if needed
      if (route.name === 'login' || route.name === 'error') return;

      const title = route.meta?.title || (route.name as string) || 'Untitled';

      this.tabs.push({
        id: Math.random().toString(36).substring(2, 9),
        path,
        title,
        name: route.name as string,
        query: route.query,
        params: route.params,
        meta: route.meta,
        lastAccessed: now,
      });

      this.activeTabPath = path;
    },

    removeTab(path: string) {
      const index = this.tabs.findIndex((t) => t.path === path);
      if (index === -1) return;

      this.tabs.splice(index, 1);

      // If we closed the active tab, switch to the next available one
      if (this.activeTabPath === path) {
        const nextTab = this.tabs[index] || this.tabs[index - 1];
        if (nextTab) {
          this.activeTabPath = nextTab.path;
        } else {
          this.activeTabPath = '';
        }
      }
    },

    setActiveTab(path: string) {
      this.activeTabPath = path;
      const tab = this.tabs.find(t => t.path === path);
      if (tab) {
        tab.lastAccessed = Date.now();
      }
    },

    closeOtherTabs(path: string) {
      this.tabs = this.tabs.filter((t) => t.path === path);
      this.activeTabPath = path;
    },

    closeAllTabs() {
      this.tabs = [];
      this.activeTabPath = '';
    },

    checkInactivity() {
      const now = Date.now();
      // Auto close after 30 minutes (1800000 ms)
      const AUTO_CLOSE_THRESHOLD = 30 * 60 * 1000;
      
      // Filter out tabs that are inactive for too long, but keep the active one
      this.tabs = this.tabs.filter(tab => {
        if (tab.path === this.activeTabPath) return true;
        return (now - tab.lastAccessed) < AUTO_CLOSE_THRESHOLD;
      });
    },
  },
});
