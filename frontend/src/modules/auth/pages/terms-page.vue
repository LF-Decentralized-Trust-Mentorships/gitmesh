<template>
  <div class="min-h-screen bg-black flex flex-col items-center px-4 py-12 relative overflow-y-auto selection:bg-orange-500/30">
    
    <div class="fixed inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

    <div class="relative w-full max-w-4xl z-10">
      
      <div class="mb-8 text-center flex flex-col items-center">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-white font-sans text-2xl font-bold tracking-tight">GitMesh</span>
        </div>

        <h1 class="text-white font-sans text-3xl font-bold tracking-tight mb-2">
          <span class="text-orange-500">/</span>terms_of_service
        </h1>
        <p class="text-zinc-400 text-sm font-mono">
          Last Updated: December 27, 2025
        </p>
      </div>

      <div class="bg-zinc-900/20 border border-zinc-700 p-8 mb-8">
        <div class="prose prose-invert prose-zinc max-w-none">
          <div class="text-zinc-300 leading-relaxed space-y-8">
            
            <section class="space-y-4">
              <h2 class="text-orange-500 text-2xl font-bold font-sans mb-6">Terms of Service</h2>
              
              <div class="space-y-6">
                <div>
                  <h3 class="text-orange-400 text-lg font-bold font-mono mb-3">I. Acceptance of Terms</h3>
                  <p class="text-zinc-400 text-sm leading-relaxed pl-4">
                    By accessing the GitMesh source code, participating in the GitMesh community repositories, or installing/deploying GitMesh Community Edition (CE) or GitMesh Enterprise Edition (EE), you ("the User," "the Contributor," or "the Entity") agree to be bound by these Terms of Service. If you do not agree, you must cease all use of the software and exit the community immediately.
                  </p>
                </div>

                <div>
                  <h3 class="text-orange-400 text-lg font-bold font-mono mb-3">II. Dual-Edition Framework</h3>
                  <p class="text-zinc-400 text-sm leading-relaxed pl-4 mb-3">
                    GitMesh operates under a dual-licensing and governance model:
                  </p>
                  <ul class="text-zinc-400 text-sm space-y-2 pl-8 list-disc">
                    <li><strong class="text-zinc-300">Community Edition (CE):</strong> Distributed under the Apache License 2.0. Governance is managed under the Linux Foundation Decentralized Trust (LFDT).</li>
                    <li><strong class="text-zinc-300">Enterprise Edition (EE):</strong> Distributed under a Proprietary Commercial License owned by Alveoli. Use is strictly limited to active subscribers (Essential, Signals, Scale, or Enterprise tiers).</li>
                  </ul>
                </div>

                <div>
                  <h3 class="text-orange-400 text-lg font-bold font-mono mb-3">III. Enterprise Use and Restrictions</h3>
                  <p class="text-zinc-400 text-sm leading-relaxed pl-4 mb-3">
                    Users of GitMesh EE are granted a non-exclusive, non-transferable, revocable license to use the software solely for internal business operations.
                  </p>
                  <ul class="text-zinc-400 text-sm space-y-2 pl-8 list-disc">
                    <li><strong class="text-zinc-300">Prohibited Acts:</strong> Reverse engineering, decompilation, unauthorized modification, or the creation of derivative works of EE-specific components is strictly prohibited.</li>
                    <li><strong class="text-zinc-300">Inadvertent Inclusion:</strong> If EE-proprietary code is identified within a CE distribution, it remains the property of Alveoli. Users are legally obligated to report the discovery to Alveoli and purge the code from their systems.</li>
                  </ul>
                </div>

                <div>
                  <h3 class="text-orange-400 text-lg font-bold font-mono mb-3">IV. Community Governance and Conduct</h3>
                  <p class="text-zinc-400 text-sm leading-relaxed pl-4">
                    All participants in the GitMesh ecosystem must adhere to the GitMesh Code of Conduct. We maintain a tiered contributor structure (Newbie, Active, Core, Principal) supported by automated activity tracking. We reserve the right to revoke contributor status for violations of community standards, including harassment, security negligence, or intellectual property infringement.
                  </p>
                </div>

                <div>
                  <h3 class="text-orange-400 text-lg font-bold font-mono mb-3">V. Limitation of Liability and Disclaimer</h3>
                  <p class="text-zinc-400 text-sm leading-relaxed pl-4">
                    To the maximum extent permitted by law, GitMesh (all editions) is provided "AS IS." Alveoli and the LFDT disclaim all warranties, express or implied. In no event shall Alveoli or its contributors be liable for any indirect, incidental, or consequential damages, including loss of data, loss of profits, or system downtime.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'AppTermsPage',
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;600;700;900&display=swap');

.font-sans { font-family: 'Inter', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }
</style>
