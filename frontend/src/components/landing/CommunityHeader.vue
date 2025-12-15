<template>
  <header class="border-b border-white/10 bg-black">
    <div class="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
      <h1 class="text-white font-mono text-xl font-bold tracking-tight">
        GitMesh <span class="text-white/40 font-normal">Community Edition</span>
      </h1>
      
      <div class="flex gap-6 items-center">
        <router-link 
          to="/auth/signin" 
          class="text-white font-mono text-sm font-bold hover:underline"
        >
          Sign In
        </router-link>
        <router-link 
          to="/auth/signup" 
          class="bg-zinc-800 text-white px-5 py-2 font-mono text-sm font-bold hover:bg-zinc-700 transition-all"
        >
          Sign Up
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
</script>
