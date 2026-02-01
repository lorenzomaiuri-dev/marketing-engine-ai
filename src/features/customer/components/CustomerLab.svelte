<script lang="ts">
  import { engineService } from '../lib/engine';
  import { engineStore } from '../../../lib/stores/engineStore';
  import type { BuyerPersona } from '../types';
  import * as Card from "@/lib/components/ui/card";
  import { Button } from "@/lib/components/ui/button";
  import { Textarea } from "@/lib/components/ui/textarea";
  import { Progress } from "@/lib/components/ui/progress";
  import { Badge } from "@/lib/components/ui/badge";
  import { 
    Users, 
    Sparkles, 
    BrainCircuit, 
    Loader, 
    CircleCheck,
    Target,
    Zap,
    History,
    CircleUser,
    MapPin,
    Briefcase,
    Calendar,
    Lightbulb,
    CircleAlert
  } from "@lucide/svelte";

  const engineStatus = engineService.state;
  const progress = engineService.progress;

  let businessContext = $state("");
  let generatedPersona = $derived($engineStore.persona);
  let error = $state<string | null>(null);

  async function initializeEngine() {
    error = null;
    try {
      await engineService.init();
    } catch (e: any) {
      error = e.message || "Failed to initialize Web-LLM. Make sure your browser supports WebGPU.";
    }
  }

  async function generate() {
    if (!businessContext.trim()) return;
    error = null;
    try {
      const result = await engineService.generatePersona(businessContext);
      const persona = JSON.parse(result);
      engineStore.updatePersona(persona);
    } catch (e) {
      error = "Failed to generate persona. Ensure WebGPU is enabled in your browser.";
      console.error(e);
    }
  }

  function loadFromStrategy() {
    const state = $engineStore.strategy;
    let context = "";
    
    if (state.swot.strengths?.length) context += `Strengths: ${state.swot.strengths.join(', ')}. `;
    if (state.swot.opportunities?.length) context += `Opportunities: ${state.swot.opportunities.join(', ')}. `;
    if (state.marketingMix.product) context += `Product: ${state.marketingMix.product}. `;
    if (state.marketingMix.promotion) context += `Marketing Strategy: ${state.marketingMix.promotion}. `;
    
    if (context) {
        businessContext = `Targeting customers for a business with these characteristics: ${context}`;
    } else {
        error = "No previous strategy data found. Please enter business details manually.";
    }
  }
</script>

<div class="space-y-8 animate-in fade-in duration-700">
  <!-- Header Section -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h2 class="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
        <Users class="w-8 h-8 text-blue-400" />
        Customer Lab
      </h2>
      <p class="text-slate-400 mt-2">AI-Powered Buyer Persona Generation (Local LLM)</p>
    </div>

    {#if $engineStatus === 'idle'}
      <Button 
        onclick={initializeEngine} 
        class="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 h-11 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
      >
        <BrainCircuit class="w-4 h-4 mr-2" />
        Initialize AI Engine
      </Button>
    {:else if $engineStatus === 'loading'}
      <div class="flex items-center gap-3 bg-slate-900/50 border border-slate-800 p-2 pr-4 rounded-xl">
        <div class="p-2 bg-blue-500/10 rounded-lg">
          <Loader class="w-4 h-4 text-blue-400 animate-spin" />
        </div>
        <span class="text-xs font-medium text-slate-300">Loading Model (WebGPU)...</span>
      </div>
    {:else}
      <Badge variant="outline" class="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 px-3 py-1.5 h-auto">
        <CircleCheck class="w-3.5 h-3.5 mr-2" />
        AI Engine Ready
      </Badge>      
    {/if}
  </div>

  <!-- Progress Bar for Loading -->
  {#if $engineStatus === 'loading'}
    <Card.Root class="bg-slate-900/40 border-slate-800/80 backdrop-blur-md">
      <Card.Content class="p-6">
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm font-medium text-slate-300">Downloading AI Weights</span>
          <span class="text-sm font-bold text-blue-400">{Math.round($progress.progress * 100)}%</span>
        </div>
        <Progress value={$progress.progress * 100} class="h-2" />
        <p class="text-[10px] text-slate-500 mt-3 font-mono truncate">{$progress.text}</p>
      </Card.Content>
    </Card.Root>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
    <!-- Input Section -->
    <div class="lg:col-span-5 space-y-6">
      <Card.Root class="bg-slate-900/40 border-slate-800/80 backdrop-blur-md h-full">
        <Card.Header>
          <Card.Title class="text-lg font-bold flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-amber-400" />
            Persona Context
          </Card.Title>
          <Card.Description>Describe your product, target industry, or specific goals.</Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
          <Textarea 
            bind:value={businessContext}
            placeholder="e.g., A premium organic coffee subscription for remote tech workers who value sustainability and quality over price..."
            class="min-h-[200px] bg-slate-950 border-slate-800 rounded-xl focus:ring-blue-500/50 text-slate-200 placeholder:text-slate-600"
          />
          
          {#if error}
            <div class="flex items-center gap-2 text-xs text-rose-400 bg-rose-400/10 p-3 rounded-lg border border-rose-400/20">
              <CircleAlert class="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          {/if}
        </Card.Content>
        <Card.Footer class="flex flex-col sm:flex-row gap-3 border-t border-slate-800/50 bg-slate-900/40 p-6">
          <Button 
            variant="outline" 
            onclick={loadFromStrategy}
            class="w-full sm:w-auto border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl"
          >
            <History class="w-4 h-4 mr-2" />
            Use Strategy Data
          </Button>
          <Button 
            onclick={generate}
            disabled={$engineStatus !== 'ready' || !businessContext.trim()}
            class="w-full sm:flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
          >
            {#if $engineStatus === 'generating'}
              <Loader class="w-4 h-4 mr-2 animate-spin" />
              Generating...
            {:else}
              <Zap class="w-4 h-4 mr-2" />
              Generate Persona
            {/if}
          </Button>
        </Card.Footer>
      </Card.Root>
    </div>

    <!-- Result Section -->
    <div class="lg:col-span-7">
      {#if generatedPersona}
        <Card.Root class="bg-slate-900/60 border-blue-500/30 backdrop-blur-lg shadow-2xl shadow-blue-500/5 rounded-3xl overflow-hidden border-2 animate-in zoom-in-95 duration-500">
          <Card.Header class="bg-blue-600/10 border-b border-blue-500/20 p-8">
            <div class="flex items-start justify-between">
              <div class="space-y-2">
                <Badge class="bg-blue-500 text-white hover:bg-blue-500 px-3">{generatedPersona.archetype}</Badge>
                <Card.Title class="text-3xl font-black text-white">{generatedPersona.name}</Card.Title>
              </div>
              <div class="p-4 bg-slate-950/50 rounded-2xl border border-blue-500/20 shadow-inner">
                <CircleUser class="w-12 h-12 text-blue-400" />
              </div>
            </div>
          </Card.Header>
          <Card.Content class="p-8 space-y-8">
            <!-- Demographics Grid -->
            <div class="grid grid-cols-3 gap-4">
              <div class="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                <div class="flex items-center gap-2 text-slate-500 mb-1">
                  <Calendar class="w-3.5 h-3.5" />
                  <span class="text-[10px] font-bold uppercase tracking-widest">Age Range</span>
                </div>
                <p class="text-sm font-semibold text-slate-200">{generatedPersona.demographics.ageRange}</p>
              </div>
              <div class="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                <div class="flex items-center gap-2 text-slate-500 mb-1">
                  <Briefcase class="w-3.5 h-3.5" />
                  <span class="text-[10px] font-bold uppercase tracking-widest">Occupation</span>
                </div>
                <p class="text-sm font-semibold text-slate-200">{generatedPersona.demographics.occupation}</p>
              </div>
              <div class="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                <div class="flex items-center gap-2 text-slate-500 mb-1">
                  <MapPin class="w-3.5 h-3.5" />
                  <span class="text-[10px] font-bold uppercase tracking-widest">Location</span>
                </div>
                <p class="text-sm font-semibold text-slate-200">{generatedPersona.demographics.location}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Pain Points -->
              <div class="space-y-4">
                <h4 class="text-xs font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <CircleAlert class="w-4 h-4" /> Pain Points
                </h4>
                <ul class="space-y-2">
                  {#each generatedPersona.painPoints as point}
                    <li class="flex items-start gap-3 text-sm text-slate-300 bg-slate-800/20 p-3 rounded-xl border border-slate-800/30">
                      <div class="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                      {point}
                    </li>
                  {/each}
                </ul>
              </div>

              <!-- Goals -->
              <div class="space-y-4">
                <h4 class="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Target class="w-4 h-4" /> Objectives
                </h4>
                <ul class="space-y-2">
                  {#each generatedPersona.goals as goal}
                    <li class="flex items-start gap-3 text-sm text-slate-300 bg-slate-800/20 p-3 rounded-xl border border-slate-800/30">
                      <div class="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      {goal}
                    </li>
                  {/each}
                </ul>
              </div>
            </div>

            <!-- Buying Behavior -->
            <div class="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl space-y-3">
              <h4 class="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <Lightbulb class="w-4 h-4 text-amber-400" /> Buying Behavior
              </h4>
              <p class="text-slate-300 text-sm leading-relaxed italic">
                "{generatedPersona.buyingBehavior}"
              </p>
            </div>
          </Card.Content>
        </Card.Root>
      {:else if $engineStatus === 'generating'}
         <div class="h-full flex flex-col items-center justify-center space-y-4 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl p-12">
            <div class="relative">
                <div class="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>
                <BrainCircuit class="w-16 h-16 text-blue-400 animate-bounce relative" />
            </div>
            <p class="text-slate-400 font-medium animate-pulse">Our AI is dreaming up your ideal customer...</p>
         </div>
      {:else}
        <div class="h-full flex flex-col items-center justify-center space-y-4 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center">
          <div class="p-4 bg-slate-800/40 rounded-full mb-2">
            <Users class="w-10 h-10 text-slate-600" />
          </div>
          <h3 class="text-slate-400 font-bold">No Persona Generated</h3>
          <p class="text-slate-500 text-sm max-w-[280px]">Fill in the context and hit "Generate" to create a target persona using local AI.</p>
        </div>
      {/if}
    </div>
  </div>
</div>
