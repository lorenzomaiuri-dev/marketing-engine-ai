<script lang="ts">
  import { onMount } from 'svelte';
  import type { SwotData } from '../types';
  import * as Card from "@/lib/components/ui/card";
  import { Button } from "@/lib/components/ui/button";
  import { Input } from "@/lib/components/ui/input";
  import { Badge } from "@/lib/components/ui/badge";
  import { Plus, Trash2, Target, Zap, TriangleAlert, TrendingUp, Download } from "@lucide/svelte";

  let { 
    data: initialData
  }: { data?: SwotData } = $props();

  let data = $state(initialData || {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  });

  let newItem = $state("");
  let activeQuadrant: { value: keyof SwotData; label: string } = $state({ value: "strengths", label: "Strengths" });

  const quadrantConfigs = {
    strengths: { color: "text-emerald-400", icon: Zap, bg: "bg-emerald-500/10", label: "Strengths" },
    weaknesses: { color: "text-amber-400", icon: TriangleAlert, bg: "bg-amber-500/10", label: "Weaknesses" },
    opportunities: { color: "text-blue-400", icon: TrendingUp, bg: "bg-blue-500/10", label: "Opportunities" },
    threats: { color: "text-rose-400", icon: Target, bg: "bg-rose-500/10", label: "Threats" }
  };

  onMount(() => {
    const saved = localStorage.getItem('marketing-engine-swot');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        data.strengths = parsed.strengths || [];
        data.weaknesses = parsed.weaknesses || [];
        data.opportunities = parsed.opportunities || [];
        data.threats = parsed.threats || [];
      } catch (e) {
        console.error("Failed to load SWOT data", e);
      }
    }
  });

  $effect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('marketing-engine-swot', JSON.stringify(data));
    }
  });

  function addItem() {
    if (newItem.trim()) {
      const q = activeQuadrant.value;
      data[q] = [...data[q], newItem.trim()];
      newItem = "";
    }
  }

  function removeItem(quadrant: keyof SwotData, index: number) {
    data[quadrant] = data[quadrant].filter((_, i) => i !== index);
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'swot-analysis.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("Strategic SWOT Export:", data);
  }
</script>

<Card.Root class="bg-slate-900/40 border-slate-800/80 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
  <Card.Header class="border-b border-slate-800/50 bg-slate-900/60 p-6 flex flex-row items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="p-2 rounded-xl bg-blue-500/10 text-blue-400">
        <Target class="w-5 h-5" aria-hidden="true" />
      </div>
      <div>
        <Card.Title class="text-xl font-bold text-white tracking-tight">
          Strategic Canvas
        </Card.Title>
        <Card.Description class="text-slate-500 text-xs">Internal & External Factors</Card.Description>
      </div>
    </div>
    <Button variant="outline" size="sm" class="bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300 transition-all" onclick={exportData} aria-label="Export SWOT analysis as JSON">
      <Download class="w-4 h-4 mr-2" />
      Export
    </Button>
  </Card.Header>

  <Card.Content class="p-6 md:p-8">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      {#each Object.entries(quadrantConfigs) as [key, config]}
        {@const quadrantKey = key as keyof SwotData}
        <div 
          class="group rounded-2xl border border-slate-800/40 bg-slate-950/40 p-5 transition-all hover:border-slate-700/60 hover:bg-slate-900/20"
          aria-labelledby={`heading-${key}`}
        >
          <div class="flex items-center gap-2 mb-4">
            <div class="p-1.5 rounded-lg {config.bg}">
              <svelte:component this={config.icon} class="w-4 h-4 {config.color}" aria-hidden="true" />
            </div>
            <h3 id={`heading-${key}`} class="capitalize font-bold text-xs tracking-[0.1em] {config.color} opacity-80">
              {config.label}
            </h3>
            <Badge variant="outline" class="ml-auto bg-slate-950/50 border-slate-800 text-slate-400 text-[10px] px-2 py-0 h-5" aria-label={`${data[quadrantKey].length} items`}>
              {data[quadrantKey].length}
            </Badge>
          </div>

          <ul class="space-y-2.5" aria-live="polite">
            {#each data[quadrantKey] as item, i}
              <li class="flex justify-between items-start gap-3 text-sm text-slate-200 group/item bg-slate-900/40 p-3 rounded-xl border border-slate-800/30 hover:border-slate-700/50 hover:bg-slate-900/60 transition-all duration-200 animate-in fade-in slide-in-from-left-2">
                <span class="leading-relaxed font-medium">{item}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  class="h-7 w-7 rounded-lg opacity-0 group-item-hover:opacity-100 text-slate-600 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
                  onclick={() => removeItem(quadrantKey, i)}
                  aria-label={`Remove ${item} from ${config.label}`}
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </Button>
              </li>
            {/each}
            {#if data[quadrantKey].length === 0}
              <li class="text-xs text-slate-600 italic py-6 text-center border-2 border-dashed border-slate-800/30 rounded-xl" aria-label={`No ${config.label} added yet`}>
                No factors identified
              </li>
            {/if}
          </ul>
        </div>
      {/each}
    </div>
  </Card.Content>

  <Card.Footer class="p-6 md:p-8 border-t border-slate-800/50 bg-slate-900/40 flex flex-col sm:flex-row gap-4">
    <div class="w-full sm:w-56">
      <div class="relative">
        <select 
          bind:value={activeQuadrant.value}
          aria-label="Select SWOT quadrant"
          class="flex h-11 w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-300 ring-offset-background transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
        >
          <option value="strengths">Strengths</option>
          <option value="weaknesses">Weaknesses</option>
          <option value="opportunities">Opportunities</option>
          <option value="threats">Threats</option>
        </select>
        <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </div>
      </div>
    </div>

    <div class="flex flex-1 gap-2">
      <Input 
        bind:value={newItem} 
        onkeydown={(e) => e.key === 'Enter' && addItem()}
        placeholder="Enter strategic factor..." 
        aria-label="Factor description"
        class="h-11 bg-slate-950 border-slate-800 rounded-xl focus-visible:ring-blue-500/50 text-slate-200 placeholder:text-slate-600"
      />
      <Button onclick={addItem} class="h-11 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all" aria-label="Add factor">
        <Plus class="w-4 h-4 mr-2" strokeWidth={3} /> Add
      </Button>
    </div>
  </Card.Footer>
</Card.Root>