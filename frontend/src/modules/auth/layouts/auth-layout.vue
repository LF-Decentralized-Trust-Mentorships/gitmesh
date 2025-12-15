<template>
  <div class="auth-layout">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'AppAuthLayout',
};
</script>

<style lang="scss" scoped>
.auth-layout {
  width: 100%;
  min-height: 100vh;
}
</style>
