<template>
  <section class="max-w-5xl mx-auto px-6 py-24">
    <div class="max-w-3xl">
      <h1 class="text-white font-sans text-6xl font-black leading-tight mb-6 tracking-tight">
        GitMesh<br />Community Edition
      </h1>
      <p class="text-white/70 text-xl mb-12 leading-relaxed">
        GitMesh correlates market signals with engineering telemetry to auto-generate ranked backlogs, sprint plans, and work routing - fully synced across your dev stack.
      </p>

      <!-- Auth Buttons -->
      <div class="flex gap-4 mb-16">
        <router-link 
          to="/auth/signup" 
          class="bg-zinc-800 text-white px-8 py-3 font-mono text-sm font-bold hover:bg-zinc-700 transition-all inline-block"
        >
          Get Started
        </router-link>
        <router-link 
          to="/auth/signin" 
          class="border-2 border-zinc-700 text-white px-8 py-3 font-mono text-sm font-bold hover:bg-zinc-800 hover:text-white transition-all inline-block"
        >
          Sign In
        </router-link>
      </div>
    </div>

    <!-- Features -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 class="text-white font-mono text-lg font-bold mb-2">
          Fast & Local
        </h3>
        <p class="text-white/60 font-mono text-sm leading-relaxed">
          All operations run on your machine. You use your own APIs, and your data stays completely under your control.
        </p>
      </div>

      <div>
        <h3 class="text-white font-mono text-lg font-bold mb-2">
          Open Source
        </h3>
        <p class="text-white/60 font-mono text-sm leading-relaxed">
          Apache-2.0 licensed. Fork it, contribute, or tailor it to your workflow.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>
