<template>
  <nav class="px-1 flex flex-col">
    <el-tooltip
      v-for="(link, li) of props.links"
      :key="`menu-link-${li}`"
      :disabled="!props.collapsed"
      :hide-after="50"
      :content="link.label"
      effect="dark"
      placement="right"
      raw-content
    >
      <template
        v-if="link.display({
          user: currentUser,
          tenant: currentTenant,
        })"
      >
        <router-link
          v-if="link.routeName"
          :id="`menu-${link.id}`"
          :to="{ name: link.routeName, ...link.routeOptions }"
          :disabled="link.disable({
            user: currentUser,
            tenant: currentTenant,
          })"
          class="rounded-md h-8 transition !text-zinc-400 flex items-center whitespace-nowrap
          flex-nowrap px-1.5 hover:bg-zinc-800 hover:!text-zinc-100 mb-2 overflow-hidden"
          :active-class="!disableActiveClass ? '!bg-zinc-800 font-medium !text-white' : ''"
          :class="[props.linkClass, props.collapsed ? 'justify-center' : '']"
        >
          <i v-if="link.icon" :class="[link.icon, props.iconClass, props.collapsed ? 'mr-0' : 'mr-3']" class="text-lg" />
          <span v-if="!props.collapsed" class="">
            {{ link.label }}
          </span>
        </router-link>
        <a
          v-else-if="link.href || link.click"
          :id="`menu-${link.id}`"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-md h-8 transition !text-zinc-400 flex items-center justify-between
          group whitespace-nowrap flex-nowrap px-1.5 hover:bg-zinc-800 hover:!text-zinc-100 mb-2 cursor-pointer overflow-hidden"
          :class="[props.linkClass, props.collapsed ? 'justify-center' : '']"
          @click="link.click && link.click()"
        >
          <div class="flex items-center" :class="{ 'justify-center w-full': props.collapsed }">
            <i v-if="link.icon" :class="[link.icon, props.iconClass, props.collapsed ? 'mr-0' : 'mr-3']" class="text-lg" />
            <span v-if="!props.collapsed" class="">
              {{ link.label }}
            </span>
          </div>
          <i v-if="link.href && !props.collapsed" class="ri-external-link-line text-base text-zinc-600 opacity-0 transition group-hover:opacity-100" />
        </a>
      </template>
    </el-tooltip>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { MenuLink } from '@/modules/layout/types/MenuLink';
import { mapGetters } from '@/shared/vuex/vuex.helpers';

const props = defineProps<{
  collapsed: boolean,
  links: MenuLink[],
  linkClass?: string,
  iconClass?: string,
  disableActiveClass?: boolean,
}>();

const { currentTenant, currentUser } = mapGetters('auth');

</script>

<script lang="ts">
export default {
  name: 'CrMenuLinks',
};
</script>
