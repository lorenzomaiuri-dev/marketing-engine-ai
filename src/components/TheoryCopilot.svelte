<script lang="ts">
  import { engineStore } from '../lib/stores/engineStore';
  import { engineService } from '../features/customer/lib/engine';
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import { Sparkles, BookOpen, AlertCircle, CheckCircle2, Loader, BrainCircuit } from "@lucide/svelte";
  import { slide, fade } from 'svelte/transition';
  import { marked } from 'marked';

  let { theoryHtml, moduleName } = $props();

  let isOpen = $state(false);
  let aiInsights = $state<string[]>([]);
  let isAnalyzing = $state(false);
  
  const engineStatus = engineService.state;

  const renderedTheoryHtml = $derived(marked.parse(theoryHtml || ''));

  // Logic-based "Kotler" validation
  let insights = $derived.by(() => {
    const state = $engineStore;
    const items: { type: 'warning' | 'success' | 'info', message: string }[] = [];

    if (moduleName === 'Strategy') {
        if (state.strategy.swot.strengths.length < 2) {
            items.push({ type: 'warning', message: "Your positioning might be weak. Identify more internal strengths." });
        }
        if (state.strategy.marketingMix.price === '0' || !state.strategy.marketingMix.price) {
            items.push({ type: 'info', message: "Setting a price is critical for economic validation in the next step." });
        }
    }

    if (moduleName === 'Economics') {
        if (state.economics.cac > state.economics.arpu) {
            items.push({ type: 'warning', message: "CAC is higher than ARPU. This model is currently unsustainable." });
        } else if (state.economics.arpu > state.economics.cac * 3) {
            items.push({ type: 'success', message: "Excellent LTV/CAC potential detected (Unit Economics > 3x)." });
        }
    }

    return items;
  });

  async function runAiAudit() {
    isAnalyzing = true;
    try {
        const result = await engineService.analyzeStrategy($engineStore);
        aiInsights = result.split('\n').filter(line => line.trim().length > 5);
    } catch (e) {
        aiInsights = ["Error connecting to local AI engine."];
    } finally {
        isAnalyzing = false;
    }
  }

  function toggle() {
    isOpen = !isOpen;
  }
</script>

<div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
  {#if isOpen}
    <div 
      transition:slide={{ axis: 'y' }}
      class="w-[380px] max-h-[70vh] overflow-y-auto pointer-events-auto"
    >
      <Card.Root class="bg-slate-900/95 border-slate-800 backdrop-blur-xl shadow-2xl border-2 ring-1 ring-blue-500/20">
        <Card.Header class="p-4 border-b border-slate-800 flex flex-row items-center justify-between sticky top-0 bg-slate-900/95 z-10">
          <div class="flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-blue-400" />
            <Card.Title class="text-sm font-bold uppercase tracking-widest">Theory Copilot</Card.Title>
          </div>
          <Badge variant="outline" class="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]">
            {moduleName}
          </Badge>
        </Card.Header>
        <Card.Content class="p-4 space-y-6">
          <!-- AI Insights Section -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
                <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Strategic Audit</h4>
                {#if $engineStatus === 'idle'}
                     <Button variant="ghost" size="sm" class="h-6 text-[10px] text-blue-400" onclick={() => engineService.init()}>
                        Initialize AI
                     </Button>
                {:else if $engineStatus === 'ready'}
                    <Button variant="ghost" size="sm" class="h-6 text-[10px] text-blue-400" onclick={runAiAudit} disabled={isAnalyzing}>
                        {isAnalyzing ? 'Analyzing...' : 'Run AI Audit'}
                    </Button>
                {/if}
            </div>

            <div class="space-y-2">
                {#each insights as insight}
                  <div class="flex gap-3 p-3 rounded-xl border {insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-200' : insight.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200' : 'bg-blue-500/5 border-blue-500/20 text-blue-200'} text-xs leading-relaxed">
                    {#if insight.type === 'warning'}
                      <AlertCircle class="w-4 h-4 shrink-0" />
                    {:else if insight.type === 'success'}
                      <CheckCircle2 class="w-4 h-4 shrink-0" />
                    {:else}
                      <Sparkles class="w-4 h-4 shrink-0" />
                    {/if}
                    {insight.message}
                  </div>
                {/each}

                {#if aiInsights.length > 0}
                    <div class="mt-4 pt-4 border-t border-slate-800 space-y-2">
                        <div class="flex items-center gap-2 text-[10px] font-bold text-blue-400 mb-2">
                            <BrainCircuit class="w-3 h-3" /> AI AGENT FEEDBACK
                        </div>
                        {#each aiInsights as ai}
                            <div class="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 italic">
                                "{ai}"
                            </div>
                        {/each}
                    </div>
                {/if}

                {#if insights.length === 0 && aiInsights.length === 0}
                  <p class="text-xs text-slate-600 italic">Complete more fields or run AI Audit for feedback.</p>
                {/if}
            </div>
          </div>

          <Separator class="bg-slate-800" />

          <!-- Theory Section -->
          <div class="space-y-3">
            <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Contextual Theory</h4>
            <div class="prose prose-invert prose-sm max-w-none opacity-80 text-slate-300">
              {@html renderedTheoryHtml}
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  {/if}

  <button 
    onclick={toggle}
    class="pointer-events-auto h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 transition-all hover:scale-110 active:scale-95 group relative"
    aria-label="Toggle Copilot"
  >
    {#if isOpen}
        <span class="text-xl font-bold">×</span>
    {:else}
        <BookOpen class="w-6 h-6" />
        {#if (insights.length + aiInsights.length) > 0}
            <span class="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-slate-950 text-[10px] flex items-center justify-center font-bold">
                {insights.length + aiInsights.length}
            </span>
        {/if}
    {/if}
  </button>
</div>
