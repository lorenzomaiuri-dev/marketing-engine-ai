<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { engineStore } from '../../../lib/stores/engineStore';
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale,
    Filler,
    type ChartConfiguration
  } from 'chart.js';
  import type { BusinessModel, SimulationResult } from '../types';
  import { calculateSimulation, calculateMarketFit, runAgentSimulation, type AgentResult } from '../lib/simulator';
  import * as Card from "@/lib/components/ui/card";
  import { Input } from "@/lib/components/ui/input";
  import { Label } from "@/lib/components/ui/label";
  import { Badge } from "@/lib/components/ui/badge";
  import { Progress } from "@/lib/components/ui/progress";
  import { Separator } from "@/lib/components/ui/separator";
  import { Button } from "$lib/components/ui/button";
  import { Rocket, TrendingUp, Users, DollarSign, AlertCircle, CheckCircle2, ShieldCheck } from "@lucide/svelte";

  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale,
    Filler
  );

  let model = $derived($engineStore.economics);
  let result = $derived(calculateSimulation(model));
  let marketFit = $derived(calculateMarketFit($engineStore));
  
  let isSimulating = $state(false);
  let simulationProgress = $state(0);
  let agentResult = $state<AgentResult | null>(null);

  let canvas: HTMLCanvasElement;
  let chart: ChartJS;

  async function runSimulation() {
    isSimulating = true;
    simulationProgress = 0;
    agentResult = null;
    
    // Smooth progress visual
    const interval = setInterval(() => {
        simulationProgress += 2;
        if (simulationProgress >= 100) {
            clearInterval(interval);
            isSimulating = false;
            agentResult = runAgentSimulation($engineStore, 1000);
        }
    }, 20);
  }

  function updateChart() {
    if (!chart) return;
    
    chart.data.labels = result.monthlyProjection.map(d => `M${d.month}`);
    chart.data.datasets[0].data = result.monthlyProjection.map(d => d.profit);
    chart.data.datasets[1].data = Array(model.months).fill(0);
    chart.update();
  }

  function handleInput(field: keyof BusinessModel, value: number) {
    engineStore.updateEconomics({ [field]: value });
  }

  $effect(() => {
    if (result) {
      updateChart();
    }
  });

  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: result.monthlyProjection.map(d => `M${d.month}`),
        datasets: [
          {
            label: 'Cumulative Profit/Loss',
            data: result.monthlyProjection.map(d => d.profit),
            fill: true,
            borderColor: '#10b981', // emerald-500
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            pointRadius: 2,
          },
          {
            label: 'Break Even',
            data: Array(model.months).fill(0),
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#0f172a',
            titleColor: '#94a3b8',
            bodyColor: '#f8fafc',
            borderColor: '#1e293b',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context: any) => `Profit: $${context.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
            },
            ticks: {
              color: '#64748b',
              callback: (value: any) => `$${value}`
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#64748b',
              maxRotation: 0
            }
          }
        }
      }
    };

    chart = new ChartJS(ctx, config);
  });

  onDestroy(() => {
    if (chart) {
      chart.destroy();
    }
  });
</script>

<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
  <!-- Inputs Panel -->
  <div class="lg:col-span-4 space-y-6">
    <Card.Root class="bg-slate-900/40 border-slate-800/80 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
        <Card.Header class="p-6 border-b border-slate-800/50 bg-slate-900/60">
        <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Rocket class="w-5 h-5" />
            </div>
            <div>
            <Card.Title class="text-xl font-bold text-white tracking-tight">Simulator Inputs</Card.Title>
            <Card.Description class="text-slate-500 text-xs">Adjust your model parameters</Card.Description>
            </div>
        </div>
        </Card.Header>
        <Card.Content class="p-6 space-y-6">
        <div class="space-y-4">
            <div class="space-y-2">
            <div class="flex justify-between items-center">
                <Label for="cac" class="text-xs font-bold text-slate-400 uppercase tracking-widest">CAC ($)</Label>
                <span class="text-emerald-400 font-mono text-sm">${model.cac}</span>
            </div>
            <input type="range" id="cac" value={model.cac} oninput={(e) => handleInput('cac', parseFloat(e.currentTarget.value))} min="0" max="1000" step="10" class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            </div>

            <div class="space-y-2">
            <div class="flex justify-between items-center">
                <Label for="arpu" class="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly ARPU ($)</Label>
                <span class="text-emerald-400 font-mono text-sm">${model.arpu}</span>
            </div>
            <input type="range" id="arpu" value={model.arpu} oninput={(e) => handleInput('arpu', parseFloat(e.currentTarget.value))} min="0" max="500" step="5" class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            </div>

            <div class="space-y-2">
            <div class="flex justify-between items-center">
                <Label for="cogs" class="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly COGS ($)</Label>
                <span class="text-emerald-400 font-mono text-sm">${model.cogs}</span>
            </div>
            <input type="range" id="cogs" value={model.cogs} oninput={(e) => handleInput('cogs', parseFloat(e.currentTarget.value))} min="0" max="200" step="1" class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            </div>

            <div class="space-y-2">
            <div class="flex justify-between items-center">
                <Label for="churn" class="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Churn (%)</Label>
                <span class="text-rose-400 font-mono text-sm">{model.churnRate}%</span>
            </div>
            <input type="range" id="churn" value={model.churnRate} oninput={(e) => handleInput('churnRate', parseFloat(e.currentTarget.value))} min="0" max="50" step="0.5" class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500" />
            </div>
        </div>
        </Card.Content>
    </Card.Root>

    <!-- Synthetic Market Fit Gauge -->
    <Card.Root class="bg-slate-900/60 border-blue-500/30 backdrop-blur-xl rounded-3xl p-6 border-2 overflow-hidden relative">
        <div class="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div class="relative z-10">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                        <ShieldCheck class="w-5 h-5" />
                    </div>
                    <h3 class="font-bold text-white tracking-tight">Market Simulation</h3>
                </div>
                <Button variant="ghost" size="sm" class="h-8 text-blue-400 text-[10px]" onclick={runSimulation} disabled={isSimulating}>
                    {isSimulating ? 'SIMULATING...' : 'RUN AGENTS'}
                </Button>
            </div>
            
            <div class="space-y-4">
                {#if isSimulating}
                    <div class="grid grid-cols-10 gap-1 mb-4">
                        {#each Array(50) as _, i}
                            <div class="w-1.5 h-1.5 rounded-full {i < (simulationProgress / 2) ? 'bg-blue-500 animate-pulse' : 'bg-slate-800'}"></div>
                        {/each}
                    </div>
                    <p class="text-[10px] text-blue-400 animate-pulse font-mono uppercase">Processing {simulationProgress * 10} decisions...</p>
                {:else if agentResult}
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div class="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                            <div class="text-[9px] text-slate-500 uppercase font-bold mb-1">Acquired</div>
                            <div class="text-xl font-bold text-emerald-400">{agentResult.converted}</div>
                        </div>
                        <div class="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                            <div class="text-[9px] text-slate-500 uppercase font-bold mb-1">Churned</div>
                            <div class="text-xl font-bold text-rose-400">{agentResult.churned}</div>
                        </div>
                    </div>
                    <div class="flex justify-between items-end mb-2">
                        <span class="text-4xl font-black text-white">{agentResult.fitScore}%</span>
                        <Badge variant="outline" class="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3">
                            {agentResult.fitScore > 20 ? 'Success' : 'Failure'}
                        </Badge>
                    </div>
                    <Progress value={agentResult.fitScore} class="h-2 bg-slate-800" />
                    <p class="text-[9px] text-slate-500 mt-2">Results from 1,000 unique Monte Carlo agent iterations.</p>
                {:else}
                    <div class="flex justify-between items-end">
                        <span class="text-4xl font-black text-white">{marketFit}%</span>
                        <Badge variant="outline" class="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3">
                            {marketFit > 75 ? 'Strong Fit' : 'Draft'}
                        </Badge>
                    </div>
                    <Progress value={marketFit} class="h-3 bg-slate-800" />
                {/if}
            </div>
        </div>
    </Card.Root>
  </div>

  <!-- Visualization & Key Metrics -->
  <div class="lg:col-span-8 space-y-8">
    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card.Root class="bg-slate-900/40 border-slate-800/80 backdrop-blur-md rounded-3xl p-6 border-l-4 border-l-emerald-500">
        <div class="flex flex-col gap-1">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lifetime Value (LTV)</span>
          <span class="text-3xl font-black text-white">${result.ltv.toFixed(2)}</span>
          <div class="flex items-center gap-1 text-[10px] text-emerald-400 mt-2">
            <TrendingUp class="w-3 h-3" />
            <span>Projected Gross Revenue</span>
          </div>
        </div>
      </Card.Root>

      <Card.Root class="bg-slate-900/40 border-slate-800/80 backdrop-blur-md rounded-3xl p-6 border-l-4 border-l-blue-500">
        <div class="flex flex-col gap-1">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">LTV / CAC Ratio</span>
          <span class="text-3xl font-black {result.ltvCacRatio >= 3 ? 'text-emerald-400' : 'text-rose-400'}">
            {result.ltvCacRatio.toFixed(2)}x
          </span>
          <div class="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
            <span>Minimum Target: 3.0x</span>
          </div>
        </div>
      </Card.Root>

      <Card.Root class="bg-slate-900/40 border-slate-800/80 backdrop-blur-md rounded-3xl p-6 border-l-4 border-l-amber-500">
        <div class="flex flex-col gap-1">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payback Period</span>
          <span class="text-3xl font-black text-white">
            {result.paybackPeriod ? `${result.paybackPeriod} mo.` : 'Never'}
          </span>
          <div class="flex items-center gap-1 text-[10px] text-amber-400 mt-2">
            <DollarSign class="w-3 h-3" />
            <span>CAC Recovery Time</span>
          </div>
        </div>
      </Card.Root>
    </div>

    <!-- Chart -->
    <Card.Root class="bg-slate-900/40 border-slate-800/80 backdrop-blur-md rounded-3xl overflow-hidden h-[450px] flex flex-col border-2 border-slate-800/40">
      <Card.Header class="p-6 border-b border-slate-800/50 bg-slate-900/60 flex flex-row items-center justify-between">
        <div>
          <Card.Title class="text-lg font-bold text-white tracking-tight">Cumulative Unit Economics</Card.Title>
          <Card.Description class="text-slate-500 text-xs">Profitability projection over {model.months} months</Card.Description>
        </div>
      </Card.Header>
      <Card.Content class="p-6 flex-grow relative">
        <div class="absolute inset-0 p-8">
          <canvas bind:this={canvas}></canvas>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</div>

<style>
  input[type='range']::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    background: #ffffff;
    border-radius: 50%;
    cursor: pointer;
    border: 3px solid #10b981;
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
    transition: all 0.2s ease;
  }

  input[type='range']::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  input[type='range']#churn::-webkit-slider-thumb {
    border-color: #f43f5e;
    box-shadow: 0 0 15px rgba(244, 63, 94, 0.4);
  }
</style>
