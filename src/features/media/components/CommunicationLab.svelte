<script lang="ts">
  import { onMount } from 'svelte';
  import * as Card from "@/lib/components/ui/card";
  import { Button } from "@/lib/components/ui/button";
  import { Input } from "@/lib/components/ui/input";
  import { Badge } from "@/lib/components/ui/badge";
  import { Progress } from "@/lib/components/ui/progress";
  import { Textarea } from "@/lib/components/ui/textarea";
  import { Label } from "@/lib/components/ui/label";
  import * as Tabs from "@/lib/components/ui/tabs";
  import { 
    Search, 
    Share2, 
    Layers, 
    MessageSquare, 
    AlertCircle, 
    CheckCircle2, 
    Globe, 
    TrendingUp, 
    DollarSign,
    Zap,
    Sparkles,
    Type
  } from "@lucide/svelte";
  import { analyzeSEO, analyzeSocial, calculateOmnichannelScore, analyzeContentSmart, calculateROIPotential } from '../lib/analyzers';
  import type { CommunicationPlan } from '../types';

  let plan = $state<CommunicationPlan>({
    seo: {
      title: "Marketing Engine AI | Communication Hub",
      description: "Master digital communication strategies, SEO optimization, and social media engagement with our advanced marketing intelligence suite.",
      keywords: "marketing, seo, digital strategy"
    },
    social: {
      reach: 5000,
      interactions: 250,
      cost: 150
    },
    omnichannel: {
      web: true,
      social: true,
      email: false,
      offline: false
    },
    content: "Discover our revolutionary new platform! Join now to transform your marketing strategy with proven secrets and instant results."
  });

  const seoAnalysis = $derived(analyzeSEO(plan.seo));
  const socialAnalysis = $derived(analyzeSocial(plan.social));
  const roiPotential = $derived(calculateROIPotential(plan.social));
  const omnichannelScore = $derived(calculateOmnichannelScore(plan.omnichannel));
  const contentAnalysis = $derived(analyzeContentSmart(plan.content));

  function getStatusColor(status: 'ideal' | 'warning' | 'critical') {
    switch (status) {
      case 'ideal': return 'text-emerald-400';
      case 'warning': return 'text-amber-400';
      case 'critical': return 'text-rose-400';
    }
  }
</script>

<div class="space-y-8">
  <Tabs.Root value="seo" class="w-full">
    <Tabs.List class="grid w-full grid-cols-4 bg-slate-900/60 border border-slate-800/50 p-1 rounded-2xl backdrop-blur-md">
      <Tabs.Trigger value="seo" class="rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-400 transition-all">
        <Search class="w-4 h-4 mr-2" /> SEO
      </Tabs.Trigger>
      <Tabs.Trigger value="social" class="rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-indigo-400 transition-all">
        <Share2 class="w-4 h-4 mr-2" /> Social
      </Tabs.Trigger>
      <Tabs.Trigger value="omni" class="rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-violet-400 transition-all">
        <Layers class="w-4 h-4 mr-2" /> Omnichannel
      </Tabs.Trigger>
      <Tabs.Trigger value="content" class="rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-amber-400 transition-all">
        <MessageSquare class="w-4 h-4 mr-2" /> Content
      </Tabs.Trigger>
    </Tabs.List>

    <!-- SEO TAB -->
    <Tabs.Content value="seo" class="mt-6 space-y-6">
      <Card.Root class="bg-slate-950/40 border-slate-800/80 backdrop-blur-md">
        <Card.Header>
          <div class="flex items-center justify-between">
            <div>
              <Card.Title class="text-white">SEO Previewer</Card.Title>
              <Card.Description>Simulate how your page appears on Google</Card.Description>
            </div>
            <Badge variant="outline" class="border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
              Health: {seoAnalysis.score}%
            </Badge>
          </div>
        </Card.Header>
        <Card.Content class="space-y-6">
          <div class="space-y-4">
            <div class="space-y-2">
              <div class="flex justify-between">
                <Label for="title" class="text-slate-400">Page Title</Label>
                <span class="text-xs {getStatusColor(seoAnalysis.titleStatus)}">
                  {plan.seo.title.length}/60 chars
                </span>
              </div>
              <Input 
                id="title" 
                bind:value={plan.seo.title} 
                class="bg-slate-900 border-slate-800 focus:ring-emerald-500/50"
              />
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <Label for="desc" class="text-slate-400">Meta Description</Label>
                <span class="text-xs {getStatusColor(seoAnalysis.descriptionStatus)}">
                  {plan.seo.description.length}/160 chars
                </span>
              </div>
              <Textarea 
                id="desc" 
                bind:value={plan.seo.description} 
                class="bg-slate-900 border-slate-800 focus:ring-emerald-500/50 h-24"
              />
            </div>
          </div>

          <div class="p-6 rounded-2xl bg-[#f8f9fa] border border-slate-200">
            <div class="text-[#1a0dab] text-xl font-medium hover:underline cursor-pointer truncate">
              {plan.seo.title || 'Page Title Goes Here'}
            </div>
            <div class="text-[#006621] text-sm mt-1 truncate">
              https://yourdomain.com/ › hub
            </div>
            <div class="text-[#545454] text-sm mt-1 line-clamp-2">
              {plan.seo.description || 'Provide a meta description to see how it looks in search results.'}
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- SOCIAL TAB -->
    <Tabs.Content value="social" class="mt-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card.Root class="bg-slate-950/40 border-slate-800/80 backdrop-blur-md">
          <Card.Header>
            <Card.Title class="text-white text-lg">Engagement Simulator</Card.Title>
          </Card.Header>
          <Card.Content class="space-y-4">
            <div class="space-y-2">
              <Label class="text-slate-400 flex items-center">
                <Globe class="w-3.5 h-3.5 mr-2" /> Estimated Reach
              </Label>
              <Input type="number" bind:value={plan.social.reach} class="bg-slate-900 border-slate-800" />
            </div>
            <div class="space-y-2">
              <Label class="text-slate-400 flex items-center">
                <TrendingUp class="w-3.5 h-3.5 mr-2" /> Interactions
              </Label>
              <Input type="number" bind:value={plan.social.interactions} class="bg-slate-900 border-slate-800" />
            </div>
            <div class="space-y-2">
              <Label class="text-slate-400 flex items-center">
                <DollarSign class="w-3.5 h-3.5 mr-2" /> Total Cost ($)
              </Label>
              <Input type="number" bind:value={plan.social.cost} class="bg-slate-900 border-slate-800" />
            </div>
          </Card.Content>
        </Card.Root>

        <Card.Root class="bg-indigo-950/10 border-indigo-500/20 backdrop-blur-md">
          <Card.Header>
            <Card.Title class="text-indigo-400 text-lg">Metrics Analysis</Card.Title>
          </Card.Header>
          <Card.Content class="space-y-8">
            <div class="text-center p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
              <div class="text-3xl font-black text-white">{socialAnalysis.engagementRate.toFixed(2)}%</div>
              <div class="text-xs text-indigo-400 uppercase tracking-widest mt-1">Engagement Rate</div>
            </div>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-slate-400 text-sm">Cost Per Engagement</span>
                <Badge variant="outline" class="border-indigo-500/30 text-indigo-300">
                  ${socialAnalysis.costPerEngagement.toFixed(2)}
                </Badge>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-400 text-sm">ROI Potential</span>
                <span class="{roiPotential.color} text-sm font-bold tracking-tighter uppercase">{roiPotential.label}</span>
              </div>
              <Progress value={roiPotential.value} class="h-1.5 bg-slate-900" />
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    </Tabs.Content>

    <!-- OMNICHANNEL TAB -->
    <Tabs.Content value="omni" class="mt-6">
      <Card.Root class="bg-slate-950/40 border-slate-800/80 backdrop-blur-md">
        <Card.Header>
          <div class="flex items-center justify-between">
            <Card.Title class="text-white">Omnichannel Scorecard</Card.Title>
            <div class="text-right">
              <div class="text-2xl font-bold text-violet-400">{omnichannelScore}%</div>
              <div class="text-[10px] text-slate-500 uppercase tracking-tighter">Weighted Strategy Score</div>
            </div>
          </div>
        </Card.Header>
        <Card.Content class="space-y-6">
          <Progress value={omnichannelScore} class="h-2 bg-slate-900" />
          
          <div class="grid grid-cols-2 gap-4">
            {#each Object.entries(plan.omnichannel) as [channel, active]}
              <button 
                onclick={() => plan.omnichannel[channel as keyof typeof plan.omnichannel] = !active}
                class="flex items-center justify-between p-4 rounded-2xl border transition-all {active ? 'bg-violet-500/10 border-violet-500/50 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-500'}"
              >
                <div class="flex flex-col items-start">
                  <span class="capitalize font-medium">{channel}</span>
                  <span class="text-[9px] opacity-60">
                    {channel === 'web' ? '40% Weight' : channel === 'social' ? '30% Weight' : channel === 'email' ? '20% Weight' : '10% Weight'}
                  </span>
                </div>
                {#if active}
                  <CheckCircle2 class="w-5 h-5 text-violet-400" />
                {:else}
                  <div class="w-5 h-5 rounded-full border border-slate-700"></div>
                {/if}
              </button>
            {/each}
          </div>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- CONTENT TAB -->
    <Tabs.Content value="content" class="mt-6">
      <Card.Root class="bg-slate-950/40 border-slate-800/80 backdrop-blur-md">
        <Card.Header>
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles class="w-5 h-5" />
            </div>
            <div>
              <Card.Title class="text-white">Heuristic Sentiment AI</Card.Title>
              <Card.Description>Advanced structural and vocabulary analysis</Card.Description>
            </div>
          </div>
        </Card.Header>
        <Card.Content class="space-y-6">
          <Textarea 
            bind:value={plan.content} 
            placeholder="Type your marketing copy here..."
            class="bg-slate-900 border-slate-800 h-32 focus:ring-amber-500/50"
          />
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div class="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-widest mb-2">
                <Zap class="w-3 h-3 text-amber-400" /> Persuasion Impact
              </div>
              <div class="text-2xl font-bold text-white">{contentAnalysis.score}%</div>
              <Progress value={contentAnalysis.score} class="h-1.5 mt-2 bg-slate-950" />
            </div>
            
            <div class="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div class="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-widest mb-2">
                <Type class="w-3 h-3 text-amber-400" /> Readability & Tone
              </div>
              <div class="flex flex-wrap gap-2">
                <Badge variant="outline" class="bg-amber-500/5 text-amber-400 border-amber-500/20">
                  {contentAnalysis.readability}
                </Badge>
                <Badge variant="outline" class="bg-blue-500/5 text-blue-400 border-blue-500/20">
                  {contentAnalysis.tone}
                </Badge>
              </div>
            </div>
          </div>

          {#if contentAnalysis.impactWords.length > 0}
            <div class="space-y-2">
              <div class="text-[10px] text-slate-500 uppercase tracking-widest">Detected Power Words</div>
              <div class="flex flex-wrap gap-2">
                {#each contentAnalysis.impactWords as word}
                  <span class="text-xs px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {word}
                  </span>
                {/each}
              </div>
            </div>
          {/if}
        </Card.Content>
      </Card.Root>
    </Tabs.Content>
  </Tabs.Root>
</div>
